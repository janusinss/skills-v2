import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleRoot, sourceRoot, repoRoot, filesIn, parseSkill, snapshotSource, slash, json, sha256, payloadData, payloadHash, writeIfChanged, assertNoSymlinkAncestors } from './lib.mjs';
import { convertSkill, openaiMetadata, yamlText, readOriginalMetadata, adaptMarkdown, adaptPlaywrightRunner } from './convert.mjs';

export function buildBundle() {
  assertNoSymlinkAncestors(bundleRoot);
  const before = snapshotSource();
  const sourceFiles = filesIn(sourceRoot);
  const skillFiles = sourceFiles.filter(file => path.basename(file) === 'SKILL.md');
  const canonicalNames = new Map();
  const duplicates = new Map();
  for (const file of skillFiles.sort((a, b) => a.length - b.length || a.localeCompare(b))) {
    const { frontmatter } = parseSkill(fs.readFileSync(file, 'utf8'), file);
    if (canonicalNames.has(frontmatter.name)) duplicates.set(file, path.join(path.dirname(file), 'REFERENCE.md'));
    else canonicalNames.set(frontmatter.name, file);
  }
  const previousPath = path.join(bundleRoot, 'manifest.json');
  const previous = fs.existsSync(previousPath) ? JSON.parse(fs.readFileSync(previousPath, 'utf8')) : { files: {} };
  if (previous.generatedBy && previous.generatedBy !== 'tools/codex/build.mjs') throw new Error('Unexpected generated bundle owner');
  const outputs = new Map();
  const records = {};
  let topLevelSkills = 0;
  let discoverableSkills = 0;
  const templates = path.join(repoRoot, 'tools/codex/templates');

  function add(relative, content, source) {
    if (outputs.has(relative)) throw new Error(`Output collision: ${relative}`);
    const data = payloadData(content);
    outputs.set(relative, data);
    records[relative] = { source: slash(path.relative(repoRoot, source)), sourceHash: payloadHash(fs.readFileSync(source)), outputHash: sha256(data) };
  }

  for (const source of sourceFiles) {
    const originalRelative = slash(path.relative(sourceRoot, source));
    if (originalRelative === 'hooks.json' || originalRelative.startsWith('rules/')) continue;
    if (/\/agents\/openai\.yaml$/.test(originalRelative) && skillFiles.includes(path.resolve(path.dirname(source), '../SKILL.md'))) continue;
    if (duplicates.has(source)) {
      const { text } = convertSkill(fs.readFileSync(source, 'utf8'), source, duplicates);
      add(slash(path.relative(sourceRoot, duplicates.get(source))), text, source);
    } else if (path.basename(source) === 'SKILL.md') {
      const override = path.join(templates, originalRelative);
      const input = fs.existsSync(override) ? override : source;
      const { text, frontmatter } = convertSkill(fs.readFileSync(input, 'utf8'), source, duplicates);
      add(originalRelative, text, input);
      const metadataRelative = slash(path.join(path.dirname(originalRelative), 'agents/openai.yaml'));
      add(metadataRelative, yamlText(openaiMetadata(readOriginalMetadata(source), frontmatter)), source);
      discoverableSkills++;
      if (path.dirname(path.dirname(source)) === path.join(sourceRoot, 'skills')) topLevelSkills++;
    } else if (originalRelative === 'skills/playwright-skill/run.js') {
      add(originalRelative, adaptPlaywrightRunner(fs.readFileSync(source, 'utf8')), source);
    } else if (source.endsWith('.md')) {
      add(originalRelative, adaptMarkdown(fs.readFileSync(source, 'utf8'), source, duplicates), source);
    } else add(originalRelative, fs.readFileSync(source), source);
  }

  for (const original of filesIn(path.join(sourceRoot, 'rules'))) {
    const name = path.basename(original);
    const override = path.join(templates, 'rules', name);
    const input = fs.existsSync(override) ? override : original;
    let text = fs.readFileSync(input, 'utf8');
    if (!fs.existsSync(override)) {
      const { body } = parseSkill(text, input);
      text = `> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.\n\n${body}`;
    }
    add(`rules/${name}`, adaptMarkdown(text, original, duplicates), input);
  }
  const agentsTemplate = path.join(templates, 'AGENTS.template.md');
  add('AGENTS.template.md', fs.readFileSync(agentsTemplate), agentsTemplate);
  const hooks = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'hooks.json'), 'utf8'));
  add('hooks.example.json', json({ description: 'Optional Impeccable hooks. Install at .codex/hooks.json in a trusted target project and review them in Codex before use.', ...hooks }).replaceAll('.agents/skills/', '.codex/skills/'), path.join(sourceRoot, 'hooks.json'));

  // Preflight every generated destination before writing any files. Refuse to
  // overwrite manually edited generated files, and never delete stale files.
  for (const [relative, data] of outputs) {
    const absolute = path.join(bundleRoot, relative);
    assertNoSymlinkAncestors(absolute);
    if (fs.existsSync(absolute)) {
      const currentData = fs.readFileSync(absolute);
      const currentHash = previous.formatVersion === 2 ? payloadHash(currentData) : sha256(currentData);
      if (currentHash !== sha256(data) && currentHash !== previous.files?.[relative]?.outputHash) throw new Error(`Edited or unowned generated file: ${relative}. Preserve it before rebuilding.`);
    }
  }
  for (const old of Object.keys(previous.files || {})) if (!outputs.has(old)) throw new Error(`Stale generated file ${old}; review it before rebuilding. No files were removed.`);
  for (const [relative, data] of outputs) writeIfChanged(path.join(bundleRoot, relative), data);
  const after = snapshotSource();
  if (before.digest !== after.digest) throw new Error('Original source changed during conversion');
  const manifest = {
    generatedBy: 'tools/codex/build.mjs', formatVersion: 2, hashing: 'sha256-lf-text', checkedOn: '2026-10-01',
    originalSnapshot: before, originalPreserved: true,
    summary: { topLevelSkills, discoverableSkills, duplicatesPreservedAsReferences: duplicates.size, rules: 8, generatedFiles: outputs.size },
    duplicateReferences: Object.fromEntries([...duplicates].map(([from, to]) => [slash(path.relative(sourceRoot, from)), slash(path.relative(sourceRoot, to))])),
    files: records,
  };
  writeIfChanged(previousPath, json(manifest));
  return manifest.summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(json(buildBundle())); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
