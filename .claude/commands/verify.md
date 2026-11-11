---
description: Run deterministic receipt verification and cold-context @skeptic evaluation
---
Execute deterministic receipt verification and cold-context Skeptic review for: $ARGUMENTS.
1. Run `node .claude/skills/continuous-agent-loop/scripts/harness.mjs verify run --task <id>`.
2. Generate the sanitized brief via `node .claude/skills/continuous-agent-loop/scripts/harness.mjs skeptic-packet --task <id>`.
3. Invoke the @skeptic subagent on `.harness/context/<id>-brief.json` (Contract + Raw Diff + Receipt only, zero author commentary) and stamp its verdict via `node .claude/skills/continuous-agent-loop/scripts/harness.mjs stamp-skeptic --task <id> --verdict <APPROVE|REJECT>`.
