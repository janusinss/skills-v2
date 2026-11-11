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
- **Compounding Invariants & Progress Ledger**: Read [.codex/rules/learned-invariants.md](.codex/rules/learned-invariants.md) and `.harness/PROGRESS.md` (when present) before editing code. Record failed hypotheses and verified checkpoints into `.harness/PROGRESS.md` via `node .codex/skills/continuous-agent-loop/scripts/harness.mjs checkpoint` so context compaction never loses negative knowledge.
- **2-Strike Escalation & 3-Strike Circuit Breaker**:
  - **Strike 2 (Model / Architect Escalation)**: After 2 consecutive failed verification receipts or Skeptic rejections on the same issue, escalate from `builder` tier to `brain` tier ([.codex/agents/code-architect.md](.codex/agents/code-architect.md) or higher-reasoning model) for root-cause re-architecture.
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
  - **Brand New Web App / Greenfield**: [.codex/rules/starting-brandnew.md](.codex/rules/starting-brandnew.md)
  - **Existing App / Redesign / Refactor**: [.codex/rules/starting-existing.md](.codex/rules/starting-existing.md)
  - **Active UI Implementation**: [.codex/rules/frontend.md](.codex/rules/frontend.md)
  - **Layout & CSS Hygiene**: [.codex/rules/UI_Always.md](.codex/rules/UI_Always.md)
  - **Motion, Physics & Micro-Interactions**: [.codex/rules/MOTION.md](.codex/rules/MOTION.md) (and [.codex/skills/3d-web-experience/SKILL.md](.codex/skills/3d-web-experience/SKILL.md) for 3D/WebGL)
- **Backend, Security & QA**:
  - **Backend Architecture, Data Layer & APIs**: [.codex/rules/backend.md](.codex/rules/backend.md)
  - **Application Security & Exploit Defense**: [.codex/rules/security.md](.codex/rules/security.md)
  - **Penetration Testing, Strix & Functional Flow QA**: [.codex/rules/penetrating-and-testing.md](.codex/rules/penetrating-and-testing.md)
  - **Compounding Guardrails & Learned Invariants**: [.codex/rules/learned-invariants.md](.codex/rules/learned-invariants.md)

---

## 3. Playwright & Browser Verification Policy

Follow [.codex/rules/UI_Always.md](.codex/rules/UI_Always.md#8-browser-verification-policy) for visual and responsive checks:

- **Engine**: Use the bundled [playwright-skill](.codex/skills/playwright-skill/SKILL.md) through inline Node execution from the project root: `node .codex/skills/playwright-skill/run.js -e "..."`. Create no scratch `.js` files for these audits and do not delegate browser verification to subagents.
- **Target URL**: Resolve the running application through `helpers.resolveTargetUrl()`. Respect a user-provided URL or project configuration; do not guess a port.
- **Layout Audits**: Check 375px, 768px, and 1280px for accidental horizontal overflow (`document.documentElement.scrollWidth > window.innerWidth`), page exceptions, and console errors.
- **Artifacts**: Save screenshots and temporary browser diagnostics in the project's git-ignored `scratch/` directory.
- **Execution Script**: Start with the canonical inline layout audit in `UI_Always.md`.

---

## 4. Subagents & Specialized Roles (3-Tier Cognitive Routing)

Delegate specialized lifecycle tasks to the agents defined under [.codex/agents/](.codex/agents):

- **Cognitive Routing Tiers (`tier:`, `model_tier:` & `reasoning_effort:` frontmatter)**:
  - **`reflex`** (Fast/Read-Only Reconnaissance — **GPT / Codex**: `model_tier: mini`, `reasoning_effort: low`): [.codex/agents/explorer.md](.codex/agents/explorer.md) — locates files, symbols, and call-sites rapidly; never concludes, plans, or edits files.
  - **`builder`** (Scoped Workhorse Implementation & Repair — **GPT / Codex**: `model_tier: codex`, `reasoning_effort: medium`): `tdd-guide`, `e2e-runner`, `code-simplifier`, `refactor-cleaner`, `performance-optimizer`, `penetration-tester`, and `*-build-resolver` agents.
  - **`brain`** (High-Reasoning Architecture, Audit & Cold-Context Skepticism — **GPT / Codex**: `model_tier: reasoning`, `reasoning_effort: high`): `planner`, `architect`, `code-architect`, `a11y-architect`, `spec-miner`, `skeptic`, `security-auditor`, `silent-failure-hunter`, `agent-evaluator`, and `*-reviewer` agents (all reviewers, auditors, and skeptics are strictly read-only).
- **Reconnaissance, Planning & Architecture**:
  - Fast Codebase Reconnaissance (`reflex`): [.codex/agents/explorer.md](.codex/agents/explorer.md)
  - Implementation Planning (`brain`): [.codex/agents/planner.md](.codex/agents/planner.md)
  - Domain & System Architecture (`brain`): [.codex/agents/code-architect.md](.codex/agents/code-architect.md)
  - Web Accessibility (WCAG 2.2) (`brain`): [.codex/agents/a11y-architect.md](.codex/agents/a11y-architect.md)
  - Test-Driven Specification (`builder`): [.codex/agents/tdd-guide.md](.codex/agents/tdd-guide.md)
- **Quality Gates, Cold-Context Skeptic & Failure Hunting**:
  - Cold-Context Adversarial Skeptic (`brain`, read-only): [.codex/agents/skeptic.md](.codex/agents/skeptic.md)
  - Swallowed Exception & Fallback Audits (`brain`, read-only): [.codex/agents/silent-failure-hunter.md](.codex/agents/silent-failure-hunter.md)
  - Code Simplification & Dead Weight Removal (`builder`): [.codex/agents/code-simplifier.md](.codex/agents/code-simplifier.md)
  - Pre-Delivery Verification (`brain`, read-only): [.codex/agents/agent-evaluator.md](.codex/agents/agent-evaluator.md)
- **Security & Penetration Testing**:
  - Pre-Commit Security & Invariant Audits (`brain`, read-only): [.codex/agents/security-auditor.md](.codex/agents/security-auditor.md)
  - Exploit Validation & Penetration QA (`builder`): [.codex/agents/penetration-tester.md](.codex/agents/penetration-tester.md)
- **Code Review Specialists (`brain`, read-only)**:
  - TypeScript / JS: [.codex/agents/typescript-reviewer.md](.codex/agents/typescript-reviewer.md) · React: [.codex/agents/react-reviewer.md](.codex/agents/react-reviewer.md)
  - Backend & Databases: [.codex/agents/database-reviewer.md](.codex/agents/database-reviewer.md) · FastAPI: [.codex/agents/fastapi-reviewer.md](.codex/agents/fastapi-reviewer.md)
  - Systems & Stacks: [.codex/agents/go-reviewer.md](.codex/agents/go-reviewer.md) · [.codex/agents/rust-reviewer.md](.codex/agents/rust-reviewer.md) · [.codex/agents/php-reviewer.md](.codex/agents/php-reviewer.md) · [.codex/agents/vue-reviewer.md](.codex/agents/vue-reviewer.md)
- **Closed-Loop Build & Error Repair (`builder`)**:
  - TypeScript & Generic Build Repair: [.codex/agents/build-error-resolver.md](.codex/agents/build-error-resolver.md)
  - Framework Resolvers: [.codex/agents/react-build-resolver.md](.codex/agents/react-build-resolver.md), [.codex/agents/go-build-resolver.md](.codex/agents/go-build-resolver.md), [.codex/agents/rust-build-resolver.md](.codex/agents/rust-build-resolver.md), [.codex/agents/django-build-resolver.md](.codex/agents/django-build-resolver.md), [.codex/agents/cpp-build-resolver.md](.codex/agents/cpp-build-resolver.md), [.codex/agents/pytorch-build-resolver.md](.codex/agents/pytorch-build-resolver.md)

---

## 5. 6-Stage Self-Improving Harness Lifecycle

For non-trivial features, refactoring, or multi-file changes, execute the deterministic 6-stage harness defined in [.codex/skills/continuous-agent-loop/SKILL.md](.codex/skills/continuous-agent-loop/SKILL.md) via `node .codex/skills/continuous-agent-loop/scripts/harness.mjs`:

1. **Stage 1: Pre-Flight Contract & Adaptive Worktree**: Use [.codex/agents/explorer.md](.codex/agents/explorer.md) (`reflex`) for fast file discovery and [.codex/agents/planner.md](.codex/agents/planner.md) / [.codex/agents/code-architect.md](.codex/agents/code-architect.md) (`brain`) to initialize a scoped contract (`node .codex/skills/continuous-agent-loop/scripts/harness.mjs contract init --task <id> --allow "<globs>" --cmd "<commands>"`). Use `worktree spawn --task <id>` for multi-file or parallel work (adaptive mode allows `<20` lines single-file edits in-tree).
2. **Stage 2: TDD & Scoped Implementation**: Delegate to [.codex/agents/tdd-guide.md](.codex/agents/tdd-guide.md) (`builder`) to write failing tests first, then implement minimal passing code within `allowed_paths` enforced by `harness.mjs sensor check-file`. On compiler/type failure, delegate to [.codex/agents/build-error-resolver.md](.codex/agents/build-error-resolver.md).
3. **Stage 3: Deterministic Receipt Gate**: Execute `node .codex/skills/continuous-agent-loop/scripts/harness.mjs verify run --task <id>` to validate scope compliance, run all `acceptance_commands`, hash `git diff HEAD` (`diff_sha256`), and write `.harness/receipts/<id>.json`.
4. **Stage 4: Cold-Context Adversarial Skeptic**: Generate a sanitized context packet (`node .codex/skills/continuous-agent-loop/scripts/harness.mjs skeptic-packet --task <id>`) containing **only** Contract + Raw Diff + Receipt (zero author rationalization), then invoke [.codex/agents/skeptic.md](.codex/agents/skeptic.md) (plus [.codex/agents/silent-failure-hunter.md](.codex/agents/silent-failure-hunter.md) and [.codex/agents/security-auditor.md](.codex/agents/security-auditor.md) for security surfaces) in a fresh cold context and stamp the verdict (`harness.mjs stamp-skeptic`).
5. **Stage 5: Browser/E2E Verification**: For UI or user-flow changes, run the canonical Playwright layout and functional audit per Section 3 and evaluate output quality with [.codex/agents/agent-evaluator.md](.codex/agents/agent-evaluator.md) and [.codex/skills/agent-self-evaluation/SKILL.md](.codex/skills/agent-self-evaluation/SKILL.md).
6. **Stage 6: Calibrated Memory Flywheel & Progress Compaction**: On any verification failure, Skeptic `REJECT`, or user correction, record the root cause via `node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel record` (staging into `.harness/evals/regressions.jsonl` and promoting verified invariants to [.codex/rules/learned-invariants.md](.codex/rules/learned-invariants.md)), and checkpoint state into `.harness/PROGRESS.md` via `harness.mjs checkpoint`.
