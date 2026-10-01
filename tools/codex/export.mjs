import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleRoot, sourceRoot, repoRoot, filesIn, assertNoSymlinkAncestors, within, sha256, slash, json } from './lib.mjs';
import { validateBundle } from './validate.mjs';

export function planExport({ target, profile = 'all', includeHooks = false }, root = bundleRoot) {
  if (!target || !path.isAbsolute(target)) throw new Error('--target must be an absolute project directory');
  const destination = path.resolve(target);
  assertNoSymlinkAncestors(destination);
  if (destination === repoRoot || within(sourceRoot, destination) || within(root, destination) || within(path.join(repoRoot, 'tools'), destination) || within(destination, repoRoot)) throw new Error('Choose a target project separate from the original source and distribution directories');
  const profiles = JSON.parse(fs.readFileSync(path.join(root, 'profiles.json'), 'utf8'));
  const all = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, 'skills', entry.name, 'SKILL.md'))).map(entry => entry.name);
  let selected;
  if (profile === 'all') selected = all;
  else if (profile === 'fullstack') selected = [...new Set([...profiles.frontend, ...profiles.backend])];
  else if (profiles[profile]) selected = profiles[profile];
  else throw new Error(`Unknown profile ${profile}. Choose all, minimal, frontend, backend, security, or fullstack.`);
  if (includeHooks && !selected.includes('impeccable')) throw new Error('--include-hooks requires a profile containing impeccable');
  const entries = [];
  const add = (source, relative) => {
    const output = path.resolve(destination, relative);
    if (!within(destination, output)) throw new Error(`Export path escapes its target: ${relative}`);
    assertNoSymlinkAncestors(output);
    if (fs.existsSync(output)) throw new Error(`Destination already exists: ${output}. Export to a new directory or review and merge manually.`);
    entries.push({ source, destination: output, relative });
  };
  add(path.join(root, 'AGENTS.template.md'), 'AGENTS.md');
  for (const area of ['rules', 'resources']) for (const source of filesIn(path.join(root, area))) add(source, slash(path.join('.agents', area, path.relative(path.join(root, area), source))));
  for (const skill of selected) {
    if (!all.includes(skill)) throw new Error(`Missing skill ${skill} in profile ${profile}`);
    const directory = path.join(root, 'skills', skill);
    for (const source of filesIn(directory)) add(source, slash(path.join('.agents/skills', skill, path.relative(directory, source))));
  }
  if (includeHooks) add(path.join(root, 'hooks.example.json'), '.codex/hooks.json');
  const installManifest = path.join(destination, '.agents/codex-install.json');
  assertNoSymlinkAncestors(installManifest);
  if (fs.existsSync(installManifest)) throw new Error(`Destination already exists: ${installManifest}`);
  return { target: destination, profile, topLevelSkills: selected.length, includeHooks, entries, installManifest };
}

export function exportBundle(options, root = bundleRoot) {
  const validation = validateBundle(root, { checkSource: false });
  if (validation.errors.length) throw new Error(`Bundle validation failed: ${validation.errors.join('; ')}`);
  const plan = planExport(options, root);
  if (options.dryRun) return { target: plan.target, profile: plan.profile, topLevelSkills: plan.topLevelSkills, files: plan.entries.length + 1, dryRun: true };
  const hashes = {};
  for (const entry of plan.entries) {
    const data = fs.readFileSync(entry.source);
    fs.mkdirSync(path.dirname(entry.destination), { recursive: true });
    // Exclusive creation also prevents overwriting a file created after preflight.
    fs.writeFileSync(entry.destination, data, { flag: 'wx' });
    hashes[entry.relative] = sha256(data);
  }
  fs.writeFileSync(plan.installManifest, json({ source: 'skills-v2 Codex edition', profile: plan.profile, topLevelSkills: plan.topLevelSkills, hooksIncluded: plan.includeHooks, files: hashes }), { flag: 'wx' });
  return { target: plan.target, profile: plan.profile, topLevelSkills: plan.topLevelSkills, files: plan.entries.length + 1, dryRun: false };
}

export function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--target' || value === '--profile') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${value} requires a value`);
      options[value.slice(2)] = args[++index];
    } else if (value === '--dry-run') options.dryRun = true;
    else if (value === '--include-hooks') options.includeHooks = true;
    else throw new Error(`Unknown option ${value}`);
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(json(exportBundle(parseArgs(process.argv.slice(2))))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
