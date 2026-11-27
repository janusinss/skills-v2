---
description: Record a bidirectional positive exemplar or negative anti-pattern into Project Memory
---
Follow [.claude/skills/learn/SKILL.md](.claude/skills/learn/SKILL.md) to capture a reusable insight for: $ARGUMENTS.
1. Classify the insight as a positive **exemplar** (verified technique, pattern, or workflow to repeat) or negative **regression** (bug root cause, user correction, or guardrail to prevent).
2. Draft the single-sentence entry under Section 5 (`Staged Candidates`) of [.claude/rules/learned-invariants.md](.claude/rules/learned-invariants.md) using `- **[<Domain>]**: <rule>`, and after user approval promote it to Section 3 (`Promoted Project Invariants`, `<= 20`) or Section 4 (`Promoted Positive Exemplars`, `<= 8`).
3. When a domain reaches `>= 3` recurring lessons or `learned-invariants.md` nears `12 KB`, graduate the cluster into `.claude/skills/project-<domain>/SKILL.md` and prune superseded bullets.
