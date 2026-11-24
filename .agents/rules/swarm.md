---
trigger: model_decision
description: AGY-only /swarm and Orchestrator routing under the unified Gemini pool: Carbon High or Neon XHigh coordinator lock, 4-rung worker pinning, zero Argon.
---

# Swarm Orchestration & Model Routing Policy (AGY Only)

Apply whenever running `/swarm`, choosing between single-session `Orchestrator` and `/swarm`, or adding/switching swarm members.

## 1. Edition Scope & `Orchestrator` vs `/swarm`

- **AGY-Only**: `/swarm` is restricted to AGY (Antigravity / Gemini). Exclude `.agents/rules/swarm.md` from **CLAUDE** (`tools/claude/lib.mjs`) and **CODEX** (`tools/codex/lib.mjs`) via `isBundleExcluded`.
- **Single-Session Outside `/swarm`**: Prefer `Orchestrator (Carbon)` (`gemini-pro-orchestrator`), fallback `Orchestrator (Neon)` (`gemini-pro-orchestrator-neon`).
  - Carbon/Neon plans and reviews while `Gemini 4 Hydrogen` runs routine edits and commands, saving unified `Gemini Models` (`5h` + `Weekly`) quota.
- **No `Orchestrator (*)` Inside `/swarm`**: Cross-turn swaps break coordinator prompt-cache continuity. Run `/swarm` coordinators on standalone `gemini-4-carbon-high` or `gemini-4-neon-xhigh`.

## 2. `/swarm` Coordinator Policy (Carbon High or Neon XHigh Only)

1. **Inspect First**: Call `swarm{action:"models", all:true}` and `swarm{action:"status"}` at `/swarm` start.
   - **Unified `Gemini Models` Pool (`5h` + `Weekly`)**: All Gemini 4, `gemini-3.8-flash-*`, `gemini-pro-orchestrator*`, and `gemini-4-argon-*` share one pool (`carbon-high` heaviest, `neon-*` moderate, `hydrogen-high` lightest).
   - **Separate Pool**: Only `Claude and GPT models` draw from a non-Gemini pool.
   - **Zero Argon**: `gemini-4-argon-*` and `gemini-pro-orchestrator-argon` burn the same pool with weaker capability. Never use Argon anywhere.
2. **Preserve UI Choice**: Keep `Gemini 4 Carbon (High)` (`gemini-4-carbon-high`) or `Gemini 4 Neon (XHigh)` (`gemini-4-neon-xhigh`) if already active.
3. **Redirect Any Other Model Immediately**: Before spawning or messaging workers, call `swarm{action:"model", model:"<target>"}` (omit `name` or pass `"coordinator"`):
   - **Disallowed**: `gemini-pro-orchestrator*`, `gemini-4-carbon-medium/low`, `gemini-4-neon-high/medium/low`, `gemini-4-hydrogen-*`, `gemini-4-argon-*`, `gemini-3.8-flash-*`, `claude-*`, `gpt-oss-*`.
   - **Priority 1**: `gemini-4-carbon-high` (`"Gemini 4 Carbon (High)"`).
   - **Priority 2 (Fallback)**: `gemini-4-neon-xhigh` (`"Gemini 4 Neon (XHigh)"`) only if `gemini-4-carbon-high` is unavailable or errors.
   - No third coordinator model is allowed. State the policy reason when switching.

## 3. Worker & Specialist 4-Rung Pinning

Pass explicit `model: "<worker-model>"` on every coordinator `swarm{action:"add"}` call (worker-spawned same-rung helpers may omit `model:` to inherit their parent's pinned model):

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
- **Rung 4 (`reflex`, Routine Slices & `monitor`)**:
  - Roles: `monitor` (`swarm_monitor`), `explorer` (`reflex`), mechanical single-file slices, docs/config sync, test-suite runners.
  - Models: `gemini-4-hydrogen-high` ONLY.
- **Forbidden Models**:
  - Everywhere: `gemini-4-argon-*`, `gemini-pro-orchestrator-argon`, `gemini-pro-orchestrator*` (in `/swarm`), `gemini-4-carbon-medium/low`, `gemini-4-neon-low`, `gemini-4-hydrogen-xhigh/medium/low`, `gemini-3.8-flash-*`, `claude-*`, `gpt-oss-*`.
  - Role-restricted: `gemini-4-neon-xhigh` outside Rung 1; `gemini-4-carbon-high` on Rung 3/4 workers.
- **Quota Hard Stop**: At `0%` on the unified `Gemini Models` (`5h` or `Weekly`) pool, stop immediately and report to the user. Never switch to Argon, Flash, or non-Gemini models unless asked.

## 4. Hybrid Briefs, Selective Specialists & Subagents

- **Implementation Workers**: Use direct coordinator `brief` instructions (file ownership, concrete edits, acceptance checks) instead of loading generic `.agents/agents/<role>.md` files.
- **Review & Audit Workers**: Attach `.agents/agents/<role>.md` selectively in the `brief` for dedicated reviewers, auditors, or skeptics:
  - [skeptic.md](.agents/agents/skeptic.md), [security-auditor.md](.agents/agents/security-auditor.md), [silent-failure-hunter.md](.agents/agents/silent-failure-hunter.md), [a11y-architect.md](.agents/agents/a11y-architect.md), or stack `*-reviewer.md`.
- **Worker `invoke_subagent`**: Always pass `Model: "inherit"`. Never pass `"flash"`, `"flash_lite"`, or escalate Rung 3/4 workers to `"pro"`.

## 5. Monitor, Restart Recovery, Waits & Stop Guard

- **Mandatory `monitor`**: Spawn `monitor` on `gemini-4-hydrogen-high` in Wave 1 (`brief: "You are the swarm monitor. Read the swarm_monitor skill first and follow it strictly."`). Never assign implementation work to it.
- **Restart Cron Recovery**: Server restarts clear cron timers while `monitor` waits on `mentions_only: true`. Post `@<monitor> resume` after any restart so `swarm_monitor` re-schedules its 3-minute cron.
- **Coordinator `swarm_wait` Mode**:
  - Default to `swarm_wait{since: <last_seq>, mentions_only: false}` for unaddressed posts or single-hop worker updates.
  - Use `swarm_wait{since: <last_seq>, mentions_only: true}` ONLY when an active `monitor` is running AND workers perform explicit peer-to-peer handoffs (avoids `Carbon High` quota burn on intermediate peer messages while `monitor` guards against stalls).
- **Explicit Closure**: Check `swarm{action:"status"}` and `read_board`, post `[done] <summary>` via `post_message` so `monitor` goes dormant, and `kill` completed workers (kill `monitor` only for full teardown).
- **`Stop` Hook**: [swarm-stop-guard.cjs](.agents/scripts/swarm-stop-guard.cjs) inspects `transcriptPath` at turn end and returns `{"decision":"continue"}` when:
  - Workers remain open without `[done]`/`kill` or `swarm_wait`, or Wave 1 ends / waits without an active `monitor` (`monitor` is required for `mentions_only: true` waits).
