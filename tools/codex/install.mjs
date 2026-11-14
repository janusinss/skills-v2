import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { exportBundle, normalizeMode, parseArgs as parseExportArgs, resolveTarget } from './export.mjs';
import { bundleRoot, assertNoSymlinkAncestors, within, payloadHash, json, isRecord } from './lib.mjs';
import { planGitignore, applyGitignore } from './gitignore.mjs';

const installRule = '.codex/rules/install.md';
const playwrightRunner = '.codex/skills/playwright-skill/run.js';
const agentBrowserSkill = '.codex/skills/agent-browser/SKILL.md';
const harnessRunner = '.codex/skills/continuous-agent-loop/scripts/harness.mjs';
const verificationMarker = 'PLAYWRIGHT_VERIFIED_OK';
const verificationScript = `const browser = await helpers.launchBrowser('chromium', { headless: true }); try { const page = await browser.newPage(); await page.setContent('<title>Codex setup</title>'); if (await page.title() !== 'Codex setup') throw new Error('Browser verification failed'); console.log('${verificationMarker}'); } finally { await browser.close(); }`;

function readInstallation(target) {
  const manifestPath = path.join(target, '.codex/codex-install.json');
  assertNoSymlinkAncestors(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.source !== 'skills-v2 Codex edition' || manifest.formatVersion !== 2 || manifest.hashing !== 'sha256-lf-text' || !isRecord(manifest.files) || !manifest.files['AGENTS.md']) throw new Error('Not a supported Codex installation');
  if (manifest.setup?.status !== 'complete' && !manifest.files[installRule]) throw new Error('Missing installation rule in the installation record');
  for (const [relative, hash] of Object.entries(manifest.files)) {
    const absolute = path.resolve(target, relative);
    if (path.isAbsolute(relative) || !within(target, absolute) || !/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid installation record: ${relative}`);
    assertNoSymlinkAncestors(absolute);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || payloadHash(fs.readFileSync(absolute)) !== hash) throw new Error(`Installed file changed or missing: ${relative}. Preserve it before retrying setup.`);
  }
  return { manifestPath, manifest };
}

function runStep(execute, command, args, options, label) {
  const result = execute(command, args, { windowsHide: true, ...options });
  if (result.error || result.status !== 0) throw new Error(`${label} failed: ${result.error?.message || result.stderr?.trim() || result.signal || `exit ${result.status}`}`);
  return result;
}

function verifyRunner(execute, target, runnerPath) {
  return execute(process.execPath, [path.join(target, runnerPath), '-e', verificationScript], { cwd: target, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function installGitPreCommitHook(execute, target, manifest) {
  if (manifest.hooksIncluded === false) return 'disabled';
  const mode = normalizeMode(manifest.mode || 'harness');
  if (mode === 'designer') return 'skipped (designer mode)';
  const gitDir = path.join(target, '.git');
  if (!fs.existsSync(gitDir)) return 'skipped (no .git directory)';
  const harnessPath = path.join(target, harnessRunner);
  if (!fs.existsSync(harnessPath)) return 'skipped (continuous-agent-loop not in profile)';
  const preCommitPath = path.join(gitDir, 'hooks', 'pre-commit');
  assertNoSymlinkAncestors(preCommitPath);
  if (fs.existsSync(preCommitPath)) {
    const existing = fs.readFileSync(preCommitPath, 'utf8');
    if (existing.includes('pre-commit-check')) return 'active';
    if (!existing.includes('# Installed by Self-Improving Agent Harness')) {
      const chained = `${existing.trimEnd()}\n\n# Installed by Self-Improving Agent Harness (harness.mjs install-git-hook)\nnode "${harnessRunner}" pre-commit-check\n`;
      fs.writeFileSync(preCommitPath, chained, { encoding: 'utf8', mode: 0o755 });
      return 'chained';
    }
  }
  runStep(execute, process.execPath, [harnessPath, 'install-git-hook', '--cwd', target], { cwd: target, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }, 'Harness git pre-commit hook setup');
  return 'installed';
}

function runPlatformCmd(execute, command, args, options) {
  if (process.platform === 'win32') {
    const cmdLine = [command, ...args].join(' ');
    return execute(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', cmdLine], { windowsHide: true, ...options });
  }
  return execute(command, args, { windowsHide: true, ...options });
}

export function setupAgentBrowser(execute, target) {
  try {
    const checkOpts = { cwd: target, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] };
    let version = runPlatformCmd(execute, 'agent-browser', ['--version'], checkOpts);
    if (!version || version.error || version.status !== 0) {
      console.error('agent-browser CLI not found. Installing globally via npm...');
      const npmInstall = runPlatformCmd(execute, 'npm', ['install', '-g', 'agent-browser', '--no-audit', '--no-fund'], { cwd: target, stdio: 'inherit' });
      if (!npmInstall || npmInstall.error || npmInstall.status !== 0) {
        console.error(`agent-browser global install warning: ${npmInstall?.error?.message || npmInstall?.stderr?.trim() || `exit ${npmInstall?.status ?? 1}`}`);
        return 'unavailable';
      }
      version = runPlatformCmd(execute, 'agent-browser', ['--version'], checkOpts);
      if (!version || version.error || version.status !== 0) {
        console.error('agent-browser CLI still unavailable after npm install -g agent-browser.');
        return 'unavailable';
      }
    }

    const precheck = runPlatformCmd(execute, 'agent-browser', ['doctor', '--offline', '--quick', '--json'], checkOpts);
    if (precheck && !precheck.error && precheck.status === 0) {
      console.error('Working agent-browser CLI and browser detected. Skipping agent-browser install.');
      return 'verified';
    }

    console.error('Installing browser runtime for agent-browser...');
    const installRes = runPlatformCmd(execute, 'agent-browser', ['install'], { cwd: target, stdio: 'inherit' });
    const recheck = runPlatformCmd(execute, 'agent-browser', ['doctor', '--offline', '--quick', '--json'], checkOpts);
    if (recheck && !recheck.error && recheck.status === 0) {
      return 'verified';
    }
    const reason = installRes?.error?.message || recheck?.stderr?.trim() || `exit ${recheck?.status ?? installRes?.status ?? 1}`;
    console.error(`agent-browser browser check warning: ${reason}`);
    return 'cli-only';
  } catch (error) {
    console.error(`agent-browser setup warning: ${error.message}`);
    return 'unavailable';
  }
}

function finishSetup(target, manifestPath, manifest, playwright, gitHook, agentBrowser = 'not included in selected profile') {
  assertNoSymlinkAncestors(manifestPath);
  const onDisk = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (json(onDisk) !== json(manifest)) throw new Error('Installation record changed during setup');
  const rulePath = path.join(target, installRule);
  if (!fs.existsSync(rulePath) || payloadHash(fs.readFileSync(rulePath)) !== manifest.files[installRule]) {
    throw new Error(`Installed file changed or missing: ${installRule}. Preserve it before retrying setup.`);
  }
  const ruleData = fs.readFileSync(rulePath);
  const mode = normalizeMode(manifest.mode || 'harness');
  const hooks = manifest.hooksIncluded === false ? 'disabled' : mode === 'designer' ? 'impeccable' : 'active';
  const completed = { ...manifest, files: { ...manifest.files }, setup: { status: 'complete', playwright, agentBrowser, mode, hooks, gitHook, removedFiles: [installRule] } };
  delete completed.files[installRule];
  const temporary = `${manifestPath}.setup.tmp`;
  assertNoSymlinkAncestors(temporary);
  fs.writeFileSync(temporary, json(completed), { flag: 'wx' });
  try {
    fs.unlinkSync(rulePath);
    try { fs.renameSync(temporary, manifestPath); }
    catch (error) {
      fs.writeFileSync(rulePath, ruleData, { flag: 'wx' });
      throw error;
    }
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return completed;
}

export function installBundle(options, root = bundleRoot, execute = spawnSync) {
  const target = resolveTarget(options.target, root);
  let exported;
  if (!options.resume) {
    exported = exportBundle(options, root);
    if (options.dryRun) return { ...exported, setup: 'Playwright and Chromium when the profile includes playwright-skill', removesAfterSuccess: [installRule] };
  }
  const installation = readInstallation(target);
  const manifestPath = installation.manifestPath;
  let manifest = installation.manifest;
  if (
    options.resume &&
    ((options.profile && options.profile !== manifest.profile) ||
      (options.includeHooks !== undefined && options.includeHooks !== Boolean(manifest.hooksIncluded)) ||
      (options.mode && normalizeMode(options.mode) !== normalizeMode(manifest.mode || 'harness')))
  ) {
    throw new Error('--resume uses the installed profile, mode, and hook selection');
  }
  const installedMode = normalizeMode(manifest.mode || 'harness');
  const installedHookSet = manifest.hookSet || (manifest.hooksIncluded === false ? 'none' : installedMode === 'designer' ? 'impeccable' : 'all');
  let gitignore = exported?.gitignore;
  if (!gitignore) {
    const ignorePlan = planGitignore(target, root);
    gitignore = options.dryRun ? { ...ignorePlan.record, action: ignorePlan.action } : applyGitignore(ignorePlan);
  }
  const ignoreRecord = { path: gitignore.path, entries: gitignore.entries };
  if (!options.dryRun && json(manifest.gitignore) !== json(ignoreRecord)) {
    if (json(JSON.parse(fs.readFileSync(manifestPath, 'utf8'))) !== json(manifest)) throw new Error('Installation record changed during .gitignore setup');
    const updated = { ...manifest, gitignore: ignoreRecord };
    const temporary = `${manifestPath}.gitignore.tmp`;
    assertNoSymlinkAncestors(temporary);
    fs.writeFileSync(temporary, json(updated), { flag: 'wx' });
    try { fs.renameSync(temporary, manifestPath); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
    manifest = updated;
  }
  if (options.dryRun || manifest.setup?.status === 'complete') return { target, profile: manifest.profile, mode: installedMode, hookSet: installedHookSet, topLevelSkills: manifest.topLevelSkills, files: Object.keys(manifest.files).length + 2, gitignore, dryRun: Boolean(options.dryRun), setup: manifest.setup?.status || 'pending' };
  let playwright = 'not included in selected profile';
  let agentBrowser = 'not included in selected profile';
  try {
    if (manifest.files[playwrightRunner]) {
      const skillDirectory = path.dirname(path.join(target, playwrightRunner));
      const hasLocalModules = fs.existsSync(path.join(skillDirectory, 'node_modules/playwright'));
      if (!hasLocalModules) {
        console.error('Installing local Playwright dependencies from the included lockfile...');
        if (process.platform === 'win32') runStep(execute, process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm ci --no-audit --no-fund --prefer-offline'], { cwd: skillDirectory, stdio: 'inherit' }, 'Playwright dependency setup');
        else runStep(execute, 'npm', ['ci', '--no-audit', '--no-fund', '--prefer-offline'], { cwd: skillDirectory, stdio: 'inherit' }, 'Playwright dependency setup');
      } else {
        console.error('Local Playwright dependencies already present. Skipping npm ci.');
      }
      console.error('Checking for working browser installation on system...');
      const precheck = verifyRunner(execute, target, playwrightRunner);
      if (precheck.stdout?.split(/\r?\n/).includes(verificationMarker)) {
        console.error('Working browser detected on computer. Skipping Chromium download.');
        playwright = 'verified';
      } else {
        if (process.env.DEBUG && precheck.stderr) console.error(`Precheck diagnostic: ${precheck.stderr.trim()}`);
        console.error('No working browser detected. Attempting Chromium download...');
        let downloadError = null;
        try {
          runStep(execute, process.execPath, [path.join(skillDirectory, 'node_modules/playwright/cli.js'), 'install', 'chromium'], { cwd: skillDirectory, stdio: 'inherit' }, 'Chromium setup');
        } catch (err) {
          downloadError = err;
          console.error(`Chromium download warning: ${err.message}`);
        }
        console.error('Verifying the installed Playwright runner...');
        const result = verifyRunner(execute, target, playwrightRunner);
        if (!result.stdout?.split(/\r?\n/).includes(verificationMarker)) {
          if (downloadError) throw downloadError;
          throw new Error(`Playwright verification did not return its success marker: ${result.stderr?.trim() || result.stdout?.trim() || 'unknown failure'}`);
        }
        playwright = 'verified';
      }
    }
    if (manifest.files[playwrightRunner] || manifest.files[agentBrowserSkill]) {
      agentBrowser = setupAgentBrowser(execute, target);
    }
    const gitHook = installGitPreCommitHook(execute, target, manifest);
    const completed = finishSetup(target, manifestPath, manifest, playwright, gitHook, agentBrowser);
    const resolvedCompletedMode = normalizeMode(completed.mode || 'harness');
    return { target, profile: completed.profile, mode: resolvedCompletedMode, hookSet: completed.hookSet || (completed.hooksIncluded === false ? 'none' : resolvedCompletedMode === 'designer' ? 'impeccable' : 'all'), topLevelSkills: completed.topLevelSkills, files: Object.keys(completed.files).length + 2, gitignore, dryRun: false, setup: completed.setup };
  } catch (error) {
    throw new Error(`${error.message}\nSetup is incomplete; the installed ${installRule} is retained. Retry from the source checkout with node tools/codex/install.mjs --target ${JSON.stringify(target)} --resume.`, { cause: error });
  }
}

export function parseArgs(args) {
  return { ...parseExportArgs(args.filter(value => value !== '--resume')), resume: args.includes('--resume') };
}

async function resolveInteractiveCliOptions(options) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return options;
  const needMode = !options.mode && !options.resume && options.includeHooks !== false;
  const needTarget = !options.target;
  if (!needMode && !needTarget) return options;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const resolved = { ...options };
    if (needMode) {
      console.error('\nSelect hook mode:');
      console.error('  1) HARNESS MODE (default) - Installs all hooks (Harness + Impeccable + design-taste-frontend + avoid-ai-writing), .git/hooks/pre-commit, and full Harness lifecycle in AGENTS.md');
      console.error('  2) DESIGNER MODE          - Activates non-harness hooks (Impeccable, design-taste-frontend, avoid-ai-writing), skips Harness hooks/.git pre-commit, and installs Designer AGENTS.md');
      for (;;) {
        const answer = (await rl.question('Enter choice [1-2 or harness/designer, default: harness]: ')).trim().toLowerCase();
        if (!answer || answer === '1' || answer === 'harness') { resolved.mode = 'harness'; break; }
        if (answer === '2' || answer === 'designer' || answer === 'normal') { resolved.mode = 'designer'; break; }
        console.error('Invalid selection. Choose 1 (harness) or 2 (designer).');
      }
    }
    if (needTarget) {
      for (;;) {
        const answer = (await rl.question('Enter target project directory (absolute path): ')).trim();
        if (answer) { resolved.target = path.resolve(answer); break; }
        console.error('Target directory cannot be empty.');
      }
    }
    return resolved;
  } finally {
    rl.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const cliOptions = await resolveInteractiveCliOptions(parseArgs(process.argv.slice(2)));
    console.log(json(installBundle(cliOptions)));
  } catch (error) {
    console.error(error.stack || error.message);
    if (error.cause) console.error('Caused by:', error.cause.stack || error.cause.message || error.cause);
    process.exitCode = 1;
  }
}
