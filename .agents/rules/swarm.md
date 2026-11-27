---
trigger: model_decision
description: AGY-only /swarm and Orchestrator routing under the unified Gemini pool: Carbon High, Neon XHigh, or user-chosen Hydrogen XHigh (workers capped to Hydrogen High only) coordinator lock, 4-rung worker pinning, zero Argon.
---

# Swarm Orchestration & Model Routing Policy (AGY Only)

Apply whenever running `/swarm`, choosing between single-session `Orchestrator` and `/swarm`, or adding/switching swarm members.

## 1. Edition Scope & `Orchestrator` vs `/swarm`

- **AGY-Only**: This AGY Gemini-pool rule file is excluded from verbatim conversion in `tools/claude/lib.mjs` and `tools/codex/lib.mjs` (`isBundleExcluded`) because Claude Code (`.claude/rules/swarm.md`) and Codex (`.codex/rules/swarm.md`) ship their own edition-native swarm rules.
- **Single-Session Outside `/swarm`**: Prefer `Orchestrator (Carbon)` (`gemini-pro-orchestrator`), fallback `Orchestrator (Neon)` (`gemini-pro-orchestrator-neon`).
  - Carbon/Neon plans and reviews while `Gemini 4 Hydrogen` runs routine edits and commands, saving unified `Gemini Models` (`5h` + `Weekly`) quota.
- **No `Orchestrator (*)` Inside `/swarm`**: Cross-turn swaps break coordinator prompt-cache continuity. Run `/swarm` coordinators on standalone `gemini-4-carbon-high`, `gemini-4-neon-xhigh`, or user-selected `gemini-4-hydrogen-xhigh`.

## 2. `/swarm` Coordinator Policy (Carbon High, Neon XHigh, or User-Selected Hydrogen XHigh)

1. **Inspect First**: Call `swarm{action:"models", all:true}` and `swarm{action:"status"}` at `/swarm` start.
   - **Unified `Gemini Models` Pool (`5h` + `Weekly`)**: All Gemini 4, `gemini-3.8-flash-*`, `gemini-pro-orchestrator*`, and `gemini-4-argon-*` share one pool (`carbon-high` heaviest, `neon-*` moderate, `hydrogen-*` lightest).
   - **Separate Pool**: Only `Claude and GPT models` draw from a non-Gemini pool.
   - **Zero Argon**: `gemini-4-argon-*` and `gemini-pro-orchestrator-argon` burn the same pool with weaker capability. Never use Argon anywhere.
2. **Preserve UI Choice**:
   - **Standard Mode**: Keep `Gemini 4 Carbon (High)` (`gemini-4-carbon-high`) or `Gemini 4 Neon (XHigh)` (`gemini-4-neon-xhigh`) if already active.
   - **Hydrogen Mode (User-Selected `gemini-4-hydrogen-xhigh`)**: Keep `Gemini 4 Hydrogen (XHigh)` (`gemini-4-hydrogen-xhigh`) as the `/swarm` coordinator / orchestrator when the user selects it. Do **not** redirect it to Carbon or Neon; instead activate the strict **Hydrogen-Only Worker Cap** in Section 3 (every worker pinned to `gemini-4-hydrogen-high` ONLY).
3. **Redirect Any Other Model Immediately**: Before spawning or messaging workers, call `swarm{action:"model", model:"<target>"}` (omit `name` or pass `"coordinator"`):
   - **Disallowed**: `gemini-pro-orchestrator*`, `gemini-4-carbon-medium/low`, `gemini-4-neon-high/medium/low`, `gemini-4-hydrogen-high/medium/low`, `gemini-4-argon-*`, `gemini-3.8-flash-*`, `claude-*`, `gpt-oss-*`.
   - **Priority 1**: `gemini-4-carbon-high` (`"Gemini 4 Carbon (High)"`).
   - **Priority 2 (Fallback)**: `gemini-4-neon-xhigh` (`"Gemini 4 Neon (XHigh)"`) only if `gemini-4-carbon-high` is unavailable or errors.
   - `gemini-4-hydrogen-xhigh` is UI-opt-in only (never an automatic redirect target unless explicitly requested by the user). No fourth coordinator model is allowed. State the policy reason when switching.

## 3. Worker & Specialist Pinning (Standard 4-Rung vs Hydrogen-Capped Mode)

Pass explicit `model: "<worker-model>"` on every coordinator `swarm{action:"add"}` call (worker-spawned same-rung helpers may omit `model:` to inherit their parent's pinned model):

### Hydrogen Mode Override (`coordinator` = `gemini-4-hydrogen-xhigh`)

When the user runs `/swarm` with `gemini-4-hydrogen-xhigh` as coordinator / orchestrator, this override **supersedes** the 4-rung table below:

- **Strict Worker Cap**: Pin every implementation, review, verification, planning, and `explorer` worker strictly to `gemini-4-hydrogen-high` (`"Gemini 4 Hydrogen (High)"`) ONLY. Exception: if an optional `monitor` (`swarm_monitor`) is spawned per Section 5, pin `monitor` strictly to `gemini-4-hydrogen-medium` (`"Gemini 4 Hydrogen (Medium)"`) ONLY.
- **Explicit `model:` Mandatory**: Always pass explicit `model:` (`gemini-4-hydrogen-high` for workers; `gemini-4-hydrogen-medium` for optional `monitor`) on every `swarm{action:"add"}` call so no worker inherits `gemini-4-hydrogen-xhigh`.
- **No Other Models Allowed**: Never spawn or escalate any worker to `gemini-4-carbon-*`, `gemini-4-neon-*`, `gemini-4-hydrogen-xhigh`, `gemini-4-hydrogen-low`, `gemini-4-argon-*`, `gemini-3.8-flash-*`, `claude-*`, or `gpt-oss-*` (and restrict `gemini-4-hydrogen-medium` to `monitor` ONLY).
- **Escalation Boundary**: Keep high-reasoning planning, Strike-2 root-cause re-architecture, and final verification judgment on the `gemini-4-hydrogen-xhigh` coordinator rather than escalating workers above `gemini-4-hydrogen-high`.

### Standard Mode 4-Rung Pinning (`coordinator` = `gemini-4-carbon-high` or `gemini-4-neon-xhigh`)

- **Rung 1 (`brain` Planners & Architects)**:
  - Roles: `planner`, `architect`, `code-architect`, `a11y-architect`, `spec-miner`.
  - Models: `gemini-4-carbon-high` or `gemini-4-neon-xhigh` ONLY (coordinator handles directly or spawns at Rung 1).
- **Rung 2 (Complex `builder` + `brain` Verifiers, Reviewers & Security)**:
  - Complex `builder`: `tdd-guide`, `performance-optimizer`, `penetration-tester`, complex multi-file refactors, tangled multi-package build repairs.
  - `brain` Review & Security: `qa-verifier`, all `*-reviewer` (`code-`, `typescript-`, `react-`, `vue-`, `go-`, `rust-`, `php-`, `fastapi-`, `database-reviewer`), `silent-failure-hunter`, `agent-evaluator`, `skeptic`, `security-auditor`.
  - Models: `gemini-4-neon-high` default; escalate to `gemini-4-carbon-high` for auth/crypto/exploit surfaces, `security-auditor`, high-stakes `skeptic`, or Strike-2 failures.
- **Rung 3 (Routine `builder`)**:
  - Roles: `code-simplifier`, `refactor-cleaner`, `e2e-runner`, and all 7 `*-build-resolver` agents.
  - Models: `gemini-4-neon-medium` (`gemini-4-hydrogen-high` only for trivial dead-code/lint cleanups).
- **Rung 4 (`reflex` & Routine Slices)**:
  - Roles: `explorer` (`reflex`), mechanical single-file slices, docs/config sync, test-suite runners.
  - Models: `gemini-4-hydrogen-high` ONLY.
- **Optional `monitor` (`swarm_monitor` — Anti-Spam Only When Needed)**:
  - Models: `gemini-4-hydrogen-medium` (`"Gemini 4 Hydrogen (Medium)"`) ONLY. Never use `gemini-4-hydrogen-high` for `monitor`, and never use `gemini-4-hydrogen-medium` for coding/review/`explorer` workers.
- **Forbidden Models**:
  - Everywhere: `gemini-4-argon-*`, `gemini-pro-orchestrator-argon`, `gemini-pro-orchestrator*` (in `/swarm`), `gemini-4-carbon-medium/low`, `gemini-4-neon-low`, `gemini-4-hydrogen-low`, `gemini-3.8-flash-*`, `claude-*`, `gpt-oss-*`.
  - Role-restricted: `gemini-4-hydrogen-xhigh` is coordinator-only when selected by the user (never a worker, and caps all workers to `gemini-4-hydrogen-high`, except optional `monitor` at `gemini-4-hydrogen-medium`); `gemini-4-hydrogen-medium` is `monitor`-only; `gemini-4-neon-xhigh` outside Standard Rung 1; `gemini-4-carbon-high` on Rung 3/4 workers; all `gemini-4-carbon-*` and `gemini-4-neon-*` models on workers in Hydrogen mode.
- **Quota Hard Stop**: At `0%` on the unified `Gemini Models` (`5h` or `Weekly`) pool, stop immediately and report to the user. Never switch to Argon, Flash, or non-Gemini models unless asked.

## 4. Hybrid Briefs, Selective Specialists & Subagents

- **Implementation Workers**: Use direct coordinator `brief` instructions (file ownership, concrete edits, acceptance checks) instead of loading generic `.agents/agents/<role>.md` files.
- **Review & Audit Workers**: Attach `.agents/agents/<role>.md` selectively in the `brief` for dedicated reviewers, auditors, or skeptics:
  - [skeptic.md](.agents/agents/skeptic.md), [security-auditor.md](.agents/agents/security-auditor.md), [silent-failure-hunter.md](.agents/agents/silent-failure-hunter.md), [a11y-architect.md](.agents/agents/a11y-architect.md), or stack `*-reviewer.md`.
- **Worker `invoke_subagent`**: Always pass `Model: "inherit"`. Never pass `"flash"`, `"flash_lite"`, or escalate Rung 3/4 or Hydrogen-mode workers to `"pro"`.

## 5. Monitor, Anti-Spam Guardrails, Waits & Stop Guard

- **Optional `monitor` (No Cron Spam on Simple Waves)**: Do **not** spawn a `monitor` for routine single-hop waves (`<= 3` workers reporting directly to `@coordinator` while coordinator waits on `swarm_wait{mentions_only: false}`). Spawn `monitor` **only** when using `swarm_wait{mentions_only: true}` for peer-to-peer handoffs or long `>= 4`-worker multi-wave runs, pinned strictly to **`gemini-4-hydrogen-medium`**. Never assign implementation work to it.
- **Anti-Spam Monitor Brief & Reuse**:
  - Reuse an existing live/dormant `monitor` across waves instead of killing and respawning `monitor-1..N`.
  - Brief any new `monitor` with explicit anti-spam overrides: *(1) start from `read_board{since: <wave_start_seq>}` (never `since: 0` on long boards), (2) schedule cron at `*/6 * * * *` with `MaxIterations: 12` (reduces wakeups vs `*/3` and caps runaway ticks), and (3) kill cron immediately once `[done]` is posted or zero non-monitor workers remain — do not re-arm cron on post-closure chatter.*
- **Restart Cron Recovery**: Server restarts clear cron timers while an active `monitor` waits on `mentions_only: true`. Post `@<monitor> resume` only if an active `mentions_only: true` swarm wave is still running after restart.
- **Coordinator `swarm_wait` Mode**:
  - Default to `swarm_wait{since: <last_seq>, mentions_only: false}` for single-hop worker updates (wakes on every post with zero background monitor quota burn).
  - Use `swarm_wait{since: <last_seq>, mentions_only: true}` ONLY when an active `monitor` (on `gemini-4-hydrogen-medium`) is running AND workers perform explicit peer-to-peer handoffs.
- **Explicit Closure**: Check `swarm{action:"status"}` and `read_board`, post `[done] <summary>` via `post_message`, `kill` completed workers, and `kill` any active `monitor` on final teardown so it cannot wake on later messages and re-schedule a zombie cron.
- **`Stop` Hook**: [swarm-stop-guard.cjs](.agents/scripts/swarm-stop-guard.cjs) inspects `transcriptPath` at turn end and returns `{"decision":"continue"}` when:
  - Workers remain open without `[done]`/`kill` or `swarm_wait`, OR the coordinator sleeps via `swarm_wait{mentions_only: true}` without an active `monitor` (`mentions_only: false` waits and Turn-1 spawns pass cleanly with zero monitor overhead).
