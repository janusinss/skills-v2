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

function checkHookFile(hookFile, label, dataRoot, partialProfile, errors, warnings) {
  try {
    const parsed = JSON.parse(fs.readFileSync(hookFile, 'utf8'));
    if (!isRecord(parsed.hooks)) {
      errors.push(`${label} must contain hooks`);
      return;
    }
    for (const [event, groups] of Object.entries(parsed.hooks)) {
      if (!Array.isArray(groups)) continue;
      for (const group of groups) {
        if (!group || !Array.isArray(group.hooks)) continue;
        for (const entry of group.hooks) {
          for (const field of ['command', 'commandWindows']) {
            const cmd = entry?.[field];
            if (typeof cmd !== 'string') continue;
            const refs = new Set();
            for (const match of cmd.matchAll(/\.codex\/((?:skills|scripts|rules|agents|resources)\/[A-Za-z0-9._/-]+)/g)) {
              refs.add(match[1]);
            }
            for (const rel of refs) {
              const target = path.join(dataRoot, rel);
              if (!fs.existsSync(target)) {
                if (partialProfile && rel.startsWith('skills/')) warnings.push(`${label} (${event}): out-of-profile hook script .codex/${rel}`);
                else errors.push(`${label} (${event}): missing hook script .codex/${rel}`);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
  }
}

function checkLeaks(text, label, patterns, errors) {
  for (const { pattern, message } of patterns) {
    if (pattern.test(text)) errors.push(`${label}: ${message}`);
  }
}

const policyLeakChecks = [
  { pattern: /\binvoke_subagent\b/, message: 'leaks AGY invoke_subagent' },
  { pattern: /AGY \/ Gemini/, message: 'leaks AGY / Gemini edition routing' },
  { pattern: /\bClaude Code\b/, message: 'leaks Claude Code edition routing' },
  { pattern: /`ask_question`/, message: 'leaks AGY `ask_question` tool name' },
  { pattern: /`@e2e-runner`/, message: 'leaks Claude `@e2e-runner` mention' },
  { pattern: /<!--\s*edition-/, message: 'leaks leftover edition HTML marker' },
];

const designerLeakChecks = [
  { pattern: /^## 5\./m, message: 'Designer policy must not include Section 5 Harness lifecycle' },
  { pattern: /\bskeptic\b/i, message: 'Designer policy must not mention skeptic' },
  { pattern: /PROGRESS\.md/, message: 'Designer policy must not mention PROGRESS.md' },
  { pattern: /\bharness\.mjs\b/, message: 'Designer policy must not mention harness.mjs' },
];

const designerInvariantsLeakChecks = [
  { pattern: /\[Harness-[A-Za-z]+\]/, message: 'Designer learned-invariants must not include [Harness-*] baseline rules' },
  { pattern: /\.harness\//, message: 'Designer learned-invariants must not reference .harness/' },
  { pattern: /\bharness\.mjs\b/, message: 'Designer learned-invariants must not mention harness.mjs' },
  { pattern: /\bskeptic\b/i, message: 'Designer learned-invariants must not mention skeptic' },
  { pattern: /\bcontinuous-agent-loop\b/, message: 'Designer learned-invariants must not reference continuous-agent-loop' },
];

const ruleLeakChecks = [
  { pattern: /\binvoke_subagent\b/, message: 'leaks AGY invoke_subagent' },
  { pattern: /`ask_question`/, message: 'leaks AGY `ask_question` tool name' },
  { pattern: /`@e2e-runner`/, message: 'leaks Claude `@e2e-runner` mention' },
];

const agentLeakChecks = [
  { pattern: /\binvoke_subagent\b/, message: 'leaks AGY invoke_subagent' },
  { pattern: /`ask_question`/, message: 'leaks AGY `ask_question` tool name' },
  { pattern: /`@e2e-runner`/, message: 'leaks Claude `@e2e-runner` mention' },
  { pattern: /^mainAgent:/m, message: 'leaks AGY-only frontmatter key mainAgent:' },
  { pattern: /^commandExecutionPolicy:/m, message: 'leaks AGY-only frontmatter key commandExecutionPolicy:' },
  { pattern: /^subagent:/m, message: 'leaks AGY-only frontmatter key subagent:' },
  { pattern: /^[ \t]*-\s*view_file\b/m, message: 'leaks AGY-only tool view_file' },
];

const skillLeakChecks = [
  { pattern: /\bupstream-hooks\b/, message: 'leaks raw Claude upstream-hooks metadata' },
  { pattern: /\$\{CLAUDE_PLUGIN_ROOT\}/, message: 'leaks unset ${CLAUDE_PLUGIN_ROOT}' },
  { pattern: /`ask_question`/, message: 'leaks AGY `ask_question` tool name' },
  { pattern: /`@e2e-runner`/, message: 'leaks Claude `@e2e-runner` mention' },
];

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
      const raw = fs.readFileSync(file, 'utf8');
      const { frontmatter, body } = parseSkill(raw, file);
      errors.push(...checkSkill(frontmatter, path.basename(path.dirname(file))).map(message => `${relative}: ${message}`));
      checkLeaks(raw, relative, skillLeakChecks, errors);
      const metadata = path.join(path.dirname(file), 'agents/openai.yaml');
      if (!fs.existsSync(metadata)) errors.push(`${relative}: missing agents/openai.yaml`);
      else errors.push(...checkOpenai(parseYaml(fs.readFileSync(metadata, 'utf8'), metadata), frontmatter.name).map(message => `${relative}: ${message}`));
      for (const link of missingLinks(body, file, dataRoot)) warnings.push(`${relative}: upstream or optional reference is unavailable: ${link}`);
      skills.push({ name: frontmatter.name, path: relative, description: frontmatter.description });
    } catch (error) { errors.push(`${relative}: ${error.message}`); }
  }
  for (const name of new Set(skills.map(skill => skill.name))) if (skills.filter(skill => skill.name === name).length > 1) errors.push(`Duplicate discoverable skill name: ${name}`);
  if (!manifests.length) errors.push('No skill manifests found');
  const installationPath = path.join(dataRoot, 'codex-install.json');
  let installed = null;
  if (fs.existsSync(installationPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(installationPath, 'utf8'));
      if (!isRecord(parsed)) errors.push('codex-install.json must be a JSON object');
      else installed = parsed;
    } catch (error) { errors.push(`codex-install.json: ${error.message}`); }
  }
  const partialProfile = Boolean(installed?.profile && installed.profile !== 'all');
  const instruction = path.join(root, 'AGENTS.md');
  const designerInstruction = path.join(root, 'AGENTS.designer.md');
  const designerLearnedInvariants = path.join(root, 'learned-invariants.designer.md');
  const ruleFiles = filesIn(path.join(dataRoot, 'rules')).filter(file => file.endsWith('.md'));
  for (const file of [...ruleFiles, instruction]) {
    if (!fs.existsSync(file)) { errors.push(`Missing instructions: ${file}`); continue; }
    const rel = slash(path.relative(root, file));
    const text = fs.readFileSync(file, 'utf8');
    for (const target of missingLinks(text, file, dataRoot)) {
      if (partialProfile && /^(?:\.\.\/|\.codex\/|\.agents\/)?skills\//.test(target)) warnings.push(`${rel}: out-of-profile skill link ${target}`);
      else errors.push(`${rel}: missing instruction link ${target}`);
    }
    if (file === instruction) {
      checkLeaks(text, rel, policyLeakChecks, errors);
      if (installed?.mode === 'designer') checkLeaks(text, rel, designerLeakChecks, errors);
    } else {
      checkLeaks(text, rel, ruleLeakChecks, errors);
      if (path.basename(file) === 'learned-invariants.md' && installed?.mode === 'designer') {
        checkLeaks(text, rel, designerInvariantsLeakChecks, errors);
      }
    }
  }
  if (fs.existsSync(designerInstruction)) {
    const rel = slash(path.relative(root, designerInstruction));
    const text = fs.readFileSync(designerInstruction, 'utf8');
    for (const target of missingLinks(text, designerInstruction, dataRoot)) {
      if (partialProfile && /^(?:\.\.\/|\.codex\/|\.agents\/)?skills\//.test(target)) warnings.push(`${rel}: out-of-profile skill link ${target}`);
      else errors.push(`${rel}: missing instruction link ${target}`);
    }
    checkLeaks(text, rel, [...policyLeakChecks, ...designerLeakChecks], errors);
  }
  if (fs.existsSync(designerLearnedInvariants)) {
    const rel = slash(path.relative(root, designerLearnedInvariants));
    const text = fs.readFileSync(designerLearnedInvariants, 'utf8');
    checkLeaks(text, rel, [...ruleLeakChecks, ...designerInvariantsLeakChecks], errors);
    for (const target of missingLinks(text, path.join(dataRoot, 'rules', 'learned-invariants.md'), dataRoot)) {
      errors.push(`${rel}: missing instruction link ${target}`);
    }
  }
  if (installed?.mode === 'designer') {
    if (fs.existsSync(path.join(skillsRoot, 'continuous-agent-loop'))) {
      errors.push('Designer installation must not include harness-only skill .codex/skills/continuous-agent-loop');
    }
    for (const skepticFile of ['skeptic.md', 'skeptic.toml']) {
      if (fs.existsSync(path.join(dataRoot, 'agents', skepticFile))) {
        errors.push(`Designer installation must not include harness-only agent .codex/agents/${skepticFile}`);
      }
    }
  }
  const projectIgnorePath = path.join(root, 'project.gitignore');
  if (fs.existsSync(projectIgnorePath)) {
    const ignoreText = fs.readFileSync(projectIgnorePath, 'utf8');
    if (ignoreText.includes('/.agents/hooks.json')) errors.push('project.gitignore: leaks AGY /.agents/hooks.json');
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
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      try { verifyBundleFiles(root); } catch (error) { errors.push(error.message); }
      if (manifest?.summary?.discoverableSkills !== skills.length) errors.push('Skill count differs from manifest');
      if (checkSource && snapshotSource().digest !== manifest?.originalSnapshot?.digest) errors.push('The original edition differs from the conversion snapshot; rebuild after reviewing source changes');
    } catch (error) { errors.push(`manifest.json: ${error.message}`); }
  }
  if (checkManifest && installed) {
    if (installed.gitignore !== undefined) {
      if (!isRecord(installed.gitignore) || installed.gitignore.path !== '.gitignore' || !Array.isArray(installed.gitignore.entries) || installed.gitignore.entries.some(entry => typeof entry !== 'string')) errors.push('Invalid project .gitignore record');
      else if (!fs.existsSync(path.join(root, '.gitignore')) || !fs.statSync(path.join(root, '.gitignore')).isFile()) errors.push('Missing project .gitignore');
    }
    if (installed.files !== undefined && !isRecord(installed.files)) errors.push('Invalid installation files record');
    else for (const [relative, hash] of Object.entries(installed.files || {})) {
      const absolute = path.join(root, relative);
      if (!fs.existsSync(absolute) || payloadHash(fs.readFileSync(absolute)) !== hash) errors.push(`Installed file differs from manifest: ${relative}`);
    }
    if (installed.hooksIncluded) {
      const activeHooksPath = path.join(dataRoot, 'hooks.json');
      if (!fs.existsSync(activeHooksPath)) errors.push('Missing active .codex/hooks.json in hooks-enabled installation');
      else checkHookFile(activeHooksPath, '.codex/hooks.json', dataRoot, partialProfile, errors, warnings);
    }
  }
  const agentsDir = path.join(dataRoot, 'agents');
  if (fs.existsSync(agentsDir)) {
    const mdAgents = filesIn(agentsDir).filter(file => file.endsWith('.md'));
    const tomlAgents = filesIn(agentsDir).filter(file => file.endsWith('.toml'));
    const validEfforts = new Set(['low', 'medium', 'high', 'xhigh', 'max']);
    const validSandboxes = new Set(['read-only', 'workspace-write', 'danger-full-access']);
    const forbiddenModels = new Set(['haiku', 'sonnet', 'opus']);
    const tomlLeakChecks = [
      { pattern: /\binvoke_subagent\b/, message: 'leaks AGY invoke_subagent' },
      { pattern: /`ask_question`/, message: 'leaks AGY `ask_question` tool name' },
      { pattern: /`@e2e-runner`/, message: 'leaks Claude `@e2e-runner` mention' },
    ];
    for (const agentFile of mdAgents) {
      const rel = slash(path.relative(root, agentFile));
      try {
        const raw = fs.readFileSync(agentFile, 'utf8');
        const { frontmatter, body } = parseSkill(raw, agentFile);
        if (!['mini', 'codex', 'reasoning'].includes(frontmatter.model_tier)) errors.push(`${rel}: missing or invalid Codex model_tier`);
        if (!validEfforts.has(frontmatter.reasoning_effort)) errors.push(`${rel}: missing or invalid Codex reasoning_effort`);
        if (forbiddenModels.has(frontmatter.model)) errors.push(`${rel}: Codex agent must not use Claude model name ${frontmatter.model}`);
        checkLeaks(raw, rel, agentLeakChecks, errors);
        for (const target of missingLinks(body, agentFile, dataRoot)) {
          if (partialProfile && /^(?:\.\.\/|\.codex\/|\.agents\/)?skills\//.test(target)) warnings.push(`${rel}: out-of-profile skill link ${target}`);
          else errors.push(`${rel}: missing agent link ${target}`);
        }
        const expectedToml = path.join(path.dirname(agentFile), `${path.basename(agentFile, '.md')}.toml`);
        if (!fs.existsSync(expectedToml)) errors.push(`${rel}: missing paired Codex role file ${path.basename(expectedToml)}`);
      } catch (error) { errors.push(`${rel}: ${error.message}`); }
    }
    for (const tomlFile of tomlAgents) {
      const rel = slash(path.relative(root, tomlFile));
      try {
        const raw = fs.readFileSync(tomlFile, 'utf8').replace(/\r\n/g, '\n');
        const expectedName = path.basename(tomlFile, '.toml');
        const nameMatch = /^name\s*=\s*"([^"]+)"\s*$/m.exec(raw);
        const descMatch = /^description\s*=\s*"((?:[^"\\]|\\.)+)"\s*$/m.exec(raw);
        const modelMatch = /^model\s*=\s*"([^"]+)"\s*$/m.exec(raw);
        const effortMatch = /^model_reasoning_effort\s*=\s*"([^"]+)"\s*$/m.exec(raw);
        const sandboxMatch = /^sandbox_mode\s*=\s*"([^"]+)"\s*$/m.exec(raw);
        const instructionsMatch = /^developer_instructions\s*=\s*"""\n([\s\S]+?)\n"""\s*$/m.exec(raw);
        if (!nameMatch) errors.push(`${rel}: missing required field name`);
        else if (nameMatch[1] !== expectedName) errors.push(`${rel}: name ${JSON.stringify(nameMatch[1])} does not match filename ${expectedName}`);
        if (!descMatch || !descMatch[1].trim()) errors.push(`${rel}: missing required field description`);
        if (!modelMatch || !modelMatch[1].trim()) errors.push(`${rel}: missing required field model`);
        else if (forbiddenModels.has(modelMatch[1].toLowerCase())) errors.push(`${rel}: Codex agent TOML must not use Claude model name ${modelMatch[1]}`);
        if (!effortMatch || !validEfforts.has(effortMatch[1])) errors.push(`${rel}: missing or invalid model_reasoning_effort`);
        if (!sandboxMatch || !validSandboxes.has(sandboxMatch[1])) errors.push(`${rel}: missing or invalid sandbox_mode`);
        if (!instructionsMatch || !instructionsMatch[1].trim()) errors.push(`${rel}: missing or malformed developer_instructions`);
        checkLeaks(raw, rel, tomlLeakChecks, errors);
      } catch (error) { errors.push(`${rel}: ${error.message}`); }
    }
  }
  const configExampleCandidates = [path.join(root, 'config.example.toml'), path.join(dataRoot, 'config.example.toml')];
  const configExamplePath = configExampleCandidates.find(candidate => fs.existsSync(candidate));
  if (!configExamplePath) {
    errors.push('Missing config.example.toml');
  } else {
    const configExampleText = fs.readFileSync(configExamplePath, 'utf8');
    if (!/^\s*\[features\.multi_agent_v2\]\s*(?:#.*)?$/m.test(configExampleText)) {
      errors.push(`${slash(path.relative(root, configExamplePath))}: missing [features.multi_agent_v2] section`);
    }
  }
  if (installed) {
    const targetConfigPath = path.join(dataRoot, 'config.toml');
    if (!fs.existsSync(targetConfigPath)) {
      errors.push('Missing installed .codex/config.toml');
    } else {
      const targetConfigText = fs.readFileSync(targetConfigPath, 'utf8');
      if (!/^\s*\[features\.multi_agent_v2\]\s*(?:#.*)?$/m.test(targetConfigText)) {
        errors.push('.codex/config.toml: missing [features.multi_agent_v2] section');
      }
    }
  }
  for (const hookName of ['hooks.example.json', 'hooks.impeccable.example.json']) {
    for (const hookCandidate of [path.join(root, hookName), path.join(dataRoot, hookName)]) {
      if (fs.existsSync(hookCandidate)) {
        checkHookFile(hookCandidate, hookName, dataRoot, partialProfile, errors, warnings);
        break;
      }
    }
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
    let targetRoot = bundleRoot;
    let checkSource = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--source') checkSource = true;
      else if (args[i] === '--target') {
        if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--target requires a path');
        targetRoot = path.resolve(args[++i]);
      } else throw new Error('Usage: node tools/codex/validate.mjs [--source] [--target <path>]');
    }
    const result = validateBundle(targetRoot, { checkSource });
    console.log(json({ ...result, warnings: result.warnings.slice(0, 12), warningCount: result.warnings.length }));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
