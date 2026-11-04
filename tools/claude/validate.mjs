import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  bundleRoot,
  filesIn,
  parseFrontmatter,
  checkSkill,
  checkClaudeAgent,
  snapshotSource,
  slash,
  json,
  isRecord,
  verifyBundleFiles
} from './lib.mjs';

function missingLinks(text, absolute, root) {
  const body = text.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '');
  const missing = [];
  for (const match of body.matchAll(/\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(?:[a-z][a-z0-9+.-]*:|<|\/)/i.test(target) || /[{}]/.test(target)) continue;
    const file = /^(?:\.agents|\.codex|\.claude)\//.test(target)
      ? path.join(root, target.replace(/^(?:\.agents|\.codex|\.claude)\//, ''))
      : path.resolve(path.dirname(absolute), target);
    if (!fs.existsSync(file)) missing.push(target);
  }
  return [...new Set(missing)];
}

export function validateClaudeBundle(root = bundleRoot, { checkSource = false, checkManifest = true } = {}) {
  const errors = [];
  const warnings = [];
  const skills = [];
  const agents = [];
  const commands = [];

  const dataRoot = fs.existsSync(path.join(root, 'skills'))
    ? root
    : fs.existsSync(path.join(root, '.claude/skills'))
      ? path.join(root, '.claude')
      : path.join(root, '.agents');

  // 1. Validate Skills
  const skillsRoot = path.join(dataRoot, 'skills');
  const manifests = filesIn(skillsRoot).filter(file => path.basename(file) === 'SKILL.md');
  for (const file of manifests) {
    const relative = slash(path.relative(root, file));
    try {
      const { frontmatter, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'), file);
      errors.push(...checkSkill(frontmatter, path.basename(path.dirname(file))).map(msg => `${relative}: ${msg}`));
      for (const link of missingLinks(body, file, dataRoot)) {
        warnings.push(`${relative}: upstream or optional reference is unavailable: ${link}`);
      }
      skills.push({ name: frontmatter.name, path: relative, description: frontmatter.description });
    } catch (error) {
      errors.push(`${relative}: ${error.message}`);
    }
  }

  const skillNames = new Set();
  for (const skill of skills) {
    if (skillNames.has(skill.name)) {
      errors.push(`Duplicate discoverable skill name: ${skill.name}`);
    }
    skillNames.add(skill.name);
  }
  if (!manifests.length) errors.push('No skill manifests found');

  // 2. Validate Claude Agents
  const agentsRoot = path.join(dataRoot, 'agents');
  const agentFiles = filesIn(agentsRoot).filter(file => file.endsWith('.md'));
  for (const file of agentFiles) {
    const relative = slash(path.relative(root, file));
    try {
      const { frontmatter, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'), file);
      errors.push(...checkClaudeAgent(frontmatter, file).map(msg => `${relative}: ${msg}`));
      for (const link of missingLinks(body, file, dataRoot)) {
        warnings.push(`${relative}: upstream or optional reference is unavailable: ${link}`);
      }
      agents.push({ name: frontmatter.name, path: relative });
    } catch (error) {
      errors.push(`${relative}: ${error.message}`);
    }
  }

  // 3. Validate Claude Slash Commands
  const commandsRoot = path.join(dataRoot, 'commands');
  const commandFiles = filesIn(commandsRoot).filter(file => file.endsWith('.md'));
  for (const file of commandFiles) {
    const relative = slash(path.relative(root, file));
    try {
      const { frontmatter } = parseFrontmatter(fs.readFileSync(file, 'utf8'), file);
      if (!frontmatter.description || typeof frontmatter.description !== 'string') {
        errors.push(`${relative}: command must have a non-empty description`);
      }
      commands.push({ name: path.basename(file, '.md'), path: relative });
    } catch (error) {
      errors.push(`${relative}: ${error.message}`);
    }
  }

  // 4. Validate Rules and Instruction Files
  const instructionFiles = [
    ...filesIn(path.join(dataRoot, 'rules')).filter(file => file.endsWith('.md')),
    path.join(root, 'CLAUDE.md')
  ];
  for (const file of instructionFiles) {
    if (!fs.existsSync(file)) {
      errors.push(`Missing instructions: ${file}`);
      continue;
    }
    for (const target of missingLinks(fs.readFileSync(file, 'utf8'), file, dataRoot)) {
      errors.push(`${slash(path.relative(root, file))}: missing instruction link ${target}`);
    }
  }

  // 5. Validate Profiles
  const profilesPath = path.join(root, 'profiles.json');
  if (fs.existsSync(profilesPath)) {
    try {
      const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
      if (!isRecord(profiles) || !Object.keys(profiles).length) {
        errors.push('profiles.json must be a non-empty mapping');
      }
      for (const [name, roots] of Object.entries(profiles)) {
        if (!Array.isArray(roots) || !roots.length) {
          errors.push(`Empty or invalid profile ${name}`);
          continue;
        }
        for (const skill of roots) {
          if (!fs.existsSync(path.join(skillsRoot, skill, 'SKILL.md'))) {
            errors.push(`Profile ${name} references missing skill ${skill}`);
          }
        }
      }
    } catch (error) {
      errors.push(`profiles.json: ${error.message}`);
    }
  }

  // 6. Validate Manifest & Snapshot
  const manifestPath = path.join(root, 'manifest.json');
  if (checkManifest && fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      try {
        verifyBundleFiles(root);
      } catch (error) {
        errors.push(error.message);
      }
      if (manifest?.summary?.discoverableSkills !== skills.length) {
        errors.push(`Skill count (${skills.length}) differs from manifest (${manifest?.summary?.discoverableSkills})`);
      }
      if (checkSource && snapshotSource().digest !== manifest?.originalSnapshot?.digest) {
        errors.push('The original edition differs from the conversion snapshot; rebuild after reviewing source changes');
      }
    } catch (error) {
      errors.push(`manifest.json: ${error.message}`);
    }
  }

  return {
    skills: skills.length,
    topLevelSkills: manifests.filter(file => path.dirname(path.dirname(file)) === skillsRoot).length,
    agents: agents.length,
    commands: commands.length,
    rules: filesIn(path.join(dataRoot, 'rules')).filter(file => file.endsWith('.md')).length,
    errors,
    warnings,
    descriptionCharacters: skills.reduce((sum, skill) => sum + (typeof skill.description === 'string' ? skill.description.length : 0), 0)
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--source')) throw new Error('Usage: node tools/claude/validate.mjs [--source]');
    const result = validateClaudeBundle(bundleRoot, { checkSource: args.includes('--source') });
    console.log(json({ ...result, warnings: result.warnings.slice(0, 12), warningCount: result.warnings.length }));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
