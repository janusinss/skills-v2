import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { parseSkill, supportedFields, isRecord, parseYaml, slash, sourceRoot } from './lib.mjs';

const descriptions = {
  'impeccable': 'Design, review, and polish frontend interfaces using Impeccable playbooks. Use for UI, typography, layout, accessibility, or interaction work.',
  'design': 'Create brand assets, logos, icons, and identity collateral using the bundled design references and scripts. Image generation requires an available provider.',
  'penetration-testing-with-strix': 'Run an authorized penetration test with Strix and report evidence of exploitable vulnerabilities in web apps, APIs, or repositories.',
  'api-security-testing': 'Test an authorized API with Strix for authentication, authorization, injection, and API-specific vulnerabilities, with verified evidence.',
  'application-security-testing': 'Assess application security across code, web apps, APIs, and CI using Strix. Use when the user requests an AppSec review or assessment.',
  'web-app-penetration-testing': 'Penetration-test an authorized web application with Strix for exploitable web vulnerabilities and report proof of findings.',
  'find-security-vulnerabilities-in-code': 'Review source code with Strix for security vulnerabilities when the user requests a code security audit or vulnerability investigation.',
  'fix-security-vulnerabilities-with-strix': 'Fix verified security findings from Strix by addressing their root causes and checking that the original exploits fail.',
  'ci-security-scanning-with-strix': 'Configure Strix security scanning in CI when the user requests automated security checks or gates for code changes.',
  'playwright-skill': 'Automate and verify websites with Playwright. Use for browser interactions, screenshots, responsive checks, or testing user journeys.',
  'prompt-enhancer': 'Deconstruct concepts into domain-adaptive P0-P3 product architecture, data models, PRODUCT.md specs, and execution-ready Master Prompts.',
  'prompt-enhancer-frontend': 'Expand UI concepts into exhaustive P0-P3 page/component matrices, interaction states, responsive journeys, and frontend Master Prompts.',
  'prompt-enhancer-backend': 'Expand backend concepts into exhaustive P0-P3 API contracts, database schemas, state machines, auth/security rules, and backend Master Prompts.',
  'scrollytelling': 'Build declarative scroll-driven animations, pinned sections, parallax, waypoints, canvas sequences, and R3F 3D scroll scenes with @bsmnt/scrollytelling and GSAP.',
};

export function normalizeFrontmatter(original) {
  const result = { name: original.name, description: descriptions[original.name] || original.description };
  for (const key of ['license', 'compatibility', 'allowed-tools']) if (original[key] !== undefined) result[key] = original[key];
  if (typeof result['allowed-tools'] === 'string') {
    result['allowed-tools'] = result['allowed-tools'].replace(/,\s*AskUserQuestion\b|\bAskUserQuestion\s*,?\s*/g, '').trim();
  }
  const metadata = {};
  for (const [key, value] of Object.entries(isRecord(original.metadata) ? original.metadata : {})) metadata[key] = typeof value === 'string' ? value : JSON.stringify(value);
  for (const [key, value] of Object.entries(original)) if (!supportedFields.has(key) && key !== 'hooks') metadata[`upstream-${key}`] = typeof value === 'string' ? value : JSON.stringify(value);
  if (Object.keys(metadata).length) result.metadata = metadata;
  return result;
}

export const yamlText = data => YAML.stringify(data, { lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' });

export function openaiMetadata(original, skill) {
  const result = original ? structuredClone(original) : {};
  const display = result.interface?.display_name || skill.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const fullShort = result.interface?.short_description || skill.description;
  let short = fullShort.trim();
  if (short.length > 64) {
    const candidate = short.slice(0, 61);
    short = candidate.slice(0, candidate.lastIndexOf(' ') > 35 ? candidate.lastIndexOf(' ') : candidate.length) + '...';
  }
  if (short.length < 25) short = `${display}: ${short}`.slice(0, 64);
  if (short.length < 25) short = `Guidance for ${display} workflows`.slice(0, 64);
  let prompt = result.interface?.default_prompt || `Use $${skill.name} for the relevant part of this task.`;
  if (!prompt.includes(`$${skill.name}`)) prompt = `Use $${skill.name}. ${prompt}`;
  result.interface = { ...result.interface, display_name: display, short_description: short, default_prompt: prompt };
  // Preserve an existing policy. New metadata keeps normal automatic discovery.
  return result;
}

const rung1Agents = new Set(['a11y-architect', 'architect', 'code-architect', 'planner', 'spec-miner']);
const rung2ReadOnlyAgents = new Set([
  'security-auditor', 'skeptic', 'agent-evaluator', 'code-reviewer',
  'database-reviewer', 'fastapi-reviewer', 'go-reviewer', 'php-reviewer',
  'react-reviewer', 'rust-reviewer', 'silent-failure-hunter', 'typescript-reviewer',
  'vue-reviewer',
]);
const rung2WritableAgents = new Set(['tdd-guide', 'performance-optimizer', 'penetration-tester']);
const rung3Agents = new Set([
  'code-simplifier', 'refactor-cleaner', 'e2e-runner',
  'build-error-resolver', 'cpp-build-resolver', 'django-build-resolver',
  'go-build-resolver', 'pytorch-build-resolver', 'react-build-resolver',
  'rust-build-resolver',
]);
const rung4Agents = new Set(['explorer']);

export function resolveCodexAgentConfig(name, tier) {
  if (rung1Agents.has(name)) {
    return {
      model: 'gpt-6.2-sol',
      model_tier: 'reasoning',
      reasoning_effort: 'high',
      target_model: 'gpt-6.2-sol (high/xhigh)',
      sandbox_mode: 'read-only',
    };
  }
  if (rung2ReadOnlyAgents.has(name)) {
    return {
      model: 'gpt-6.2-sol',
      model_tier: 'reasoning',
      reasoning_effort: 'high',
      target_model: 'gpt-6.2-sol (high)',
      sandbox_mode: 'read-only',
    };
  }
  if (rung2WritableAgents.has(name)) {
    return {
      model: 'gpt-6.2-sol',
      model_tier: 'codex',
      reasoning_effort: 'high',
      target_model: 'gpt-6.2-sol (high)',
      sandbox_mode: 'workspace-write',
    };
  }
  if (rung3Agents.has(name)) {
    return {
      model: 'gpt-6.2-sol',
      model_tier: 'codex',
      reasoning_effort: 'medium',
      target_model: 'gpt-6.2-sol (medium)',
      sandbox_mode: 'workspace-write',
    };
  }
  if (rung4Agents.has(name)) {
    return {
      model: 'gpt-6.2-sol',
      model_tier: 'mini',
      reasoning_effort: 'medium',
      target_model: 'gpt-6.2-sol (medium)',
      sandbox_mode: 'read-only',
    };
  }
  if (tier === 'reflex') {
    return {
      model: 'gpt-6.2-sol',
      model_tier: 'mini',
      reasoning_effort: 'medium',
      target_model: 'gpt-6.2-sol (medium)',
      sandbox_mode: 'read-only',
    };
  }
  if (tier === 'builder') {
    return {
      model: 'gpt-6.2-sol',
      model_tier: 'codex',
      reasoning_effort: 'medium',
      target_model: 'gpt-6.2-sol (medium)',
      sandbox_mode: 'workspace-write',
    };
  }
  return {
    model: 'gpt-6.2-sol',
    model_tier: 'reasoning',
    reasoning_effort: 'high',
    target_model: 'gpt-6.2-sol (high)',
    sandbox_mode: 'read-only',
  };
}

const codexSubtitle = 'Instructions, operating rules, and workspace routing for OpenAI Codex.';

const codexRoutingBlock = [
  '- **Invocation & Multi-Agent V2 (`$swarm`, `$learn`)**: Configure `[features.multi_agent_v2]` in `.codex/config.toml` and spawn specialists from `.codex/agents/<role>.toml` with `fork_turns: "none"` and native parent `wait` (`default_wait_timeout_ms = 30000`, no polling worker). Follow [.codex/rules/swarm.md](.codex/rules/swarm.md) and `$swarm` for parallel execution, and use `$learn` for bidirectional positive + negative learning into `.codex/rules/learned-invariants.md`.',
  '- **Coordinator**: Preserve user-selected `gpt-6.2-astra` (`xhigh`/`max`) or `gpt-6.2-sol` (`xhigh`/`max`) in UI/config; never auto-escalate.',
  '',
  '| Rung / Tier | GPT / Codex Routing | Agents ([.codex/agents/](.codex/agents/)) |',
  '| :--- | :--- | :--- |',
  '| **Rung 1** (`brain` architects/planners) | `gpt-6.2-sol` (`high`; `xhigh` for complex multi-module architecture), `read-only` (`model_tier: reasoning`) | `a11y-architect`, `architect`, `code-architect`, `planner`, `spec-miner` |',
  '| **Rung 2** (`brain` reviewers/security + complex `builder`) | `gpt-6.2-sol` (`high`): `read-only` reviewers (`model_tier: reasoning`), `workspace-write` builders (`model_tier: codex`) | Read-only: `code-reviewer`, `{typescript,react,vue,go,rust,php,fastapi,database}-reviewer`, `silent-failure-hunter`, `security-auditor`, `skeptic`, `agent-evaluator`; Writable: `tdd-guide`, `performance-optimizer`, `penetration-tester` |',
  '| **Rung 3** (routine `builder` & build resolvers) | `gpt-6.2-sol` (`medium`), `workspace-write` (`model_tier: codex`) | `code-simplifier`, `refactor-cleaner`, `e2e-runner`, `build-error-resolver`, `{react,go,rust,django,cpp,pytorch}-build-resolver` |',
  '| **Rung 4** (`reflex` explorer/recon) | `gpt-6.2-sol` (`medium`), `read-only` (`model_tier: mini`) | `explorer` (fast read-only recon; never plans or edits) |',
  '',
  '- **Mandatory Lifecycle Triggers**:',
  '  1. Multi-file discovery (`>= 3` files) -> `explorer`',
  '  2. Non-trivial feature or refactor design -> `planner` + `code-architect` / `architect` (plus `a11y-architect` for UI)',
  '  3. Implementation, cleanup, or build failures -> `tdd-guide`, `code-simplifier`, `refactor-cleaner`, `performance-optimizer`, `e2e-runner`, or `*-build-resolver`',
  '  4. Post-edit verification -> matching stack `*-reviewer` + `silent-failure-hunter` (plus `security-auditor` / `penetration-tester` on auth, API, or input changes, and `skeptic` / `agent-evaluator` before final delivery)',
].join('\n');

function adaptCodexAgentFrontmatter(text, agentName) {
  return text.replace(/^(---\r?\n[\s\S]*?\r?\n---)/, fm => {
    let cleaned = fm
      .replace(/\r?\nmainAgent:\s*.+/g, '')
      .replace(/\r?\nsubagent:\s*.+/g, '')
      .replace(/\r?\ncommandExecutionPolicy:\s*.+/g, '');
    if (/^[ \t]*-\s*read_file\b/m.test(cleaned)) {
      cleaned = cleaned.replace(/\r?\n[ \t]*-\s*view_file\b[^\r\n]*/g, '');
    } else {
      cleaned = cleaned.replace(/^([ \t]*-\s*)view_file\b/gm, '$1read_file');
    }
    const tierMatch = /^tier:\s*(reflex|builder|brain)\s*$/m.exec(cleaned);
    if (!tierMatch) return cleaned;
    const tier = tierMatch[1];
    const nameMatch = /^name:\s*["']?([^\s"']+)["']?\s*$/m.exec(cleaned);
    const resolvedName = agentName || nameMatch?.[1] || '';
    const mapped = resolveCodexAgentConfig(resolvedName, tier);
    cleaned = cleaned
      .replace(/\r?\nmodel:\s*\S+/g, '')
      .replace(/\r?\nmodel_tier:\s*\S+/g, '')
      .replace(/\r?\nreasoning_effort:\s*\S+/g, '')
      .replace(/\r?\ntarget_model:\s*.+/g, '');
    return cleaned.replace(
      /^tier:\s*(reflex|builder|brain)\s*$/m,
      `tier: ${tier}\nmodel_tier: ${mapped.model_tier}\nreasoning_effort: ${mapped.reasoning_effort}\ntarget_model: "${mapped.target_model}"`
    );
  });
}

function tomlBasicString(value) {
  return JSON.stringify(String(value));
}

function tomlMultilineString(value) {
  const normalized = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const escaped = normalized
    .replace(/\\/g, '\\\\')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`)
    .replace(/"{3,}/g, match => match.replace(/"/g, '\\"'))
    .replace(/"+$/, match => match.replace(/"/g, '\\"'));
  return `"""\n${escaped}\n"""`;
}

export function generateCodexAgentToml(adaptedMdText, agentName) {
  const { frontmatter, body } = parseSkill(adaptedMdText, agentName ? `${agentName}.md` : 'agent.md');
  const resolvedName = agentName || frontmatter.name;
  if (!resolvedName || typeof resolvedName !== 'string') {
    throw new Error('Cannot generate Codex agent TOML without a valid name');
  }
  const description = typeof frontmatter.description === 'string' && frontmatter.description.trim()
    ? frontmatter.description.trim()
    : `Codex specialist role: ${resolvedName}`;
  const config = resolveCodexAgentConfig(resolvedName, frontmatter.tier);
  return [
    `name = ${tomlBasicString(resolvedName)}`,
    `description = ${tomlBasicString(description)}`,
    `model = ${tomlBasicString(config.model)}`,
    `model_reasoning_effort = ${tomlBasicString(config.reasoning_effort)}`,
    `sandbox_mode = ${tomlBasicString(config.sandbox_mode)}`,
    `developer_instructions = ${tomlMultilineString(body)}`,
    '',
  ].join('\n');
}

function adaptCodexPolicy(text) {
  let result = text;
  if (/<!--\s*edition-subtitle-start\s*-->/.test(result)) {
    result = result.replace(/<!--\s*edition-subtitle-start\s*-->[\s\S]*?<!--\s*edition-subtitle-end\s*-->/g, codexSubtitle);
  } else {
    result = result.replace(
      /^Instructions, operating rules, and skill mappings for AI agents[^\n]*$/m,
      codexSubtitle
    );
  }
  if (/<!--\s*edition-routing-start\s*-->/.test(result)) {
    result = result.replace(/<!--\s*edition-routing-start\s*-->[\s\S]*?<!--\s*edition-routing-end\s*-->/g, codexRoutingBlock);
  } else {
    result = result.replace(
      /- \*\*Cognitive Routing Tiers[\s\S]*?(?=\r?\n---\r?\n|\r?\n## 5\.)/,
      codexRoutingBlock + '\n'
    );
  }
  result = result.replace(/via bidirectional `\/learn`/g, 'via bidirectional `$learn`');
  return result.replace(/<!--\s*edition-[a-z0-9_-]+\s*-->\r?\n?/gi, '');
}

export function adaptMarkdown(text, sourceFile, duplicatePaths = new Map()) {
  let result = text;
  const relativeSource = sourceFile ? slash(path.relative(sourceRoot, sourceFile)) : '';
  const isAgentsPolicy = Boolean(sourceFile && path.basename(sourceFile) === 'AGENTS.md');
  if (relativeSource.startsWith('agents/')) {
    result = adaptCodexAgentFrontmatter(result, path.basename(sourceFile, '.md'));
  }
  result = result
    .replaceAll('${CLAUDE_PLUGIN_ROOT}/.claude/skills/', '.codex/skills/')
    .replaceAll('${CLAUDE_PLUGIN_ROOT}/.agents/skills/', '.codex/skills/');
  if (relativeSource !== 'skills/design-taste-frontend/references/gate.md') {
    result = result
      .replaceAll('~/.claude/skills/', '.agents/skills/')
      .replace(/(?<!\$CLAUDE_PROJECT_DIR\/)\.claude\/skills\//g, '.agents/skills/');
  }
  result = result
    .replaceAll('via `view_file`', 'using the available file-reading tool or shell')
    .replaceAll('via `read_file`', 'using the file-reading tool')
    .replaceAll('`read_file`, `view_file`', '`read_file`')
    .replaceAll('`view_file`', 'file-reading tool')
    .replaceAll('via `AGY /learn`, `Claude /flywheel`, or `harness.mjs flywheel digest --graduate <domain>`', 'via `$learn` or `harness.mjs flywheel digest --graduate <domain>`')
    .replaceAll('Graduate recurring clusters via AGY `/learn` or `/flywheel` (or `/flywheel` in Claude / skill authoring in Codex)', 'Graduate recurring clusters via `$learn` or `harness.mjs flywheel digest --graduate <domain>`')
    .replaceAll('AGY `/learn`', '`$learn`')
    .replaceAll('`AGY /learn`', '`$learn`')
    .replaceAll('AGY /learn', '`$learn`')
    .replaceAll('Claude `/flywheel`', '`harness.mjs flywheel digest --graduate <domain>`')
    .replaceAll('`Claude /flywheel`', '`harness.mjs flywheel digest --graduate <domain>`')
    .replaceAll('Claude /flywheel', '`harness.mjs flywheel digest --graduate <domain>`');
  result = result
    .replaceAll('(`ask_question` when unspecified)', '(when unspecified)')
    .replaceAll('(`ask_question`)', '(when the existing user instructions leave a material choice unresolved)')
    .replace(/`ask_question`/g, 'user clarification');
  result = result.replaceAll('AskUserQuestion', 'the available user-input tool');
  result = result
    .replaceAll('`@e2e-runner`', '`e2e-runner`')
    .replaceAll('@e2e-runner', 'e2e-runner')
    .replaceAll('`@skeptic`', '`skeptic`')
    .replaceAll('@skeptic', 'skeptic');
  if (relativeSource === 'skills/continuous-agent-loop/SKILL.md') {
    result = result
      .replace(/\s*\(using `\.codex\/` or `\.claude\/` in those editions\)/g, '')
      .replace(/\s*\(or the `\.codex\/` \/ `\.claude\/` equivalent\)/g, '')
      .replace(
        /^- \*\*Tier 2 -> Tier 3 \(`flywheel digest` -> `\/learn` or `\/flywheel` -> prune\)\*\*:[^\n]*$/m,
        '- **Tier 2 -> Tier 3 (`flywheel digest` -> `$learn` -> prune)**: `flywheel digest [--json] [--graduate <domain>]` sets `curation_recommended: true` when promoted rules reach `>= 20`, file size approaches `12 KB`, or a domain hits `>= 3` ungraduated regressions. Graduate recurring clusters via `$learn` into `.codex/skills/project-<domain>/SKILL.md`, run `flywheel digest --graduate <domain>`, and prune superseded rules.'
      );
  }
  // Repair repository-root links into relative links that work in both the
  // staged bundle (skills/) and the installed edition (.codex/skills/).
  result = result.replace(/(\[[^\]\n]*\]\()([^\s)]+)(\))/g, (whole, prefix, target, suffix) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) return whole;
    const [bare, anchor] = target.split('#', 2);
    const rootRelative = bare.replace(/^\.\//, '');
    let resolved = /^(?:\.agents|\.codex)\//.test(rootRelative) ? path.resolve(sourceRoot, rootRelative.replace(/^(?:\.agents|\.codex)\//, '')) : path.resolve(path.dirname(sourceFile), bare);
    resolved = duplicatePaths.get(resolved) || resolved;
    if (!fs.existsSync(resolved) && ![...duplicatePaths.values()].includes(resolved)) return whole;
    const relative = slash(path.relative(path.dirname(sourceFile), resolved)) || '.';
    return `${prefix}${relative}${anchor ? '#' + anchor : ''}${suffix}`;
  });
  for (const [from, to] of duplicatePaths) {
    const relative = slash(path.relative(path.dirname(sourceFile), from));
    if (!relative.startsWith('../')) result = result.replaceAll(relative, slash(path.relative(path.dirname(sourceFile), to)));
    result = result.replaceAll(slash(path.relative(path.dirname(sourceRoot), from)), slash(path.relative(path.dirname(sourceRoot), to)));
  }
  // Rewrite project-root command examples after rebasing local links. Preserve
  // user-scoped ~/.agents paths.
  const rewriteAgentsPathsToCodex = value =>
    value
      .replace(/(^|[\s"'`(=:\[!]|!\/|\.\/)\.agents\/(skills|rules|resources|agents)(\/|[)\]#\s]|$)/gm, '$1.codex/$2$3')
      .replace(/(^|[\s"'`(=:\[!]|!\\|\.\\)\.agents\\(skills|rules|resources|agents)(\\|[)\]#\s]|$)/gm, '$1.codex\\$2$3');
  result = rewriteAgentsPathsToCodex(result);
  if (isAgentsPolicy) {
    result = adaptCodexPolicy(result);
  }
  result = result.replace(/via bidirectional `\/learn`/g, 'via bidirectional `$learn`');
  return result.replace(/<!--\s*edition-[a-z0-9_-]+\s*-->\r?\n?/gi, '');
}

export function convertSkill(text, sourceFile, duplicates) {
  const { frontmatter, body } = parseSkill(text, sourceFile);
  const normalized = normalizeFrontmatter(frontmatter);
  return { frontmatter: normalized, text: `---\n${yamlText(normalized)}---\n${adaptMarkdown(body, sourceFile, duplicates)}` };
}

export function convertAgent(text, sourceFile, duplicates = new Map()) {
  const adapted = adaptMarkdown(text, sourceFile, duplicates);
  const { frontmatter } = parseSkill(adapted, sourceFile);
  return { frontmatter, text: adapted };
}

export function adaptPlaywrightRunner(text) {
  const result = text
    .replace("  // User home directory (.agents, .claude)", '  // User-scoped Agent Skills directory')
    .replace(/,\r?\n\s*path\.join\(home, '\.claude', 'skills', 'playwright-skill', 'node_modules'\)/, '');
  if (result.includes('centralSkills') || result.includes('execSync(')) throw new Error('Playwright runner adaptation no longer matches its upstream source');
  return result;
}

export function formatDesignerPolicy(text) {
  let result = text.replace(/\r\n/g, '\n');
  const dir = result.includes('.codex/') ? 'codex' : result.includes('.claude/') ? 'claude' : 'agents';
  result = result.replace(
    /^- \*\*Compounding Invariants[^*\n]*\*\*:[^\n]*$/m,
    `- **Compounding Invariants**: Read [.${dir}/rules/learned-invariants.md](.${dir}/rules/learned-invariants.md) (when present) before editing code to enforce project-specific guardrails and prevent known regressions; use \`$learn\` to record bidirectional exemplars and anti-patterns.`
  );
  result = result.replace(/\s*\(`harness\.mjs`[^)\n]*\)/g, '');
  result = result.replace(
    /After 2 consecutive failed verification receipts or Skeptic rejections on the same issue/gi,
    'After 2 consecutive failed verification checks or audits on the same issue'
  );
  result = result
    .replace(/\bverification receipts or Skeptic rejections\b/gi, 'verification checks or audits')
    .replace(/\bSkeptic rejections\b/gi, 'audit rejections');
  result = result
    .replace(/\n---\n\n## 5\.[\s\S]*$/, '')
    .replace(/\n## 5\.[\s\S]*$/, '');
  result = result
    .replace(/,\s*`skeptic`/g, '')
    .replace(/`skeptic`\s*,\s*/g, '')
    .replace(/`skeptic`\s*\/\s*`agent-evaluator`/g, '`agent-evaluator`')
    .replace(/^\s*-\s+[^\n]*\bskeptic\b[^\n]*\n?/gim, '');
  return result.trimEnd() + '\n';
}

export function formatDesignerLearnedInvariants(text) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const preambleMatch = /^(>[^\n]+\n\n)/.exec(normalized);
  const preamble = preambleMatch ? preambleMatch[1] : '';
  const section3Idx = normalized.indexOf('## 3. Promoted Project Invariants');
  const tail = section3Idx >= 0
    ? normalized.slice(section3Idx).trimEnd()
    : [
        '## 3. Promoted Project Invariants',
        '',
        '<!-- flywheel-promoted-rules-start -->',
        '<!-- flywheel-promoted-rules-end -->',
        '',
        '## 4. Promoted Positive Exemplars',
        '',
        '<!-- flywheel-exemplars-start -->',
        '<!-- flywheel-exemplars-end -->',
        '',
        '## 5. Staged Candidates (Pending Promotion)',
        '',
        '<!-- flywheel-staged-rules-start -->',
        '<!-- flywheel-staged-rules-end -->',
      ].join('\n');

  return `${preamble}${[
    '# Learned Invariants & Project Memory',
    '',
    'Core project invariants and winning playbooks loaded before planning or code edits. See [learn](../skills/learn/SKILL.md) for the `$learn` workflow.',
    '',
    '## 1. Project Memory Tiers & Budget',
    '',
    '- **Tier 2 (This file)**: Promoted Project Invariants (Section 3, `<= 20` soft cap), Promoted Positive Exemplars (Section 4, `<= 8` soft cap), and Staged Candidates (Section 5). Stage new lessons here first and promote only after user approval—never auto-append raw reflections to root policy files.',
    '- **Tier 3 (`.codex/skills/project-<domain>/SKILL.md`)**: Graduate recurring clusters (`>= 3` verified hits) or relieve size pressure near `12 KB` into a dedicated project skill, then prune superseded bullets.',
    '- **Repo Scope**: Keep project invariants, exemplars, and `project-*` skills local to target repos; commit only universal workflow invariants in a shared skills source repo.',
    '',
    '## 2. Core Baseline Invariants',
    '',
    '- **[Security-Boundary]**: Reviewers and auditors ([security-auditor.md](../agents/security-auditor.md)) must stay strictly read-only and never mutate workspace files during audits (Source: baseline-readonly-audit).',
    '',
    tail,
    '',
  ].join('\n')}`;
}

export function formatDesignerSecurityRule(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\s*·\s*\[skeptic\]\([^\n)]*skeptic\.md\)/g, '')
    .trimEnd() + '\n';
}

export function readOriginalMetadata(skillFile) {
  const file = path.join(path.dirname(skillFile), 'agents/openai.yaml');
  return fs.existsSync(file) ? parseYaml(fs.readFileSync(file, 'utf8'), file) : undefined;
}
