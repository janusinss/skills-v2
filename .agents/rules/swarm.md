---
trigger: model_decision
description: Strict AGY-only /swarm orchestration and model routing policy keeping gemini-4-hydrogen-xhigh coordinators on xhigh, redirecting other starting models to CARBON/ARGON High/Pro (fallback gemini-4-hydrogen-xhigh), and strictly running ALL swarm workers and swarm subagents on gemini-4-hydrogen-high ONLY.
---

# Swarm Orchestration & Model Routing Policy (AGY Only)

Apply this rule whenever running `/swarm`, coordinating multi-agent swarm runs, or adding/switching swarm members.

---

## 1. Edition Scope (Strict AGY-Only Restriction)

- `/swarm` is **strictly restricted to the AGY (Antigravity / Gemini) edition**.
- Exclude `.agents/rules/swarm.md` from generated **CLAUDE** (`tools/claude/lib.mjs`) and **CODEX** (`tools/codex/lib.mjs`) bundles via `isBundleExcluded`. Do not expose or port `/swarm` rules to Claude Code or Codex editions.

---

## 2. Coordinator / Orchestrator Model Policy (Preserve `xhigh`, Otherwise Redirect to CARBON / ARGON)

The swarm coordinator / orchestrator MUST run on `gemini-4-hydrogen-xhigh` (if explicitly selected) or **CARBON** / **ARGON** High/Pro:

1. **Discover Models & Active State**: Call `swarm{action:"models", all:true}` and `swarm{action:"status"}` first to inspect the coordinator's current model, available models, and remaining quotas.
2. **Keep `GEMINI HYDROGEN EXTRA HIGH` (`gemini-4-hydrogen-xhigh`)**:
   - If the coordinator started on / the user selected **GEMINI HYDROGEN EXTRA HIGH** (`gemini-4-hydrogen-xhigh`), **keep it on `gemini-4-hydrogen-xhigh`**. Do **NOT** switch to CARBON or ARGON unless `gemini-4-hydrogen-xhigh` quota runs out.
3. **Redirect Any Other Active Model or Reasoning Level**:
   - If **any other** model or reasoning level is active (for example `gemini-4-hydrogen-high`, `gemini-4-hydrogen-medium`, `gemini-4-hydrogen-low`, `gemini-3.8-flash-*`, `claude-*`, `gpt-oss-*`, or lower Argon tiers), immediately redirect via `swarm{action:"model", model:"<target>"}` (omit `name` or pass `"coordinator"`) before spawning or messaging workers:
     - **Priority 1 — CARBON**: Switch to an available Pro **CARBON** model if it has remaining quota.
     - **Priority 2 — ARGON**: If CARBON is unavailable or out of quota, switch to **ARGON**: prefer `gemini-pro-orchestrator-g1-pro` (`"Orchestrator (Argon)"`), falling back to `gemini-4-argon-high` (`"Gemini 4 Argon (High)"`) if `gemini-pro-orchestrator-g1-pro` is unavailable or out of quota.
     - **Priority 3 — Hydrogen Extra High Fallback**: Fall back to `gemini-4-hydrogen-xhigh` only if both CARBON and ARGON lack quota or are unavailable.
   - Explicitly state why the switch is happening (e.g., enforcing AGY coordinator policy: redirecting from `<current>` to `<target>`).

---

## 3. Swarm Worker Model Policy (Strict `gemini-4-hydrogen-high` ONLY)

ALL swarm workers — `reflex`, `builder`, `brain` workers, and the stall monitor (`monitor` / `swarm_monitor`) — MUST strictly use `gemini-4-hydrogen-high` ONLY:

- **Allowed Worker Model**:
  - `gemini-4-hydrogen-high` ONLY.
- **Explicit Pinning Required**: Always pass `model: "gemini-4-hydrogen-high"` on every `swarm{action:"add", ...}` call so omitting `model` never inherits `gemini-4-hydrogen-xhigh`, ARGON, or CARBON from the coordinator.
- **Forbidden Worker Models**:
  - **No `xhigh` or lower Hydrogen reasoning**: `gemini-4-hydrogen-xhigh`, `gemini-4-hydrogen-medium`, and `gemini-4-hydrogen-low` are forbidden for workers.
  - **No other model families or tiers**: `gemini-3.8-flash-*`, `gemini-4-argon-*`, `gemini-pro-orchestrator-*`, `claude-*`, `gpt-oss-*`, and CARBON models are forbidden for workers.
- **Hard Stop on Quota Exhaustion / Unavailability**:
  - If `gemini-4-hydrogen-high` hits quota exhaustion or is unavailable, **STOP immediately** and report the unavailability/quota exhaustion to the user. Never upgrade workers to `gemini-4-hydrogen-xhigh` or downgrade below `high` (or switch to Flash/non-Hydrogen models).

---

## 4. Hybrid Task Briefs, Selective Specialist Binding & Subagent Delegation

- **Implementation Workers (Custom Coordinator Briefs)**: Drive implementation, refactoring, and file-slice workers directly with surgical coordinator `brief` instructions (exact file ownership, concrete edits, and acceptance checks) without forcing them to load a generic `.agents/agents/<role>.md` file.
- **Review, Security & Architecture Workers (Selective Specialist Checklists)**: Reference `.agents/agents/<role>.md` in a worker's `brief` selectively when spawning a dedicated reviewer, security/accessibility auditor, or cold-context `skeptic` ([skeptic.md](.agents/agents/skeptic.md), [security-auditor.md](.agents/agents/security-auditor.md), [silent-failure-hunter.md](.agents/agents/silent-failure-hunter.md), [a11y-architect.md](.agents/agents/a11y-architect.md), or stack `*-reviewer.md`).
- **Swarm Tier-to-Model Mapping**: ALL swarm worker tiers (`reflex`, `builder`, `brain` workers, and `monitor`) strictly use `gemini-4-hydrogen-high` ONLY. The `brain` coordinator tier uses `gemini-4-hydrogen-xhigh` (when started on `xhigh`) or `CARBON` / `ARGON` High/Pro.
- **Worker Subagent Delegation (`invoke_subagent`)**: Any `invoke_subagent` calls made from swarm workers (e.g., scoped read-only reconnaissance or targeted specialist audits) MUST strictly use `Model: "inherit"` (inheriting the worker's `gemini-4-hydrogen-high`) — never `"pro"`, `"flash"`, or `"flash_lite"`.

---

## 5. Anti-Stall Monitor & Coordinator Wait Policy

- **Mandatory `monitor` Worker**: Every `/swarm` session MUST spawn a `monitor` worker running `swarm_monitor` (`swarm{action:"add", name:"monitor", brief:"You are the swarm monitor. Read the swarm_monitor skill first and follow it strictly."}`) in the initial wave alongside workers. Leave `monitor` running until work completes; never assign implementation tasks to it.
- **Unfiltered Coordinator Waits**: Whenever waiting on the board with active workers, the coordinator MUST call `swarm_wait{since: <last_seq>, mentions_only: false}` (never default `mentions_only: true`) so peer replies, unaddressed reports, and `monitor` stall nudges always wake the coordinator.
- **Explicit Closure (`[done]` / `kill`)**: Before finishing, verify `swarm{action:"status"}` and `read_board`, post `[done] <summary>` via `post_message` once work finishes so `monitor` retires, and `kill` completed workers (or leave `kill`ed clean).
- **`Stop` Hook Enforcement (Harness & Designer Modes)**: [swarm-stop-guard.cjs](.agents/scripts/swarm-stop-guard.cjs) inspects the hook `transcriptPath` at turn end and forces one re-check (`{"decision":"continue"}`) if workers remain open without `[done]`/`kill`, without a `monitor`, or with `swarm_wait` missing `mentions_only: false`.

