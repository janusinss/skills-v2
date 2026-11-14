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
