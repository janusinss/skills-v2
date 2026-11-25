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
description: Coordinate parallel Agent subagents with disjoint file ownership, worktree isolation, and 4-rung model routing
---
Follow [.claude/rules/swarm.md](.claude/rules/swarm.md) to orchestrate parallel \`Agent\` subagents for: $ARGUMENTS.
1. Preserve the user's UI coordinator effort (\`opus\` \`xhigh\` or \`max\`; never auto-escalate \`xhigh\` to \`max\`).
2. Decompose the task into disjoint file-ownership slices and launch parallel writers with \`isolation: "worktree"\` (read-only scouts and reviewers run without worktree isolation).
3. Route specialists by the 4-rung table (\`Rung 1: opus high\`, \`Rung 2: sonnet high\` or \`opus high\` for \`@security-auditor\` / \`@skeptic\` / Strike-2, \`Rung 3: opus medium\`, \`Rung 4: haiku high\`).
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
description: Record a root-cause invariant into the Calibrated Dual-Store Memory Flywheel and checkpoint progress
---
Record a failure root cause or invariant and checkpoint task progress for: $ARGUMENTS.
1. Execute \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --task <id> --source <skeptic|verify|user> --domain <domain> --cause "<root_cause>" --rule "<guardrail_rule>" --promote\` to stage into \`.harness/evals/regressions.jsonl\` and promote deduplicated guardrails to \`.claude/rules/learned-invariants.md\`.
2. Update \`.harness/PROGRESS.md\` via \`node .claude/skills/continuous-agent-loop/scripts/harness.mjs checkpoint --task <id> --step "<completed_step>"\`.
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

/** Filter excluded hooks and adapt matchers/commands to native Claude Code settings.json schema. */
function adaptHooksForClaude(hooksMap = {}, excludedSubstrings = []) {
  const filtered = {};
  for (const [event, groups] of Object.entries(hooksMap)) {
    if (!Array.isArray(groups)) continue;
    const keptGroups = [];
    for (const group of groups) {
      if (!group || typeof group !== 'object' || !Array.isArray(group.hooks)) continue;
      const keptHooks = [];
      for (const entry of group.hooks) {
        if (!entry || typeof entry !== 'object') continue;
        const commands = `${entry.command ?? ''}\n${entry.commandWindows ?? ''}`;
        if (excludedSubstrings.some(needle => commands.includes(needle))) continue;
        const { commandWindows: _commandWindows, ...rest } = entry;
        if (typeof rest.command === 'string') {
          rest.command = rest.command
            .replaceAll('.agents/', '.claude/')
            .replaceAll('--hook antigravity', '--hook claude')
            .replace("const dec=('--hook claude').endsWith('antigravity')?'continue':'block';", "const dec='block';");
        }
        keptHooks.push(rest);
      }
      if (keptHooks.length > 0) {
        const adaptedGroup = { ...group, hooks: keptHooks };
        if (typeof adaptedGroup.matcher === 'string') {
          adaptedGroup.matcher = adaptedGroup.matcher
            .replaceAll('Edit|Write|apply_patch', 'Edit|Write|MultiEdit|NotebookEdit')
            .replaceAll('apply_patch', 'MultiEdit|NotebookEdit');
        }
        keptGroups.push(adaptedGroup);
      }
    }
    if (keptGroups.length > 0) filtered[event] = keptGroups;
  }
  return filtered;
}

function injectSubagentStopHook(hooksMap = {}) {
  const existing = Array.isArray(hooksMap.SubagentStop) ? [...hooksMap.SubagentStop] : [];
  existing.push({
    matcher: '',
    hooks: [
      {
        type: 'command',
        command: 'node .claude/scripts/swarm-subagent-guard.cjs',
        timeout: 10,
        statusMessage: 'Validating subagent completion report'
      }
    ]
  });
  return { ...hooksMap, SubagentStop: existing };
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
    const hooks = JSON.parse(fs.readFileSync(hooksSource, 'utf8'));
    add(
      'hooks.example.json',
      json({
        description: 'Optional harness and Impeccable hooks. Install at .claude/hooks.json in a trusted target project and review them in Claude Code before use.',
        ...hooks,
        hooks: injectSubagentStopHook(adaptHooksForClaude(hooks.hooks, ['swarm-stop-guard']))
      }),
      hooksSource
    );
    add(
      'hooks.impeccable.example.json',
      json({
        description: 'Optional Impeccable hooks (Designer mode, without Harness hooks). Install at .claude/hooks.json in a trusted target project and review them in Claude Code before use.',
        ...hooks,
        hooks: injectSubagentStopHook(adaptHooksForClaude(hooks.hooks, ['harness.mjs', 'swarm-stop-guard']))
      }),
      hooksSource
    );
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
