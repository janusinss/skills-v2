# CLAUDE.md

Instructions, operating rules, and workspace routing for Anthropic Claude Code.

---

## 1. Operating Rules (ADHD Mode & Action-First Execution)

- **Lead with Action**: Put the command, file path, diff, or tool call on Line 1. Zero throat-clearing, intros, or restating the prompt.
- **Numbered Bounded Steps**: Break multi-step work into atomic steps (one verb/action per step; ban "and then", "afterward", "while").
- **Tool Autonomy**: Execute tool calls directly instead of asking permission or telling the user to run commands.
- **Concrete Time & Scale**: Ban vague qualifiers ("in a bit", "takes a while"); use concrete units ("~10 minutes", "2 files").
- **Visible Wins**: Immediately show what works and how to verify it (test commands, curl endpoints).
- **Neutral Error Reporting**: Report strictly **Location**, **Cause**, and **Fix**. Zero emotional padding.
- **Cap Lists to 5 Items**: Show at most 5 items per group in user-facing output.
- **Compounding Invariants**: Read [.claude/rules/learned-invariants.md](.claude/rules/learned-invariants.md) (when present) before editing code to enforce project-specific guardrails and prevent known regressions.
- **2-Strike Escalation & 3-Strike Circuit Breaker**:
  - **Strike 2 (Architect Escalation)**: After 2 consecutive failed verification checks or audits on the same issue, escalate from `builder` to `brain` ([.claude/agents/code-architect.md](.claude/agents/code-architect.md) or higher-reasoning model) for root-cause re-architecture.
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
| Brand New Web App / Greenfield | [.claude/rules/starting-brandnew.md](.claude/rules/starting-brandnew.md) |
| Existing App / Redesign / Refactor | [.claude/rules/starting-existing.md](.claude/rules/starting-existing.md) |
| Active UI Implementation | [.claude/rules/frontend.md](.claude/rules/frontend.md) ([design-taste-frontend](.claude/skills/design-taste-frontend/SKILL.md) visual/typography/palette + [impeccable](.claude/skills/impeccable/SKILL.md) layout/craft-floor/audit) |
| Layout & CSS Hygiene | [.claude/rules/UI_Always.md](.claude/rules/UI_Always.md) |
| Native HTML/CSS/DOM & Baseline APIs | [modern-web-guidance](.claude/skills/modern-web-guidance/SKILL.md) (query `search`->`retrieve` first for dialogs, popovers, anchor positioning, View Transitions, Scroll-Driven Animations, forms, CWV, Passkeys; skip backend/infra; degrade gracefully offline) |
| Motion, Physics & 3D | [.claude/rules/MOTION.md](.claude/rules/MOTION.md) + [interaction-catalog.md](.claude/resources/creative-libraries/interaction-catalog.md) + [3d-web-experience](.claude/skills/3d-web-experience/SKILL.md) |
| Anti-AI-Slop & Copy | [anti-ai-slop](.claude/skills/anti-ai-slop/SKILL.md) (always-on rules & gates) + [unslop](.claude/skills/unslop/SKILL.md) (9-pass screen redline, live URLs, RTL) + [avoid-ai-writing](.claude/skills/avoid-ai-writing/SKILL.md) |
| Backend Architecture & Data | [.claude/rules/backend.md](.claude/rules/backend.md) |
| Application Security & Defense | [.claude/rules/security.md](.claude/rules/security.md) |
| Penetration Testing & Critical QA | [.claude/rules/penetrating-and-testing.md](.claude/rules/penetrating-and-testing.md) |
| Learned Invariants & Guardrails | [.claude/rules/learned-invariants.md](.claude/rules/learned-invariants.md) |

---

## 3. Browser Verification Policy

Follow [UI_Always.md](.claude/rules/UI_Always.md#7-browser-verification-policy) for visual, responsive, and interactive checks:

- **Combined Engines**: Pair [playwright-skill](.claude/skills/playwright-skill/SKILL.md) (`--audit`, `-e`, or Windows-safe `--stdin`/`-b`) for layout, overflow, `--a11y`, network, console, and screenshots with [agent-browser](.claude/skills/agent-browser/SKILL.md) (`open`, `snapshot -i`, `click`/`fill @eN`, `errors`, `console`, `close`) for semantic flows. Create zero scratch `.js` files; the main agent runs ad-hoc checks (`e2e-runner` is strictly for persistent CI suites).
- **Canonical Commands & CDP Handoff**: Resolve URLs via `node .claude/skills/playwright-skill/run.js --detect-url` (never guess ports), audit via `--audit --screenshots scratch --touch-targets --a11y` (375/768/1280px), and pass authenticated `agent-browser` sessions into `--audit --session <sid>`.
- **Artifacts**: Store screenshots and temporary diagnostics in git-ignored `scratch/`.

---

## 4. Subagents & 3-Tier Cognitive Routing

Delegate specialized lifecycle tasks to the agents defined under [.claude/agents/](.claude/agents/) using `@<agent>`:

- **Invocation**: Invoke specialists via `@<agent>` (or slash commands `/plan`, `/tdd`, `/audit`, `/review`, `/eval`).
- **Cognitive Routing Tiers (`tier:`, `model:`, `effort:` frontmatter)**:

| Tier | Claude Code Model | Agents ([.claude/agents/](.claude/agents/)) |
| :--- | :--- | :--- |
| `reflex` | `model: haiku` (`effort: medium`) | `explorer` (fast read-only recon; never plans or edits) |
| `builder` | `model: sonnet` (`effort: high`) | `tdd-guide`, `e2e-runner`, `code-simplifier`, `refactor-cleaner`, `performance-optimizer`, `penetration-tester`, `build-error-resolver`, `{react,go,rust,django,cpp,pytorch}-build-resolver` |
| `brain` *(read-only auditors/reviewers)* | `model: opus` (`effort: high`) | `planner`, `architect`, `code-architect`, `a11y-architect`, `spec-miner`, `code-reviewer`, `{typescript,react,vue,go,rust,php,fastapi,database}-reviewer`, `silent-failure-hunter`, `security-auditor`, `agent-evaluator` |

- **Mandatory Lifecycle Triggers**:
  1. Multi-file discovery (`>= 3` files) -> `@explorer`
  2. Non-trivial feature or refactor design -> `@planner` + `@code-architect` / `@architect` (plus `@a11y-architect` for UI)
  3. Implementation, cleanup, or build failures -> `@tdd-guide`, `@code-simplifier`, `@refactor-cleaner`, `@performance-optimizer`, `@e2e-runner`, or `@*-build-resolver`
  4. Post-edit verification -> matching stack `@*-reviewer` + `@silent-failure-hunter` (plus `@security-auditor` / `@penetration-tester` on auth, API, or input changes, and `@agent-evaluator` before final delivery)
