---
trigger: model_decision
description: Strict AGY-only /swarm orchestration and model routing policy requiring CARBON/ARGON Pro (fallback GEMINI HYDROGEN xhigh) for the coordinator and GEMINI HYDROGEN high/xhigh only for all workers.
---

# Swarm Orchestration & Model Routing Policy (AGY Only)

Apply this rule whenever running `/swarm`, coordinating multi-agent swarm runs, or adding/switching swarm members.

---

## 1. Edition Scope (Strict AGY-Only Restriction)

- `/swarm` is **strictly restricted to the AGY (Antigravity / Gemini) edition**.
- Exclude `.agents/rules/swarm.md` from generated **CLAUDE** (`tools/claude/lib.mjs`) and **CODEX** (`tools/codex/lib.mjs`) bundles via `isBundleExcluded`. Do not expose or port `/swarm` rules to Claude Code or Codex editions.

---

## 2. Coordinator / Orchestrator Model Policy (Mandatory Pro Tier with Hydrogen XHigh Fallback)

The swarm coordinator / orchestrator MUST always run on the Pro model tier (or Hydrogen Extra High only if all Pro options are unavailable/exhausted):

1. **Discover Models**: Call `swarm{action:"models", all:true}` first to inspect available models and remaining quotas.
2. **Select Target Model**:
   - Check for **CARBON** first (any available Pro CARBON model with remaining quota).
   - If **CARBON** is unavailable or out of quota, use **ARGON**: prefer `gemini-pro-orchestrator-g1-pro`, and fall back to `gemini-4-argon-high` if `gemini-pro-orchestrator-g1-pro` is unavailable or out of quota.
   - If **both CARBON and ARGON** (`gemini-pro-orchestrator-g1-pro` and `gemini-4-argon-high`) are unavailable or their quota is exhausted, fall back to **GEMINI HYDROGEN** at **EXTRA HIGH** reasoning (`gemini-4-hydrogen-xhigh`) for the orchestrator/coordinator.
3. **Immediate Self-Switch**: If the coordinator is not already on the highest-priority available target model (for example it started on Hydrogen, Flash, Claude, or GPT-OSS while CARBON or ARGON is available, or on a non-`xhigh` model when falling back), immediately switch itself before spawning or messaging workers:
   - Call `swarm{action:"model", model:"<target>"}` (omit `name` or pass `"coordinator"`).
   - Explicitly state why the switch is happening (e.g., enforcing AGY coordinator policy: switching from `<current>` to `<target>`).

---

## 3. Swarm Worker Model Policy (Strict GEMINI HYDROGEN High / XHigh Only)

Every swarm worker — including specialized implementation/audit workers and the stall monitor (`monitor` / `swarm_monitor`) — MUST strictly use **GEMINI HYDROGEN** at **HIGH** or **EXTRA HIGH** reasoning:

- **Allowed Worker Models**:
  - `gemini-4-hydrogen-high`
  - `gemini-4-hydrogen-xhigh`
- **Explicit Pinning Required**: Always pass `model: "gemini-4-hydrogen-high"` or `model: "gemini-4-hydrogen-xhigh"` on every `swarm{action:"add", ...}` call. Never omit `model` when the coordinator is on CARBON/ARGON, because omitting `model` inherits the coordinator's Pro model instead of Hydrogen.
- **Forbidden Worker Models**:
  - **No lower Hydrogen reasoning**: `gemini-4-hydrogen-low` and `gemini-4-hydrogen-medium` are forbidden.
  - **No other model families or tiers**: `gemini-3.8-flash-*`, `gemini-4-argon-*`, `gemini-pro-orchestrator-*`, `claude-*`, and `gpt-oss-*` are forbidden for workers.
- **Hard Stop on Unavailability / Quota Exhaustion**:
  - If a worker hits quota exhaustion on one allowed Hydrogen tier, you may switch it only to the other allowed Hydrogen tier (`gemini-4-hydrogen-high` <-> `gemini-4-hydrogen-xhigh`) via `swarm{action:"model", name:"<worker>", model:"<target>"}` with an explanation.
  - If **both** `gemini-4-hydrogen-high` and `gemini-4-hydrogen-xhigh` are unavailable or out of quota, **STOP immediately** and report the unavailability/quota exhaustion to the user. Never downgrade a worker to medium/low Hydrogen, Flash, or any non-Hydrogen model.

---

## 4. Hybrid Task Briefs & Selective `.agents/agents/` Specialist Binding

- **Implementation Workers (Custom Coordinator Briefs)**: Drive implementation, refactoring, and file-slice workers directly with surgical coordinator `brief` instructions (exact file ownership, concrete edits, and acceptance checks) without forcing them to load a generic `.agents/agents/<role>.md` file.
- **Review, Security & Architecture Workers (Selective Specialist Checklists)**: Reference `.agents/agents/<role>.md` in a worker's `brief` selectively when spawning a dedicated reviewer, security/accessibility auditor, or cold-context `skeptic` ([skeptic.md](.agents/agents/skeptic.md), [security-auditor.md](.agents/agents/security-auditor.md), [silent-failure-hunter.md](.agents/agents/silent-failure-hunter.md), [a11y-architect.md](.agents/agents/a11y-architect.md), or stack `*-reviewer.md`).
- **Swarm Tier-to-Model Mapping**: Both `reflex` and `builder` tiers strictly use `gemini-4-hydrogen-high` ONLY (no `flash`, `flash_lite`, or lower Hydrogen tiers); `brain` uses `CARBON` / `ARGON` (coordinator) or `gemini-4-hydrogen-xhigh` (architecture/audit/verifier workers & subagents, falling back to `high` only on `xhigh` quota exhaustion).
- **Worker Subagent Delegation**: Keep optional `invoke_subagent` delegation for scoped read-only reconnaissance (`explorer`) or targeted specialist audits.

---

## 5. Anti-Stall Monitor & Coordinator Wait Policy

- **Mandatory `monitor` Worker**: Every `/swarm` session MUST spawn a `monitor` worker running `swarm_monitor` (`swarm{action:"add", name:"monitor", brief:"You are the swarm monitor. Read the swarm_monitor skill first and follow it strictly."}`) in the initial wave alongside workers. Leave `monitor` running until work completes; never assign implementation tasks to it.
- **Unfiltered Coordinator Waits**: Whenever waiting on the board with active workers, the coordinator MUST call `swarm_wait{since: <last_seq>, mentions_only: false}` (never default `mentions_only: true`) so peer replies, unaddressed reports, and `monitor` stall nudges always wake the coordinator.
- **Explicit Closure (`[done]` / `kill`)**: Before finishing, verify `swarm{action:"status"}` and `read_board`, post `[done] <summary>` via `post_message` once work finishes so `monitor` retires, and `kill` completed workers (or leave `kill`ed clean).
- **`Stop` Hook Enforcement (Harness & Designer Modes)**: [swarm-stop-guard.cjs](.agents/scripts/swarm-stop-guard.cjs) inspects the hook `transcriptPath` at turn end and forces one re-check (`{"decision":"continue"}`) if workers remain open without `[done]`/`kill`, without a `monitor`, or with `swarm_wait` missing `mentions_only: false`.

