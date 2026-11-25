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
  payloadHash,
  slash,
  json,
  isRecord,
  verifyBundleFiles
} from './lib.mjs';

const crossEditionLeakPatterns = [
  { label: 'invoke_subagent', regex: /\binvoke_subagent\b/ },
  { label: 'AGY / Gemini', regex: /AGY \/ Gemini/ },
  { label: 'GPT / Codex', regex: /GPT \/ Codex/ },
  { label: 'model_tier', regex: /\bmodel_tier\b/ },
  { label: 'reasoning_effort:', regex: /\breasoning_effort:/ },
  { label: '`ask_question`', regex: /`ask_question`/ },
  { label: 'browser_subagent', regex: /\bbrowser_subagent\b/ },
  { label: 'AGENTS.md §', regex: /`?AGENTS\.md`?\s*§/ },
  { label: '`view_file`', regex: /`view_file`/ },
  { label: '`read_file`', regex: /`read_file`/ },
  { label: '`grep_search`', regex: /`grep_search`/ },
  { label: '`find_by_name`', regex: /`find_by_name`/ },
  { label: '`list_dir`', regex: /`list_dir`/ }
];

const designerLeakPatterns = [
  { label: '## 5.', regex: /^## 5\./m },
  { label: 'skeptic', regex: /\bskeptic\b/i },
  { label: 'PROGRESS.md', regex: /PROGRESS\.md/ },
  { label: '/contract', regex: /\/contract\b/ },
  { label: '/verify', regex: /\/verify\b/ },
  { label: '/flywheel', regex: /\/flywheel\b/ }
];

function checkLeaks(text, relative, patterns, errors) {
  for (const { label, regex } of patterns) {
    if (regex.test(text)) {
      errors.push(`${relative}: disallowed leak (${label})`);
    }
  }
}

function validateClaudeHooksSchema(parsed, label, errors, dataRoot = null) {
  if (!isRecord(parsed.hooks)) {
    errors.push(`${label} must contain hooks`);
    return;
  }
  for (const [event, groups] of Object.entries(parsed.hooks)) {
    if (!Array.isArray(groups)) continue;
    for (const group of groups) {
      if (!isRecord(group)) continue;
      if (typeof group.matcher === 'string' && group.matcher.includes('apply_patch')) {
        errors.push(`${label}: ${event} matcher contains non-Claude tool "apply_patch"`);
      }
      if (!Array.isArray(group.hooks)) continue;
      for (const entry of group.hooks) {
        if (!isRecord(entry)) continue;
        if ('commandWindows' in entry) {
          errors.push(`${label}: ${event} hook contains non-standard "commandWindows" key`);
        }
        if (typeof entry.command === 'string' && entry.command.includes('apply_patch')) {
          errors.push(`${label}: ${event} hook command contains "apply_patch"`);
        }
        if (typeof entry.command === 'string' && dataRoot) {
          for (const match of entry.command.matchAll(/\.claude\/scripts\/([A-Za-z0-9._-]+)/g)) {
            const scriptFile = path.join(dataRoot, 'scripts', match[1]);
            if (!fs.existsSync(scriptFile)) {
              errors.push(`${label}: ${event} hook references missing script .claude/scripts/${match[1]}`);
            }
          }
        }
      }
    }
  }
}

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

  const installationPath = path.join(dataRoot, 'claude-install.json');
  let installed = null;
  if (fs.existsSync(installationPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(installationPath, 'utf8').replace(/^\uFEFF/, ''));
      if (!isRecord(parsed)) errors.push('claude-install.json must be a JSON object');
      else installed = parsed;
    } catch (error) {
      errors.push(`claude-install.json: ${error.message}`);
    }
  }
  const partialProfile = Boolean(installed?.profile && installed.profile !== 'all');

  // 2. Validate Claude Agents
  const agentsRoot = path.join(dataRoot, 'agents');
  const agentFiles = filesIn(agentsRoot).filter(file => file.endsWith('.md'));
  for (const file of agentFiles) {
    const relative = slash(path.relative(root, file));
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const { frontmatter, body } = parseFrontmatter(raw, file);
      errors.push(...checkClaudeAgent(frontmatter, file).map(msg => `${relative}: ${msg}`));
      checkLeaks(raw, relative, crossEditionLeakPatterns, errors);
      for (const target of missingLinks(body, file, dataRoot)) {
        if (partialProfile && /^(?:\.\.\/|\.claude\/|\.codex\/|\.agents\/)?skills\//.test(target)) {
          warnings.push(`${relative}: out-of-profile skill link ${target}`);
        } else {
          errors.push(`${relative}: missing agent link ${target}`);
        }
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
      const raw = fs.readFileSync(file, 'utf8');
      const { frontmatter } = parseFrontmatter(raw, file);
      if (!frontmatter.description || typeof frontmatter.description !== 'string') {
        errors.push(`${relative}: command must have a non-empty description`);
      }
      checkLeaks(raw, relative, crossEditionLeakPatterns, errors);
      commands.push({ name: path.basename(file, '.md'), path: relative });
    } catch (error) {
      errors.push(`${relative}: ${error.message}`);
    }
  }
  if (installed?.mode === 'designer') {
    for (const harnessCmd of ['contract.md', 'verify.md', 'flywheel.md']) {
      if (fs.existsSync(path.join(commandsRoot, harnessCmd))) {
        errors.push(`Designer installation must not include harness-only command .claude/commands/${harnessCmd}`);
      }
    }
  }

  // 4. Validate Rules and Instruction Files
  const designerClaudeMd = path.join(root, 'CLAUDE.designer.md');
  const instructionFiles = [
    ...filesIn(path.join(dataRoot, 'rules')).filter(file => file.endsWith('.md')),
    path.join(root, 'CLAUDE.md'),
    ...(fs.existsSync(designerClaudeMd) ? [designerClaudeMd] : [])
  ];
  for (const file of instructionFiles) {
    if (!fs.existsSync(file)) {
      errors.push(`Missing instructions: ${file}`);
      continue;
    }
    const relative = slash(path.relative(root, file));
    const text = fs.readFileSync(file, 'utf8');
    checkLeaks(text, relative, crossEditionLeakPatterns, errors);
    if (file === designerClaudeMd || (path.basename(file) === 'CLAUDE.md' && installed?.mode === 'designer')) {
      checkLeaks(text, relative, designerLeakPatterns, errors);
    }
    for (const target of missingLinks(text, file, dataRoot)) {
      if (partialProfile && /^(?:\.\.\/|\.claude\/|\.codex\/|\.agents\/)?skills\//.test(target)) {
        warnings.push(`${relative}: out-of-profile skill link ${target}`);
      } else {
        errors.push(`${relative}: missing instruction link ${target}`);
      }
    }
  }

  // 5. Validate Profiles
  const profilesPath = path.join(root, 'profiles.json');
  if (fs.existsSync(profilesPath)) {
    try {
      const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8').replace(/^\uFEFF/, ''));
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
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));
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

  if (checkManifest && installed) {
    if (installed.gitignore !== undefined) {
      if (!isRecord(installed.gitignore) || installed.gitignore.path !== '.gitignore' || !Array.isArray(installed.gitignore.entries) || installed.gitignore.entries.some(entry => typeof entry !== 'string')) {
        errors.push('Invalid project .gitignore record');
      } else if (!fs.existsSync(path.join(root, '.gitignore')) || !fs.statSync(path.join(root, '.gitignore')).isFile()) {
        errors.push('Missing project .gitignore');
      }
    }
    if (installed.files !== undefined && !isRecord(installed.files)) {
      errors.push('Invalid installation files record');
    } else {
      for (const [relative, hash] of Object.entries(installed.files || {})) {
        const absolute = path.join(root, relative);
        if (!fs.existsSync(absolute) || payloadHash(fs.readFileSync(absolute)) !== hash) {
          errors.push(`Installed file differs from manifest: ${relative}`);
        }
      }
    }
    if (installed.hooksIncluded) {
      for (const relHook of ['hooks.json', 'settings.json']) {
        const hookFile = path.join(dataRoot, relHook);
        if (!fs.existsSync(hookFile)) {
          errors.push(`Missing .claude/${relHook} in hooks-enabled installation`);
        } else {
          try {
            const parsed = JSON.parse(fs.readFileSync(hookFile, 'utf8').replace(/^\uFEFF/, ''));
            validateClaudeHooksSchema(parsed, `.claude/${relHook}`, errors, dataRoot);
          } catch (error) {
            errors.push(`.claude/${relHook}: ${error.message}`);
          }
        }
      }
    }
  }

  for (const hookName of ['hooks.example.json', 'hooks.impeccable.example.json']) {
    for (const hookCandidate of [path.join(root, hookName), path.join(dataRoot, hookName)]) {
      if (fs.existsSync(hookCandidate)) {
        try {
          const hooks = JSON.parse(fs.readFileSync(hookCandidate, 'utf8').replace(/^\uFEFF/, ''));
          validateClaudeHooksSchema(hooks, hookName, errors, dataRoot);
        } catch (error) {
          errors.push(`${hookName}: ${error.message}`);
        }
        break;
      }
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
    let targetRoot = bundleRoot;
    let checkSource = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--source') checkSource = true;
      else if (args[i] === '--target') {
        if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--target requires a path');
        targetRoot = path.resolve(args[++i]);
      } else throw new Error('Usage: node tools/claude/validate.mjs [--source] [--target <path>]');
    }
    const result = validateClaudeBundle(targetRoot, { checkSource });
    console.log(json({ ...result, warnings: result.warnings.slice(0, 12), warningCount: result.warnings.length }));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
