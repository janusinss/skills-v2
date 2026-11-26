---
description: Record a bidirectional positive exemplar or negative anti-pattern into the Memory Flywheel
---
Follow [.claude/skills/learn/SKILL.md](.claude/skills/learn/SKILL.md) to capture a reusable insight for: $ARGUMENTS.
1. Classify the insight as a positive **exemplar** (verified technique, pattern, or workflow to repeat) or negative **regression** (bug root cause, user correction, or guardrail to prevent).
2. Record it via `node .claude/skills/continuous-agent-loop/scripts/harness.mjs flywheel record --kind <regression|exemplar> --source user --domain <domain> --cause "<context>" --rule "<actionable_rule>" --promote` (or directly into `.claude/rules/learned-invariants.md` when running without the harness script).
3. Run `flywheel digest` when a domain reaches 3+ related learnings to graduate recurring clusters into a dedicated project skill.
