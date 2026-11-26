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
- **Compounding Invariants & Progress Ledger**: Read [.claude/rules/learned-invariants.md](.claude/rules/learned-invariants.md) and `.harness/PROGRESS.md` (when present) before editing code; capture both `regression` anti-patterns and verified positive `exemplar` playbooks via bidirectional `/learn` and record checkpoints via `node .claude/skills/continuous-agent-loop/scripts/harness.mjs checkpoint`.
- **2-Strike Escalation & 3-Strike Circuit Breaker**: (`harness.mjs` tracks `consecutive_failures` programmatically with `[STRIKE 2]` / `[STRIKE 3]` signals)
  - **Strike 2 (Architect Escalation)**: After 2 consecutive failed verification receipts or Skeptic rejections on the same issue, escalate from `builder` to `brain` ([.claude/agents/code-architect.md](.claude/agents/code-architect.md) or higher-reasoning model) for root-cause re-architecture.
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
| Learned Invariants & Guardrails | [.claude/rules/learned-invariants.md](.claude/rules/learned-invariants.md) + [learn](.claude/skills/learn/SKILL.md) (bidirectional positive + negative learning across Harness & Designer modes) |
| Parallel Multi-Agent / Swarm | [.claude/rules/swarm.md](.claude/rules/swarm.md) |

---

## 3. Browser Verification Policy

Follow [UI_Always.md](.claude/rules/UI_Always.md#7-browser-verification-policy) for visual, responsive, and interactive checks:

- **Combined Engines**: Pair [playwright-skill](.claude/skills/playwright-skill/SKILL.md) (`--audit`, `-e`, or Windows-safe `--stdin`/`-b`) for layout, overflow, `--a11y`, network, console, and screenshots with [agent-browser](.claude/skills/agent-browser/SKILL.md) (`open`, `snapshot -i`, `click`/`fill @eN`, `errors`, `console`, `close`) for semantic flows. Create zero scratch `.js` files; the main agent runs ad-hoc checks (`e2e-runner` is strictly for persistent CI suites).
- **Canonical Commands & CDP Handoff**: Resolve URLs via `node .claude/skills/playwright-skill/run.js --detect-url` (never guess ports), audit via `--audit --screenshots scratch --touch-targets --a11y` (375/768/1280px), and pass authenticated `agent-browser` sessions into `--audit --session <sid>`.
- **Artifacts**: Store screenshots and temporary diagnostics in git-ignored `scratch/`.

---

## 4. Subagents & 3-Tier Cognitive Routing

Delegate specialized lifecycle tasks to the agents defined under [.claude/agents/](.claude/agents/) using `@<agent>`, or coordinate parallel non-CLI subagents with `/swarm` per [.claude/rules/swarm.md](.claude/rules/swarm.md):

- **Invocation**: Invoke specialists via `@<agent>` (or slash commands `/swarm`, `/learn`, `/plan`, `/tdd`, `/audit`, `/review`, `/eval`, `/contract`, `/verify`, `/flywheel`).
- **Coordinator (UI Lead)**: Run `/swarm` orchestration on `opus` (`xhigh` or `max` when chosen in the UI; preserve the user's choice and never auto-escalate `xhigh` to `max`). Use parallel `Agent` subagents with `isolation: "worktree"` for parallel writers.
- **4-Rung Model Routing (`model:`, `effort:` frontmatter)**:

| Rung | Claude Code Model & Effort | Agents ([.claude/agents/](.claude/agents/)) |
| :--- | :--- | :--- |
| **Rung 1** *(Architects & Planners)* | `model: opus` (`effort: high`) | `planner`, `architect`, `code-architect`, `a11y-architect`, `spec-miner` |
| **Rung 2** *(Reviewers, Security & Complex Builders)* | `model: sonnet` (`effort: high`); `model: opus` (`effort: high`) on `security-auditor`, `skeptic`, and Strike-2 escalations | `agent-evaluator`, `code-reviewer`, `{typescript,react,vue,go,rust,php,fastapi,database}-reviewer`, `silent-failure-hunter`, `tdd-guide`, `performance-optimizer`, `penetration-tester`, `security-auditor`, `skeptic` |
| **Rung 3** *(Routine Builders & Build Resolvers)* | `model: opus` (`effort: medium`) | `code-simplifier`, `refactor-cleaner`, `e2e-runner`, `build-error-resolver`, `{react,go,rust,django,cpp,pytorch}-build-resolver` |
| **Rung 4** *(Explorer / Recon)* | `model: haiku` (`effort: high`) | `explorer` (fast read-only recon; never plans or edits) |

- **Closure Guard**: Native `SubagentStop` hook (`node .claude/scripts/swarm-subagent-guard.cjs`) verifies every subagent reports modified files or verified findings before closing (no polling monitor worker).
- **Mandatory Lifecycle Triggers**:
  1. Multi-file discovery (`>= 3` files) -> `@explorer`
  2. Non-trivial feature or refactor design -> `@planner` + `@code-architect` / `@architect` (plus `@a11y-architect` for UI)
  3. Implementation, cleanup, or build failures -> `@tdd-guide`, `@code-simplifier`, `@refactor-cleaner`, `@performance-optimizer`, `@e2e-runner`, or `@*-build-resolver`
  4. Post-edit verification -> matching stack `@*-reviewer` + `@silent-failure-hunter` (plus `@security-auditor` / `@penetration-tester` on auth, API, or input changes, and `@skeptic` / `@agent-evaluator` before final delivery)

---

## 5. 6-Stage Self-Improving Harness Lifecycle

For non-trivial features, refactors, or multi-file work, run the 6-stage harness ([continuous-agent-loop](.claude/skills/continuous-agent-loop/SKILL.md)) via `node .claude/skills/continuous-agent-loop/scripts/harness.mjs`:

1. **Contract & Worktree**: Scout with `explorer` and initialize scope via `harness.mjs contract init --task <id> --allow "<globs>" --cmd "<commands>"` (use `worktree spawn --task <id>` for multi-file/parallel work).
2. **TDD & Scoped Edit**: Delegate failing tests and minimal implementation to `tdd-guide` within `allowed_paths` (`harness.mjs sensor check-file`); repair build breaks with `*-build-resolver`.
3. **Receipt Gate**: Run `harness.mjs verify run --task <id>` to enforce scope, execute acceptance commands, hash `git diff HEAD`, and write `.harness/receipts/<id>.json`.
4. **Cold-Context Skeptic**: Build Contract + Diff + Receipt via `harness.mjs skeptic-packet --task <id>`, run `skeptic` (+ `silent-failure-hunter` / `security-auditor`) cold, and stamp via `harness.mjs stamp-skeptic`.
5. **Browser / E2E**: Run Section 3 browser audits for UI/flow changes and score quality with `agent-evaluator` ([agent-self-evaluation](.claude/skills/agent-self-evaluation/SKILL.md)).
6. **Memory Flywheel & Checkpoint**: Stage `regression` anti-patterns and verified `exemplar` playbooks via `/learn` or `harness.mjs flywheel record` (gated by `flywheel test` replay or approval before `flywheel promote` into [.claude/rules/learned-invariants.md](.claude/rules/learned-invariants.md)); inject `<= 600 B` domain briefs at `SessionStart` (`memory brief`), graduate `>= 3`-hit domains via `flywheel digest --graduate` (`project-<domain>/SKILL.md`), run `flywheel prune` + `telemetry record`, and checkpoint via `harness.mjs checkpoint`.
