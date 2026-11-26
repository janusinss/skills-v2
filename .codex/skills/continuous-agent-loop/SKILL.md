---
name: "continuous-agent-loop"
description: "Run autonomous agent loops with quality gates, evaluation checkpoints, dual-polarity ACE memory flywheel, and failure recovery. Use when orchestrating self-checking multi-step agent loops."
metadata:
  origin: "ECC"
---

# Continuous Agent Loop (Self-Improving 6-Stage Harness)

This skill orchestrates the **Compounding Self-Improving Agent Harness** using the zero-dependency CLI at `.codex/skills/continuous-agent-loop/scripts/harness.mjs`. Every non-trivial task progresses through six deterministic gates with worktree-scoped pointers, live diff-freshness verification, Strike-2/3 escalation, and a dual-polarity ACE memory flywheel.

---

## 1. Architecture & Runtime State Layout

All runtime state lives inside the git-ignored `.harness/` directory. Stage 6 routes curated guardrails and positive exemplars through `.codex/rules/learned-invariants.md` and graduates recurring clusters into on-demand `.codex/skills/project-<domain>/SKILL.md`:

```text
<workspace-root>/
├── .harness/                                # Git-ignored runtime state
│   ├── contracts/<task_id>.json             # Stage 1: Pre-flight task contract (allowed_paths, acceptance_commands)
│   ├── worktree-tasks/<hash>.json           # Worktree-scoped active task pointer (parallel swarm safe)
│   ├── worktrees/<task_id>/                 # Stage 2: Ephemeral git worktree (branch agent/<task_id>)
│   ├── receipts/<task_id>.json              # Stage 4: Verifier output + diff_sha256 + Strike counter + Skeptic stamp
│   ├── context/<task_id>-brief.json         # Stage 5: Cold-context packet (contract + raw git_diff + receipt ONLY)
│   ├── evals/regressions.jsonl              # Stage 6 (Tier 1): Negative failure ledger & repro commands
│   ├── evals/exemplars.jsonl                # Stage 6 (Tier 1): Verified positive playbooks & evidence commands
│   ├── evals/orchestration-metrics.jsonl    # Run telemetry (strikes, rework, stalls, scope blocks)
│   └── PROGRESS.md                          # Cross-session compaction ledger (checkpoints + failed hypotheses)
├── .codex/rules/learned-invariants.md      # Stage 6 (Tier 2): Promoted invariants (<=20), exemplars (<=8), staged
└── .codex/skills/project-<domain>/SKILL.md # Stage 6 (Tier 3): Graduated on-demand domain skills
```

---

## 2. The 6-Stage Self-Improving Lifecycle

```text
[SessionStart Memory Brief] --> [1. Contract Init] --> [2. Adaptive Worktree] --> [3. Scoped Builder + Sensor]
                                                                                           |
[6. Dual-Polarity Flywheel & Checkpoint] <-- [5. Cold-Context Skeptic] <-- [4. Deterministic Verify Receipt]
```

### Stage 1: Pre-Flight Contract (`contract init`)
Lock file scope (`allowed_paths`), acceptance commands (`acceptance_commands`), turn budget, and isolation mode before editing code:

```bash
node .codex/skills/continuous-agent-loop/scripts/harness.mjs contract init \
  --task feat-auth-rate-limit \
  --allow "src/auth/**,tests/auth/**" \
  --cmd "npm test,npm run typecheck" \
  --max-turns 15 \
  --mode adaptive
```

- Stores active task pointers per git worktree in `.harness/worktree-tasks/<hash>.json` (with `.harness/active-task.json` fallback for single-worktree setups) so parallel swarm shards never clobber one another.
- **Modes**: `adaptive` (default; single-file under 20 lines in-tree, multi-file in worktree), `worktree` (strict isolation), `in-tree` (in-place with scope enforcement).

### Stage 2: Adaptive Worktree Isolation (`worktree spawn|merge|abort`)
Isolate multi-file or parallel builder mutations on branch `agent/<task_id>`:

```bash
node .codex/skills/continuous-agent-loop/scripts/harness.mjs worktree spawn --task feat-auth-rate-limit
node .codex/skills/continuous-agent-loop/scripts/harness.mjs worktree merge --task feat-auth-rate-limit
node .codex/skills/continuous-agent-loop/scripts/harness.mjs worktree abort --task feat-auth-rate-limit
```

### Stage 3: Builder Execution & Boundary Sensor (`sensor check-file`)
During implementation, the `PreToolUse` / `PostToolUse` hook runs `sensor check-file` in `<50ms`:

```bash
node .codex/skills/continuous-agent-loop/scripts/harness.mjs sensor check-file --file src/auth/limiter.ts --task feat-auth-rate-limit
node .codex/skills/continuous-agent-loop/scripts/harness.mjs sensor check-file --hook antigravity
```

- Resolves workspace root from stdin `cwd` or `workspacePaths[0]` and extracts file targets from `toolCall.args` (`Path`, `TargetFile`, `file_path`, `path`, `File`, `paths`) alongside `tool_input`/`input`.
- Under `--hook antigravity`, outputs JSON `{"decision":"allow"}` or `{"decision":"deny","reason":"..."}` and exits `0`. Under Claude/Codex or CLI mode, prints to stderr and exits `2` on scope or protected-path violations.

### Stage 4: Deterministic Receipt, Strike Counter & Freshness Gate (`verify run` & `verify status-check`)
Generate a cryptographic verification receipt and track consecutive failures:

```bash
node .codex/skills/continuous-agent-loop/scripts/harness.mjs verify run --task feat-auth-rate-limit
node .codex/skills/continuous-agent-loop/scripts/harness.mjs verify status-check --hook antigravity
```

- `verify run`: Validates `allowed_paths`, executes every `acceptance_commands` entry, hashes `git diff HEAD` (`diff_sha256`), tracks `consecutive_failures` (`strike` / `escalation_action`), auto-stages a local regression entry on `FAIL`, and prints `[STRIKE 2: ESCALATE TO ARCHITECT/BRAIN]` at 2 or `[STRIKE 3: CIRCUIT BREAKER — STOP & ASK USER]` at `>= 3`.
- `verify status-check`: Verifies `receipt.status === "PASS"`, `skeptic_verdict !== "REJECT"`, and recomputes live `git diff HEAD` SHA-256 against `receipt.diff_sha256` (blocks if files were edited after `PASS`).

### Stage 5: Cold-Context Adversarial Skeptic & Evaluator Ingestion (`skeptic-packet`, `stamp-skeptic`, `eval ingest`)
Strip all builder prose before adversarial review and ingest structured verdicts:

```bash
# 1. Build sanitized brief containing ONLY { contract, git_diff, receipt }
node .codex/skills/continuous-agent-loop/scripts/harness.mjs skeptic-packet --task feat-auth-rate-limit

# 2. Stamp Skeptic verdict from JSON (auto-stages blocking_issues & verified_exemplars) or manual flags
node .codex/skills/continuous-agent-loop/scripts/harness.mjs stamp-skeptic --task feat-auth-rate-limit --from-json -
node .codex/skills/continuous-agent-loop/scripts/harness.mjs stamp-skeptic --task feat-auth-rate-limit --verdict APPROVE --reason "All invariants verified."

# 3. Ingest agent-evaluator scorecard JSON (axes <= 2 stage regressions; verified avg >= 4.5 stage exemplars)
node .codex/skills/continuous-agent-loop/scripts/harness.mjs eval ingest --from-json - --task feat-auth-rate-limit
```

- `stamp-skeptic` increments `consecutive_failures` on `REJECT` and resets to `0` on `PASS` + `APPROVE`.

### Stage 6: Dual-Polarity ACE Memory Flywheel, Rule Lifecycle & Compaction
Prevent context bloat by staging all new findings locally until explicitly promoted or verified by replay:

```bash
# 1. Record negative regression or positive exemplar (NEVER auto-promotes unless --promote is passed)
node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel record \
  --kind regression --source skeptic --domain auth \
  --cause "X-Forwarded-For spoofing bypassed rate limiter" \
  --rule "Parse client IP from the trusted hop in X-Forwarded-For before rate-limiting." \
  --repro "npm test -- tests/auth/limiter.spec.ts"

node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel record \
  --kind exemplar --source evaluator --domain auth \
  --cause "Zero-regression proxy IP parser with table-driven tests" \
  --rule "Table-drive trusted-hop header parsing against single, chained, and malformed IPs." \
  --repro "npm test -- tests/auth/limiter.spec.ts" --trigger "Editing HTTP proxy headers" --score 4.8

# 2. Explicitly promote a staged entry by ID & vote ACE counters
node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel promote --id reg-1234567890
node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel feedback --id ex-1234567890 --vote helpful

# 3. Replay recorded repro/evidence commands, prune stale/duplicate items, and graduate domain clusters
node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel test --domain auth --timeout 30
node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel prune --max-age-days 30 --dry-run
node .codex/skills/continuous-agent-loop/scripts/harness.mjs flywheel digest --graduate auth --edition agents

# 4. Checkpoint atomic progress and failed hypotheses into .harness/PROGRESS.md
node .codex/skills/continuous-agent-loop/scripts/harness.mjs checkpoint \
  --task feat-auth-rate-limit \
  --step "Verified IP extraction and stamped Skeptic approval" \
  --failed-hypothesis "Splitting X-Forwarded-For on index 0 trusted spoofed headers"
```

- **Anti-Bloat Promotion Gate**: `flywheel record` writes to `.harness/evals/regressions.jsonl` (`reg-...`) or `.harness/evals/exemplars.jsonl` (`ex-...`) and stages in `learned-invariants.md` Staged Candidates. Only `--promote` or `flywheel promote --id <id>` moves entries into Promoted Project Invariants (`<= 20` cap) or Promoted Positive Exemplars (`<= 8` cap). Only regressions are logged under `Failed Hypotheses` in `PROGRESS.md`.
- **Automated Graduation (`--graduate <domain>`)**: Scaffolds `.<edition>/skills/project-<domain>/SKILL.md` (`Pitfalls & Anti-Patterns`, `Verified Playbooks & Exemplars`, `Verification Commands`), prunes superseded `<domain>` bullets from `learned-invariants.md`, and marks matching JSONL entries `graduated: true`.
- **Pruning (`flywheel prune`)**: Merges duplicates with Jaccard token overlap `>= 0.75`, expires stale 1-hit unpromoted items older than `--max-age-days`, and removes net-harmful entries (`harmful > helpful + 1`).

---

## 3. Just-in-Time Memory Brief & Orchestration Telemetry

```bash
# SessionStart active memory brief (hard-capped <= 600 bytes; emits {} on clean workspaces)
node .codex/skills/continuous-agent-loop/scripts/harness.mjs memory brief --hook antigravity --max-bytes 600

# Record and summarize orchestration telemetry (.harness/evals/orchestration-metrics.jsonl)
node .codex/skills/continuous-agent-loop/scripts/harness.mjs telemetry record \
  --workflow swarm --event wave_complete --strikes 0 --rework 1 --stalls 0 --scope-blocks 0 --outcome ok
node .codex/skills/continuous-agent-loop/scripts/harness.mjs telemetry summary
```

---

## 4. Optional Pre-Commit Git Hook & Loop Recovery

```bash
node .codex/skills/continuous-agent-loop/scripts/harness.mjs install-git-hook
node .codex/skills/continuous-agent-loop/scripts/harness.mjs pre-commit-check
```

| Loop Pattern | When to Use | Harness Configuration |
| :--- | :--- | :--- |
| **Single-File Fast Path** | `<20` lines in 1 file | `--mode adaptive` (in-tree with `sensor` + `verify`) |
| **Standard Feature / Bugfix** | Multi-file feature or refactor | `--mode worktree` + full 6-stage Skeptic & Flywheel gate |
| **Parallel Swarm Shards** | Independent module slices | One contract + worktree pointer per shard (`--task shard-1`, `--task shard-2`) |

1. Run `harness.mjs checkpoint` with `--failed-hypothesis` before compaction or escalation.
2. On **Strike 2**, escalate from Builder tier to Brain tier (`code-architect`) for root-cause re-architecture.
3. On **Strike 3**, trigger the Circuit Breaker: stop editing and present the invalid assumption plus a diagnostic choice, or run `harness.mjs worktree abort --task <id>`.
