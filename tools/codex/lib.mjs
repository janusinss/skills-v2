import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const bundleRoot = path.join(repoRoot, '.codex');
export const sourceRoot = path.join(repoRoot, '.agents');
export const supportedFields = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const skippedDirectories = new Set(['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.cache']);

export const slash = value => value.split(path.sep).join('/');
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
export const json = value => JSON.stringify(value, null, 2) + '\n';
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

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
  const document = YAML.parseDocument(text, { uniqueKeys: true });
  if (document.errors.length) throw new Error(`${label}: ${document.errors.map(error => error.message).join('; ')}`);
  return document.toJS({ maxAliasCount: 50 });
}

export function parseSkill(text, label = 'SKILL.md') {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error(`${label}: missing YAML frontmatter`);
  const frontmatter = parseYaml(match[1], label);
  if (!isRecord(frontmatter)) throw new Error(`${label}: frontmatter must be a mapping`);
  return { frontmatter, body: text.slice(match[0].length) };
}

export function checkSkill(frontmatter, directoryName, strict = true) {
  const errors = [];
  const name = frontmatter.name;
  const description = frontmatter.description;
  if (typeof name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) errors.push('name must be lowercase kebab-case with at most 64 characters');
  if (name !== directoryName) errors.push(`name ${JSON.stringify(name)} does not match directory ${directoryName}`);
  if (typeof description !== 'string' || !description.trim() || description.length > 1024) errors.push('description must be a non-empty string with at most 1024 characters');
  if (frontmatter.compatibility !== undefined && (typeof frontmatter.compatibility !== 'string' || frontmatter.compatibility.length > 500)) errors.push('compatibility must be a string with at most 500 characters');
  if (frontmatter.license !== undefined && typeof frontmatter.license !== 'string') errors.push('license must be a string');
  if (frontmatter['allowed-tools'] !== undefined && typeof frontmatter['allowed-tools'] !== 'string') errors.push('allowed-tools must be a string');
  if (frontmatter.metadata !== undefined && (!isRecord(frontmatter.metadata) || Object.values(frontmatter.metadata).some(value => typeof value !== 'string'))) errors.push('metadata must map keys to string values');
  if (strict) for (const field of Object.keys(frontmatter)) if (!supportedFields.has(field)) errors.push(`unsupported top-level field: ${field}`);
  return errors;
}

export function checkOpenai(data, skillName) {
  const errors = [];
  if (!isRecord(data)) return ['openai.yaml must be a mapping'];
  for (const field of Object.keys(data)) if (!['interface', 'policy', 'dependencies'].includes(field)) errors.push(`unknown openai.yaml field: ${field}`);
  if (data.interface !== undefined) {
    if (!isRecord(data.interface)) errors.push('interface must be a mapping');
    else {
      for (const [key, value] of Object.entries(data.interface)) {
        if (!['display_name', 'short_description', 'icon_small', 'icon_large', 'brand_color', 'default_prompt'].includes(key)) errors.push(`unknown interface field: ${key}`);
        if (typeof value !== 'string' || !value.trim()) errors.push(`interface.${key} must be a non-empty string`);
      }
      const short = data.interface.short_description;
      if (typeof short === 'string' && (short.length < 25 || short.length > 64)) errors.push('short_description must have 25–64 characters');
      const prompt = data.interface.default_prompt;
      if (typeof prompt === 'string' && !prompt.includes(`$${skillName}`)) errors.push(`default_prompt must mention $${skillName}`);
      if (data.interface.brand_color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(data.interface.brand_color)) errors.push('brand_color must be a six-digit hex color');
    }
  }
  if (data.policy !== undefined && (!isRecord(data.policy) || Object.keys(data.policy).some(key => key !== 'allow_implicit_invocation') || (data.policy.allow_implicit_invocation !== undefined && typeof data.policy.allow_implicit_invocation !== 'boolean'))) errors.push('policy.allow_implicit_invocation must be boolean');
  if (data.dependencies !== undefined) {
    if (!isRecord(data.dependencies) || !Array.isArray(data.dependencies.tools)) errors.push('dependencies.tools must be an array');
    else for (const tool of data.dependencies.tools) {
      if (!isRecord(tool) || tool.type !== 'mcp' || typeof tool.value !== 'string' || !tool.value.trim()) errors.push('tool dependencies currently require type: mcp and a non-empty value');
    }
  }
  return errors;
}

export function snapshotSource() {
  // Include checked-out resource submodules, but exclude dependencies, secrets,
  // and embedded Git administration. The exporter also works from a ZIP checkout.
  const names = filesIn(sourceRoot).map(file => slash(path.relative(repoRoot, file)));
  names.push(...['GEMINI.MD', 'README.MD', 'skills-lock.json', '.gitignore'].filter(name => fs.existsSync(path.join(repoRoot, name))));
  if (fs.existsSync(path.join(repoRoot, 'codex_gpt_conversion_plan.md'))) names.push('codex_gpt_conversion_plan.md');
  const files = Object.fromEntries(names.sort().map(name => [name, sha256(fs.readFileSync(path.join(repoRoot, name)))]));
  return { digest: sha256(json(files)), files };
}

export function writeIfChanged(absolute, content) {
  const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (fs.existsSync(absolute) && fs.readFileSync(absolute).equals(data)) return;
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, data);
}

export function assertNoSymlinkAncestors(absolute) {
  let current = path.resolve(absolute);
  for (;;) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing a symlink destination: ${current}`);
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

export function within(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep));
}
