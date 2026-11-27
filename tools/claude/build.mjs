import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  repoRoot,
  bundleRoot,
  sourceRoot,
  filesIn,
  slash,
  json,
  sha256,
  payloadData,
  payloadHash,
  writeIfChanged,
  assertNoSymlinkAncestors,
  snapshotSource,
  isBundleExcluded,
  parseFrontmatter
} from './lib.mjs';
import { convertSkill, convertAgent, adaptMarkdown, generateClaudeMd, formatDesignerPolicy, adaptPlaywrightRunner } from './convert.mjs';

const customCommands = {
  'swarm.md': `---
description: Coordinate parallel Agent subagents with disjoint file ownership, worktree isolation, and Advisor-First model routing
---
Follow [.claude/rules/swarm.md](.claude/rules/swarm.md) to orchestrate parallel \`Agent\` subagents for: $ARGUMENTS.
1. Run the coordinator on \`sonnet\` (preserving the user's UI effort) with \`"advisorModel": "opus"\` configured in user-global \`~/.claude/settings.json\`.
2. Decompose the task into disjoint file-ownership slices and launch parallel writers with \`isolation: "worktree"\` (read-only scouts and reviewers run without worktree isolation).
3. Route specialists by Advisor-First frontmatter defaults (\`Rung 1–2: sonnet high\`, \`Rung 3: sonnet medium\`, \`Rung 4: haiku high\`, inheriting user \`"advisorModel": "opus"\`), reserving per-invocation \`Agent(model: "opus")\` strictly for Strike-2 escalations after Opus advisor guidance.
4. Rely on the native \`SubagentStop\` hook (\`node .claude/scripts/swarm-subagent-guard.cjs\`) for completion reporting, integrate completed worktree changes, and run verification before finishing.
`,
  'plan.md': `---
description: Deconstruct a feature or refactoring task into atomic steps using @planner
---
Please invoke the @planner subagent to create a Phase 1 implementation checklist for: $ARGUMENTS. Follow the operating rules in CLAUDE.md (Action-first on Line 1, numbered bounded atomic steps, max 5 items per group).
`,
  'tdd.md': `---
description: Author failing unit and integration tests before implementation using @tdd-guide
---
Please invoke the @tdd-guide subagent to author Phase 2 test specifications for: $ARGUMENTS. Enforce RED state before writing feature code.
`,
  'audit.md': `---
description: Run adversarial security and quality audit using @security-auditor and @silent-failure-hunter
---
Please run a defensive audit on recent changes. First, invoke @security-auditor to check for injection, auth, and OWASP vulnerabilities. Then invoke @silent-failure-hunter to catch swallowed errors and missing telemetry.
`,
  'review.md': `---
description: Review code quality, type safety, and framework conventions using @typescript-reviewer or @code-reviewer
---
Please invoke @typescript-reviewer (or @code-reviewer) to perform a thorough code quality and security review on recent changes.
`,
  'eval.md': `---
description: Grade task delivery against 5-axis quality rubric using @agent-evaluator
---
Please invoke the @agent-evaluator subagent to evaluate task delivery across accuracy, completeness, clarity, actionability, and conciseness.
`,
  'contract.md': `---
description: Initialize a pre-flight task contract and adaptive worktree using harness.mjs
---
Initialize a scoped task contract before editing files for: $ARGUMENTS. First use @explorer (fast reconnaissance) and @planner or @code-architect to identify exact allowed file globs and acceptance commands, then execute \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs contract init --task <id> --allow "<globs>" --cmd "<commands>"\`.
`,
  'verify.md': `---
description: Run deterministic receipt verification and cold-context @skeptic evaluation
---
Execute deterministic receipt verification and cold-context Skeptic review for: $ARGUMENTS.
1. Run \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs verify run --task <id>\`.
2. Generate the sanitized brief via \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs skeptic-packet --task <id>\`.
3. Invoke the @skeptic subagent on \`.harness/context/<id>-brief.json\` (Contract + Raw Diff + Receipt only, zero author commentary) and stamp its verdict via \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs stamp-skeptic --task <id> --verdict <APPROVE|REJECT>\`.
`,
  'flywheel.md': `---
description: Record a regression guardrail or positive exemplar into the Calibrated Dual-Store Memory Flywheel and checkpoint progress
---
Record a failure root cause, positive exemplar, or invariant and checkpoint task progress for: $ARGUMENTS (or use \`/learn\` for quick bidirectional insight capture in both Harness and Designer modes).
1. Execute \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --task <id> --kind <regression|exemplar> --source <skeptic|verify|user> --domain <domain> --cause "<root_cause_or_context>" --rule "<guardrail_or_exemplar_rule>" --promote\` to stage into \`.harness/evals/regressions.jsonl\` (or \`exemplars.jsonl\`) and promote deduplicated rules to \`.claude/rules/learned-invariants.md\`.
2. Update \`.harness/PROGRESS.md\` via \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs checkpoint --task <id> --step "<completed_step>"\`.
`,
  'learn.md': `---
description: Record a bidirectional positive exemplar or negative anti-pattern into the Memory Flywheel
---
Follow [.claude/skills/learn/SKILL.md](.claude/skills/learn/SKILL.md) to capture a reusable insight for: $ARGUMENTS.
1. Classify the insight as a positive **exemplar** (verified technique, pattern, or workflow to repeat) or negative **regression** (bug root cause, user correction, or guardrail to prevent).
2. Record it via \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --kind <regression|exemplar> --source user --domain <domain> --cause "<context>" --rule "<actionable_rule>" --promote\` (or directly into \`.claude/rules/learned-invariants.md\` when running without the harness script).
3. Run \`flywheel digest\` when a domain reaches 3+ related learnings to graduate recurring clusters into a dedicated project skill.
`
};

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

const CLAUDE_AVOID_AI_WRITING_CMD = "node -e \"const fs=require('fs'),path=require('path'),cp=require('child_process'),g='.claude/skills/avoid-ai-writing/bin/avoid-ai-writing-gate.js';function run(raw){let d={};try{const t=(raw.charCodeAt(0)===65279?raw.slice(1):raw).trim();if(t)d=JSON.parse(t);}catch(e){}if(d&&(d.stop_hook_active||d.continuationActive))process.exit(0);const b=(d&&typeof d.cwd==='string'&&d.cwd)?d.cwd:process.cwd();const top=cp.spawnSync('git',['rev-parse','--show-toplevel'],{cwd:b,encoding:'utf8'});if(top.status===0&&top.stdout.trim()){}else{process.exit(0);}const root=path.resolve(top.stdout.trim()),gate=fs.existsSync(path.join(root,g))?path.join(root,g):path.resolve(b,g);if(fs.existsSync(gate)===false)process.exit(0);const st=cp.spawnSync('git',['-c','core.quotepath=false','status','--porcelain','--untracked-files=all'],{cwd:root,encoding:'utf8'});if(st.status===0){}else{process.exit(0);}const files=st.stdout.split(String.fromCharCode(10)).map(l=>l.replaceAll(String.fromCharCode(13),'').slice(3).split(' -> ').pop().trim().replaceAll(String.fromCharCode(34),'')).filter(p=>{const n=p.split(path.sep).join('/'),lo=n.toLowerCase();return p&&(lo.endsWith('.md')||lo.endsWith('.mdx'))&&['.agents','.codex','.claude'].some(x=>n.startsWith(x+'/'))===false&&fs.existsSync(path.join(root,p));});if(files.length===0)process.exit(0);const r=cp.spawnSync(process.execPath,[gate,'--json','--context','technical','--source-mode','rendered-markdown','--threshold','6','--',...files],{cwd:root,encoding:'utf8'});if(r.status===0)process.exit(0);let reason=(r.stderr||r.stdout||'avoid-ai-writing gate failed').trim();try{const j=JSON.parse(r.stdout);const bad=(j.files||[]).filter(x=>x.pass===false).map(x=>x.path+' ('+x.findings+' findings: '+(x.types||[]).join(', ')+')');if(bad.length)reason='avoid-ai-writing failed threshold '+j.threshold+': '+bad.join('; ')+' — rewrite AI-ism prose before finishing.';}catch(e){}const dec='block';process.stdout.write(JSON.stringify({decision:dec,reason})+String.fromCharCode(10));process.exit(0);}if(process.stdin.isTTY){run('');}else{let raw='',done=false;const fin=()=>{if(done)return;done=true;clearTimeout(tm);try{process.stdin.pause();process.stdin.destroy();}catch(e){}run(raw);};const tm=setTimeout(fin,500);process.stdin.setEncoding('utf8');process.stdin.on('data',c=>{raw+=c;if(raw.length>1048576)fin();});process.stdin.on('end',fin);process.stdin.on('error',fin);}\"";

/** Build native Claude Code hooks JSON independently of AGY's hooks.md schema. */
function buildClaudeHooks({ designer = false } = {}) {
  const description = designer
    ? 'Optional Impeccable hooks (Designer mode, without Harness hooks). Install at .claude/hooks.json in a trusted target project and review them in Claude Code before use.'
    : 'Optional harness and Impeccable hooks. Install at .claude/hooks.json in a trusted target project and review them in Claude Code before use.';

  const postToolUseHooks = [
    {
      type: 'command',
      command: '[ ! -f ".claude/skills/impeccable/scripts/impeccable" ] || ".claude/skills/impeccable/scripts/impeccable" hook',
      timeout: 5,
      statusMessage: 'Checking UI changes'
    }
  ];
  if (!designer) {
    postToolUseHooks.push({
      type: 'command',
      command: '[ ! -f ".claude/skills/continuous-agent-loop/scripts/harness.mjs" ] || node ".claude/skills/continuous-agent-loop/scripts/harness.mjs" sensor check-file',
      timeout: 5,
      statusMessage: 'Auditing post-edit scope boundary'
    });
  }

  const stopHooks = [
    {
      type: 'command',
      command: '[ ! -f ".claude/skills/impeccable/scripts/impeccable" ] || ".claude/skills/impeccable/scripts/impeccable" hook',
      timeout: 30,
      statusMessage: 'Design deep pass'
    },
    {
      type: 'command',
      command: '[ ! -f ".claude/skills/design-taste-frontend/scripts/gate.mjs" ] || node ".claude/skills/design-taste-frontend/scripts/gate.mjs" --hook claude',
      timeout: 600,
      statusMessage: 'Running tasteskill frontend gate'
    },
    {
      type: 'command',
      command: CLAUDE_AVOID_AI_WRITING_CMD,
      timeout: 15,
      statusMessage: 'Checking modified Markdown prose (avoid-ai-writing)'
    }
  ];
  if (!designer) {
    stopHooks.push({
      type: 'command',
      command: '[ ! -f ".claude/skills/continuous-agent-loop/scripts/harness.mjs" ] || node ".claude/skills/continuous-agent-loop/scripts/harness.mjs" verify status-check --hook claude',
      timeout: 10,
      statusMessage: 'Verifying harness receipt & progress checkpoint'
    });
  }

  const hooks = {
    SessionStart: [
      {
        matcher: '',
        hooks: [
          {
            type: 'command',
            command: '[ ! -f ".claude/skills/continuous-agent-loop/scripts/harness.mjs" ] || node ".claude/skills/continuous-agent-loop/scripts/harness.mjs" memory brief --hook claude',
            timeout: 10,
            statusMessage: 'Loading active memory brief'
          }
        ]
      }
    ]
  };

  if (!designer) {
    hooks.PreToolUse = [
      {
        matcher: 'Edit|Write|MultiEdit|NotebookEdit',
        hooks: [
          {
            type: 'command',
            command: '[ ! -f ".claude/skills/continuous-agent-loop/scripts/harness.mjs" ] || node ".claude/skills/continuous-agent-loop/scripts/harness.mjs" sensor check-file',
            timeout: 5,
            statusMessage: 'Checking harness contract scope'
          }
        ]
      }
    ];
  }

  hooks.PostToolUse = [
    {
      matcher: 'Edit|Write|MultiEdit|NotebookEdit',
      hooks: postToolUseHooks
    }
  ];

  hooks.Stop = [
    {
      hooks: stopHooks
    }
  ];

  hooks.SubagentStop = [
    {
      matcher: '',
      hooks: [
        {
          type: 'command',
          command: 'node .claude/scripts/swarm-subagent-guard.cjs',
          timeout: 10,
          statusMessage: 'Validating subagent completion report'
        }
      ]
    }
  ];

  return { description, hooks };
}

export function buildClaudeBundle() {
  assertNoSymlinkAncestors(bundleRoot);
  const before = snapshotSource();
  const sourceFiles = filesIn(sourceRoot);
  const skillFiles = sourceFiles.filter(file => path.basename(file) === 'SKILL.md');

  const canonicalNames = new Map();
  const duplicates = new Map();
  for (const file of skillFiles.sort((a, b) => a.length - b.length || a.localeCompare(b))) {
    const { frontmatter } = parseFrontmatter(fs.readFileSync(file, 'utf8'), file);
    if (canonicalNames.has(frontmatter.name)) duplicates.set(file, path.join(path.dirname(file), 'REFERENCE.md'));
    else canonicalNames.set(frontmatter.name, file);
  }

  const previousPath = path.join(bundleRoot, 'manifest.json');
  const previous = fs.existsSync(previousPath) ? JSON.parse(fs.readFileSync(previousPath, 'utf8')) : { files: {} };
  const outputs = new Map();
  const records = {};
  let discoverableSkills = 0;
  let topLevelSkills = 0;
  let discoverableAgents = 0;
  const templates = path.join(repoRoot, 'tools/claude/templates');

  function add(relative, content, source) {
    if (outputs.has(relative)) throw new Error(`Output collision: ${relative}`);
    const data = payloadData(content);
    outputs.set(relative, data);
    const sourceRelative = source ? slash(path.relative(repoRoot, source)) : null;
    records[relative] = {
      source: sourceRelative,
      sourceHash: sourceRelative && before.files[sourceRelative] !== undefined
        ? before.files[sourceRelative]
        : source ? payloadHash(fs.readFileSync(source)) : sha256(data),
      outputHash: sha256(data)
    };
  }

  // 1. Process all source files from .agents
  for (const source of sourceFiles) {
    const originalRelative = slash(path.relative(sourceRoot, source));
    if (originalRelative === 'hooks.example.json' || originalRelative === 'hooks.impeccable.example.json' || originalRelative === 'hooks.json' || isBundleExcluded(originalRelative)) continue;

    // Convert Skills
    if (duplicates.has(source)) {
      const { text } = convertSkill(fs.readFileSync(source, 'utf8'), source);
      add(slash(path.relative(sourceRoot, duplicates.get(source))), text, source);
    } else if (path.basename(source) === 'SKILL.md') {
      const { text } = convertSkill(fs.readFileSync(source, 'utf8'), source);
      add(originalRelative, text, source);
      discoverableSkills++;
      if (path.dirname(path.dirname(source)) === path.join(sourceRoot, 'skills')) topLevelSkills++;
    }
    // Convert Subagents
    else if (originalRelative.startsWith('agents/') && source.endsWith('.md')) {
      const { text } = convertAgent(fs.readFileSync(source, 'utf8'), source);
      add(originalRelative, text, source);
      discoverableAgents++;
    }
    // Convert Rules
    else if (originalRelative.startsWith('rules/') && source.endsWith('.md')) {
      const name = path.basename(source);
      const override = path.join(templates, 'rules', name);
      const input = fs.existsSync(override) ? override : source;
      let rawText = fs.readFileSync(input, 'utf8');
      if (!fs.existsSync(override)) {
        rawText = rawText.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n*/, '');
      }
      const text = adaptMarkdown(rawText, source);
      add(originalRelative, text, input);
    }
    // Supporting files (scripts, references, assets, etc.)
    else if (originalRelative === 'skills/playwright-skill/run.js') {
      add(originalRelative, adaptPlaywrightRunner(fs.readFileSync(source, 'utf8')), source);
    } else {
      let content = fs.readFileSync(source);
      if (source.endsWith('.md') || source.endsWith('.txt') || source.endsWith('.json') || source.endsWith('.js') || source.endsWith('.mjs')) {
        const text = adaptMarkdown(content.toString('utf8'), source);
        content = Buffer.from(text);
      }
      add(originalRelative, content, source);
    }
  }

  // 2. Add custom slash commands into .claude/commands/
  for (const [cmdFile, cmdContent] of Object.entries(customCommands)) {
    add(`commands/${cmdFile}`, cmdContent, null);
  }

  // 2b. Emit Claude-specific swarm rule and SubagentStop closure guard script
  const swarmRuleSource = path.join(templates, 'rules/swarm.md');
  if (fs.existsSync(swarmRuleSource)) {
    add('rules/swarm.md', adaptMarkdown(fs.readFileSync(swarmRuleSource, 'utf8'), path.join(sourceRoot, 'rules/swarm.md')), swarmRuleSource);
  }
  const swarmGuardSource = path.join(templates, 'scripts/swarm-subagent-guard.cjs');
  if (fs.existsSync(swarmGuardSource)) {
    add('scripts/swarm-subagent-guard.cjs', fs.readFileSync(swarmGuardSource), swarmGuardSource);
  }

  // 3. Add profiles.json and project.gitignore
  const profilesSource = path.join(path.dirname(fileURLToPath(import.meta.url)), 'profiles.json');
  if (fs.existsSync(profilesSource)) {
    add('profiles.json', fs.readFileSync(profilesSource), profilesSource);
  }
  const gitignoreSource = path.join(path.dirname(fileURLToPath(import.meta.url)), 'project.gitignore');
  if (fs.existsSync(gitignoreSource)) {
    add('project.gitignore', fs.readFileSync(gitignoreSource), gitignoreSource);
  }
  const hooksSource = path.join(sourceRoot, 'hooks.example.json');
  if (fs.existsSync(hooksSource)) {
    add('hooks.example.json', json(buildClaudeHooks({ designer: false })), hooksSource);
    add('hooks.impeccable.example.json', json(buildClaudeHooks({ designer: true })), hooksSource);
  }

  // 4. Generate root CLAUDE.md and CLAUDE.designer.md from AGENTS.md
  const agentsMdSource = path.join(repoRoot, 'AGENTS.md');
  const claudeMdContent = generateClaudeMd(fs.readFileSync(agentsMdSource, 'utf8'));
  writeIfChanged(path.join(repoRoot, 'CLAUDE.md'), claudeMdContent);
  add('CLAUDE.md', claudeMdContent, agentsMdSource);
  add('CLAUDE.designer.md', formatDesignerPolicy(claudeMdContent), agentsMdSource);

  // 5. Handle retired files from previous bundle
  const retired = [];
  for (const old of Object.keys(previous.files || {})) {
    if (outputs.has(old)) continue;
    const absolute = path.join(bundleRoot, old);
    assertNoSymlinkAncestors(absolute);
    if (fs.existsSync(absolute)) retired.push(absolute);
  }

  // 6. Write new outputs and purge retired files
  for (const [relative, data] of outputs) {
    writeIfChanged(path.join(bundleRoot, relative), data);
  }
  for (const file of retired) {
    fs.unlinkSync(file);
  }
  pruneEmptyDirs(bundleRoot);

  // 7. Write manifest
  const manifest = {
    generatedBy: 'tools/claude/build.mjs',
    formatVersion: 1,
    hashing: 'sha256-lf-text',
    checkedOn: new Date().toISOString().split('T')[0],
    originalSnapshot: before,
    originalPreserved: true,
    summary: {
      topLevelSkills,
      discoverableSkills,
      duplicatesPreservedAsReferences: duplicates.size,
      discoverableAgents,
      rules: [...outputs.keys()].filter(k => k.startsWith('rules/') && k.endsWith('.md')).length,
      customCommands: Object.keys(customCommands).length,
      generatedFiles: outputs.size
    },
    duplicateReferences: Object.fromEntries([...duplicates].map(([from, to]) => [slash(path.relative(sourceRoot, from)), slash(path.relative(sourceRoot, to))])),
    files: records
  };
  writeIfChanged(previousPath, json(manifest));
  return manifest.summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(json(buildClaudeBundle()));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
