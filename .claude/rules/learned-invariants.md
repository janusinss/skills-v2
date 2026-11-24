# Learned Invariants & Memory Flywheel Guardrails

Core project invariants loaded before planning, code edits, or verification gates. See [continuous-agent-loop](../skills/continuous-agent-loop/SKILL.md) for full CLI flags and schemas.

## 1. 3-Tier Memory Flywheel & Budget

- **Tier 1 (`.harness/evals/regressions.jsonl`)**: Captures failures from `verify run`, [skeptic.md](../agents/skeptic.md), or user corrections via `harness.mjs flywheel record`.
- **Tier 2 (This file)**: First-time automated findings stage in Section 4; user corrections, `--promote`, or recurring causes (`>= 2` hits) promote to Section 3 as `- **[<Domain>]**: <Single-sentence invariant>` (optional trailing `(Source: ...)` tags are ignored during dedup).
- **Tier 3 (`.claude/skills/project-<domain>/SKILL.md`)**: Graduate recurring clusters (`>= 3` hits) via `/flywheel` or `harness.mjs flywheel digest --graduate <domain>`, then prune superseded Section 3 bullets.
- **Budget & Scope**: Run `harness.mjs flywheel digest` at `>= 20` promoted bullets, near `12 KB` (`12,288` bytes; `24 KB` cap), or `>= 3` hits per domain. Keep project invariants and `project-*` skills local to target repos; commit only universal workflow invariants in the `Skills` source repo.

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

## 4. Staged Candidates (Pending Promotion)

<!-- flywheel-staged-rules-start -->
<!-- flywheel-staged-rules-end -->
