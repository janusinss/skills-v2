import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter, slash, sourceRoot } from './lib.mjs';

const descriptions = {
  'impeccable': 'Design, review, and polish frontend interfaces using Impeccable playbooks. Use for UI, typography, layout, accessibility, or interaction work.',
  'design': 'Create brand assets, logos, icons, and identity collateral using the bundled design references and scripts. Image generation requires an available provider.',
  'penetration-testing-with-strix': 'Run an authorized penetration test with Strix and report evidence of exploitable vulnerabilities in web apps, APIs, or repositories.',
  'playwright-skill': 'Automate and verify websites with Playwright. Use for browser interactions, screenshots, responsive checks, or testing user journeys.',
  'prompt-enhancer': 'Deconstruct concepts into domain-adaptive P0-P3 product architecture, data models, PRODUCT.md specs, and execution-ready Master Prompts.',
  'prompt-enhancer-frontend': 'Expand UI concepts into exhaustive P0-P3 page/component matrices, interaction states, responsive journeys, and frontend Master Prompts.',
  'prompt-enhancer-backend': 'Expand backend concepts into exhaustive P0-P3 API contracts, database schemas, state machines, auth/security rules, and backend Master Prompts.',
  'scrollytelling': 'Build declarative scroll-driven animations, pinned sections, parallax, waypoints, canvas sequences, and R3F 3D scroll scenes with @bsmnt/scrollytelling and GSAP.',
};

const toolMap = {
  'view_file': 'Read',
  'read_file': 'Read',
  'grep_search': 'Grep',
  'find_by_name': 'Glob',
  'list_dir': 'Glob',
  'glob': 'Glob',
  'edit_file': 'Edit',
  'replace_file_content': 'Edit',
  'write_file': 'Write',
  'write_to_file': 'Write',
  'run_command': 'Bash',
  'bash': 'Bash'
};

function rewritePathsToClaude(text, { preserveInvocationLine = false } = {}) {
  const rewrite = value =>
    value
      .replace(/(^|[\s"'`(=:\[!]|!\/|\.\/)\.(?:agents|codex)\/(skills|rules(?!\/swarm\.md\b)|resources|agents)(\/|[)\]#\s]|$)/gm, '$1.claude/$2$3')
      .replace(/(^|[\s"'`(=:\[!]|!\\|\.\\)\.(?:agents|codex)\\(skills|rules(?!\\swarm\.md\b)|resources|agents)(\\|[)\]#\s]|$)/gm, '$1.claude\\$2$3');
  if (!preserveInvocationLine) return rewrite(text);
  return text
    .split(/(\r?\n)/)
    .map((part, idx) => (idx % 2 === 0 && !/^\s*-\s+\*\*(?:Invocation by Edition|GPT \/ CODEX|AGY \/ GEMINI):?\*\*/.test(part) ? rewrite(part) : part))
    .join('');
}

export function adaptMarkdown(text, sourceFile) {
  let result = text;
  result = result.replaceAll('~/.agents/skills/', '.claude/skills/').replaceAll('.agents/skills/', '.claude/skills/');
  result = result.replaceAll('~/.codex/skills/', '.claude/skills/').replaceAll('.codex/skills/', '.claude/skills/');

  // Strip edition marker HTML comments if present
  result = result.replace(/<!--\s*edition-[^>]*-->\r?\n?/g, '');

  // Rewrite AGY/Codex tool names to Claude Code native tools
  result = result
    .replaceAll('via `view_file`', 'using the Read tool')
    .replaceAll('via `read_file`', 'using the Read tool')
    .replaceAll('(`read_file`, `view_file`, `grep_search`, `find_by_name`, `list_dir`)', '(`Read`, `Grep`, `Glob`)')
    .replaceAll('`find_by_name`, `list_dir`, `grep_search`, and bounded `read_file`', '`Glob`, `Grep`, and bounded `Read`')
    .replaceAll('Use `read_file` and `grep_search`', 'Use the `Read` and `Grep` tools')
    .replaceAll('`ask_question`', '`AskUserQuestion`')
    .replaceAll('`read_file`', 'the Read tool')
    .replaceAll('`view_file`', 'the Read tool')
    .replaceAll('`grep_search`', 'the Grep tool')
    .replaceAll('`find_by_name`', 'the Glob tool')
    .replaceAll('`list_dir`', 'the Glob tool')
    .replaceAll('`run_command`', 'the Bash tool')
    .replaceAll('`browser_subagent`', 'subagents')
    .replaceAll('`AGENTS.md` §', '`CLAUDE.md` §')
    .replaceAll('AGENTS.md §', 'CLAUDE.md §');

  // Clean AGY/Codex cross-edition prose in shared harness/flywheel docs
  result = result
    .replaceAll('via `AGY /learn`, `Claude /flywheel`, or `harness.mjs flywheel digest --graduate <domain>`', 'via `/flywheel` or `harness.mjs flywheel digest --graduate <domain>`')
    .replaceAll(' (using `.codex/` or `.claude/` in those editions)', '')
    .replaceAll("(under AGY's `24 KB` cap and `20,000`-token rules budget)", '(under the `24 KB` cap and `20,000`-token rules budget)')
    .replaceAll('Graduate recurring clusters via AGY `/learn` or `/flywheel` (or `/flywheel` in Claude / skill authoring in Codex)', 'Graduate recurring clusters via `/flywheel`')
    .replaceAll(' (or the `.codex/` / `.claude/` equivalent)', '');

  // Rebase internal relative links if needed
  result = result.replace(/(\[[^\]\n]*\]\()([^\s)]+)(\))/g, (whole, prefix, target, suffix) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) return whole;
    const [bare, anchor] = target.split('#', 2);
    const rootRelative = bare.replace(/^\.\//, '');
    let resolved = /^(?:\.agents|\.codex|\.claude)\//.test(rootRelative)
      ? path.resolve(sourceRoot, rootRelative.replace(/^(?:\.agents|\.codex|\.claude)\//, ''))
      : path.resolve(path.dirname(sourceFile), bare);
    if (!fs.existsSync(resolved)) return whole;
    const relative = slash(path.relative(path.dirname(sourceFile), resolved)) || '.';
    return `${prefix}${relative}${anchor ? '#' + anchor : ''}${suffix}`;
  });

  if (sourceFile && path.basename(sourceFile) === 'install.md') {
    const phase1Idx = result.indexOf('## Phase 1:');
    if (phase1Idx !== -1) {
      const head = result.slice(0, phase1Idx);
      const tail = result.slice(phase1Idx).replace(/\.agents\/(hooks(?:\.impeccable)?\.example\.json|hooks\.json)\b/g, '.claude/$1');
      result = head + tail;
    }
  }

  // Rewrite root command examples from .agents/ or .codex/ to .claude/
  return rewritePathsToClaude(result, { preserveInvocationLine: true });
}

function formatYamlScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string' && value.length > 0 && !/[:#\n[\]{}]|^\s|\s$/.test(value)) return value;
  return JSON.stringify(value);
}

export function convertSkill(text, sourceFile) {
  const { frontmatter, body } = parseFrontmatter(text, sourceFile);
  const name = frontmatter.name;
  const description = descriptions[name] || frontmatter.description;
  const yamlOut = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(description)}`
  ];
  if (frontmatter.license) yamlOut.push(`license: ${frontmatter.license}`);
  if (frontmatter.compatibility) yamlOut.push(`compatibility: ${JSON.stringify(frontmatter.compatibility)}`);
  if (frontmatter['disable-model-invocation'] !== undefined) {
    yamlOut.push(`disable-model-invocation: ${formatYamlScalar(frontmatter['disable-model-invocation'])}`);
  }
  if (frontmatter['argument-hint'] !== undefined) {
    yamlOut.push(`argument-hint: ${JSON.stringify(frontmatter['argument-hint'])}`);
  }
  if (frontmatter['allowed-tools'] !== undefined) {
    const allowedTools = frontmatter['allowed-tools'];
    const formatted = typeof allowedTools === 'string' && !/: |[#\n[\]{}]|^\s|\s$/.test(allowedTools)
      ? allowedTools
      : JSON.stringify(allowedTools);
    yamlOut.push(`allowed-tools: ${formatted}`);
  }
  yamlOut.push('---');

  return {
    frontmatter: {
      name,
      description,
      ...(frontmatter['disable-model-invocation'] !== undefined ? { 'disable-model-invocation': frontmatter['disable-model-invocation'] } : {}),
      ...(frontmatter['argument-hint'] !== undefined ? { 'argument-hint': frontmatter['argument-hint'] } : {}),
      ...(frontmatter['allowed-tools'] !== undefined ? { 'allowed-tools': frontmatter['allowed-tools'] } : {})
    },
    text: `${yamlOut.join('\n')}\n${adaptMarkdown(body, sourceFile)}`
  };
}

const tierConfigMap = {
  reflex: { model: 'haiku', effort: 'medium' },
  builder: { model: 'sonnet', effort: 'high' },
  brain: { model: 'opus', effort: 'high' }
};

export function convertAgent(text, sourceFile) {
  const { frontmatter, body } = parseFrontmatter(text, sourceFile);
  const name = frontmatter.name || path.basename(sourceFile, '.md');
  const description = frontmatter.description;
  const rawTools = Array.isArray(frontmatter.tools) ? frontmatter.tools : (frontmatter.tools ? String(frontmatter.tools).split(',').map(t => t.trim()) : []);
  
  const mappedTools = new Set();
  for (const t of rawTools) {
    const mapped = toolMap[t.toLowerCase()] || t;
    mappedTools.add(mapped);
  }
  // Default to Read, Grep, Glob if none specified
  if (mappedTools.size === 0) {
    mappedTools.add('Read');
    mappedTools.add('Grep');
    mappedTools.add('Glob');
  }

  const tier = typeof frontmatter.tier === 'string' ? frontmatter.tier.trim().toLowerCase() : '';
  const tierConfig = tierConfigMap[tier] || tierConfigMap.builder;
  const { model, effort } = tierConfig;
  const toolsStr = [...mappedTools].join(', ');
  const yamlOut = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(description)}`,
    `tools: ${toolsStr}`
  ];
  if (tier) yamlOut.push(`tier: ${tier}`);
  yamlOut.push(
    `model: ${model}`,
    `effort: ${effort}`,
    '---'
  );

  return {
    frontmatter: {
      name,
      description,
      tools: toolsStr,
      ...(tier ? { tier } : {}),
      model,
      effort
    },
    text: `${yamlOut.join('\n')}\n${adaptMarkdown(body, sourceFile)}`
  };
}

const claudeRoutingBlock = `Delegate specialized lifecycle tasks to the agents defined under [.claude/agents/](.claude/agents/) using \`@<agent>\`:

- **Invocation**: Invoke specialists via \`@<agent>\` (or slash commands \`/plan\`, \`/tdd\`, \`/audit\`, \`/review\`, \`/eval\`, \`/contract\`, \`/verify\`, \`/flywheel\`).
- **Cognitive Routing Tiers (\`tier:\`, \`model:\`, \`effort:\` frontmatter)**:

| Tier | Claude Code Model | Agents ([.claude/agents/](.claude/agents/)) |
| :--- | :--- | :--- |
| \`reflex\` | \`model: haiku\` (\`effort: medium\`) | \`explorer\` (fast read-only recon; never plans or edits) |
| \`builder\` | \`model: sonnet\` (\`effort: high\`) | \`tdd-guide\`, \`e2e-runner\`, \`code-simplifier\`, \`refactor-cleaner\`, \`performance-optimizer\`, \`penetration-tester\`, \`build-error-resolver\`, \`{react,go,rust,django,cpp,pytorch}-build-resolver\` |
| \`brain\` *(read-only auditors/reviewers)* | \`model: opus\` (\`effort: high\`) | \`planner\`, \`architect\`, \`code-architect\`, \`a11y-architect\`, \`spec-miner\`, \`code-reviewer\`, \`{typescript,react,vue,go,rust,php,fastapi,database}-reviewer\`, \`silent-failure-hunter\`, \`security-auditor\`, \`skeptic\`, \`agent-evaluator\` |

- **Mandatory Lifecycle Triggers**:
  1. Multi-file discovery (\`>= 3\` files) -> \`@explorer\`
  2. Non-trivial feature or refactor design -> \`@planner\` + \`@code-architect\` / \`@architect\` (plus \`@a11y-architect\` for UI)
  3. Implementation, cleanup, or build failures -> \`@tdd-guide\`, \`@code-simplifier\`, \`@refactor-cleaner\`, \`@performance-optimizer\`, \`@e2e-runner\`, or \`@*-build-resolver\`
  4. Post-edit verification -> matching stack \`@*-reviewer\` + \`@silent-failure-hunter\` (plus \`@security-auditor\` / \`@penetration-tester\` on auth, API, or input changes, and \`@skeptic\` / \`@agent-evaluator\` before final delivery)`;

export function generateClaudeMd(agentsMdText) {
  // Extract content before <!-- source-repository-only -->
  const content = agentsMdText.split('<!-- source-repository-only -->')[0].replace(/\r\n/g, '\n').trim();
  const claudeSubtitle = 'Instructions, operating rules, and workspace routing for Anthropic Claude Code.';

  let result = content.replace(/^# AGENTS\.md\b/m, '# CLAUDE.md');

  if (/<!--\s*edition-subtitle-start\s*-->[\s\S]*?<!--\s*edition-subtitle-end\s*-->/.test(result)) {
    result = result.replace(/<!--\s*edition-subtitle-start\s*-->[\s\S]*?<!--\s*edition-subtitle-end\s*-->/, claudeSubtitle);
  } else {
    result = result.replace(
      /^Instructions, operating rules, and skill mappings for AI agents \(Codex, Antigravity, and compatible harnesses\)\.$/m,
      claudeSubtitle
    );
  }

  if (/<!--\s*edition-routing-start\s*-->[\s\S]*?<!--\s*edition-routing-end\s*-->/.test(result)) {
    result = result.replace(/<!--\s*edition-routing-start\s*-->[\s\S]*?<!--\s*edition-routing-end\s*-->/, claudeRoutingBlock);
  } else {
    result = result.replace(
      /Delegate specialized lifecycle tasks to the agents defined under [^\n]+:[\s\S]*?(?=\n---\n\n## 5\.)/,
      claudeRoutingBlock
    );
  }

  // Strip any remaining edition marker comments
  result = result.replace(/<!--\s*edition-[^>]*-->\r?\n?/g, '');

  // Rewrite .agents/ and .codex/ paths to .claude/
  result = rewritePathsToClaude(result);

  return result.trimEnd() + '\n';
}

export function formatDesignerPolicy(text) {
  let result = text.replace(/\r\n/g, '\n');
  result = result.replace(
    /^- \*\*Compounding Invariants & Progress Ledger\*\*: Read \[\.(agents|codex|claude)\/rules\/learned-invariants\.md\]\(\.\1\/rules\/learned-invariants\.md\)[^\n]*$/m,
    (_, dir) => `- **Compounding Invariants**: Read [.${dir}/rules/learned-invariants.md](.${dir}/rules/learned-invariants.md) (when present) before editing code to enforce project-specific guardrails and prevent known regressions.`
  );
  result = result.replace(
    /After 2 consecutive failed verification receipts or Skeptic rejections on the same issue/g,
    'After 2 consecutive failed verification checks or audits on the same issue'
  );
  result = result.replace(/, `\/contract`, `\/verify`, `\/flywheel`/g, '');
  result = result.replace(/`skeptic`,\s*/g, '');
  result = result.replace(/`@skeptic`\s*\/\s*/g, '');
  result = result.replace(/\n---\n\n## 5\.[\s\S]*$/, '');
  return result.trimEnd() + '\n';
}

export function adaptPlaywrightRunner(text) {
  if (text.includes('centralSkills') || text.includes('execSync(')) {
    throw new Error('Playwright runner adaptation no longer matches its upstream source');
  }
  return text;
}
