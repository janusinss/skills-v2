---
trigger: model_decision
description: Strict AGY-only /swarm orchestration and model routing policy preserving gemini-4-neon-xhigh coordinators on xhigh, redirecting other starting models to CARBON -> gemini-4-neon-xhigh / gemini-pro-orchestrator-neon (fallback ARGON separate weekly bucket when Neon/Hydrogen quota is low), and enforcing role-based worker pinning (gemini-4-hydrogen-high routine/reflex/monitor, gemini-4-neon-medium complex builders/refactors, gemini-4-neon-high verifiers/auditors/skeptic).
---

# Swarm Orchestration & Model Routing Policy (AGY Only)

Apply this rule whenever running `/swarm`, coordinating multi-agent swarm runs, or adding/switching swarm members.

---

## 1. Edition Scope (Strict AGY-Only Restriction)

- `/swarm` is **strictly restricted to the AGY (Antigravity / Gemini) edition**.
- Exclude `.agents/rules/swarm.md` from generated **CLAUDE** (`tools/claude/lib.mjs`) and **CODEX** (`tools/codex/lib.mjs`) bundles via `isBundleExcluded`. Do not expose or port `/swarm` rules to Claude Code or Codex editions.

---

## 2. Coordinator / Orchestrator Model Policy (Preserve `gemini-4-neon-xhigh`, Redirect Others via CARBON / NEON / ARGON)

The swarm coordinator / orchestrator MUST run on `gemini-4-neon-xhigh` (when started there with healthy quota), **CARBON**, `gemini-pro-orchestrator-neon`, or **ARGON** reserve when the shared Neon/Hydrogen bucket is low:

1. **Discover Models & Live Quota Buckets**: Call `swarm{action:"models", all:true}` and `swarm{action:"status"}` first to inspect the coordinator's active model, available models, and live quota buckets:
   - **Shared Neon / Hydrogen Fast-Reset Pool**: `Gemini 4 Neon (*)` (`gemini-4-neon-*`), `Orchestrator (Neon)` (`gemini-pro-orchestrator-neon`), and `Gemini 4 Hydrogen (*)` (`gemini-4-hydrogen-*`) share one fast-reset quota pool.
   - **Separate Argon Weekly Pool**: `Gemini 4 Argon (*)` (`gemini-4-argon-*`) and `Orchestrator (Argon)` (`gemini-pro-orchestrator-g1-pro`) sit in a separate weekly quota pool.
2. **Keep `Gemini 4 Neon (XHigh)` (`gemini-4-neon-xhigh`)**:
   - If the coordinator started on / the user selected **Gemini 4 Neon (XHigh)** (`gemini-4-neon-xhigh`), **keep it on `gemini-4-neon-xhigh`** unless the shared Neon/Hydrogen bucket is low (`<= 10%`) or exhausted.
3. **Redirect Any Other Active Model or Reasoning Level**:
   - If **any other** model or reasoning level is active (such as `gemini-4-neon-high`, `gemini-4-neon-medium`, `gemini-4-neon-low`, `gemini-4-hydrogen-*`, `gemini-3.8-flash-*`, `claude-*`, `gpt-oss-*`, or Argon while the shared Neon/Hydrogen bucket is healthy), immediately redirect via `swarm{action:"model", model:"<target>"}` (omit `name` or pass `"coordinator"`) before spawning or messaging workers:
     - **Priority 1 — CARBON**: Switch to an available Pro **CARBON** model if it has remaining quota.
     - **Priority 2 — NEON**: Switch to `gemini-4-neon-xhigh` (`"Gemini 4 Neon (XHigh)"`) or `gemini-pro-orchestrator-neon` (`"Orchestrator (Neon)"`) while the shared Neon/Hydrogen bucket is healthy (`> 10%`).
     - **Priority 3 — ARGON Separate-Bucket Reserve**: When the shared Neon/Hydrogen bucket is low (`<= 10%`) or exhausted, fall back to `gemini-pro-orchestrator-g1-pro` (`"Orchestrator (Argon)"`), or `gemini-4-argon-high` (`"Gemini 4 Argon (High)"`) if `gemini-pro-orchestrator-g1-pro` is unavailable or out of quota.
   - Explicitly state why the switch is happening (for example, enforcing AGY coordinator policy: redirecting from `<current>` to `<target>`).

---

## 3. Swarm Worker & Verifier Model Policy (Role-Based Explicit Pinning)

Every `swarm{action:"add"}` call MUST explicitly pin `model` to match the worker's role so workers never inherit coordinator `gemini-4-neon-xhigh`, `CARBON`, or `ARGON`:

- **Explicit Pinning Required**: Always pass `model: "<worker-model>"` on every `swarm{action:"add", ...}` call.
- **Role-Based Allowed Worker Models**:
  - **Routine / `reflex` / `monitor` / Docs / Test-Runner Workers**: `gemini-4-hydrogen-high` (including `swarm_monitor`).
  - **Complex `builder` / Multi-File Refactor / Tricky Logic Workers**: `gemini-4-neon-medium` (fall back to `gemini-4-hydrogen-high` when conserving shared Neon/Hydrogen quota).
  - **Dedicated Verifiers / Code Reviewers / Security & A11y Auditors / Cold-Context `skeptic`**: `gemini-4-neon-high`.
- **Forbidden Worker Models**:
  - `gemini-4-neon-xhigh`, `gemini-4-neon-low`, `gemini-4-hydrogen-xhigh`, `gemini-4-hydrogen-medium`, `gemini-4-hydrogen-low`, `gemini-3.8-flash-*`, `claude-*`, `gpt-oss-*`, and `CARBON` models are forbidden for workers.
- **Separate-Bucket Argon Overflow & Hard Stop**:
  - `gemini-4-argon-high` is **NOT** used for workers while Neon/Hydrogen quota is available, **EXCEPT** as explicit overflow when the shared Neon/Hydrogen bucket is exhausted and Argon weekly quota remains.
  - If **BOTH** the shared Neon/Hydrogen bucket and the Argon weekly bucket are exhausted, **STOP immediately** and report quota exhaustion to the user. Never upgrade workers to `gemini-4-neon-xhigh`, downgrade below the allowed role floor, or switch to Flash / non-Gemini models.

---

## 4. Hybrid Task Briefs, Selective Specialist Binding & Subagent Delegation

- **Implementation Workers (Custom Coordinator Briefs)**: Drive implementation, refactoring, and file-slice workers directly with surgical coordinator `brief` instructions (exact file ownership, concrete edits, and acceptance checks) without forcing them to load a generic `.agents/agents/<role>.md` file.
- **Review, Security & Architecture Workers (Selective Specialist Checklists)**: Reference `.agents/agents/<role>.md` in a worker's `brief` selectively when spawning a dedicated reviewer, security/accessibility auditor, or cold-context `skeptic` ([skeptic.md](.agents/agents/skeptic.md), [security-auditor.md](.agents/agents/security-auditor.md), [silent-failure-hunter.md](.agents/agents/silent-failure-hunter.md), [a11y-architect.md](.agents/agents/a11y-architect.md), or stack `*-reviewer.md`).
- **Swarm Tier-to-Model Mapping**:
  - `reflex`, routine workers, docs, test runners, and `monitor` (`swarm_monitor`): `gemini-4-hydrogen-high`
  - Complex `builder` / multi-file refactor workers: `gemini-4-neon-medium` (or `gemini-4-hydrogen-high` when conserving Neon/Hydrogen quota)
  - Dedicated `brain` verifiers, reviewers, auditors, and cold-context `skeptic`: `gemini-4-neon-high`
  - `brain` coordinator: `gemini-4-neon-xhigh` (preserved when started on `xhigh` and healthy) or redirected via `CARBON` -> `gemini-4-neon-xhigh` / `gemini-pro-orchestrator-neon` -> `ARGON` reserve (`gemini-pro-orchestrator-g1-pro` / `gemini-4-argon-high`)
- **Worker Subagent Delegation (`invoke_subagent`)**: Any `invoke_subagent` calls made from swarm workers (such as scoped read-only reconnaissance or targeted specialist audits) MUST strictly use `Model: "inherit"` (inheriting the worker's pinned model) — never `"flash"`, `"flash_lite"`, or escalating routine workers to `"pro"`.

---

## 5. Anti-Stall Monitor & Coordinator Wait Policy

- **Mandatory `monitor` Worker**: Every `/swarm` session MUST spawn a `monitor` worker running `swarm_monitor` (`swarm{action:"add", name:"monitor", brief:"You are the swarm monitor. Read the swarm_monitor skill first and follow it strictly."}`) in the initial wave alongside workers. Leave `monitor` running until work completes; never assign implementation tasks to it.
- **Unfiltered Coordinator Waits**: Whenever waiting on the board with active workers, the coordinator MUST call `swarm_wait{since: <last_seq>, mentions_only: false}` (never default `mentions_only: true`) so peer replies, unaddressed reports, and `monitor` stall nudges always wake the coordinator.
- **Explicit Closure (`[done]` / `kill`)**: Before finishing, verify `swarm{action:"status"}` and `read_board`, post `[done] <summary>` via `post_message` once work finishes so `monitor` retires, and `kill` completed workers (or leave `kill`ed clean).
- **`Stop` Hook Enforcement (Harness & Designer Modes)**: [swarm-stop-guard.cjs](.agents/scripts/swarm-stop-guard.cjs) inspects the hook `transcriptPath` at turn end and forces one re-check (`{"decision":"continue"}`) if workers remain open without `[done]`/`kill`, without a `monitor`, or with `swarm_wait` missing `mentions_only: false`.

