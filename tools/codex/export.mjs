import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleRoot, sourceRoot, repoRoot, filesIn, assertNoSymlinkAncestors, within, sha256, slash, json, verifyBundleFiles } from './lib.mjs';
import { planGitignore, applyGitignore } from './gitignore.mjs';

export function resolveTarget(target, root = bundleRoot) {
  if (!target || !path.isAbsolute(target)) throw new Error('--target must be an absolute project directory');
  const destination = path.resolve(target);
  assertNoSymlinkAncestors(destination);
  if (destination === repoRoot || within(sourceRoot, destination) || within(root, destination) || within(path.join(repoRoot, 'tools'), destination) || within(destination, repoRoot)) throw new Error('Choose a target project separate from the original source and distribution directories');
  return destination;
}

export function normalizeMode(mode = 'harness') {
  if (typeof mode !== 'string') throw new Error('Invalid --mode. Choose harness or designer.');
  const normalized = mode.trim().toLowerCase();
  if (normalized === 'normal') return 'designer';
  if (normalized !== 'harness' && normalized !== 'designer') throw new Error(`Unknown mode ${mode}. Choose harness or designer.`);
  return normalized;
}

export function resolveHooksSourceFile(mode = 'harness', root = bundleRoot) {
  return normalizeMode(mode) === 'designer'
    ? path.join(root, 'hooks.impeccable.example.json')
    : path.join(root, 'hooks.example.json');
}

export function planExport({ target, profile = 'all', includeHooks = true, mode = 'harness' }, root = bundleRoot) {
  const destination = resolveTarget(target, root);
  const resolvedMode = normalizeMode(mode);
  const hookSet = !includeHooks ? 'none' : resolvedMode === 'designer' ? 'impeccable' : 'all';
  const profiles = JSON.parse(fs.readFileSync(path.join(root, 'profiles.json'), 'utf8'));
  const all = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, 'skills', entry.name, 'SKILL.md'))).map(entry => entry.name);
  let selected;
  if (profile === 'all') selected = [...all];
  else if (profile === 'fullstack') selected = [...new Set([...profiles.frontend, ...profiles.backend])];
  else if (profiles[profile]) selected = [...profiles[profile]];
  else throw new Error(`Unknown profile ${profile}. Choose all, minimal, frontend, backend, security, or fullstack.`);
  if (all.includes('swarm') && !selected.includes('swarm')) selected.push('swarm');
  const entries = [];
  const add = (source, relative) => {
    const output = path.resolve(destination, relative);
    if (!within(destination, output)) throw new Error(`Export path escapes its target: ${relative}`);
    assertNoSymlinkAncestors(output);
    if (fs.existsSync(output)) throw new Error(`Destination already exists: ${output}. Export to a new directory or review and merge manually.`);
    entries.push({ source, destination: output, relative });
  };
  const agentsSource = resolvedMode === 'designer' && fs.existsSync(path.join(root, 'AGENTS.designer.md'))
    ? path.join(root, 'AGENTS.designer.md')
    : path.join(root, 'AGENTS.md');
  add(agentsSource, 'AGENTS.md');
  for (const area of ['rules', 'agents', 'resources']) {
    const dir = path.join(root, area);
    if (fs.existsSync(dir)) {
      for (const source of filesIn(dir)) add(source, slash(path.join('.codex', area, path.relative(dir, source))));
    }
  }
  for (const skill of selected) {
    if (!all.includes(skill)) throw new Error(`Missing skill ${skill} in profile ${profile}`);
    const directory = path.join(root, 'skills', skill);
    for (const source of filesIn(directory)) add(source, slash(path.join('.codex/skills', skill, path.relative(directory, source))));
  }
  const configExample = path.join(root, 'config.example.toml');
  if (fs.existsSync(configExample)) add(configExample, '.codex/config.example.toml');
  add(path.join(root, 'hooks.example.json'), '.codex/hooks.example.json');
  const impeccableHooksExample = path.join(root, 'hooks.impeccable.example.json');
  if (fs.existsSync(impeccableHooksExample)) add(impeccableHooksExample, '.codex/hooks.impeccable.example.json');
  if (includeHooks) {
    const activeHooksSource = resolveHooksSourceFile(resolvedMode, root);
    if (!fs.existsSync(activeHooksSource)) {
      throw new Error(`Missing ${path.basename(activeHooksSource)} in Codex bundle at ${root}. Rebuild the bundle or use a complete release checkout.`);
    }
    add(activeHooksSource, '.codex/hooks.json');
  }
  const installManifest = path.join(destination, '.codex/codex-install.json');
  assertNoSymlinkAncestors(installManifest);
  if (fs.existsSync(installManifest)) throw new Error(`Destination already exists: ${installManifest}`);
  return { target: destination, profile, mode: resolvedMode, topLevelSkills: selected.length, includeHooks, hookSet, entries, installManifest, gitignore: planGitignore(destination, root) };
}

const tomlHeaderRe = /^\s*\[{1,2}[^\]\r\n]+\]{1,2}\s*(?:#.*)?$/m;

function extractTomlSection(text, header) {
  const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startMatch = new RegExp(`^\\s*\\[${escaped}\\]\\s*(?:#.*)?$`, 'm').exec(text);
  if (!startMatch) return null;
  const startIndex = startMatch.index;
  const afterHeader = startIndex + startMatch[0].length;
  const nextTable = tomlHeaderRe.exec(text.slice(afterHeader));
  const endIndex = nextTable ? afterHeader + nextTable.index : text.length;
  return text.slice(startIndex, endIndex).trimEnd();
}

export function mergeCodexConfigToml(existingText, exampleText) {
  let updated = existingText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  let changed = false;

  const featuresHeaderRe = /^\s*\[features\]\s*(?:#.*)?$/m;
  const featuresMatch = featuresHeaderRe.exec(updated);
  if (featuresMatch) {
    const afterHeader = featuresMatch.index + featuresMatch[0].length;
    const nextTable = tomlHeaderRe.exec(updated.slice(afterHeader));
    const sectionEnd = nextTable ? afterHeader + nextTable.index : updated.length;
    const sectionBody = updated.slice(afterHeader, sectionEnd);
    if (!/^\s*multi_agent\s*=/m.test(sectionBody)) {
      updated = `${updated.slice(0, afterHeader)}\nmulti_agent = true${updated.slice(afterHeader)}`;
      changed = true;
    }
  } else {
    const firstHeader = tomlHeaderRe.exec(updated);
    const topLevelEnd = firstHeader ? firstHeader.index : updated.length;
    const topLevel = updated.slice(0, topLevelEnd);
    if (/^\s*features\.(?!multi_agent_v2\b)/m.test(topLevel)) {
      if (!/^\s*features\.multi_agent\s*=/m.test(topLevel)) {
        const dottedRe = /^\s*features\.(?!multi_agent_v2\b)[^\n]*/gm;
        let lastMatch = null;
        for (let m; (m = dottedRe.exec(topLevel)) !== null;) lastMatch = m;
        const insertAt = lastMatch ? lastMatch.index + lastMatch[0].length : topLevelEnd;
        updated = `${updated.slice(0, insertAt)}\nfeatures.multi_agent = true${updated.slice(insertAt)}`;
        changed = true;
      }
    } else {
      const featuresBlock = extractTomlSection(exampleText, 'features') || '[features]\nmulti_agent = true';
      updated = updated.trim() ? `${updated.trimEnd()}\n\n${featuresBlock}\n` : `${featuresBlock}\n`;
      changed = true;
    }
  }

  if (!/^\s*\[features\.multi_agent_v2\]\s*(?:#.*)?$/m.test(updated)) {
    const v2Block = extractTomlSection(exampleText, 'features.multi_agent_v2') || [
      '[features.multi_agent_v2]',
      'enabled = true',
      'max_concurrent_threads_per_session = 16',
      'min_wait_timeout_ms = 10000',
      'default_wait_timeout_ms = 30000',
      'max_wait_timeout_ms = 3600000',
      'hide_spawn_agent_metadata = false',
    ].join('\n');
    updated = updated.trim() ? `${updated.trimEnd()}\n\n${v2Block}\n` : `${v2Block}\n`;
    changed = true;
  }

  return { changed, content: updated.endsWith('\n') ? updated : `${updated}\n` };
}

export function planCodexConfigToml(target, root = bundleRoot) {
  const examplePath = path.join(root, 'config.example.toml');
  if (!fs.existsSync(examplePath)) return { path: '.codex/config.toml', action: 'skipped' };
  const configPath = path.join(target, '.codex/config.toml');
  assertNoSymlinkAncestors(configPath);
  const exampleText = fs.readFileSync(examplePath, 'utf8').replace(/\r\n/g, '\n');
  if (!fs.existsSync(configPath)) {
    return { path: '.codex/config.toml', action: 'created', configPath, content: exampleText.endsWith('\n') ? exampleText : `${exampleText}\n` };
  }
  const existingText = fs.readFileSync(configPath, 'utf8');
  const merged = mergeCodexConfigToml(existingText, exampleText);
  return {
    path: '.codex/config.toml',
    action: merged.changed ? 'merged' : 'unchanged',
    configPath,
    content: merged.content,
  };
}

export function applyCodexConfigToml(target, root = bundleRoot) {
  const plan = planCodexConfigToml(target, root);
  if (plan.action === 'created') {
    fs.mkdirSync(path.dirname(plan.configPath), { recursive: true });
    fs.writeFileSync(plan.configPath, plan.content, { encoding: 'utf8', flag: 'wx' });
  } else if (plan.action === 'merged') {
    fs.writeFileSync(plan.configPath, plan.content, 'utf8');
  }
  return { path: plan.path, action: plan.action };
}

export function exportBundle(options, root = bundleRoot) {
  const plan = planExport(options, root);
  const { manifest, files } = verifyBundleFiles(root);
  for (const entry of plan.entries) {
    if (!files.has(slash(path.relative(root, entry.source)))) throw new Error(`Unverified bundle file: ${entry.source}`);
  }
  if (options.dryRun) {
    const configPlan = planCodexConfigToml(plan.target, root);
    return { target: plan.target, profile: plan.profile, mode: plan.mode, topLevelSkills: plan.topLevelSkills, includeHooks: plan.includeHooks, hookSet: plan.hookSet, files: plan.entries.length + 2, gitignore: { ...plan.gitignore.record, action: plan.gitignore.action }, configToml: { path: configPlan.path, action: configPlan.action }, dryRun: true };
  }
  const hashes = {};
  for (const entry of plan.entries) {
    const bundleRelative = slash(path.relative(root, entry.source));
    const data = files.get(bundleRelative);
    fs.mkdirSync(path.dirname(entry.destination), { recursive: true });
    // Exclusive creation also prevents overwriting a file created after preflight.
    fs.writeFileSync(entry.destination, data, { flag: 'wx' });
    hashes[entry.relative] = manifest.files?.[bundleRelative]?.outputHash ?? sha256(data);
  }
  const gitignore = applyGitignore(plan.gitignore);
  const configToml = applyCodexConfigToml(plan.target, root);
  // .gitignore and .codex/config.toml are shared project configuration. Record
  // them outside immutable payload hashes so later user edits remain valid.
  fs.writeFileSync(plan.installManifest, json({ source: 'skills-v2 Codex edition', formatVersion: 2, hashing: 'sha256-lf-text', profile: plan.profile, mode: plan.mode, topLevelSkills: plan.topLevelSkills, hooksIncluded: plan.includeHooks, hookSet: plan.hookSet, gitignore: plan.gitignore.record, files: hashes }), { flag: 'wx' });
  return { target: plan.target, profile: plan.profile, mode: plan.mode, topLevelSkills: plan.topLevelSkills, includeHooks: plan.includeHooks, hookSet: plan.hookSet, files: plan.entries.length + 2, gitignore, configToml, dryRun: false };
}

export function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--target' || value === '--profile' || value === '--mode') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${value} requires a value`);
      const nextValue = args[++index];
      if (value === '--mode') options.mode = normalizeMode(nextValue);
      else options[value.slice(2)] = nextValue;
    } else if (value === '--dry-run') options.dryRun = true;
    else if (value === '--include-hooks') options.includeHooks = true;
    else if (value === '--no-hooks') options.includeHooks = false;
    else throw new Error(`Unknown option ${value}`);
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(json(exportBundle(parseArgs(process.argv.slice(2))))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
