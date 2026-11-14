import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { isUtf8 } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  repoRoot,
  sourceRoot,
  filesIn,
  assertNoSymlinkAncestors,
  within,
  payloadData,
  payloadHash,
  sha256,
  slash,
  json,
  isRecord
} from './tools/codex/lib.mjs';
import { applyGitignore } from './tools/codex/gitignore.mjs';
import { formatDesignerPolicy } from './tools/codex/convert.mjs';
import { installBundle as installCodexBundle, setupAgentBrowser } from './tools/codex/install.mjs';
import { installBundle as installClaudeBundle } from './tools/claude/install.mjs';

const agyInstallRule = '.agents/rules/install.md';
const agyPlaywrightRunner = '.agents/skills/playwright-skill/run.js';
const agyAgentBrowserSkill = '.agents/skills/agent-browser/SKILL.md';
const agyHarnessRunner = '.agents/skills/continuous-agent-loop/scripts/harness.mjs';
const agyManifestRelative = '.agents/agy-install.json';
const verificationMarker = 'PLAYWRIGHT_VERIFIED_OK';
const verificationScript = `const browser = await helpers.launchBrowser('chromium', { headless: true }); try { const page = await browser.newPage(); await page.setContent('<title>AGY setup</title>'); if (await page.title() !== 'AGY setup') throw new Error('Browser verification failed'); console.log('${verificationMarker}'); } finally { await browser.close(); }`;

const localAgyIgnoreEntries = Object.freeze([
  '/.agents/*',
  '!/.agents/rules/',
  '!/.agents/agents/',
  '/AGENTS.md',
  '/scratch/',
  '/.impeccable/',
  '/.harness/',
  '/.agent_worktrees/'
]);

export function normalizeEdition(edition) {
  if (typeof edition !== 'string' || !edition.trim()) {
    throw new Error('Invalid --edition. Choose agy, codex, or claude.');
  }
  const value = edition.trim().toLowerCase();
  if (value === 'agy' || value === 'gemini' || value === 'agy/gemini') return 'agy';
  if (value === 'codex' || value === 'gpt' || value === 'gpt/codex') return 'codex';
  if (value === 'claude' || value === 'claude-code' || value === 'anthropic') return 'claude';
  throw new Error(`Unknown edition ${edition}. Choose agy, codex, or claude.`);
}

export function normalizeMode(mode = 'harness') {
  if (typeof mode !== 'string') {
    throw new Error('Invalid --mode. Choose harness or designer.');
  }
  const value = mode.trim().toLowerCase();
  if (value === 'normal') return 'designer';
  if (value !== 'harness' && value !== 'designer') {
    throw new Error(`Unknown mode ${mode}. Choose harness or designer.`);
  }
  return value;
}

export function resolveAgyTarget(target) {
  if (!target || !path.isAbsolute(target)) {
    throw new Error('--target must be an absolute project directory');
  }
  const destination = path.resolve(target);
  assertNoSymlinkAncestors(destination);
  if (
    destination === repoRoot ||
    within(sourceRoot, destination) ||
    within(path.join(repoRoot, '.codex'), destination) ||
    within(path.join(repoRoot, '.claude'), destination) ||
    within(path.join(repoRoot, 'tools'), destination) ||
    within(destination, repoRoot)
  ) {
    throw new Error('Choose a target project separate from the original source and distribution directories');
  }
  return destination;
}

function buildAgyGitignoreDefaults() {
  const rootGitignorePath = path.join(repoRoot, '.gitignore');
  assertNoSymlinkAncestors(rootGitignorePath);
  const rootGitignore = fs.readFileSync(rootGitignorePath);
  if (!isUtf8(rootGitignore) || rootGitignore.includes(0)) {
    throw new Error('The repository .gitignore must be UTF-8 text');
  }
  return '# Local AGY skills, instructions, and workflow artifacts\n'
    + localAgyIgnoreEntries.join('\n')
    + '\n\n'
    + rootGitignore.toString('utf8');
}

export function planAgyGitignore(target) {
  if (!path.isAbsolute(target)) throw new Error('The .gitignore target must be an absolute project path');
  const sections = buildAgyGitignoreDefaults().replace(/^\uFEFF/, '').replaceAll('\r\n', '\n').trimEnd().split(/\n\s*\n/);
  const patterns = sections.flatMap(section => section.split('\n').filter(line => line && !line.startsWith('#')));
  const record = { path: '.gitignore', entries: [...new Set(patterns)] };
  const absolute = path.join(target, '.gitignore');
  assertNoSymlinkAncestors(absolute);
  const existed = fs.existsSync(absolute);
  if (existed && !fs.statSync(absolute).isFile()) throw new Error('The target .gitignore must be a regular file');
  const original = existed ? fs.readFileSync(absolute) : Buffer.alloc(0);
  if (!isUtf8(original) || original.includes(0)) {
    throw new Error('The target .gitignore must be UTF-8 text; preserve it and review the encoding before installation');
  }
  const text = original.toString('utf8');
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trimEnd());
  const positions = new Map(lines.map((line, index) => [line, index]));
  let nextPosition = lines.length;
  const additions = [];
  for (const section of sections) {
    const missing = new Set();
    let exclusionPosition = -1;
    let previousWasNegation = false;
    for (const entry of section.split('\n').filter(line => line && !line.startsWith('#'))) {
      const negation = entry.startsWith('!');
      if (!negation && previousWasNegation) exclusionPosition = -1;
      const position = Math.max(positions.get(entry) ?? -1, entry.startsWith('/') ? positions.get(entry.slice(1)) ?? -1 : -1);
      if (position < 0 || (negation && position < exclusionPosition)) {
        missing.add(entry);
        positions.set(entry, nextPosition++);
      }
      if (!negation) exclusionPosition = Math.max(exclusionPosition, positions.get(entry) ?? position);
      previousWasNegation = negation;
    }
    if (missing.size) {
      additions.push(section.split('\n').filter(line => line.startsWith('#') || missing.has(line)).join('\n'));
    }
  }
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const separator = original.length ? (text.endsWith('\n') ? newline : newline + newline) : '';
  const addition = additions.length ? Buffer.from(separator + additions.join('\n\n').replaceAll('\n', newline) + newline) : Buffer.alloc(0);
  return {
    absolute,
    existed,
    original,
    addition,
    record,
    action: !existed ? 'created' : additions.length ? 'updated' : 'unchanged'
  };
}

function readAgyInstallation(target) {
  const manifestPath = path.join(target, agyManifestRelative);
  assertNoSymlinkAncestors(manifestPath);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (
    manifest.source !== 'skills-v2 AGY edition' ||
    manifest.formatVersion !== 1 ||
    manifest.hashing !== 'sha256-lf-text' ||
    !isRecord(manifest.files) ||
    !manifest.files['AGENTS.md']
  ) {
    throw new Error('Not a supported AGY installation');
  }
  if (manifest.setup?.status !== 'complete' && !manifest.files[agyInstallRule]) {
    throw new Error('Missing installation rule in the AGY installation record');
  }
  for (const [relative, hash] of Object.entries(manifest.files)) {
    const absolute = path.resolve(target, relative);
    if (path.isAbsolute(relative) || !within(target, absolute) || !/^[a-f0-9]{64}$/.test(hash)) {
      throw new Error(`Invalid installation record: ${relative}`);
    }
    assertNoSymlinkAncestors(absolute);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || payloadHash(fs.readFileSync(absolute)) !== hash) {
      throw new Error(`Installed file changed or missing: ${relative}. Preserve it before retrying setup.`);
    }
  }
  return { manifestPath, manifest };
}

function runStep(execute, command, args, options, label) {
  const result = execute(command, args, { windowsHide: true, ...options });
  if (result.error || result.status !== 0) {
    throw new Error(`${label} failed: ${result.error?.message || result.stderr?.trim() || result.signal || `exit ${result.status}`}`);
  }
  return result;
}

function verifyRunner(execute, target, runnerPath) {
  return execute(process.execPath, [path.join(target, runnerPath), '-e', verificationScript], {
    cwd: target,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function installAgyGitPreCommitHook(execute, target, manifest) {
  if (manifest.hooksIncluded === false) return 'disabled';
  const mode = normalizeMode(manifest.mode || 'harness');
  if (mode === 'designer') return 'skipped (designer mode)';
  const gitDir = path.join(target, '.git');
  if (!fs.existsSync(gitDir)) return 'skipped (no .git directory)';
  const harnessPath = path.join(target, agyHarnessRunner);
  if (!fs.existsSync(harnessPath)) return 'skipped (continuous-agent-loop missing)';
  const preCommitPath = path.join(gitDir, 'hooks', 'pre-commit');
  assertNoSymlinkAncestors(preCommitPath);
  if (fs.existsSync(preCommitPath)) {
    const existing = fs.readFileSync(preCommitPath, 'utf8');
    if (existing.includes('pre-commit-check')) return 'active';
    if (!existing.includes('# Installed by Self-Improving Agent Harness')) {
      const chained = `${existing.trimEnd()}\n\n# Installed by Self-Improving Agent Harness (harness.mjs install-git-hook)\nnode "${agyHarnessRunner}" pre-commit-check\n`;
      fs.writeFileSync(preCommitPath, chained, { encoding: 'utf8', mode: 0o755 });
      return 'chained';
    }
  }
  runStep(
    execute,
    process.execPath,
    [harnessPath, 'install-git-hook', '--cwd', target],
    { cwd: target, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    'Harness git pre-commit hook setup'
  );
  return 'installed';
}

function finishAgySetup(target, manifestPath, manifest, playwright, gitHook, agentBrowser = 'not included') {
  assertNoSymlinkAncestors(manifestPath);
  const onDisk = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (json(onDisk) !== json(manifest)) throw new Error('Installation record changed during setup');
  const rulePath = path.join(target, agyInstallRule);
  if (!fs.existsSync(rulePath) || payloadHash(fs.readFileSync(rulePath)) !== manifest.files[agyInstallRule]) {
    throw new Error(`Installed file changed or missing: ${agyInstallRule}. Preserve it before retrying setup.`);
  }
  const ruleData = fs.readFileSync(rulePath);
  const mode = normalizeMode(manifest.mode || 'harness');
  const hooks = manifest.hooksIncluded === false ? 'disabled' : mode === 'designer' ? 'impeccable' : 'active';
  const completed = {
    ...manifest,
    files: { ...manifest.files },
    setup: {
      status: 'complete',
      playwright,
      agentBrowser,
      mode,
      hooks,
      gitHook,
      removedFiles: [agyInstallRule]
    }
  };
  delete completed.files[agyInstallRule];
  const temporary = `${manifestPath}.setup.tmp`;
  assertNoSymlinkAncestors(temporary);
  fs.writeFileSync(temporary, json(completed), { flag: 'wx' });
  try {
    fs.unlinkSync(rulePath);
    try {
      fs.renameSync(temporary, manifestPath);
    } catch (error) {
      fs.writeFileSync(rulePath, ruleData, { flag: 'wx' });
      throw error;
    }
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return completed;
}

function planAgyEntries(destination, mode, includeHooks) {
  const entries = [];
  const seenRelative = new Set();
  const addEntry = (relative, data) => {
    if (seenRelative.has(relative)) return;
    seenRelative.add(relative);
    const output = path.resolve(destination, relative);
    if (!within(destination, output)) throw new Error(`Export path escapes its target: ${relative}`);
    assertNoSymlinkAncestors(output);
    if (fs.existsSync(output)) {
      throw new Error(`Destination already exists: ${output}. Export to a new directory or review and merge manually.`);
    }
    entries.push({ relative, destination: output, data });
  };

  const agentsPolicyPath = path.join(repoRoot, 'AGENTS.md');
  assertNoSymlinkAncestors(agentsPolicyPath);
  const rawAgents = fs.readFileSync(agentsPolicyPath, 'utf8');
  const cleanAgents = rawAgents.split(/\r?\n<!-- source-repository-only -->/)[0].trimEnd() + '\n';
  const targetAgents = mode === 'designer' ? formatDesignerPolicy(cleanAgents) : cleanAgents;
  addEntry('AGENTS.md', payloadData(targetAgents));

  const skillsLockPath = path.join(repoRoot, 'skills-lock.json');
  if (fs.existsSync(skillsLockPath)) {
    assertNoSymlinkAncestors(skillsLockPath);
    addEntry('skills-lock.json', payloadData(fs.readFileSync(skillsLockPath)));
  }

  for (const source of filesIn(sourceRoot)) {
    const rel = slash(path.relative(sourceRoot, source));
    if (rel === 'hooks.json' || rel === 'agy-install.json' || rel.startsWith('skills/impeccable/scripts/bin/')) continue;
    addEntry(`.agents/${rel}`, payloadData(fs.readFileSync(source)));
  }

  if (includeHooks) {
    const hooksSource = mode === 'designer'
      ? path.join(sourceRoot, 'hooks.impeccable.example.json')
      : path.join(sourceRoot, 'hooks.example.json');
    assertNoSymlinkAncestors(hooksSource);
    if (!fs.existsSync(hooksSource)) {
      throw new Error(`Missing ${path.basename(hooksSource)} in .agents/. Ensure the source repository is complete.`);
    }
    addEntry('.agents/hooks.json', payloadData(fs.readFileSync(hooksSource)));
  }

  const installManifest = path.join(destination, agyManifestRelative);
  assertNoSymlinkAncestors(installManifest);
  if (fs.existsSync(installManifest)) throw new Error(`Destination already exists: ${installManifest}`);
  return { entries, installManifest };
}

export function installAgy(options, execute = spawnSync) {
  if (options.profile && options.profile !== 'all') {
    throw new Error(`AGY edition installs the full .agents/ collection and does not support partial --profile "${options.profile}".`);
  }
  const destination = resolveAgyTarget(options.target);
  const requestedMode = options.mode !== undefined ? normalizeMode(options.mode) : 'harness';
  const requestedIncludeHooks = options.includeHooks ?? true;
  const requestedHookSet = !requestedIncludeHooks ? 'none' : requestedMode === 'designer' ? 'impeccable' : 'all';

  let initialGitignore;
  if (!options.resume) {
    const { entries, installManifest } = planAgyEntries(destination, requestedMode, requestedIncludeHooks);
    const ignorePlan = planAgyGitignore(destination);
    if (options.dryRun) {
      return {
        edition: 'agy',
        target: destination,
        mode: requestedMode,
        includeHooks: requestedIncludeHooks,
        hookSet: requestedHookSet,
        files: entries.length + 2,
        gitignore: { ...ignorePlan.record, action: ignorePlan.action },
        dryRun: true,
        setup: 'Playwright and Chromium setup',
        removesAfterSuccess: [agyInstallRule]
      };
    }
    const hashes = {};
    for (const entry of entries) {
      fs.mkdirSync(path.dirname(entry.destination), { recursive: true });
      fs.writeFileSync(entry.destination, entry.data, { flag: 'wx' });
      hashes[entry.relative] = sha256(entry.data);
    }
    initialGitignore = applyGitignore(ignorePlan);
    fs.writeFileSync(
      installManifest,
      json({
        source: 'skills-v2 AGY edition',
        formatVersion: 1,
        hashing: 'sha256-lf-text',
        mode: requestedMode,
        hooksIncluded: requestedIncludeHooks,
        hookSet: requestedHookSet,
        gitignore: ignorePlan.record,
        files: hashes
      }),
      { flag: 'wx' }
    );
  }

  const installation = readAgyInstallation(destination);
  const manifestPath = installation.manifestPath;
  let manifest = installation.manifest;
  if (
    options.resume &&
    ((options.mode && normalizeMode(options.mode) !== normalizeMode(manifest.mode || 'harness')) ||
      (options.includeHooks !== undefined && options.includeHooks !== Boolean(manifest.hooksIncluded)))
  ) {
    throw new Error('--resume uses the installed mode and hook selection');
  }
  const installedMode = normalizeMode(manifest.mode || 'harness');
  const installedHookSet = manifest.hookSet || (manifest.hooksIncluded === false ? 'none' : installedMode === 'designer' ? 'impeccable' : 'all');

  let gitignore = initialGitignore;
  if (!gitignore) {
    const ignorePlan = planAgyGitignore(destination);
    gitignore = options.dryRun ? { ...ignorePlan.record, action: ignorePlan.action } : applyGitignore(ignorePlan);
  }
  const ignoreRecord = { path: gitignore.path, entries: gitignore.entries };
  if (!options.dryRun && json(manifest.gitignore) !== json(ignoreRecord)) {
    if (json(JSON.parse(fs.readFileSync(manifestPath, 'utf8'))) !== json(manifest)) {
      throw new Error('Installation record changed during .gitignore setup');
    }
    const updated = { ...manifest, gitignore: ignoreRecord };
    const temporary = `${manifestPath}.gitignore.tmp`;
    assertNoSymlinkAncestors(temporary);
    fs.writeFileSync(temporary, json(updated), { flag: 'wx' });
    try {
      fs.renameSync(temporary, manifestPath);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
    manifest = updated;
  }

  if (options.dryRun || manifest.setup?.status === 'complete') {
    return {
      edition: 'agy',
      target: destination,
      mode: installedMode,
      hookSet: installedHookSet,
      files: Object.keys(manifest.files).length + 2,
      gitignore,
      dryRun: Boolean(options.dryRun),
      setup: manifest.setup?.status || 'pending'
    };
  }

  let playwright = 'not included';
  let agentBrowser = 'not included';
  try {
    if (manifest.files[agyPlaywrightRunner]) {
      const skillDirectory = path.dirname(path.join(destination, agyPlaywrightRunner));
      const hasLocalModules = fs.existsSync(path.join(skillDirectory, 'node_modules/playwright'));
      if (!hasLocalModules) {
        console.error('Installing local Playwright dependencies from the included lockfile...');
        if (process.platform === 'win32') {
          runStep(execute, process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm ci --no-audit --no-fund --prefer-offline'], { cwd: skillDirectory, stdio: 'inherit' }, 'Playwright dependency setup');
        } else {
          runStep(execute, 'npm', ['ci', '--no-audit', '--no-fund', '--prefer-offline'], { cwd: skillDirectory, stdio: 'inherit' }, 'Playwright dependency setup');
        }
      } else {
        console.error('Local Playwright dependencies already present. Skipping npm ci.');
      }
      console.error('Checking for working browser installation on system...');
      const precheck = verifyRunner(execute, destination, agyPlaywrightRunner);
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
        const result = verifyRunner(execute, destination, agyPlaywrightRunner);
        if (!result.stdout?.split(/\r?\n/).includes(verificationMarker)) {
          if (downloadError) throw downloadError;
          throw new Error(`Playwright verification did not return its success marker: ${result.stderr?.trim() || result.stdout?.trim() || 'unknown failure'}`);
        }
        playwright = 'verified';
      }
    }
    if (manifest.files[agyPlaywrightRunner] || manifest.files[agyAgentBrowserSkill]) {
      agentBrowser = setupAgentBrowser(execute, destination);
    }
    const gitHook = installAgyGitPreCommitHook(execute, destination, manifest);
    const completed = finishAgySetup(destination, manifestPath, manifest, playwright, gitHook, agentBrowser);
    return {
      edition: 'agy',
      target: destination,
      mode: completed.mode || installedMode,
      hookSet: completed.hookSet || installedHookSet,
      files: Object.keys(completed.files).length + 2,
      gitignore,
      dryRun: false,
      setup: completed.setup
    };
  } catch (error) {
    throw new Error(`${error.message}\nSetup is incomplete; the installed ${agyInstallRule} is retained. Retry from the source checkout with node install.mjs --edition agy --target ${JSON.stringify(destination)} --resume.`, { cause: error });
  }
}

export function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--edition' || value === '--mode' || value === '--target' || value === '--profile') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${value} requires a value`);
      const nextValue = args[++index];
      if (value === '--edition') options.edition = normalizeEdition(nextValue);
      else if (value === '--mode') options.mode = normalizeMode(nextValue);
      else options[value.slice(2)] = nextValue;
    } else if (value === '--no-hooks') {
      options.includeHooks = false;
    } else if (value === '--include-hooks') {
      options.includeHooks = true;
    } else if (value === '--dry-run') {
      options.dryRun = true;
    } else if (value === '--resume') {
      options.resume = true;
    } else if (value === '--help' || value === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown option ${value}`);
    }
  }
  return options;
}

export function runInstaller(options) {
  if (!options.edition) {
    throw new Error('--edition is required (choose agy, codex, or claude)');
  }
  const edition = normalizeEdition(options.edition);
  if (edition === 'codex') {
    const result = installCodexBundle(options);
    return { edition: 'codex', ...result };
  }
  if (edition === 'claude') {
    const result = installClaudeBundle(options);
    return { edition: 'claude', ...result };
  }
  return installAgy(options);
}

function printUsage() {
  console.log(`Usage: node install.mjs [options]

Options:
  --edition <agy|codex|claude>   Target edition to install
  --mode <harness|designer>      Hook & policy mode: harness (all hooks + git pre-commit + full Harness lifecycle, default) or designer (non-harness hooks only + Designer AGENTS/CLAUDE; alias: normal)
  --target <absolute-dir>        Target project directory
  --profile <name>               Profile for codex/claude (all, minimal, frontend, backend, security, fullstack)
  --no-hooks                     Disable all active hooks
  --dry-run                      Preview without writing files or installing dependencies
  --resume                       Resume an incomplete installation or update .gitignore
  -h, --help                     Show this help message
`);
}

async function resolveInteractiveCliOptions(options) {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (!interactive) return options;
  const needEdition = !options.edition;
  const needMode = !options.mode && !options.resume && options.includeHooks !== false;
  const needTarget = !options.target;
  if (!needEdition && !needMode && !needTarget) return options;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const resolved = { ...options };
    if (needEdition) {
      console.error('\nQuestion 1/2 — Select edition:');
      console.error('  1) AGY    (AGY / GEMINI)');
      console.error('  2) CODEX  (GPT / CODEX)');
      console.error('  3) CLAUDE (ANTHROPIC / CLAUDE CODE)');
      for (;;) {
        const answer = (await rl.question('Select edition [1-3 or agy/codex/claude]: ')).trim().toLowerCase();
        if (answer === '1') { resolved.edition = 'agy'; break; }
        if (answer === '2') { resolved.edition = 'codex'; break; }
        if (answer === '3') { resolved.edition = 'claude'; break; }
        try {
          if (answer) { resolved.edition = normalizeEdition(answer); break; }
        } catch {
          // re-prompt below
        }
        console.error('Invalid selection. Enter 1 (AGY), 2 (CODEX), or 3 (CLAUDE).');
      }
    }
    if (needMode) {
      console.error('\nQuestion 2/2 — Select mode:');
      console.error('  1) HARNESS MODE (default) - Installs all hooks (Harness + Impeccable + design-taste-frontend + avoid-ai-writing), .git/hooks/pre-commit, and full Harness lifecycle in AGENTS.md / CLAUDE.md');
      console.error('  2) DESIGNER MODE          - Activates non-harness hooks (Impeccable, design-taste-frontend, avoid-ai-writing), skips Harness hooks/.git pre-commit, and installs Designer AGENTS.md / CLAUDE.md');
      for (;;) {
        const answer = (await rl.question('Select mode [1-2 or harness/designer, default: harness]: ')).trim().toLowerCase();
        if (!answer || answer === '1' || answer === 'harness') { resolved.mode = 'harness'; break; }
        if (answer === '2' || answer === 'designer' || answer === 'normal') { resolved.mode = 'designer'; break; }
        console.error('Invalid selection. Enter 1 (HARNESS MODE) or 2 (DESIGNER MODE).');
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
    const parsed = parseArgs(process.argv.slice(2));
    if (parsed.help) {
      printUsage();
    } else {
      const cliOptions = await resolveInteractiveCliOptions(parsed);
      console.log(json(runInstaller(cliOptions)));
    }
  } catch (error) {
    console.error(error.stack || error.message);
    if (error.cause) console.error('Caused by:', error.cause.stack || error.cause.message || error.cause);
    process.exitCode = 1;
  }
}
