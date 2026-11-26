> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Learned Invariants & Memory Flywheel Guardrails

Core project invariants and winning playbooks loaded before planning, code edits, or verification gates. See [learn](../skills/learn/SKILL.md) for the `/learn` workflow and [continuous-agent-loop](../skills/continuous-agent-loop/SKILL.md) for full CLI flags and schemas.

## 1. 3-Tier Memory Flywheel & Budget

- **Tier 1 (`.harness/evals/`)**: Append-only raw ledgers—`regressions.jsonl` (failures from `verify run`, [skeptic.md](../agents/skeptic.md), `evaluate.py`, or user corrections), `exemplars.jsonl` (verified winning patterns), and `orchestration-metrics.jsonl` (run telemetry).
- **Tier 2 (This file)**: Promoted Project Invariants (Section 3, `<= 20` soft cap), Promoted Positive Exemplars (Section 4, `<= 8` soft cap), and Staged Candidates (Section 5). Promotion is gated on explicit `/learn` approval or `flywheel test` replay PASS—never auto-append raw reflections to root policy files. At `SessionStart`, a compact `<= 600 B` domain-matched brief is injected.
- **Tier 3 (`.codex/skills/project-<domain>/SKILL.md`)**: Graduate recurring clusters (`>= 3` verified hits) or relieve size pressure near `12 KB` (`12,288` bytes; `24 KB` cap) via `harness.mjs flywheel digest --graduate <domain>`, then prune superseded bullets. Run `harness.mjs flywheel prune` to expire stale 1-hit staged items.
- **Repo Scope**: Keep project invariants, exemplars, and `project-*` skills local to target repos; commit only universal workflow invariants in the `Skills` source repo.

## 2. Core Baseline Invariants

- **[Harness-Scope]**: Never edit outside the active contract's `allowed_paths` in `.harness/contracts/<task_id>.json` or mutate `.harness/receipts/**` and `.git/hooks/**` directly (Source: baseline-contract-gate).
- **[Harness-Verification]**: Never claim completion, pass a gate, or commit without `.harness/receipts/<task_id>.json` having `status === "PASS"` and all `acceptance_commands` exiting `0` (Source: baseline-receipt-gate).
- **[Harness-Skeptic]**: Never send author prose or chat history to [skeptic.md](../agents/skeptic.md); evaluate only `.harness/context/<task_id>-brief.json` (Contract, raw `git diff`, Receipt) (Source: baseline-cold-skeptic).
- **[Harness-Tests]**: Never weaken assertions, delete failing tests, or add `.skip` / `.todo` to manufacture a green receipt (Source: baseline-anti-gaming).
- **[Harness-Compaction]**: Record failed hypotheses and active state in `.harness/PROGRESS.md` via `harness.mjs checkpoint` before compaction, escalation, or exit (Source: baseline-progress-ledger).
- **[Security-Boundary]**: Reviewers, auditors ([security-auditor.md](../agents/security-auditor.md)), and skeptics ([skeptic.md](../agents/skeptic.md)) must stay strictly read-only and never mutate workspace files during audits (Source: baseline-readonly-audit).

## 3. Promoted Project Invariants

<!-- flywheel-promoted-rules-start -->
<!-- flywheel-promoted-rules-end -->

## 4. Promoted Positive Exemplars

<!-- flywheel-exemplars-start -->
<!-- flywheel-exemplars-end -->

## 5. Staged Candidates (Pending Promotion)

<!-- flywheel-staged-rules-start -->
<!-- flywheel-staged-rules-end -->
