> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Learned Invariants & Memory Flywheel Guardrails

Read and enforce this rule before planning, modifying code, or running verification gates. This file is the **Promoted Rule Store** of the **Calibrated 3-Tier Memory Flywheel** defined in [continuous-agent-loop](../skills/continuous-agent-loop/SKILL.md).

---

## 1. Calibrated 3-Tier Memory Flywheel

To prevent rule bloat and unverified self-poisoning while compounding negative knowledge across sessions, the harness separates raw failure capture, active rule guardrails, and on-demand domain skills:

1. **Tier 1: Local Regression Store (`.harness/evals/regressions.jsonl`)**:
   - Every deterministic verification failure (`verify run`), Cold-Context Skeptic rejection ([skeptic.md](../agents/skeptic.md)), or explicit user correction is recorded immediately via:
     `node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --task <id> --source <skeptic|verify|user> --domain <domain> --cause "<root_cause>" --rule "<invariant>" --cmd "<repro_cmd>"`
   - Entries in `.harness/evals/regressions.jsonl` capture `{ id, recorded_at, task_id, source, domain, root_cause, rule, repro_cmd, promoted }` (plus optional `{ graduated, graduated_at }`) without polluting git status.
2. **Tier 2: Staged & Promoted Workspace Invariants (`.codex/rules/learned-invariants.md`)**:
   - First-time automated findings (`verify`, `skeptic`) stage inside `<!-- flywheel-staged-rules-start -->` / `<!-- flywheel-staged-rules-end -->` under Section 4.
   - Generalized, deduplicated, single-sentence invariants from user corrections (`--source user`), explicit `--promote`, or recurring root causes (`>= 2` occurrences) promote into `<!-- flywheel-promoted-rules-start -->` / `<!-- flywheel-promoted-rules-end -->` under Section 3.
   - Each promoted entry follows the canonical schema: `- **[<Domain>]**: <Single-sentence invariant> (Source: <task_id/source>)`.
3. **Tier 3: On-Demand Domain Skills (`.codex/skills/project-<domain>/SKILL.md`)**:
   - Recurring domain regression clusters graduate out of always-loaded rules into on-demand domain skills via AGY `/learn` or `/flywheel`, then get marked graduated via `harness.mjs flywheel digest --graduate <domain>`.

### Size Budget & Graduation Policy

- Keep every promoted bullet to one concise sentence.
- Run `node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel digest` and curate this file when any threshold triggers:
  - Promoted rules hit `>= 20` bullets.
  - File size approaches `12 KB` (`12,288` bytes, keeping wide headroom under AGY's `24 KB` file cap and `20,000`-token rules budget).
  - Any domain reaches `>= 3` ungraduated regressions in `.harness/evals/regressions.jsonl`.
- Graduation steps: move recurring domain clusters into on-demand `.codex/skills/project-<domain>/SKILL.md` via AGY `/learn` or `/flywheel`, run `harness.mjs flywheel digest --graduate <domain>`, and prune superseded bullets from Section 3.

### Repo Scope Isolation

- Target apps keep project-specific invariants and `project-<domain>` skills local (add `!/.agents/skills/project-*/` to `.gitignore` if team-shared in git, or the `.codex/` / `.claude/` equivalent).
- The `Skills` source checkout accepts only universal harness and workflow invariants; never commit app-specific rules or `project-*` skills here.

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

---

## 4. Staged Candidates (Pending Promotion)

<!-- flywheel-staged-rules-start -->
<!-- flywheel-staged-rules-end -->
