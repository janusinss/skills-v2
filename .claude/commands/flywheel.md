---
description: Record a root-cause invariant into the Calibrated Dual-Store Memory Flywheel and checkpoint progress
---
Record a failure root cause or invariant and checkpoint task progress for: $ARGUMENTS.
1. Execute `node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --task <id> --source <skeptic|verify|user> --domain <domain> --cause "<root_cause>" --rule "<guardrail_rule>" --promote` to stage into `.harness/evals/regressions.jsonl` and promote deduplicated guardrails to `.claude/rules/learned-invariants.md`.
2. Update `.harness/PROGRESS.md` via `node .claude/skills/continuous-agent-loop/scripts/harness.mjs checkpoint --task <id> --step "<completed_step>"`.
