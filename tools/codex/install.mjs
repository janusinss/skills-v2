import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { exportBundle, parseArgs as parseExportArgs, resolveTarget } from './export.mjs';
import { bundleRoot, assertNoSymlinkAncestors, within, payloadHash, json, isRecord } from './lib.mjs';

const installRule = '.codex/rules/install.md';
const playwrightRunner = '.codex/skills/playwright-skill/run.js';
const verificationMarker = 'PLAYWRIGHT_VERIFIED_OK';
const verificationScript = `const browser = await chromium.launch({ headless: true }); try { const page = await browser.newPage(); await page.setContent('<title>Codex setup</title>'); if (await page.title() !== 'Codex setup') throw new Error('Browser verification failed'); console.log('${verificationMarker}'); } finally { await browser.close(); }`;

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

function finishSetup(target, manifestPath, manifest, playwright) {
  // Recheck ownership after setup and before deleting the installed rule.
  const checked = readInstallation(target);
  if (json(checked.manifest) !== json(manifest)) throw new Error('Installation record changed during setup');
  const rulePath = path.join(target, installRule);
  const ruleData = fs.readFileSync(rulePath);
  const completed = { ...manifest, files: { ...manifest.files }, setup: { status: 'complete', playwright, removedFiles: [installRule] } };
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
  if (!options.resume) {
    const exported = exportBundle(options, root);
    if (options.dryRun) return { ...exported, setup: 'Playwright and Chromium when the profile includes playwright-skill', removesAfterSuccess: [installRule] };
  }
  const { manifestPath, manifest } = readInstallation(target);
  if (options.resume && ((options.profile && options.profile !== manifest.profile) || (options.includeHooks && !manifest.hooksIncluded))) throw new Error('--resume uses the installed profile and hook selection');
  if (options.dryRun || manifest.setup?.status === 'complete') return { target, profile: manifest.profile, topLevelSkills: manifest.topLevelSkills, files: Object.keys(manifest.files).length + 1, dryRun: Boolean(options.dryRun), setup: manifest.setup?.status || 'pending' };
  let playwright = 'not included in selected profile';
  try {
    if (manifest.files[playwrightRunner]) {
      const skillDirectory = path.dirname(path.join(target, playwrightRunner));
      console.error('Installing local Playwright dependencies from the included lockfile...');
      if (process.platform === 'win32') runStep(execute, process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm ci --no-audit --no-fund --prefer-offline'], { cwd: skillDirectory, stdio: 'inherit' }, 'Playwright dependency setup');
      else runStep(execute, 'npm', ['ci', '--no-audit', '--no-fund', '--prefer-offline'], { cwd: skillDirectory, stdio: 'inherit' }, 'Playwright dependency setup');
      console.error('Installing Chromium (cached browsers are reused)...');
      runStep(execute, process.execPath, [path.join(skillDirectory, 'node_modules/playwright/cli.js'), 'install', 'chromium'], { cwd: skillDirectory, stdio: 'inherit' }, 'Chromium setup');
      console.error('Verifying the installed Playwright runner...');
      const result = runStep(execute, process.execPath, [path.join(target, playwrightRunner), '-e', verificationScript], { cwd: target, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }, 'Playwright verification');
      if (!result.stdout?.split(/\r?\n/).includes(verificationMarker)) throw new Error('Playwright verification did not return its success marker');
      playwright = 'verified';
    }
    const completed = finishSetup(target, manifestPath, manifest, playwright);
    return { target, profile: completed.profile, topLevelSkills: completed.topLevelSkills, files: Object.keys(completed.files).length + 1, dryRun: false, setup: completed.setup };
  } catch (error) {
    throw new Error(`${error.message}\nSetup is incomplete; the installed ${installRule} is retained. Retry from the source checkout with node tools/codex/install.mjs --target ${JSON.stringify(target)} --resume.`, { cause: error });
  }
}

export function parseArgs(args) {
  return { ...parseExportArgs(args.filter(value => value !== '--resume')), resume: args.includes('--resume') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(json(installBundle(parseArgs(process.argv.slice(2))))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
