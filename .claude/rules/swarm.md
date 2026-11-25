# Swarm Orchestration & 4-Rung Model Routing (Claude Code)

Apply whenever running `/swarm`, orchestrating parallel `Agent` subagents, or assigning specialist models in Claude Code (VS Code Extension or Desktop App).

## 1. Execution Engine (Non-CLI)

- **Parallel `Agent` Subagents**: Launch independent workers in parallel using Claude Code's built-in `Agent` tool. Works directly in the VS Code Extension and Desktop App with zero tmux or CLI flag requirements.
- **Worktree Isolation**: Pass `isolation: "worktree"` for parallel writers that edit files or run builds concurrently. Read-only scouts, reviewers, and auditors run without worktree isolation.
- **Disjoint File Ownership**: Assign each parallel writer an explicit, non-overlapping file list before launching. Two parallel writers must never edit the same file.
- **Integration**: Review each writer's diff, merge or apply worktree changes back into the coordinator workspace, run verification commands, and remove temporary worktrees before finishing.

## 2. Coordinator Policy (UI Lead)

- **UI Model & Effort**: Run the `/swarm` coordinator on `opus` with `xhigh` or `max` effort.
- **Preserve UI Choice**: Keep whichever effort level (`xhigh` or `max`) the user selected in the UI. This applies only when chosen; never auto-escalate `xhigh` to `max`.
- **Coordinator Scope**: Decompose tasks, assign exclusive file ownership, synthesize subagent findings, resolve Strike-2 failures, and deliver the final report.

## 3. 4-Rung Subagent Model Routing

Every specialist agent under [.claude/agents/](../agents) pins `model:` and `effort:` frontmatter to the following 4-rung table:

| Rung | Model & Effort | Agents |
| :--- | :--- | :--- |
| **Rung 1 — Architects & Planners** | `model: opus`, `effort: high` | `a11y-architect`, `architect`, `code-architect`, `planner`, `spec-miner` |
| **Rung 2 — High-Stakes Security, Skeptic & Strike-2** | `model: opus`, `effort: high` | `security-auditor`, `skeptic`, and Strike-2 escalations |
| **Rung 2 — Reviewers, Evaluators & Complex Builders** | `model: sonnet`, `effort: high` | `agent-evaluator`, `code-reviewer`, `database-reviewer`, `fastapi-reviewer`, `go-reviewer`, `php-reviewer`, `react-reviewer`, `rust-reviewer`, `silent-failure-hunter`, `typescript-reviewer`, `vue-reviewer`, `tdd-guide`, `performance-optimizer`, `penetration-tester` |
| **Rung 3 — Routine Builders & Build Resolvers** | `model: opus`, `effort: medium` | `code-simplifier`, `refactor-cleaner`, `e2e-runner`, `build-error-resolver`, `cpp-build-resolver`, `django-build-resolver`, `go-build-resolver`, `pytorch-build-resolver`, `react-build-resolver`, `rust-build-resolver` |
| **Rung 4 — Explorer / Recon / Simple Checks** | `model: haiku`, `effort: high` | `explorer` |

## 4. Closure Guard (`SubagentStop` Hook)

- **Native Hook (No Polling Worker)**: Claude Code enforces subagent reporting via the native `SubagentStop` hook running `node .claude/scripts/swarm-subagent-guard.cjs` ([swarm-subagent-guard.cjs](../scripts/swarm-subagent-guard.cjs)). Do not spawn a background polling monitor worker.
- **Completion Contract**: Every subagent must end with a non-empty summary listing modified files or verified findings. If `last_assistant_message` is empty, `swarm-subagent-guard.cjs` exits `2` with a stderr prompt requiring a completion report before closing.
