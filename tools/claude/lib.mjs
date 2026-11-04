import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { isUtf8 } from 'node:buffer';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let yamlParser;

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const bundleRoot = path.join(repoRoot, '.claude');
export const sourceRoot = path.join(repoRoot, '.agents');
export const claudeBuiltinTools = new Set(['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob']);
const skippedDirectories = new Set(['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.cache']);

export const slash = value => value.split(path.sep).join('/');
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
export const json = value => JSON.stringify(value, null, 2) + '\n';
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function payloadData(value) {
  const data = Buffer.isBuffer(value) ? value : Buffer.from(value);
  if (!data.includes(13) || data.includes(0) || !isUtf8(data)) return data;
  return Buffer.from(data.toString('utf8').replaceAll('\r\n', '\n'));
}

export const payloadHash = value => sha256(payloadData(value));

export function filesIn(directory) {
  const result = [];
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink requires an explicit copy decision: ${absolute}`);
    if (entry.isDirectory() && !skippedDirectories.has(entry.name)) result.push(...filesIn(absolute));
    else if (entry.isFile() && !skippedDirectories.has(entry.name) && !/^\.env(?:\.|$)/.test(entry.name) && !/\.(?:pem|key|pfx|p12)$/i.test(entry.name)) result.push(absolute);
  }
  return result;
}

export function parseYaml(text, label = 'YAML') {
  try {
    yamlParser ??= require('../codex/node_modules/yaml');
  } catch {
    yamlParser ??= require('yaml');
  }
  const document = yamlParser.parseDocument(text, { uniqueKeys: true });
  if (document.errors.length) throw new Error(`${label}: ${document.errors.map(error => error.message).join('; ')}`);
  return document.toJS({ maxAliasCount: 50 });
}

export function parseFrontmatter(text, label = 'document') {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error(`${label}: missing YAML frontmatter`);
  const frontmatter = parseYaml(match[1], label);
  if (!isRecord(frontmatter)) throw new Error(`${label}: frontmatter must be a mapping`);
  return { frontmatter, body: text.slice(match[0].length) };
}

export function checkSkill(frontmatter, directoryName) {
  const errors = [];
  const name = frontmatter.name;
  const description = frontmatter.description;
  if (typeof name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) errors.push('name must be lowercase kebab-case with at most 64 characters');
  if (name !== directoryName) errors.push(`name ${JSON.stringify(name)} does not match directory ${directoryName}`);
  if (typeof description !== 'string' || !description.trim() || description.length > 1024) errors.push('description must be a non-empty string with at most 1024 characters');
  return errors;
}

export function checkClaudeAgent(frontmatter, filename) {
  const errors = [];
  const name = frontmatter.name;
  const description = frontmatter.description;
  const expectedName = path.basename(filename, '.md');
  if (typeof name !== 'string' || name !== expectedName) errors.push(`name ${JSON.stringify(name)} must match filename ${expectedName}`);
  if (typeof description !== 'string' || !description.trim()) errors.push('description must be a non-empty string');
  if (frontmatter.tools !== undefined) {
    const toolList = Array.isArray(frontmatter.tools) ? frontmatter.tools : String(frontmatter.tools).split(',').map(t => t.trim());
    for (const tool of toolList) {
      if (!claudeBuiltinTools.has(tool)) errors.push(`unrecognized Claude Code tool: ${tool}. Allowed: ${[...claudeBuiltinTools].join(', ')}`);
    }
  }
  return errors;
}

export function snapshotSource() {
  const names = filesIn(sourceRoot).map(file => slash(path.relative(repoRoot, file)));
  names.push(...['AGENTS.md', 'README.md', 'skills-lock.json', '.gitignore'].filter(name => fs.existsSync(path.join(repoRoot, name))));
  const files = Object.fromEntries(names.sort().map(name => [name, payloadHash(fs.readFileSync(path.join(repoRoot, name)))]));
  return { digest: sha256(json(files)), files };
}

export function writeIfChanged(absolute, content) {
  const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (fs.existsSync(absolute) && fs.readFileSync(absolute).equals(data)) return;
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, data);
}

const verifiedAncestors = new Set();
export function assertNoSymlinkAncestors(absolute) {
  let current = path.resolve(absolute);
  const toVerify = [];
  for (;;) {
    if (verifiedAncestors.has(current)) break;
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing a symlink destination: ${current}`);
    toVerify.push(current);
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  for (const p of toVerify) verifiedAncestors.add(p);
}

export function within(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep));
}

export function verifyBundleFiles(root = bundleRoot) {
  const manifestFile = path.join(root, 'manifest.json');
  if (!fs.existsSync(manifestFile)) throw new Error('Missing prebuilt Claude bundle manifest.');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (manifest.generatedBy !== 'tools/claude/build.mjs' || !isRecord(manifest.files)) throw new Error('Invalid Claude bundle manifest');
  const files = new Map();
  const errors = [];
  for (const [relative, record] of Object.entries(manifest.files)) {
    const absolute = path.resolve(root, relative);
    if (path.isAbsolute(relative) || !within(root, absolute) || !/^[a-f0-9]{64}$/.test(record?.outputHash || '')) throw new Error(`Invalid manifest entry: ${relative}`);
    assertNoSymlinkAncestors(absolute);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) { errors.push(`Missing generated file: ${relative}`); continue; }
    const data = fs.readFileSync(absolute);
    const checked = payloadData(data);
    if (sha256(checked) !== record.outputHash) errors.push(`Generated file differs from manifest: ${relative}`);
    else files.set(relative, checked);
  }
  if (errors.length) throw new Error(`Claude bundle integrity check failed (${errors.length} files): ${errors.slice(0, 4).join('; ')}`);
  const skills = [...files.keys()].filter(relative => relative.startsWith('skills/') && path.basename(relative) === 'SKILL.md');
  if (!skills.length || skills.length !== manifest.summary?.discoverableSkills || Object.keys(manifest.files).length !== manifest.summary?.generatedFiles) throw new Error('Claude bundle file or skill count differs from manifest');
  return { manifest, files };
}
