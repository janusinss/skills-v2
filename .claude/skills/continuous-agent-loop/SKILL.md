---
name: continuous-agent-loop
description: "Run autonomous agent loops with quality gates, evaluation checkpoints, and failure recovery. Use when orchestrating self-checking multi-step agent loops."
---

# Continuous Agent Loop (Self-Improving 6-Stage Harness)

This skill orchestrates the **Compounding Self-Improving Agent Harness** using the zero-dependency CLI at `.claude/skills/continuous-agent-loop/scripts/harness.mjs`. Every non-trivial task progresses through six deterministic gates so agents cannot widen scope silently, rationalize broken tests, or repeat prior root-cause failures after context compaction.

---

## 1. Architecture & Runtime State Layout

All runtime state lives inside the git-ignored `.harness/` directory, while durable root-cause invariants promote into `.claude/rules/learned-invariants.md`:

```text
<workspace-root>/
├── .harness/                          # Git-ignored runtime state
│   ├── contracts/<task_id>.json       # Stage 1: Pre-flight task contract (allowed_paths, acceptance_commands)
│   ├── worktrees/<task_id>/           # Stage 2: Ephemeral git worktree (branch agent/<task_id>)
│   ├── receipts/<task_id>.json        # Stage 4: Deterministic verifier output + diff_sha256 + Skeptic stamp
│   ├── context/<task_id>-brief.json   # Stage 5: Cold-context packet (contract + raw git_diff + receipt ONLY)
│   ├── evals/regressions.jsonl        # Stage 6: Structured failure ledger & repro commands
│   └── PROGRESS.md                    # Cross-session compaction ledger (checkpoints + failed hypotheses)
└── .claude/rules/learned-invariants.md # Stage 6: Auto-promoted workspace guardrails
```

---

## 2. The 6-Stage Self-Improving Lifecycle

```text
[1. Contract Init] --> [2. Adaptive Worktree] --> [3. Scoped Builder + PreToolUse Sensor]
                                                            |
[6. Memory Flywheel & Checkpoint] <-- [5. Cold-Context Skeptic] <-- [4. Deterministic Verify Receipt]
```

### Stage 1: Pre-Flight Contract (`contract init`)
Lock file scope (`allowed_paths`), acceptance commands (`acceptance_commands`), turn budget, and isolation mode before editing any code:

```bash
node .claude/skills/continuous-agent-loop/scripts/harness.mjs contract init \
  --task feat-auth-rate-limit \
  --allow "src/auth/**,tests/auth/**" \
  --cmd "npm test,npm run typecheck" \
  --max-turns 15 \
  --mode adaptive
```

- Writes `.harness/contracts/<task_id>.json` and initializes `.harness/PROGRESS.md`.
- **Modes**:
  - `adaptive` (default): Single-file edits under 20 changed lines may run in-tree; multi-file or parallel work spawns an isolated worktree.
  - `worktree`: Strictly requires `.harness/worktrees/<task_id>`.
  - `in-tree`: Runs directly in the working tree while still enforcing `allowed_paths`.

### Stage 2: Adaptive Worktree Isolation (`worktree spawn|merge|abort`)
Isolate multi-file or parallel builder mutations on branch `agent/<task_id>`:

```bash
# Spawn isolated worktree at .harness/worktrees/<task_id>
node .claude/skills/continuous-agent-loop/scripts/harness.mjs worktree spawn --task feat-auth-rate-limit

# Merge back ONLY after receipt status === PASS and skeptic_verdict === APPROVE
node .claude/skills/continuous-agent-loop/scripts/harness.mjs worktree merge --task feat-auth-rate-limit

# Discard failed experiment cleanly without polluting the main tree
node .claude/skills/continuous-agent-loop/scripts/harness.mjs worktree abort --task feat-auth-rate-limit
```

### Stage 3: Builder Execution & Sub-Second Boundary Sensor (`sensor check-file`)
During implementation (`tdd-guide`, `build-error-resolver`), the `PreToolUse` hook runs `sensor check-file` in `<50ms`:

```bash
node .claude/skills/continuous-agent-loop/scripts/harness.mjs sensor check-file --file src/auth/limiter.ts --task feat-auth-rate-limit
```

- Exits `2` (blocking tool execution) if `<file>` falls outside `contract.allowed_paths` or attempts to tamper with `.harness/receipts/**`, `.harness/contracts/**`, or `.git/hooks/**`.
- **2-Strike Escalation**: If the Builder (`tier: builder`) fails verification twice on the same issue, escalate to a Brain-tier agent (`code-architect` or `planner`) before hitting the 3-strike circuit breaker.

### Stage 4: Deterministic Model-Free Verification Receipt (`verify run`)
Never trust self-rated prose. Generate a cryptographic verification receipt:

```bash
node .claude/skills/continuous-agent-loop/scripts/harness.mjs verify run --task feat-auth-rate-limit
```

- Checks `git status --porcelain` against `allowed_paths`.
- Executes every command in `acceptance_commands` and records exit codes, durations, and `stdout_sha256` / `stderr_sha256`.
- Hashes `git diff HEAD` (`diff_sha256`) and writes `.harness/receipts/<task_id>.json` (`status: "PASS" | "FAIL"`).

### Stage 5: Cold-Context Adversarial Skeptic (`skeptic-packet` & `stamp-skeptic`)
Strip all builder chain-of-thought and excuses before adversarial review:

```bash
# 1. Build sanitized brief containing ONLY { contract, git_diff, receipt }
node .claude/skills/continuous-agent-loop/scripts/harness.mjs skeptic-packet --task feat-auth-rate-limit

# 2. Invoke read-only @skeptic (tier: brain) on .harness/context/feat-auth-rate-limit-brief.json
# 3. Stamp Skeptic verdict into .harness/receipts/<task_id>.json
node .claude/skills/continuous-agent-loop/scripts/harness.mjs stamp-skeptic \
  --task feat-auth-rate-limit \
  --verdict APPROVE \
  --reason "All contract invariants and rate-limit edge cases verified."
```

If `@skeptic` returns `REJECT`, run `stamp-skeptic --verdict REJECT --reason "..."` and immediately record the failure in Stage 6.

### Stage 6: Calibrated Dual-Store Memory Flywheel & Compaction (`flywheel record` & `checkpoint`)
Convert every verify failure, Skeptic rejection, or user correction into permanent regression protection:

```bash
# Record failure in .harness/evals/regressions.jsonl and stage/promote rule to learned-invariants.md
node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record \
  --task feat-auth-rate-limit \
  --source skeptic \
  --domain auth \
  --cause "Rate limiter bypassed when X-Forwarded-For header contains comma-separated IPs" \
  --rule "Parse and validate the client IP from the trusted hop in X-Forwarded-For before rate-limiting." \
  --cmd "npm test -- tests/auth/limiter.spec.ts" \
  --promote

# Checkpoint atomic progress and negative knowledge into .harness/PROGRESS.md
node .claude/skills/continuous-agent-loop/scripts/harness.mjs checkpoint \
  --task feat-auth-rate-limit \
  --step "Verified IP extraction and stamped Skeptic approval" \
  --failed-hypothesis "Splitting X-Forwarded-For on index 0 trusted spoofed client headers"
```

- **Calibration Rule**: User corrections (`--source user`), explicit `--promote`, or recurring root causes (`>=2` occurrences in `regressions.jsonl`) promote directly to `## Promoted Guardrails` in `.claude/rules/learned-invariants.md`. First-time automated findings stage under `## Staged Candidates (Pending Promotion)` to prevent rule bloat.

---

## 3. Optional Pre-Commit Git Hook

Enforce that no commit lands while an active harness task lacks a `PASS` + `APPROVE` receipt matching the current `diff_sha256`:

```bash
node .claude/skills/continuous-agent-loop/scripts/harness.mjs install-git-hook
node .claude/skills/continuous-agent-loop/scripts/harness.mjs pre-commit-check
```

---

## 4. Loop Topology Selection & Failure Recovery

| Loop Pattern | When to Use | Harness Configuration |
| :--- | :--- | :--- |
| **Single-File Fast Path** | `<20` lines in 1 file | `--mode adaptive` (executes in-tree with `sensor` + `verify`) |
| **Standard Feature / Bugfix** | Multi-file feature or refactor | `--mode worktree` + full 6-stage Skeptic & Flywheel gate |
| **Parallel Swarm Shards** | Independent module slices | One contract + worktree per shard (`--task shard-1`, `--task shard-2`) |

### Recovery Protocol on Loop Stall
1. Run `harness.mjs checkpoint` with `--failed-hypothesis` so negative knowledge is preserved before `/compact`.
2. Inspect `.harness/receipts/<task_id>.json` and `.harness/evals/regressions.jsonl`.
3. On 2 consecutive failures, escalate from `tier: builder` to `tier: brain` (`code-architect`).
4. On 3 failures, trigger the **3-Strike Circuit Breaker** (`AGENTS.md` §1) or run `harness.mjs worktree abort --task <id>`.
