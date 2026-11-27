> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.

# Learned Invariants & Project Memory

Core project invariants and winning playbooks loaded before planning or code edits. See [learn](../skills/learn/SKILL.md) for the `$learn` workflow.

## 1. Project Memory Tiers & Budget

- **Tier 2 (This file)**: Promoted Project Invariants (Section 3, `<= 20` soft cap), Promoted Positive Exemplars (Section 4, `<= 8` soft cap), and Staged Candidates (Section 5). Stage new lessons here first and promote only after user approval—never auto-append raw reflections to root policy files.
- **Tier 3 (`.codex/skills/project-<domain>/SKILL.md`)**: Graduate recurring clusters (`>= 3` verified hits) or relieve size pressure near `12 KB` into a dedicated project skill, then prune superseded bullets.
- **Repo Scope**: Keep project invariants, exemplars, and `project-*` skills local to target repos; commit only universal workflow invariants in a shared skills source repo.

## 2. Core Baseline Invariants

- **[Security-Boundary]**: Reviewers and auditors ([security-auditor.md](../agents/security-auditor.md)) must stay strictly read-only and never mutate workspace files during audits (Source: baseline-readonly-audit).

## 3. Promoted Project Invariants

<!-- flywheel-promoted-rules-start -->
<!-- flywheel-promoted-rules-end -->

## 4. Promoted Positive Exemplars

<!-- flywheel-exemplars-start -->
<!-- flywheel-exemplars-end -->

## 5. Staged Candidates (Pending Promotion)

<!-- flywheel-staged-rules-start -->
<!-- flywheel-staged-rules-end -->
