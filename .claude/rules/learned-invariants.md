---
trigger: model_decision
description: Calibrated Dual-Store repository of promoted root-cause invariants and anti-regression guardrails captured by the Memory Flywheel across verification, Skeptic audits, and user corrections.
---

# Learned Invariants & Memory Flywheel Guardrails

Read and enforce this rule before planning, modifying code, or running verification gates. This file serves as the **Promoted Rule Store** of the **Calibrated Dual-Store Memory Flywheel** defined in [continuous-agent-loop](../skills/continuous-agent-loop/SKILL.md).

---

## 1. Calibrated Dual-Store Architecture

To prevent rule bloat and unverified self-poisoning while compounding negative knowledge across sessions, the harness separates raw failure capture from promoted project invariants:

1. **Stage 1 — Local Regression Store (`.harness/evals/regressions.jsonl`)**:
   - Every deterministic verification failure (`verify run`), Cold-Context Skeptic rejection ([skeptic.md](../agents/skeptic.md)), or explicit user correction is recorded immediately via:
     `node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --task <id> --source <skeptic|verify|user> --domain <domain> --cause "<root_cause>" --rule "<invariant>" --cmd "<repro_cmd>"`
   - Entries in `.harness/evals/regressions.jsonl` capture `{ id, timestamp, task_id, source, domain, root_cause, rule, repro_cmd, promoted }` without polluting git status.
2. **Stage 2 — Promoted Workspace Invariants (`.claude/rules/learned-invariants.md`)**:
   - Only generalized, deduplicated, single-line architectural invariants verified by a reproducible command (`--cmd`) or confirmed across Skeptic/regression gates are promoted into this file via `--promote`.
   - Each promoted entry follows the canonical schema: `- **[<Domain>]**: <Single-sentence invariant> (Source: <task_id/source>)`.

---

## 2. Baseline Harness & Verification Invariants

- **[Harness-Scope]**: Never edit files outside the active contract's `allowed_paths` globs in `.harness/contracts/<task_id>.json` or mutate `.harness/receipts/**` and `.git/hooks/**` directly (Source: baseline-contract-gate).
- **[Harness-Verification]**: Never claim task completion, pass a phase gate, or commit changes without a deterministic `.harness/receipts/<task_id>.json` receipt where `status === "PASS"` and every `acceptance_commands` entry exited `0` (Source: baseline-receipt-gate).
- **[Harness-Skeptic]**: Never pass author chain-of-thought, conversation history, or commit prose to [skeptic.md](../agents/skeptic.md); evaluate exclusively against `.harness/context/<task_id>-brief.json` containing Contract, raw `git diff`, and Receipt (Source: baseline-cold-skeptic).
- **[Harness-Tests]**: Never weaken existing assertions, delete failing tests, or add `.skip` / `.todo` annotations to manufacture a green receipt (Source: baseline-anti-gaming).
- **[Harness-Compaction]**: Always record failed hypotheses and active contract state in `.harness/PROGRESS.md` via `harness.mjs checkpoint` before context compaction, model escalation, or session termination (Source: baseline-progress-ledger).

---

## 3. Promoted Project Invariants

<!-- flywheel-promoted-rules-start -->
- **[Security-Boundary]**: Reviewers, auditors ([security-auditor.md](../agents/security-auditor.md)), and skeptics ([skeptic.md](../agents/skeptic.md)) must operate with strictly read-only file tools and never mutate workspace files during an audit (Source: baseline-readonly-audit).
<!-- flywheel-promoted-rules-end -->
