# AGENTS.md

Instructions, operating rules, and skill mappings for AI agents (Codex, Antigravity, and compatible harnesses).

---

## 1. Operating Rules (ADHD Mode & Action-First Execution)

- **Lead with Action**: Place the command, file path, diff, or tool call on Line 1. Zero conversational throat-clearing, intro explanations, or restating the prompt.
- **Numbered Bounded Steps**: Break multi-step work into atomic steps. Maximum one verb/action per step. Zero compound steps (ban "and then", "afterward", "while").
- **Agent Tool Autonomy**: Inside an agent harness, execute tool calls directly rather than asking permission or instructing the user to run commands manually.
- **Concrete Time & Scale**: Never use vague qualifiers ("in a bit", "takes a while"). Ballpark in concrete units ("~10 minutes", "2 files").
- **Visible Wins**: Immediately demonstrate what works and how to verify it (e.g., test commands, curl endpoints).
- **Neutral Error Reporting**: Report strictly: **Location**, **Cause**, and **Fix**. No emotional padding.
- **Cap Lists to 5 Items**: Display at most 5 items per group in user-facing output to prevent cognitive overload.
- **Compounding Invariants & Progress Ledger**: Read [.agents/rules/learned-invariants.md](.agents/rules/learned-invariants.md) and `.harness/PROGRESS.md` (when present) before editing code. Record failed hypotheses and verified checkpoints into `.harness/PROGRESS.md` via `node .agents/skills/continuous-agent-loop/scripts/harness.mjs checkpoint` so context compaction never loses negative knowledge.
- **2-Strike Escalation & 3-Strike Circuit Breaker**:
  - **Strike 2 (Model / Architect Escalation)**: After 2 consecutive failed verification receipts or Skeptic rejections on the same issue, escalate from `builder` tier to `brain` tier ([.agents/agents/code-architect.md](.agents/agents/code-architect.md) or higher-reasoning model) for root-cause re-architecture.
  - **Strike 3 (Circuit Breaker)**: After 3 failed attempts to fix the same issue, STOP modifying code. Ask before reverting anything; never discard uncommitted work. Output strictly:
    1. **Invalid Assumption**: 1 sentence on what failed.
    2. **Diagnostic Check**: 1 concrete question or a 2-option choice (A/B) to unblock.
- **Blacklist (Zero Filler)**:
  - **Forbidden Openers**: "Sure!", "Great question", "Let me...", "I'll...", "Looking at your...", "To answer your question...", "Certainly".
  - **Forbidden Closers**: "Hope this helps!", "Let me know if you need anything else", "Happy coding!", "Feel free to ask".
  - **Forbidden Recaps**: Do not narrate what code was just written if the diff or edit already shows it.
  - **Prune on Send**: Delete hedging adverbs ("perhaps", "might", "could possibly") and idioms.

---

## 2. Design, Architecture & Security: Mandatory Workspace Rule Selection

Read and apply the active workspace's local rules before choosing generic skills:

- **Frontend, UI/UX & Motion**:
  - **Brand New Web App / Greenfield**: [.agents/rules/starting-brandnew.md](.agents/rules/starting-brandnew.md)
  - **Existing App / Redesign / Refactor**: [.agents/rules/starting-existing.md](.agents/rules/starting-existing.md)
  - **Active UI Implementation**: [.agents/rules/frontend.md](.agents/rules/frontend.md)
  - **Layout & CSS Hygiene**: [.agents/rules/UI_Always.md](.agents/rules/UI_Always.md)
  - **Motion, Physics & Micro-Interactions**: [.agents/rules/MOTION.md](.agents/rules/MOTION.md) (and [.agents/skills/3d-web-experience/SKILL.md](.agents/skills/3d-web-experience/SKILL.md) for 3D/WebGL)
- **Backend, Security & QA**:
  - **Backend Architecture, Data Layer & APIs**: [.agents/rules/backend.md](.agents/rules/backend.md)
  - **Application Security & Exploit Defense**: [.agents/rules/security.md](.agents/rules/security.md)
  - **Penetration Testing, Strix & Functional Flow QA**: [.agents/rules/penetrating-and-testing.md](.agents/rules/penetrating-and-testing.md)
  - **Compounding Guardrails & Learned Invariants**: [.agents/rules/learned-invariants.md](.agents/rules/learned-invariants.md)

---

## 3. Playwright & Browser Verification Policy

Follow [.agents/rules/UI_Always.md](.agents/rules/UI_Always.md#8-browser-verification-policy) for visual and responsive checks:

- **Engine**: Use the bundled [playwright-skill](.agents/skills/playwright-skill/SKILL.md) through inline Node execution from the project root: `node .agents/skills/playwright-skill/run.js -e "..."`. Create no scratch `.js` files for these audits and do not delegate browser verification to subagents.
- **Target URL**: Resolve the running application through `helpers.resolveTargetUrl()`. Respect a user-provided URL or project configuration; do not guess a port.
- **Layout Audits**: Check 375px, 768px, and 1280px for accidental horizontal overflow (`document.documentElement.scrollWidth > window.innerWidth`), page exceptions, and console errors.
- **Artifacts**: Save screenshots and temporary browser diagnostics in the project's git-ignored `scratch/` directory.
- **Execution Script**: Start with the canonical inline layout audit in `UI_Always.md`.

---

## 4. Subagents & Specialized Roles (3-Tier Cognitive Routing)

Delegate specialized lifecycle tasks to the agents defined under [.agents/agents/](.agents/agents/):

- **Cognitive Routing Tiers (`tier:` frontmatter & 3-Edition Model Matrix)**:
  - **`reflex`** (Fast/Read-Only Reconnaissance — **AGY / Gemini** `invoke_subagent` `Model`: `flash` or `flash_lite` (`model: flash`) · **GPT / Codex**: `model_tier: mini`, `reasoning_effort: low` · **Claude Code**: `model: haiku`): [.agents/agents/explorer.md](.agents/agents/explorer.md) — locates files, symbols, and call-sites rapidly; never concludes, plans, or edits files.
  - **`builder`** (Scoped Workhorse Implementation & Repair — **AGY / Gemini** `invoke_subagent` `Model`: `inherit` (`model: inherit`) · **GPT / Codex**: `model_tier: codex`, `reasoning_effort: medium` · **Claude Code**: `model: sonnet`): `tdd-guide`, `e2e-runner`, `code-simplifier`, `refactor-cleaner`, `performance-optimizer`, `penetration-tester`, and `*-build-resolver` agents.
  - **`brain`** (High-Reasoning Architecture, Audit & Cold-Context Skepticism — **AGY / Gemini** `invoke_subagent` `Model`: `pro` or `inherit` (`model: pro`) · **GPT / Codex**: `model_tier: reasoning`, `reasoning_effort: high` · **Claude Code**: `model: opus`): `planner`, `architect`, `code-architect`, `a11y-architect`, `spec-miner`, `skeptic`, `security-auditor`, `silent-failure-hunter`, `agent-evaluator`, and `*-reviewer` agents (all reviewers, auditors, and skeptics are strictly read-only).
- **Reconnaissance, Planning & Architecture**:
  - Fast Codebase Reconnaissance (`reflex`): [.agents/agents/explorer.md](.agents/agents/explorer.md)
  - Implementation Planning (`brain`): [.agents/agents/planner.md](.agents/agents/planner.md)
  - Domain & System Architecture (`brain`): [.agents/agents/code-architect.md](.agents/agents/code-architect.md)
  - Web Accessibility (WCAG 2.2) (`brain`): [.agents/agents/a11y-architect.md](.agents/agents/a11y-architect.md)
  - Test-Driven Specification (`builder`): [.agents/agents/tdd-guide.md](.agents/agents/tdd-guide.md)
- **Quality Gates, Cold-Context Skeptic & Failure Hunting**:
  - Cold-Context Adversarial Skeptic (`brain`, read-only): [.agents/agents/skeptic.md](.agents/agents/skeptic.md)
  - Swallowed Exception & Fallback Audits (`brain`, read-only): [.agents/agents/silent-failure-hunter.md](.agents/agents/silent-failure-hunter.md)
  - Code Simplification & Dead Weight Removal (`builder`): [.agents/agents/code-simplifier.md](.agents/agents/code-simplifier.md)
  - Pre-Delivery Verification (`brain`, read-only): [.agents/agents/agent-evaluator.md](.agents/agents/agent-evaluator.md)
- **Security & Penetration Testing**:
  - Pre-Commit Security & Invariant Audits (`brain`, read-only): [.agents/agents/security-auditor.md](.agents/agents/security-auditor.md)
  - Exploit Validation & Penetration QA (`builder`): [.agents/agents/penetration-tester.md](.agents/agents/penetration-tester.md)
- **Code Review Specialists (`brain`, read-only)**:
  - TypeScript / JS: [.agents/agents/typescript-reviewer.md](.agents/agents/typescript-reviewer.md) · React: [.agents/agents/react-reviewer.md](.agents/agents/react-reviewer.md)
  - Backend & Databases: [.agents/agents/database-reviewer.md](.agents/agents/database-reviewer.md) · FastAPI: [.agents/agents/fastapi-reviewer.md](.agents/agents/fastapi-reviewer.md)
  - Systems & Stacks: [.agents/agents/go-reviewer.md](.agents/agents/go-reviewer.md) · [.agents/agents/rust-reviewer.md](.agents/agents/rust-reviewer.md) · [.agents/agents/php-reviewer.md](.agents/agents/php-reviewer.md) · [.agents/agents/vue-reviewer.md](.agents/agents/vue-reviewer.md)
- **Closed-Loop Build & Error Repair (`builder`)**:
  - TypeScript & Generic Build Repair: [.agents/agents/build-error-resolver.md](.agents/agents/build-error-resolver.md)
  - Framework Resolvers: [.agents/agents/react-build-resolver.md](.agents/agents/react-build-resolver.md), [.agents/agents/go-build-resolver.md](.agents/agents/go-build-resolver.md), [.agents/agents/rust-build-resolver.md](.agents/agents/rust-build-resolver.md), [.agents/agents/django-build-resolver.md](.agents/agents/django-build-resolver.md), [.agents/agents/cpp-build-resolver.md](.agents/agents/cpp-build-resolver.md), [.agents/agents/pytorch-build-resolver.md](.agents/agents/pytorch-build-resolver.md)

---

## 5. 6-Stage Self-Improving Harness Lifecycle

For non-trivial features, refactoring, or multi-file changes, execute the deterministic 6-stage harness defined in [.agents/skills/continuous-agent-loop/SKILL.md](.agents/skills/continuous-agent-loop/SKILL.md) via `node .agents/skills/continuous-agent-loop/scripts/harness.mjs`:

1. **Stage 1: Pre-Flight Contract & Adaptive Worktree**: Use [.agents/agents/explorer.md](.agents/agents/explorer.md) (`reflex`) for fast file discovery and [.agents/agents/planner.md](.agents/agents/planner.md) / [.agents/agents/code-architect.md](.agents/agents/code-architect.md) (`brain`) to initialize a scoped contract (`node .agents/skills/continuous-agent-loop/scripts/harness.mjs contract init --task <id> --allow "<globs>" --cmd "<commands>"`). Use `worktree spawn --task <id>` for multi-file or parallel work (adaptive mode allows `<20` lines single-file edits in-tree).
2. **Stage 2: TDD & Scoped Implementation**: Delegate to [.agents/agents/tdd-guide.md](.agents/agents/tdd-guide.md) (`builder`) to write failing tests first, then implement minimal passing code within `allowed_paths` enforced by `harness.mjs sensor check-file`. On compiler/type failure, delegate to [.agents/agents/build-error-resolver.md](.agents/agents/build-error-resolver.md).
3. **Stage 3: Deterministic Receipt Gate**: Execute `node .agents/skills/continuous-agent-loop/scripts/harness.mjs verify run --task <id>` to validate scope compliance, run all `acceptance_commands`, hash `git diff HEAD` (`diff_sha256`), and write `.harness/receipts/<id>.json`.
4. **Stage 4: Cold-Context Adversarial Skeptic**: Generate a sanitized context packet (`node .agents/skills/continuous-agent-loop/scripts/harness.mjs skeptic-packet --task <id>`) containing **only** Contract + Raw Diff + Receipt (zero author rationalization), then invoke [.agents/agents/skeptic.md](.agents/agents/skeptic.md) (plus [.agents/agents/silent-failure-hunter.md](.agents/agents/silent-failure-hunter.md) and [.agents/agents/security-auditor.md](.agents/agents/security-auditor.md) for security surfaces) in a fresh cold context and stamp the verdict (`harness.mjs stamp-skeptic`).
5. **Stage 5: Browser/E2E Verification**: For UI or user-flow changes, run the canonical Playwright layout and functional audit per Section 3 and evaluate output quality with [.agents/agents/agent-evaluator.md](.agents/agents/agent-evaluator.md) and [.agents/skills/agent-self-evaluation/SKILL.md](.agents/skills/agent-self-evaluation/SKILL.md).
6. **Stage 6: Calibrated Memory Flywheel & Progress Compaction**: On any verification failure, Skeptic `REJECT`, or user correction, record the root cause via `node .agents/skills/continuous-agent-loop/scripts/harness.mjs flywheel record` (staging into `.harness/evals/regressions.jsonl` and promoting verified invariants to [.agents/rules/learned-invariants.md](.agents/rules/learned-invariants.md)), and checkpoint state into `.harness/PROGRESS.md` via `harness.mjs checkpoint`.

<!-- source-repository-only -->

---

## Source Repository Instructions

This section applies only to this collection's source checkout and is excluded from installed `AGENTS.md` and `CLAUDE.md` files (GPT / CODEX, AGY / GEMINI, and ANTHROPIC / CLAUDE CODE).

### Skills & Installation

For Antigravity, use skills and rules under `.agents/`. For Codex, use converted skills, rules, and resources under `.codex/`. For Claude Code, use converted skills, agents, commands, and rules under `.claude/`. Read a matching skill's `SKILL.md` before using it and load only the supporting files needed for the task. Prefer converted manifests when both edition catalogs contain the same name. A skill does not authorize external actions or configure its external providers.

For requests such as "INSTALL THIS SKILLS REPO HERE", read the source checkout's `INSTALL.md`. If the edition has not already been selected for that installation, ask:

> Which version would you like to install: GPT / CODEX, AGY / GEMINI, or ANTHROPIC / CLAUDE CODE?

Wait for the answer and reuse an explicit choice already given. Record the absolute target before changing directories. The selected edition determines the payload, including when an AGY assistant installs the Codex or Claude Code edition.

Once the user selects their option, the target workspace `AGENTS.md` or `CLAUDE.md` must remove this unnecessary source-only section (`<!-- source-repository-only -->` onward):

- **For GPT / CODEX**: Automatically read and execute the source checkout's `.codex/rules/install.md` within the same request. Run `node tools/codex/install.mjs --target <absolute-project-path> --profile all` from that checkout. It installs the prebuilt bundle and clean root `AGENTS.md` (which automatically excludes this source-only section), activates `.codex/hooks.json` (plus `.codex/hooks.example.json` and the non-destructive `.git/hooks/pre-commit` receipt gate when `.git` is present; pass `--no-hooks` to opt out), creates or merges the target's root `.gitignore`, sets up local Playwright and Chromium, verifies the runner, and removes only the target's one-time installation rule after success. Preserve existing ignore rules; merge the source bundle's `project.gitignore`, including local `.codex/`, `AGENTS.md`, `scratch/`, `.impeccable/`, and the supplied OS, secrets, editor, dependency, test, cache, and audit rules. Preserve the environment example/template and VS Code exceptions after their exclusions. Keep the source rule; use `--resume` for failed or interrupted setup or to update `.gitignore` in a completed installation. The installed rule's absence after successful setup is expected. Use each skill's setup instructions for later repairs.

- **For AGY / GEMINI**: Follow the original payload branch in the source checkout's `INSTALL.md`. When copying `AGENTS.md` into the target, write only the content before `<!-- source-repository-only -->`, removing this entire source-only block so that only the universal policy and specialized subagents are present in the target workspace. Activate `.agents/hooks.json` (copied from `.agents/hooks.example.json`) and install the `.git/hooks/pre-commit` receipt gate via `node .agents/skills/continuous-agent-loop/scripts/harness.mjs install-git-hook` when `.git` is present. Keep the source `.agents/` edition available. Preserve existing target instructions and global policy. Normal installation does not require conversion-tool dependencies, rebuilding, source validation, AGY submodule initialization, or path/hash rewriting.

- **For ANTHROPIC / CLAUDE CODE**: Run `node tools/claude/install.mjs --target <absolute-project-path> --profile all` from that checkout. It installs the prebuilt `.claude/` bundle (`skills/`, `agents/`, `commands/`, `rules/`), clean root `CLAUDE.md` (which automatically excludes this source-only section), `.claude/hooks.json`, and `.claude/hooks.example.json`, merges the active `hooks` configuration into `.claude/settings.json` (preserving any existing user settings; pass `--no-hooks` to opt out), installs the `.git/hooks/pre-commit` receipt gate when `.git` is present, creates or merges the target's root `.gitignore`, and sets up local Playwright and Chromium if included. In Claude Code, skills are discoverable via `/skill-name`, agents via `@agent-name`, and commands via `/plan`, `/tdd`, `/audit`, `/review`, `/eval`, `/contract`, `/verify`, `/flywheel`.

### Maintaining This Source Collection

Root `AGENTS.md` is the policy source. The builder generates `.codex/AGENTS.md` and root `CLAUDE.md` from the content before `<!-- source-repository-only -->`, and target installations install only the policy before that marker as the target's root policy. Edit root `AGENTS.md` directly; do not introduce a separate instruction template.

For requested conversion or maintenance changes, edit the relevant conversion logic or rule templates in `tools/codex/` and `tools/claude/`. Run `node tools/codex/build.mjs` and `node tools/codex/validate.mjs --source` for the Codex edition. Run `node tools/claude/build.mjs` and `node tools/claude/validate.mjs --source` for the Claude Code edition. Maintain `README.md`, `CONVERSION_REVIEW.md`, and `profiles.json` in each edition directly. Preserve the original AGY files except for changes explicitly requested for that edition or shared installation routing.
