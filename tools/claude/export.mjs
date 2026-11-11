import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  bundleRoot,
  sourceRoot,
  repoRoot,
  filesIn,
  assertNoSymlinkAncestors,
  within,
  sha256,
  slash,
  json,
  isRecord,
  verifyBundleFiles
} from './lib.mjs';
import { planGitignore, applyGitignore } from './gitignore.mjs';

export function resolveTarget(target, root = bundleRoot) {
  if (!target || !path.isAbsolute(target)) throw new Error('--target must be an absolute project directory');
  const destination = path.resolve(target);
  assertNoSymlinkAncestors(destination);
  if (
    destination === repoRoot ||
    within(sourceRoot, destination) ||
    within(root, destination) ||
    within(path.join(repoRoot, 'tools'), destination) ||
    within(destination, repoRoot)
  ) {
    throw new Error('Choose a target project separate from the original source and distribution directories');
  }
  return destination;
}

export function applyClaudeSettingsHooks(target, root = bundleRoot) {
  const hooksFile = path.join(root, 'hooks.example.json');
  if (!fs.existsSync(hooksFile)) return { path: '.claude/settings.json', action: 'skipped' };
  const parsedHooksFile = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
  const bundleHooks = parsedHooksFile.hooks || {};
  const settingsPath = path.join(target, '.claude/settings.json');
  assertNoSymlinkAncestors(settingsPath);
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  let existing = {};
  let action = 'created';
  if (fs.existsSync(settingsPath)) {
    const raw = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (!isRecord(raw)) throw new Error('Existing .claude/settings.json must be a JSON object');
    existing = raw;
    action = 'merged';
  }
  const existingHooks = isRecord(existing.hooks) ? { ...existing.hooks } : {};
  for (const [event, entries] of Object.entries(bundleHooks)) {
    if (!Array.isArray(entries)) continue;
    const currentList = Array.isArray(existingHooks[event]) ? [...existingHooks[event]] : [];
    const seen = new Set(currentList.map(item => JSON.stringify(item)));
    for (const item of entries) {
      const serialized = JSON.stringify(item);
      if (!seen.has(serialized)) {
        currentList.push(item);
        seen.add(serialized);
      }
    }
    existingHooks[event] = currentList;
  }
  const merged = { ...existing, hooks: existingHooks };
  fs.writeFileSync(settingsPath, json(merged), 'utf8');
  return { path: '.claude/settings.json', action };
}

export function planExport({ target, profile = 'all', includeHooks = true }, root = bundleRoot) {
  const destination = resolveTarget(target, root);
  const profiles = JSON.parse(fs.readFileSync(path.join(root, 'profiles.json'), 'utf8'));
  const all = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, 'skills', entry.name, 'SKILL.md')))
    .map(entry => entry.name);

  let selected;
  if (profile === 'all') selected = all;
  else if (profile === 'fullstack') selected = [...new Set([...(profiles.frontend || []), ...(profiles.backend || [])])];
  else if (profiles[profile]) selected = profiles[profile];
  else throw new Error(`Unknown profile ${profile}. Choose all, minimal, frontend, backend, security, or fullstack.`);

  const entries = [];
  const add = (source, relative) => {
    const output = path.resolve(destination, relative);
    if (!within(destination, output)) throw new Error(`Export path escapes its target: ${relative}`);
    assertNoSymlinkAncestors(output);
    if (fs.existsSync(output)) throw new Error(`Destination already exists: ${output}. Export to a new directory or review and merge manually.`);
    entries.push({ source, destination: output, relative });
  };

  add(path.join(root, 'CLAUDE.md'), 'CLAUDE.md');
  for (const area of ['rules', 'agents', 'commands']) {
    const dir = path.join(root, area);
    if (fs.existsSync(dir)) {
      for (const source of filesIn(dir)) {
        add(source, slash(path.join('.claude', area, path.relative(dir, source))));
      }
    }
  }

  for (const skill of selected) {
    if (!all.includes(skill)) throw new Error(`Missing skill ${skill} in profile ${profile}`);
    const directory = path.join(root, 'skills', skill);
    for (const source of filesIn(directory)) {
      add(source, slash(path.join('.claude/skills', skill, path.relative(directory, source))));
    }
  }

  add(path.join(root, 'hooks.example.json'), '.claude/hooks.example.json');
  if (includeHooks) add(path.join(root, 'hooks.example.json'), '.claude/hooks.json');

  const installManifest = path.join(destination, '.claude/claude-install.json');
  assertNoSymlinkAncestors(installManifest);
  if (fs.existsSync(installManifest)) throw new Error(`Destination already exists: ${installManifest}`);

  return {
    target: destination,
    profile,
    topLevelSkills: selected.length,
    includeHooks,
    entries,
    installManifest,
    gitignore: planGitignore(destination, root)
  };
}

export function exportBundle(options, root = bundleRoot) {
  const plan = planExport(options, root);
  const { manifest, files } = verifyBundleFiles(root);
  for (const entry of plan.entries) {
    if (!files.has(slash(path.relative(root, entry.source)))) {
      throw new Error(`Unverified bundle file: ${entry.source}`);
    }
  }
  if (options.dryRun) {
    return {
      target: plan.target,
      profile: plan.profile,
      topLevelSkills: plan.topLevelSkills,
      files: plan.entries.length + 2,
      gitignore: { ...plan.gitignore.record, action: plan.gitignore.action },
      dryRun: true
    };
  }

  const hashes = {};
  for (const entry of plan.entries) {
    const bundleRelative = slash(path.relative(root, entry.source));
    const data = files.get(bundleRelative);
    fs.mkdirSync(path.dirname(entry.destination), { recursive: true });
    fs.writeFileSync(entry.destination, data, { flag: 'wx' });
    hashes[entry.relative] = manifest.files?.[bundleRelative]?.outputHash ?? sha256(data);
  }

  const gitignore = applyGitignore(plan.gitignore);
  if (plan.includeHooks) applyClaudeSettingsHooks(plan.target, root);
  fs.writeFileSync(
    plan.installManifest,
    json({
      source: 'skills-v2 Claude Code edition',
      formatVersion: 1,
      hashing: 'sha256-lf-text',
      profile: plan.profile,
      topLevelSkills: plan.topLevelSkills,
      hooksIncluded: plan.includeHooks,
      gitignore: plan.gitignore.record,
      files: hashes
    }),
    { flag: 'wx' }
  );

  return {
    target: plan.target,
    profile: plan.profile,
    topLevelSkills: plan.topLevelSkills,
    files: plan.entries.length + 2,
    gitignore,
    dryRun: false
  };
}

export function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--target' || value === '--profile') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${value} requires a value`);
      options[value.slice(2)] = args[++index];
    } else if (value === '--dry-run') {
      options.dryRun = true;
    } else if (value === '--include-hooks') {
      options.includeHooks = true;
    } else if (value === '--no-hooks') {
      options.includeHooks = false;
    } else {
      throw new Error(`Unknown option ${value}`);
    }
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(json(exportBundle(parseArgs(process.argv.slice(2)))));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
