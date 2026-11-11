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
import { convertSkill, convertAgent, adaptMarkdown, generateClaudeMd } from './convert.mjs';

const customCommands = {
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
    if (originalRelative === 'hooks.example.json' || isBundleExcluded(originalRelative)) continue;

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
      const text = adaptMarkdown(fs.readFileSync(source, 'utf8'), source);
      add(originalRelative, text, source);
    }
    // Supporting files (scripts, references, assets, etc.)
    else {
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
        ...hooks
      }).replaceAll('.agents/', '.claude/'),
      hooksSource
    );
  }

  // 4. Generate root CLAUDE.md from AGENTS.md
  const agentsMdSource = path.join(repoRoot, 'AGENTS.md');
  const claudeMdContent = generateClaudeMd(fs.readFileSync(agentsMdSource, 'utf8'));
  writeIfChanged(path.join(repoRoot, 'CLAUDE.md'), claudeMdContent);
  add('CLAUDE.md', claudeMdContent, agentsMdSource);

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
      rules: filesIn(path.join(sourceRoot, 'rules')).filter(f => f.endsWith('.md')).length,
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
