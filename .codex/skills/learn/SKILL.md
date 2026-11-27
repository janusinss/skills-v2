---
name: "learn"
description: "Capture verified winning playbooks (exemplars) and root-cause anti-patterns (regressions) into the 3-tier memory flywheel with replay gates and decay pruning. Use when running /learn or persisting lessons across Harness and Designer modes."
license: "MIT"
---

# Bidirectional Self-Improvement (`/learn`)

Capture both verified winning playbooks (`exemplar`) and root-cause failure guardrails (`regression`) without bloating root policy files. This workflow applies across Harness Mode and Designer Mode, pairing [learned-invariants.md](../../rules/learned-invariants.md) with `continuous-agent-loop` (in Harness Mode) and [agent-self-evaluation](../agent-self-evaluation/SKILL.md).

All `harness.mjs` commands below invoke `node ../continuous-agent-loop/scripts/harness.mjs` from this skill's directory (or the equivalent workspace path for your edition).

---

## Core Design Guards

- **Evidence Over Summaries**: Extract lessons from raw receipts, `git diff`, test failures, or explicit user corrections—never from unverified chat recaps.
- **Zero Auto-Bloat**: Never append raw reflections directly into root `AGENTS.md` or `CLAUDE.md`. Stage locally first and promote only after verification or approval.
- **Dual Polarity**: Record both `regression` (what broke and how to prevent it) and `exemplar` (verified winning pattern, tool recipe, or `>= 4.5/5` evaluated outcome).
- **Repo Scope Discipline**: Keep project-specific lessons and `project-*` skills local to the target repository. Commit only universal workflow invariants in a shared skills source repository.

---

## 4-Step Bidirectional Self-Improvement Loop

### Step 1: Diagnose from Raw Evidence

Inspect raw artifacts before drafting any lesson:

1. Check `.harness/receipts/<task_id>.json`, `git diff`, test logs, Skeptic JSON output, `evaluate.py --json` output, or the user's explicit correction.
2. Classify the finding into one polarity:
   - **`regression`**: A concrete failure, recurring mistake, Skeptic rejection, or `<= 2/5` evaluator gap. Name the root cause and a single-sentence guardrail rule.
   - **`exemplar`**: A verified winning pattern, repeatable command sequence, Skeptic `verified_exemplars` entry, or `>= 4.5/5` evaluated delivery. Name why it worked and the reusable playbook rule.
3. Attach a deterministic `repro` command whenever one exists (unit test, linter, or verification command).

### Step 2: Stage & Vote Locally First

Stage the candidate locally before touching promoted rules:

```bash
# Harness Mode: stage a regression or exemplar in Tier 1 + Tier 2 Section 5
harness.mjs flywheel record \
  --kind <regression|exemplar> \
  --source <user|skeptic|verify|evaluator|swarm> \
  --domain <domain> \
  --cause "<root cause or verified win>" \
  --rule "<single-sentence reusable guardrail or playbook>" \
  --repro "<optional verification command>"
```

- **Feedback Voting**: Upvote or downvote existing staged or promoted entries based on real task outcomes:
  ```bash
  harness.mjs flywheel feedback --id <id> --vote <helpful|harmful>
  ```
- **Designer Mode / Repos Without `harness.mjs`**: Draft the single-sentence entry directly under Section 5 (`Staged Candidates`) of [learned-invariants.md](../../rules/learned-invariants.md) using the `- **[<Domain>]**: <rule>` format, then review with the user before moving it to Section 3 (`Promoted Project Invariants`) or Section 4 (`Promoted Positive Exemplars`).

### Step 3: Gate Before Promotion

Promotion into always-loaded Tier 2 memory requires either a passing deterministic replay or explicit user approval:

1. If the candidate has a `repro_cmd`, run the replay gate first:
   ```bash
   harness.mjs flywheel test
   ```
2. Present the staged candidate (polarity, domain, evidence, and proposed rule) for user confirmation unless replay already passed and the user explicitly requested auto-promotion.
3. Promote approved candidates into [learned-invariants.md](../../rules/learned-invariants.md):
   ```bash
   harness.mjs flywheel promote --id <id>
   ```
   - `regression` rules land in **Section 3** (`Promoted Project Invariants`, soft cap `<= 20`).
   - `exemplar` playbooks land in **Section 4** (`Promoted Positive Exemplars`, soft cap `<= 8`).

### Step 4: Graduate & Prune

Prevent context rot as lessons accumulate:

1. **Graduate Hot Domains**: When a domain reaches `>= 3` verified hits, or [learned-invariants.md](../../rules/learned-invariants.md) nears `12 KB`, graduate the cluster into an on-demand skill (`project-<domain>/SKILL.md`) and remove superseded bullets:
   ```bash
   harness.mjs flywheel digest --graduate <domain>
   ```
2. **Decay Pruning**: Expire stale 1-hit staged items and net-harmful entries so active memory stays sharp:
   ```bash
   harness.mjs flywheel prune
   ```

---

## Automated Handoffs Into `/learn`

- **Cold-Context Skeptic**: Passing Skeptic JSON into `harness.mjs stamp-skeptic --task <id> --from-json -` records Strike-2/3 state and auto-stages `proposed_flywheel_rule` (`regression`) and `verified_exemplars` (`exemplar`).
- **Self-Evaluation Scorecard**: Piping `evaluate.py --json` into `harness.mjs eval ingest --from-json -` auto-stages `<= 2/5` critical axis gaps as `regression` candidates and verified `>= 4.5/5` deliveries as `exemplar` candidates.

---

## Quick Checklist Before Finishing `/learn`

- [ ] Lesson cites raw evidence (receipt, diff, command output, or user correction).
- [ ] Polarity (`regression` vs `exemplar`) and domain tag are accurate.
- [ ] Root `AGENTS.md` / `CLAUDE.md` was not auto-appended with raw reflections.
- [ ] Promotion respected replay gate / user approval and Section 3 (`<= 20`) / Section 4 (`<= 8`) caps.
- [ ] Stale or clustered entries were pruned or graduated when thresholds were met.
