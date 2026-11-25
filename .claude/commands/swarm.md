---
description: Coordinate parallel Agent subagents with disjoint file ownership, worktree isolation, and 4-rung model routing
---
Follow [.claude/rules/swarm.md](.claude/rules/swarm.md) to orchestrate parallel `Agent` subagents for: $ARGUMENTS.
1. Preserve the user's UI coordinator effort (`opus` `xhigh` or `max`; never auto-escalate `xhigh` to `max`).
2. Decompose the task into disjoint file-ownership slices and launch parallel writers with `isolation: "worktree"` (read-only scouts and reviewers run without worktree isolation).
3. Route specialists by the 4-rung table (`Rung 1: opus high`, `Rung 2: sonnet high` or `opus high` for `@security-auditor` / `@skeptic` / Strike-2, `Rung 3: opus medium`, `Rung 4: haiku high`).
4. Rely on the native `SubagentStop` hook (`node .claude/scripts/swarm-subagent-guard.cjs`) for completion reporting, integrate completed worktree changes, and run verification before finishing.
