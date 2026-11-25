# AGENTS.md

<!-- edition-subtitle-start -->
Instructions, operating rules, and workspace routing for Antigravity (AGY / Gemini).
<!-- edition-subtitle-end -->

---

## 1. Operating Rules (ADHD Mode & Action-First Execution)

- **Lead with Action**: Put the command, file path, diff, or tool call on Line 1. Zero throat-clearing, intros, or restating the prompt.
- **Numbered Bounded Steps**: Break multi-step work into atomic steps (one verb/action per step; ban "and then", "afterward", "while").
- **Tool Autonomy**: Execute tool calls directly instead of asking permission or telling the user to run commands.
- **Concrete Time & Scale**: Ban vague qualifiers ("in a bit", "takes a while"); use concrete units ("~10 minutes", "2 files").
- **Visible Wins**: Immediately show what works and how to verify it (test commands, curl endpoints).
- **Neutral Error Reporting**: Report strictly **Location**, **Cause**, and **Fix**. Zero emotional padding.
- **Cap Lists to 5 Items**: Show at most 5 items per group in user-facing output.
- **Compounding Invariants & Progress Ledger**: Read [.agents/rules/learned-invariants.md](.agents/rules/learned-invariants.md) and `.harness/PROGRESS.md` (when present) before editing code. Record failed hypotheses and verified checkpoints via `node .agents/skills/continuous-agent-loop/scripts/harness.mjs checkpoint`.
- **2-Strike Escalation & 3-Strike Circuit Breaker**:
  - **Strike 2 (Architect Escalation)**: After 2 consecutive failed verification receipts or Skeptic rejections on the same issue, escalate from `builder` to `brain` ([.agents/agents/code-architect.md](.agents/agents/code-architect.md) or higher-reasoning model) for root-cause re-architecture.
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
| Brand New Web App / Greenfield | [.agents/rules/starting-brandnew.md](.agents/rules/starting-brandnew.md) |
| Existing App / Redesign / Refactor | [.agents/rules/starting-existing.md](.agents/rules/starting-existing.md) |
| Active UI Implementation | [.agents/rules/frontend.md](.agents/rules/frontend.md) ([design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md) visual/typography/palette + [impeccable](.agents/skills/impeccable/SKILL.md) layout/craft-floor/audit) |
| Layout & CSS Hygiene | [.agents/rules/UI_Always.md](.agents/rules/UI_Always.md) |
| Native HTML/CSS/DOM & Baseline APIs | [modern-web-guidance](.agents/skills/modern-web-guidance/SKILL.md) (query `search`->`retrieve` first for dialogs, popovers, anchor positioning, View Transitions, Scroll-Driven Animations, forms, CWV, Passkeys; skip backend/infra; degrade gracefully offline) |
| Motion, Physics & 3D | [.agents/rules/MOTION.md](.agents/rules/MOTION.md) + [interaction-catalog.md](.agents/resources/creative-libraries/interaction-catalog.md) + [3d-web-experience](.agents/skills/3d-web-experience/SKILL.md) |
| Anti-AI-Slop & Copy | [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md) (always-on rules & gates) + [unslop](.agents/skills/unslop/SKILL.md) (9-pass screen redline, live URLs, RTL) + [avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md) |
| Backend Architecture & Data | [.agents/rules/backend.md](.agents/rules/backend.md) |
| Application Security & Defense | [.agents/rules/security.md](.agents/rules/security.md) |
| Penetration Testing & Critical QA | [.agents/rules/penetrating-and-testing.md](.agents/rules/penetrating-and-testing.md) |
| Learned Invariants & Guardrails | [.agents/rules/learned-invariants.md](.agents/rules/learned-invariants.md) |
| Parallel Multi-Agent / Swarm | [.agents/rules/swarm.md](.agents/rules/swarm.md) |

---

## 3. Browser Verification Policy

Follow [UI_Always.md](.agents/rules/UI_Always.md#7-browser-verification-policy) for visual, responsive, and interactive checks:

- **Combined Engines**: Pair [playwright-skill](.agents/skills/playwright-skill/SKILL.md) (`--audit`, `-e`, or Windows-safe `--stdin`/`-b`) for layout, overflow, `--a11y`, network, console, and screenshots with [agent-browser](.agents/skills/agent-browser/SKILL.md) (`open`, `snapshot -i`, `click`/`fill @eN`, `errors`, `console`, `close`) for semantic flows. Create zero scratch `.js` files; the main agent runs ad-hoc checks (`e2e-runner` is strictly for persistent CI suites).
- **Canonical Commands & CDP Handoff**: Resolve URLs via `node .agents/skills/playwright-skill/run.js --detect-url` (never guess ports), audit via `--audit --screenshots scratch --touch-targets --a11y` (375/768/1280px), and pass authenticated `agent-browser` sessions into `--audit --session <sid>`.
- **Artifacts**: Store screenshots and temporary diagnostics in git-ignored `scratch/`.

---

## 4. Subagents & 3-Tier Cognitive Routing

<!-- edition-routing-start -->
- **Invocation**: `invoke_subagent{TypeName: "<agent>", Model: "<tier>"}` (in `/swarm`, drive implementation workers via direct coordinator briefs and bind `.agents/agents/<agent>.md` selectively for specialist review/audit workers per [.agents/rules/swarm.md](.agents/rules/swarm.md)).

| Tier | AGY / Gemini Routing | Agents ([.agents/agents/](.agents/agents/)) |
| --- | --- | --- |
| `reflex` | `gemini-4-hydrogen-high` (`invoke_subagent`: `inherit`, never `flash`/`flash_lite`) | `explorer` (fast read-only recon; never plans or edits) |
| `builder` | Routine: `gemini-4-neon-medium` (`gemini-4-hydrogen-high` trivial lint); Complex: `gemini-4-neon-high` / `gemini-4-carbon-high` (in `/swarm` with user-chosen `gemini-4-hydrogen-xhigh`, ALL workers strictly capped at `gemini-4-hydrogen-high` only; `invoke_subagent`: `inherit`) | `tdd-guide`, `e2e-runner`, `code-simplifier`, `refactor-cleaner`, `performance-optimizer`, `penetration-tester`, `build-error-resolver`, `{react,go,rust,django,cpp,pytorch}-build-resolver` |
| `brain` *(read-only auditors/reviewers)* | `/swarm` coordinator & architects: `gemini-4-carbon-high` or `gemini-4-neon-xhigh` (preserve UI choice; redirect others to `carbon-high` -> `neon-xhigh`; if user chooses `gemini-4-hydrogen-xhigh`, keep it as coordinator and cap ALL workers strictly to `gemini-4-hydrogen-high` only; single-session: `gemini-pro-orchestrator` -> `gemini-pro-orchestrator-neon`; zero Argon); verifiers/security/skeptic: `gemini-4-neon-high` / `gemini-4-carbon-high` (`gemini-4-hydrogen-high` only in Hydrogen mode; `invoke_subagent`: `pro` or `inherit`) | `planner`, `architect`, `code-architect`, `a11y-architect`, `spec-miner`, `code-reviewer`, `{typescript,react,vue,go,rust,php,fastapi,database}-reviewer`, `silent-failure-hunter`, `security-auditor`, `skeptic`, `agent-evaluator` |

- **Mandatory Lifecycle Triggers**:
  1. Multi-file discovery (`>= 3` files) -> `explorer`
  2. Non-trivial feature or refactor -> `planner` + `code-architect` / `architect` (+ `a11y-architect` for UI)
  3. Build, cleanup, or TDD -> `tdd-guide`, `code-simplifier`, `refactor-cleaner`, `performance-optimizer`, `e2e-runner`, `*-build-resolver`
  4. Post-edit review -> stack `*-reviewer` / `code-reviewer` + `silent-failure-hunter` (+ `security-auditor` / `penetration-tester` on auth/API/input; `skeptic` / `agent-evaluator` before final delivery)
<!-- edition-routing-end -->

---

## 5. 6-Stage Self-Improving Harness Lifecycle

For non-trivial features, refactors, or multi-file work, run the 6-stage harness ([continuous-agent-loop](.agents/skills/continuous-agent-loop/SKILL.md)) via `node .agents/skills/continuous-agent-loop/scripts/harness.mjs`:

1. **Contract & Worktree**: Scout with `explorer` and initialize scope via `harness.mjs contract init --task <id> --allow "<globs>" --cmd "<commands>"` (use `worktree spawn --task <id>` for multi-file/parallel work).
2. **TDD & Scoped Edit**: Delegate failing tests and minimal implementation to `tdd-guide` within `allowed_paths` (`harness.mjs sensor check-file`); repair build breaks with `*-build-resolver`.
3. **Receipt Gate**: Run `harness.mjs verify run --task <id>` to enforce scope, execute acceptance commands, hash `git diff HEAD`, and write `.harness/receipts/<id>.json`.
4. **Cold-Context Skeptic**: Build Contract + Diff + Receipt via `harness.mjs skeptic-packet --task <id>`, run `skeptic` (+ `silent-failure-hunter` / `security-auditor`) cold, and stamp via `harness.mjs stamp-skeptic`.
5. **Browser / E2E**: Run Section 3 browser audits for UI/flow changes and score quality with `agent-evaluator` ([agent-self-evaluation](.agents/skills/agent-self-evaluation/SKILL.md)).
6. **Memory Flywheel & Checkpoint**: Log failures, rejections, or corrections via `harness.mjs flywheel record` (promoting verified guardrails to [.agents/rules/learned-invariants.md](.agents/rules/learned-invariants.md)) and checkpoint state via `harness.mjs checkpoint`.

<!-- source-repository-only -->

---

## Source Repository Instructions

This section applies only to this collection's source checkout and is excluded from installed `AGENTS.md` and `CLAUDE.md` files (GPT / CODEX, AGY / GEMINI, and ANTHROPIC / CLAUDE CODE).

### Skills & Installation

For Antigravity, use skills and rules under `.agents/`. For Codex, use converted skills, rules, and resources under `.codex/`. For Claude Code, use converted skills, agents, commands, rules, and resources under `.claude/`. Read a matching skill's `SKILL.md` before using it and load only the supporting files needed for the task. Prefer converted manifests when both edition catalogs contain the same name. A skill does not authorize external actions or configure its external providers.

For requests such as "INSTALL THIS SKILLS REPO HERE", read the source checkout's `INSTALL.md` and ask two sequential questions in order (skipping either only if the user already specified it):

1. **Question 1 — Select edition**:
   > Which edition would you like to install: **AGY** (`AGY / GEMINI`), **CODEX** (`GPT / CODEX`), or **CLAUDE** (`ANTHROPIC / CLAUDE CODE`)?
   Wait for the answer.
2. **Question 2 — Select hook mode**:
   > Which hook mode would you like to install: **HARNESS MODE** (full Harness + Impeccable + `design-taste-frontend` + `avoid-ai-writing` hooks, `.git/hooks/pre-commit` receipt gate, and full Harness lifecycle in `AGENTS.md`/`CLAUDE.md`) or **DESIGNER MODE** (activates Impeccable, `design-taste-frontend`, and `avoid-ai-writing` hooks — plus `swarm-stop-guard.cjs` on AGY and `SubagentStop` `swarm-subagent-guard.cjs` on Claude — disables Harness hooks/git pre-commit, and installs Designer `AGENTS.md`/`CLAUDE.md`)?
   Wait for the answer.

Record the absolute target before changing directories. The selected edition and mode determine the payload and hooks, including when an AGY assistant installs the Codex or Claude Code edition. Or invoke the unified interactive installer directly from a TTY with `node install.mjs`.

Once the user selects their edition and mode, the target workspace `AGENTS.md` or `CLAUDE.md` must remove this unnecessary source-only section (`<!-- source-repository-only -->` onward) and, in `DESIGNER MODE`, omit Harness lifecycle instructions (`AGENTS.designer.md` / `CLAUDE.designer.md`):

- **For GPT / CODEX**: Automatically read and execute the source checkout's `.codex/rules/install.md` within the same request. Run `node install.mjs --edition codex --mode <harness|designer> --target <absolute-project-path> --profile all` or `node tools/codex/install.mjs --target <absolute-project-path> --profile all --mode <harness|designer>` (`normal` accepted as an alias for `designer`; in non-TTY/CI without `--mode`, defaults to `harness`; in TTY without `--mode`, prompts for mode; pass `--no-hooks` to disable all hooks). It installs the prebuilt bundle (including the `$swarm` skill across all profiles, `.codex/rules/swarm.md`, 32 native `.codex/agents/*.toml` role profiles with GPT-6.2 Astra/Sol routing, and `.codex/config.example.toml`), creates or non-destructively merges `.codex/config.toml` (`[features.multi_agent_v2]`), writes mode-specific root `AGENTS.md` (`AGENTS.md` in `harness` mode; `AGENTS.designer.md` without Harness lifecycle in `designer` mode), `.codex/hooks.example.json`, `.codex/hooks.impeccable.example.json`, and active `.codex/hooks.json` (`hooks.example.json` in `harness` mode; `hooks.impeccable.example.json` in `designer` mode), records `mode` in `.codex/codex-install.json`, installs/chains `.git/hooks/pre-commit` only in `harness` mode, creates or merges `.gitignore`, sets up local Playwright and Chromium, verifies the runner, and removes only the target's one-time installation rule after success. Use `--resume` for failed or interrupted setup or to update `.gitignore`.

- **For AGY / GEMINI**: Run `node install.mjs --edition agy --mode <harness|designer> --target <absolute-project-path>` from the source checkout (copies `.agents/` excluding `evals/` and `*.test.*`, cleans `AGENTS.md` before `<!-- source-repository-only -->` — formatted without Section 5 Harness lifecycle in `designer` mode — and copies `skills-lock.json`; for manual copy, follow `.agents/rules/install.md`). In `harness` mode, activate `.agents/hooks.json` from `.agents/hooks.example.json`; `install.mjs` chains any existing `.git/hooks/pre-commit` non-destructively before `harness.mjs pre-commit-check` when `.git` is present (running `harness.mjs install-git-hook` alone overwrites an existing hook). In `designer` mode (`normal` alias), activate `.agents/hooks.json` from `.agents/hooks.impeccable.example.json` (which retains `swarm-stop-guard.cjs`), omit Harness lifecycle instructions from `AGENTS.md`, and skip `.git/hooks/pre-commit`. Merge/create `.gitignore` (`/.agents/*`, `!/.agents/rules/`, `!/.agents/agents/`, `/AGENTS.md`, `/scratch/`, `/.impeccable/`, `/.harness/`, `/.agent_worktrees/`), set up Playwright, and remove only the target's `.agents/rules/install.md`. Preserve existing target instructions and global policy.

- **For ANTHROPIC / CLAUDE CODE**: Run `node install.mjs --edition claude --mode <harness|designer> --target <absolute-project-path> --profile all` or `node tools/claude/install.mjs --target <absolute-project-path> --profile all --mode <harness|designer>` (`normal` alias supported; non-TTY defaults to `harness`; TTY prompts if `--mode` is omitted; pass `--no-hooks` to disable all hooks). It installs `.claude/` (`skills/`, `agents/`, `commands/`, `rules/` including `.claude/rules/swarm.md`, `resources/`, `scripts/`), mode-specific root `CLAUDE.md` (`CLAUDE.md` in `harness` mode; `CLAUDE.designer.md` without Harness lifecycle in `designer` mode), `.claude/hooks.example.json`, `.claude/hooks.impeccable.example.json`, and active `.claude/hooks.json`, merges the selected hooks (including the `SubagentStop` hook `swarm-subagent-guard.cjs` in both modes) into `.claude/settings.json` (`hooks.example.json` in `harness` mode; **only** `hooks.impeccable.example.json` in `designer` mode, preserving existing user settings), installs/chains `.git/hooks/pre-commit` only in `harness` mode, records `mode` in `.claude/claude-install.json`, creates or merges `.gitignore`, and sets up Playwright and Chromium if included. In Claude Code, skills are discoverable via `/skill-name`, agents via `@agent-name`, and commands via `/plan`, `/tdd`, `/audit`, `/review`, `/eval`, `/contract`, `/verify`, `/flywheel`, `/swarm`.

### Maintaining This Source Collection

Root `AGENTS.md` is the policy source. The builder generates `.codex/AGENTS.md` and root `CLAUDE.md` from the content before `<!-- source-repository-only -->`, and target installations install only the policy before that marker as the target's root policy. Edit root `AGENTS.md` directly; do not introduce a separate instruction template.

For requested conversion or maintenance changes, edit the relevant conversion logic or rule templates in `tools/codex/` and `tools/claude/`. Run `node tools/codex/build.mjs` and `node tools/codex/validate.mjs --source` for the Codex edition. Run `node tools/claude/build.mjs` and `node tools/claude/validate.mjs --source` for the Claude Code edition. Maintain `.codex/README.md`, `.codex/CONVERSION_REVIEW.md`, `.codex/profiles.json`, and `tools/claude/profiles.json` directly. Preserve the original AGY files except for changes explicitly requested for that edition or shared installation routing.
