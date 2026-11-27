import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleRoot, sourceRoot, repoRoot, filesIn, parseSkill, snapshotSource, slash, json, sha256, payloadData, payloadHash, writeIfChanged, assertNoSymlinkAncestors, isBundleExcluded } from './lib.mjs';
import {
  convertSkill,
  openaiMetadata,
  yamlText,
  readOriginalMetadata,
  adaptMarkdown,
  adaptPlaywrightRunner,
  formatDesignerPolicy,
  formatDesignerLearnedInvariants,
  formatDesignerSecurityRule,
  generateCodexAgentToml
} from './convert.mjs';
import { localCodexIgnoreEntries } from './gitignore.mjs';

/** Recursively remove empty subdirectories bottom-up under dir, preserving dir itself. */
function pruneEmptyDirs(dir, isRoot = true) {
  if (!fs.existsSync(dir)) return false;
  let hasRemaining = false;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!pruneEmptyDirs(path.join(dir, entry.name), false)) hasRemaining = true;
    } else {
      hasRemaining = true;
    }
  }
  if (!isRoot && !hasRemaining) {
    fs.rmdirSync(dir);
    return true;
  }
  return false;
}

const CODEX_AVOID_AI_WRITING_CMD = "node -e \"const fs=require('fs'),path=require('path'),cp=require('child_process'),g='.codex/skills/avoid-ai-writing/bin/avoid-ai-writing-gate.js';function run(raw){let d={};try{const t=(raw.charCodeAt(0)===65279?raw.slice(1):raw).trim();if(t)d=JSON.parse(t);}catch(e){}if(d&&(d.stop_hook_active||d.continuationActive))process.exit(0);const b=(d&&typeof d.cwd==='string'&&d.cwd)?d.cwd:process.cwd();const top=cp.spawnSync('git',['rev-parse','--show-toplevel'],{cwd:b,encoding:'utf8'});if(top.status===0&&top.stdout.trim()){}else{process.exit(0);}const root=path.resolve(top.stdout.trim()),gate=fs.existsSync(path.join(root,g))?path.join(root,g):path.resolve(b,g);if(fs.existsSync(gate)===false)process.exit(0);const st=cp.spawnSync('git',['-c','core.quotepath=false','status','--porcelain','--untracked-files=all'],{cwd:root,encoding:'utf8'});if(st.status===0){}else{process.exit(0);}const files=st.stdout.split(String.fromCharCode(10)).map(l=>l.replaceAll(String.fromCharCode(13),'').slice(3).split(' -> ').pop().trim().replaceAll(String.fromCharCode(34),'')).filter(p=>{const n=p.split(path.sep).join('/'),lo=n.toLowerCase();return p&&(lo.endsWith('.md')||lo.endsWith('.mdx'))&&['.agents','.codex','.claude'].some(x=>n.startsWith(x+'/'))===false&&fs.existsSync(path.join(root,p));});if(files.length===0)process.exit(0);const r=cp.spawnSync(process.execPath,[gate,'--json','--context','technical','--source-mode','rendered-markdown','--threshold','6','--',...files],{cwd:root,encoding:'utf8'});if(r.status===0)process.exit(0);let reason=(r.stderr||r.stdout||'avoid-ai-writing gate failed').trim();try{const j=JSON.parse(r.stdout);const bad=(j.files||[]).filter(x=>x.pass===false).map(x=>x.path+' ('+x.findings+' findings: '+(x.types||[]).join(', ')+')');if(bad.length)reason='avoid-ai-writing failed threshold '+j.threshold+': '+bad.join('; ')+' — rewrite AI-ism prose before finishing.';}catch(e){}const dec='block';process.stdout.write(JSON.stringify({decision:dec,reason})+String.fromCharCode(10));process.exit(0);}if(process.stdin.isTTY){run('');}else{let raw='',done=false;const fin=()=>{if(done)return;done=true;clearTimeout(tm);try{process.stdin.pause();process.stdin.destroy();}catch(e){}run(raw);};const tm=setTimeout(fin,500);process.stdin.setEncoding('utf8');process.stdin.on('data',c=>{raw+=c;if(raw.length>1048576)fin();});process.stdin.on('end',fin);process.stdin.on('error',fin);}\"";

/** Build native Codex hooks JSON independently of AGY's hooks.md schema. */
function buildCodexHooks({ designer = false } = {}) {
  const description = designer
    ? 'Optional Impeccable hooks (Designer mode, without Harness hooks). Install at .codex/hooks.json in a trusted target project and review them in Codex before use.'
    : 'Full Harness, Impeccable, design-taste-frontend, and avoid-ai-writing hooks. Install at .codex/hooks.json in a trusted target project and review them in Codex before use.';

  const postToolUseHooks = [
    {
      type: 'command',
      command: '[ ! -f ".codex/skills/impeccable/scripts/impeccable" ] || ".codex/skills/impeccable/scripts/impeccable" hook',
      commandWindows: 'if exist ".codex/skills/impeccable/scripts/impeccable.cmd" (".codex/skills/impeccable/scripts/impeccable.cmd" hook & exit /b)',
      timeout: 5,
      statusMessage: 'Checking UI changes'
    }
  ];
  if (!designer) {
    postToolUseHooks.push({
      type: 'command',
      command: '[ ! -f ".codex/skills/continuous-agent-loop/scripts/harness.mjs" ] || node ".codex/skills/continuous-agent-loop/scripts/harness.mjs" sensor check-file',
      commandWindows: 'if exist ".codex/skills/continuous-agent-loop/scripts/harness.mjs" (node ".codex/skills/continuous-agent-loop/scripts/harness.mjs" sensor check-file & exit /b)',
      timeout: 5,
      statusMessage: 'Auditing post-edit scope boundary'
    });
  }

  const stopHooks = [
    {
      type: 'command',
      command: '[ ! -f ".codex/skills/impeccable/scripts/impeccable" ] || ".codex/skills/impeccable/scripts/impeccable" hook',
      commandWindows: 'if exist ".codex/skills/impeccable/scripts/impeccable.cmd" (".codex/skills/impeccable/scripts/impeccable.cmd" hook & exit /b)',
      timeout: 30,
      statusMessage: 'Design deep pass'
    },
    {
      type: 'command',
      command: '[ ! -f ".codex/skills/design-taste-frontend/scripts/gate.mjs" ] || node ".codex/skills/design-taste-frontend/scripts/gate.mjs" --hook codex',
      commandWindows: 'if exist ".codex/skills/design-taste-frontend/scripts/gate.mjs" (node ".codex/skills/design-taste-frontend/scripts/gate.mjs" --hook codex & exit /b)',
      timeout: 600,
      statusMessage: 'Running tasteskill frontend gate'
    },
    {
      type: 'command',
      command: CODEX_AVOID_AI_WRITING_CMD,
      commandWindows: CODEX_AVOID_AI_WRITING_CMD,
      timeout: 15,
      statusMessage: 'Checking modified Markdown prose (avoid-ai-writing)'
    }
  ];
  if (!designer) {
    stopHooks.push({
      type: 'command',
      command: '[ ! -f ".codex/skills/continuous-agent-loop/scripts/harness.mjs" ] || node ".codex/skills/continuous-agent-loop/scripts/harness.mjs" verify status-check --hook codex',
      commandWindows: 'if exist ".codex/skills/continuous-agent-loop/scripts/harness.mjs" (node ".codex/skills/continuous-agent-loop/scripts/harness.mjs" verify status-check --hook codex & exit /b)',
      timeout: 10,
      statusMessage: 'Verifying harness receipt & progress checkpoint'
    });
  }

  const hooks = {};
  if (!designer) {
    hooks.PreToolUse = [
      {
        matcher: 'Edit|Write|apply_patch',
        hooks: [
          {
            type: 'command',
            command: '[ ! -f ".codex/skills/continuous-agent-loop/scripts/harness.mjs" ] || node ".codex/skills/continuous-agent-loop/scripts/harness.mjs" sensor check-file',
            commandWindows: 'if exist ".codex/skills/continuous-agent-loop/scripts/harness.mjs" (node ".codex/skills/continuous-agent-loop/scripts/harness.mjs" sensor check-file & exit /b)',
            timeout: 5,
            statusMessage: 'Checking harness contract scope'
          }
        ]
      }
    ];
  }
  hooks.PostToolUse = [
    {
      matcher: 'Edit|Write|apply_patch',
      hooks: postToolUseHooks
    }
  ];
  hooks.Stop = [
    {
      hooks: stopHooks
    }
  ];

  return { description, hooks };
}

/** Build project.gitignore from localCodexIgnoreEntries + root .gitignore without AGY leaks or duplicate entries. */
function buildProjectGitignore(rootIgnoreText) {
  const covered = new Set();
  for (const entry of localCodexIgnoreEntries) {
    covered.add(entry);
    if (entry.startsWith('/')) covered.add(entry.slice(1));
  }
  const sections = rootIgnoreText.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n').trimEnd().split(/\n\s*\n/);
  const keptSections = [];
  for (const section of sections) {
    const rawLines = section.split('\n');
    const kept = [];
    let hasRule = false;
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        kept.push(line);
        continue;
      }
      if (trimmed === '/.agents/hooks.json' || trimmed.startsWith('/.agents/') || trimmed.startsWith('.agents/')) continue;
      if (covered.has(trimmed) || (trimmed.startsWith('/') && covered.has(trimmed.slice(1)))) continue;
      covered.add(trimmed);
      if (trimmed.startsWith('/')) covered.add(trimmed.slice(1));
      kept.push(line);
      hasRule = true;
    }
    if (hasRule) keptSections.push(kept.join('\n'));
  }
  return '# Local Codex skills, instructions, and workflow artifacts\n'
    + localCodexIgnoreEntries.join('\n')
    + '\n\n'
    + keptSections.join('\n\n')
    + '\n';
}

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
    const sourceRelative = slash(path.relative(repoRoot, source));
    const sourceHash = before.files[sourceRelative] !== undefined
      ? before.files[sourceRelative]
      : payloadHash(fs.readFileSync(source));
    records[relative] = { source: sourceRelative, sourceHash, outputHash: sha256(data) };
  }

  for (const source of sourceFiles) {
    const originalRelative = slash(path.relative(sourceRoot, source));
    if (originalRelative === 'hooks.example.json' || originalRelative === 'hooks.impeccable.example.json' || originalRelative === 'hooks.json' || originalRelative.startsWith('rules/') || isBundleExcluded(originalRelative)) continue;
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
    } else if (originalRelative.startsWith('agents/') && source.endsWith('.md')) {
      const adapted = adaptMarkdown(fs.readFileSync(source, 'utf8'), source, duplicates);
      add(originalRelative, adapted, source);
      const agentName = path.basename(source, '.md');
      add(`agents/${agentName}.toml`, generateCodexAgentToml(adapted, agentName), source);
    } else if (source.endsWith('.md')) {
      add(originalRelative, adaptMarkdown(fs.readFileSync(source, 'utf8'), source, duplicates), source);
    } else add(originalRelative, fs.readFileSync(source), source);
  }

  for (const original of filesIn(path.join(sourceRoot, 'rules'))) {
    if (isBundleExcluded(slash(path.relative(sourceRoot, original)))) continue;
    const name = path.basename(original);
    const override = path.join(templates, 'rules', name);
    const input = fs.existsSync(override) ? override : original;
    let text = fs.readFileSync(input, 'utf8');
    if (!fs.existsSync(override)) {
      const { body } = parseSkill(text, input);
      text = `> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.\n\n${body}`;
    }
    const adaptedRule = adaptMarkdown(text, original, duplicates);
    add(`rules/${name}`, adaptedRule, input);
    if (name === 'learned-invariants.md') {
      add('learned-invariants.designer.md', formatDesignerLearnedInvariants(adaptedRule), input);
    } else if (name === 'security.md') {
      add('security.designer.md', formatDesignerSecurityRule(adaptedRule), input);
    }
  }
  const swarmRuleTemplate = path.join(templates, 'rules/swarm.md');
  if (fs.existsSync(swarmRuleTemplate)) {
    const virtualSwarmRule = path.join(sourceRoot, 'rules/swarm.md');
    add('rules/swarm.md', adaptMarkdown(fs.readFileSync(swarmRuleTemplate, 'utf8'), virtualSwarmRule, duplicates), swarmRuleTemplate);
  }
  const swarmSkillTemplate = path.join(templates, 'skills/swarm/SKILL.md');
  if (fs.existsSync(swarmSkillTemplate)) {
    const virtualSwarmSkill = path.join(sourceRoot, 'skills/swarm/SKILL.md');
    const { text, frontmatter } = convertSkill(fs.readFileSync(swarmSkillTemplate, 'utf8'), virtualSwarmSkill, duplicates);
    add('skills/swarm/SKILL.md', text, swarmSkillTemplate);
    add('skills/swarm/agents/openai.yaml', yamlText(openaiMetadata(undefined, frontmatter)), swarmSkillTemplate);
    discoverableSkills++;
    topLevelSkills++;
  }
  const configExampleTemplate = path.join(templates, 'config.example.toml');
  if (fs.existsSync(configExampleTemplate)) {
    add('config.example.toml', fs.readFileSync(configExampleTemplate, 'utf8'), configExampleTemplate);
  }
  const agentsPolicy = path.join(repoRoot, 'AGENTS.md');
  // Keep source-only installation routing and maintenance notes in this
  // checkout. Installed projects receive the user's three-section policy.
  const rawInstalledPolicy = fs.readFileSync(agentsPolicy, 'utf8').split(/\r?\n<!-- source-repository-only -->/)[0].trimEnd() + '\n';
  const installedPolicy = adaptMarkdown(rawInstalledPolicy, agentsPolicy, duplicates);
  add('AGENTS.md', installedPolicy, agentsPolicy);
  add('AGENTS.designer.md', formatDesignerPolicy(installedPolicy), agentsPolicy);
  const projectIgnore = path.join(repoRoot, '.gitignore');
  add('project.gitignore', buildProjectGitignore(fs.readFileSync(projectIgnore, 'utf8')), projectIgnore);
  const hooksSource = path.join(sourceRoot, 'hooks.example.json');
  add('hooks.example.json', json(buildCodexHooks({ designer: false })), hooksSource);
  add('hooks.impeccable.example.json', json(buildCodexHooks({ designer: true })), hooksSource);

  // Preflight every generated destination before writing any files. Refuse to
  // overwrite manually edited generated files. The retired instruction
  // template is the sole reviewed exception to stale-file removal.
  for (const [relative, data] of outputs) {
    const absolute = path.join(bundleRoot, relative);
    assertNoSymlinkAncestors(absolute);
    if (fs.existsSync(absolute)) {
      const currentData = fs.readFileSync(absolute);
      const currentHash = previous.formatVersion === 2 ? payloadHash(currentData) : sha256(currentData);
      if (currentHash !== sha256(data) && currentHash !== previous.files?.[relative]?.outputHash) throw new Error(`Edited or unowned generated file: ${relative}. Preserve it before rebuilding.`);
    }
  }
  const retired = [];
  for (const old of Object.keys(previous.files || {})) {
    if (outputs.has(old)) continue;
    const sourcePath = previous.files[old]?.source ? path.resolve(repoRoot, previous.files[old].source) : null;
    const isSourceRemoved = sourcePath && !fs.existsSync(sourcePath);
    const isExcluded = sourcePath && isBundleExcluded(slash(path.relative(sourceRoot, sourcePath)));
    if (!isSourceRemoved && !isExcluded && old !== 'AGENTS.template.md') throw new Error(`Stale generated file ${old}; review it before rebuilding. No files were removed.`);
    const absolute = path.join(bundleRoot, old);
    assertNoSymlinkAncestors(absolute);
    if (fs.existsSync(absolute)) {
      const data = fs.readFileSync(absolute);
      const hash = previous.formatVersion === 2 ? payloadHash(data) : sha256(data);
      if (hash !== previous.files[old].outputHash) throw new Error(`Edited retired file: ${old}. Preserve it before rebuilding.`);
      retired.push(absolute);
    }
  }
  for (const [relative, data] of outputs) writeIfChanged(path.join(bundleRoot, relative), data);
  for (const file of retired) fs.unlinkSync(file);
  pruneEmptyDirs(bundleRoot);
  const after = snapshotSource();
  if (before.digest !== after.digest) throw new Error('Original source changed during conversion');
  const manifest = {
    generatedBy: 'tools/codex/build.mjs', formatVersion: 2, hashing: 'sha256-lf-text', checkedOn: '2026-10-01',
    originalSnapshot: before, originalPreserved: true,
    summary: { topLevelSkills, discoverableSkills, duplicatesPreservedAsReferences: duplicates.size, rules: [...outputs.keys()].filter(k => k.startsWith('rules/') && k.endsWith('.md')).length, generatedFiles: outputs.size },
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
