---
description: Record a regression guardrail or positive exemplar into the Calibrated Dual-Store Memory Flywheel and checkpoint progress
---
Record a failure root cause, positive exemplar, or invariant and checkpoint task progress for: $ARGUMENTS (or use `/learn` for quick bidirectional insight capture in both Harness and Designer modes).
1. Execute `node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --task <id> --kind <regression|exemplar> --source <skeptic|verify|user> --domain <domain> --cause "<root_cause_or_context>" --rule "<guardrail_or_exemplar_rule>" --promote` to stage into `.harness/evals/regressions.jsonl` (or `exemplars.jsonl`) and promote deduplicated rules to `.claude/rules/learned-invariants.md`.
2. Update `.harness/PROGRESS.md` via `node .claude/skills/continuous-agent-loop/scripts/harness.mjs checkpoint --task <id> --step "<completed_step>"`.
