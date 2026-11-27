---
description: Coordinate parallel Agent subagents with disjoint file ownership, worktree isolation, and Advisor-First model routing
---
Follow [.claude/rules/swarm.md](.claude/rules/swarm.md) to orchestrate parallel `Agent` subagents for: $ARGUMENTS.
1. Run the coordinator on `sonnet` (preserving the user's UI effort) with `"advisorModel": "opus"` configured in user-global `~/.claude/settings.json`.
2. Decompose the task into disjoint file-ownership slices and launch parallel writers with `isolation: "worktree"` (read-only scouts and reviewers run without worktree isolation).
3. Route specialists by Advisor-First frontmatter defaults (`Rung 1–2: sonnet high`, `Rung 3: sonnet medium`, `Rung 4: haiku high`, inheriting user `"advisorModel": "opus"`), reserving per-invocation `Agent(model: "opus")` strictly for Strike-2 escalations after Opus advisor guidance.
4. Rely on the native `SubagentStop` hook (`node .claude/scripts/swarm-subagent-guard.cjs`) for completion reporting, integrate completed worktree changes, and run verification before finishing.
