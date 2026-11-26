# AGENTS.md

Instructions, operating rules, and workspace routing for OpenAI Codex.

---

## 1. Operating Rules (ADHD Mode & Action-First Execution)

- **Lead with Action**: Put the command, file path, diff, or tool call on Line 1. Zero throat-clearing, intros, or restating the prompt.
- **Numbered Bounded Steps**: Break multi-step work into atomic steps (one verb/action per step; ban "and then", "afterward", "while").
- **Tool Autonomy**: Execute tool calls directly instead of asking permission or telling the user to run commands.
- **Concrete Time & Scale**: Ban vague qualifiers ("in a bit", "takes a while"); use concrete units ("~10 minutes", "2 files").
- **Visible Wins**: Immediately show what works and how to verify it (test commands, curl endpoints).
- **Neutral Error Reporting**: Report strictly **Location**, **Cause**, and **Fix**. Zero emotional padding.
- **Cap Lists to 5 Items**: Show at most 5 items per group in user-facing output.
- **Compounding Invariants**: Read [.codex/rules/learned-invariants.md](.codex/rules/learned-invariants.md) (when present) before editing code to enforce project-specific guardrails and prevent known regressions; use `$learn` to record bidirectional exemplars and anti-patterns.
- **2-Strike Escalation & 3-Strike Circuit Breaker**:
  - **Strike 2 (Architect Escalation)**: After 2 consecutive failed verification checks or audits on the same issue, escalate from `builder` to `brain` ([.codex/agents/code-architect.md](.codex/agents/code-architect.md) or higher-reasoning model) for root-cause re-architecture.
  - **Strike 3 (Circuit Breaker)**: After 3 failed attempts on the same issue, STOP editing. Ask before reverting; never discard uncommitted work. Output strictly: (1) **Invalid Assumption** (1 sentence on what failed) and (2) **Diagnostic Check** (1 concrete question or A/B choice).
- **Zero-Filler Blacklist**:
  - **Forbidden Openers**: "Sure!", "Great question", "Let me...", "I'll...", "Looking at your...", "To answer your question...", "Certainly".
  - **Forbidden Closers**: "Hope this helps!", "Let me know if you need anything else", "Happy coding!", "Feel free to ask".
  - **Forbidden Recaps & Hedges**: Do not narrate diffs; cut hedging adverbs ("perhaps", "might", "could possibly") and idioms.

---

## 2. Mandatory Workspace Rule Routing

Read and apply the matching workspace rule before selecting generic skills:

| Surface / Task | Mandatory Rule / Skill |
| --- | --- |
| Brand New Web App / Greenfield | [.codex/rules/starting-brandnew.md](.codex/rules/starting-brandnew.md) |
| Existing App / Redesign / Refactor | [.codex/rules/starting-existing.md](.codex/rules/starting-existing.md) |
| Active UI Implementation | [.codex/rules/frontend.md](.codex/rules/frontend.md) ([design-taste-frontend](.codex/skills/design-taste-frontend/SKILL.md) visual/typography/palette + [impeccable](.codex/skills/impeccable/SKILL.md) layout/craft-floor/audit) |
| Layout & CSS Hygiene | [.codex/rules/UI_Always.md](.codex/rules/UI_Always.md) |
| Native HTML/CSS/DOM & Baseline APIs | [modern-web-guidance](.codex/skills/modern-web-guidance/SKILL.md) (query `search`->`retrieve` first for dialogs, popovers, anchor positioning, View Transitions, Scroll-Driven Animations, forms, CWV, Passkeys; skip backend/infra; degrade gracefully offline) |
| Motion, Physics & 3D | [.codex/rules/MOTION.md](.codex/rules/MOTION.md) + [interaction-catalog.md](.codex/resources/creative-libraries/interaction-catalog.md) + [3d-web-experience](.codex/skills/3d-web-experience/SKILL.md) |
| Anti-AI-Slop & Copy | [anti-ai-slop](.codex/skills/anti-ai-slop/SKILL.md) (always-on rules & gates) + [unslop](.codex/skills/unslop/SKILL.md) (9-pass screen redline, live URLs, RTL) + [avoid-ai-writing](.codex/skills/avoid-ai-writing/SKILL.md) |
| Backend Architecture & Data | [.codex/rules/backend.md](.codex/rules/backend.md) |
| Application Security & Defense | [.codex/rules/security.md](.codex/rules/security.md) |
| Penetration Testing & Critical QA | [.codex/rules/penetrating-and-testing.md](.codex/rules/penetrating-and-testing.md) |
| Learned Invariants & Guardrails | [.codex/rules/learned-invariants.md](.codex/rules/learned-invariants.md) + [learn](.codex/skills/learn/SKILL.md) (bidirectional positive + negative learning across Harness & Designer modes) |
| Parallel Multi-Agent / Swarm | [.codex/rules/swarm.md](.codex/rules/swarm.md) |

---

## 3. Browser Verification Policy

Follow [UI_Always.md](.codex/rules/UI_Always.md#7-browser-verification-policy) for visual, responsive, and interactive checks:

- **Combined Engines**: Pair [playwright-skill](.codex/skills/playwright-skill/SKILL.md) (`--audit`, `-e`, or Windows-safe `--stdin`/`-b`) for layout, overflow, `--a11y`, network, console, and screenshots with [agent-browser](.codex/skills/agent-browser/SKILL.md) (`open`, `snapshot -i`, `click`/`fill @eN`, `errors`, `console`, `close`) for semantic flows. Create zero scratch `.js` files; the main agent runs ad-hoc checks (`e2e-runner` is strictly for persistent CI suites).
- **Canonical Commands & CDP Handoff**: Resolve URLs via `node .codex/skills/playwright-skill/run.js --detect-url` (never guess ports), audit via `--audit --screenshots scratch --touch-targets --a11y` (375/768/1280px), and pass authenticated `agent-browser` sessions into `--audit --session <sid>`.
- **Artifacts**: Store screenshots and temporary diagnostics in git-ignored `scratch/`.

---

## 4. Subagents & 3-Tier Cognitive Routing

- **Invocation & Multi-Agent V2 (`$swarm`, `$learn`)**: Configure `[features.multi_agent_v2]` in `.codex/config.toml` and spawn specialists from `.codex/agents/<role>.toml` with `fork_turns: "none"` and native parent `wait` (`default_wait_timeout_ms = 30000`, no polling worker). Follow [.codex/rules/swarm.md](.codex/rules/swarm.md) and `$swarm` for parallel execution, and use `$learn` for bidirectional positive + negative learning into `.codex/rules/learned-invariants.md`.
- **Coordinator**: Preserve user-selected `gpt-6.2-astra` (`xhigh`/`max`) or `gpt-6.2-sol` (`xhigh`/`max`) in UI/config; never auto-escalate.

| Rung / Tier | GPT / Codex Routing | Agents ([.codex/agents/](.codex/agents/)) |
| :--- | :--- | :--- |
| **Rung 1** (`brain` architects/planners) | `gpt-6.2-sol` (`high`; `xhigh` for complex multi-module architecture), `read-only` (`model_tier: reasoning`) | `a11y-architect`, `architect`, `code-architect`, `planner`, `spec-miner` |
| **Rung 2** (`brain` reviewers/security + complex `builder`) | `gpt-6.2-sol` (`high`): `read-only` reviewers (`model_tier: reasoning`), `workspace-write` builders (`model_tier: codex`) | Read-only: `code-reviewer`, `{typescript,react,vue,go,rust,php,fastapi,database}-reviewer`, `silent-failure-hunter`, `security-auditor`, `agent-evaluator`; Writable: `tdd-guide`, `performance-optimizer`, `penetration-tester` |
| **Rung 3** (routine `builder` & build resolvers) | `gpt-6.2-sol` (`medium`), `workspace-write` (`model_tier: codex`) | `code-simplifier`, `refactor-cleaner`, `e2e-runner`, `build-error-resolver`, `{react,go,rust,django,cpp,pytorch}-build-resolver` |
| **Rung 4** (`reflex` explorer/recon) | `gpt-6.2-sol` (`medium`), `read-only` (`model_tier: mini`) | `explorer` (fast read-only recon; never plans or edits) |

- **Mandatory Lifecycle Triggers**:
  1. Multi-file discovery (`>= 3` files) -> `explorer`
  2. Non-trivial feature or refactor design -> `planner` + `code-architect` / `architect` (plus `a11y-architect` for UI)
  3. Implementation, cleanup, or build failures -> `tdd-guide`, `code-simplifier`, `refactor-cleaner`, `performance-optimizer`, `e2e-runner`, or `*-build-resolver`
  4. Post-edit verification -> matching stack `*-reviewer` + `silent-failure-hunter` (plus `security-auditor` / `penetration-tester` on auth, API, or input changes, and `agent-evaluator` before final delivery)
