import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleRoot, filesIn, parseSkill, checkSkill, parseYaml, checkOpenai, snapshotSource, payloadHash, slash, json, isRecord, verifyBundleFiles } from './lib.mjs';

function missingLinks(text, absolute, root) {
  const body = text.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '');
  const missing = [];
  for (const match of body.matchAll(/\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(?:[a-z][a-z0-9+.-]*:|<|\/)/i.test(target) || /[{}]/.test(target)) continue;
    const file = /^(?:\.agents|\.codex)\//.test(target) ? path.join(root, target.replace(/^(?:\.agents|\.codex)\//, '')) : path.resolve(path.dirname(absolute), target);
    if (!fs.existsSync(file)) missing.push(target);
  }
  return [...new Set(missing)];
}

export function validateBundle(root = bundleRoot, { checkSource = false, checkManifest = true } = {}) {
  const errors = [];
  const warnings = [];
  const skills = [];
  const dataRoot = fs.existsSync(path.join(root, 'skills')) ? root : fs.existsSync(path.join(root, '.codex/skills')) ? path.join(root, '.codex') : path.join(root, '.agents');
  const skillsRoot = path.join(dataRoot, 'skills');
  const manifests = filesIn(skillsRoot).filter(file => path.basename(file) === 'SKILL.md');
  for (const file of manifests) {
    const relative = slash(path.relative(root, file));
    try {
      const { frontmatter, body } = parseSkill(fs.readFileSync(file, 'utf8'), file);
      errors.push(...checkSkill(frontmatter, path.basename(path.dirname(file))).map(message => `${relative}: ${message}`));
      const metadata = path.join(path.dirname(file), 'agents/openai.yaml');
      if (!fs.existsSync(metadata)) errors.push(`${relative}: missing agents/openai.yaml`);
      else errors.push(...checkOpenai(parseYaml(fs.readFileSync(metadata, 'utf8'), metadata), frontmatter.name).map(message => `${relative}: ${message}`));
      for (const link of missingLinks(body, file, dataRoot)) warnings.push(`${relative}: upstream or optional reference is unavailable: ${link}`);
      skills.push({ name: frontmatter.name, path: relative, description: frontmatter.description });
    } catch (error) { errors.push(`${relative}: ${error.message}`); }
  }
  for (const name of new Set(skills.map(skill => skill.name))) if (skills.filter(skill => skill.name === name).length > 1) errors.push(`Duplicate discoverable skill name: ${name}`);
  if (!manifests.length) errors.push('No skill manifests found');
  const instruction = path.join(root, 'AGENTS.md');
  for (const file of [...filesIn(path.join(dataRoot, 'rules')).filter(file => file.endsWith('.md')), instruction]) {
    if (!fs.existsSync(file)) { errors.push(`Missing instructions: ${file}`); continue; }
    for (const target of missingLinks(fs.readFileSync(file, 'utf8'), file, dataRoot)) errors.push(`${slash(path.relative(root, file))}: missing instruction link ${target}`);
  }
  const profilesPath = path.join(root, 'profiles.json');
  if (fs.existsSync(profilesPath)) {
    try {
      const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
      if (!isRecord(profiles) || !Object.keys(profiles).length) errors.push('profiles.json must be a non-empty mapping');
      for (const [name, roots] of Object.entries(profiles)) {
        if (!Array.isArray(roots) || !roots.length) { errors.push(`Empty or invalid profile ${name}`); continue; }
        for (const skill of roots) if (!fs.existsSync(path.join(skillsRoot, skill, 'SKILL.md'))) errors.push(`Profile ${name} references missing skill ${skill}`);
      }
    } catch (error) { errors.push(`profiles.json: ${error.message}`); }
  }
  const manifestPath = path.join(root, 'manifest.json');
  if (checkManifest && fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    try { verifyBundleFiles(root); } catch (error) { errors.push(error.message); }
    if (manifest.summary.discoverableSkills !== skills.length) errors.push('Skill count differs from manifest');
    if (checkSource && snapshotSource().digest !== manifest.originalSnapshot.digest) errors.push('The original edition differs from the conversion snapshot; rebuild after reviewing source changes');
  }
  const installationPath = path.join(dataRoot, 'codex-install.json');
  if (checkManifest && fs.existsSync(installationPath)) {
    const installed = JSON.parse(fs.readFileSync(installationPath, 'utf8'));
    for (const [relative, hash] of Object.entries(installed.files || {})) {
      const absolute = path.join(root, relative);
      if (!fs.existsSync(absolute) || payloadHash(fs.readFileSync(absolute)) !== hash) errors.push(`Installed file differs from manifest: ${relative}`);
    }
  }
  if (fs.existsSync(path.join(root, 'hooks.example.json'))) {
    try {
      const hooks = JSON.parse(fs.readFileSync(path.join(root, 'hooks.example.json'), 'utf8'));
      if (!isRecord(hooks.hooks)) errors.push('hooks.example.json must contain hooks');
    } catch (error) { errors.push(`hooks.example.json: ${error.message}`); }
  }
  return {
    skills: skills.length, topLevelSkills: manifests.filter(file => path.dirname(path.dirname(file)) === skillsRoot).length,
    rules: filesIn(path.join(dataRoot, 'rules')).filter(file => file.endsWith('.md')).length,
    errors, warnings,
    descriptionCharacters: skills.reduce((sum, skill) => sum + (typeof skill.description === 'string' ? skill.description.length : 0), 0),
    catalogCharactersEstimate: skills.reduce((sum, skill) => sum + (typeof skill.description === 'string' ? skill.description.length : 0) + (skill.name?.length || 0) + path.join(root, skill.path).length + 30, 0),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--source')) throw new Error('Usage: node tools/codex/validate.mjs [--source]');
    const result = validateBundle(bundleRoot, { checkSource: args.includes('--source') });
    console.log(json({ ...result, warnings: result.warnings.slice(0, 12), warningCount: result.warnings.length }));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
