# Swarm Orchestration & Advisor-First Model Routing (Claude Code)

Apply whenever running `/swarm`, orchestrating parallel `Agent` subagents, or assigning specialist models in Claude Code (VS Code Extension or Desktop App).

## 1. Execution Engine (Non-CLI)

- **Parallel `Agent` Subagents**: Launch independent workers in parallel using Claude Code's built-in `Agent` tool. Works directly in the VS Code Extension and Desktop App with zero tmux or CLI flag requirements.
- **Worktree Isolation**: Pass `isolation: "worktree"` for parallel writers that edit files or run builds concurrently. Read-only scouts, reviewers, and auditors run without worktree isolation.
- **Disjoint File Ownership**: Assign each parallel writer an explicit, non-overlapping file list before launching. Two parallel writers must never edit the same file.
- **Integration**: Review each writer's diff, merge or apply worktree changes back into the coordinator workspace, run verification commands, and remove temporary worktrees before finishing.
- **Preferred Over Experimental Agent Teams**: Prefer worktree `Agent` subagents over `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` on Windows, VS Code, and Desktop (no tmux panes; in-process fallback loses teammates on `/resume` and `/rewind`).

## 2. Coordinator Policy (UI Lead)

- **UI Model & Advisor**: Recommend running the `/swarm` coordinator on `sonnet` with user-global `"advisorModel": "opus"` configured in `~/.claude/settings.json`.
- **Preserve UI Effort & Prompt Cache**: Preserve the user's selected UI effort and omit `model:` from `/swarm` command frontmatter to avoid double prompt-cache invalidation and turn-2 revert on non-Sonnet sessions.
- **Coordinator Scope**: Decompose tasks, assign exclusive file ownership, synthesize subagent findings, resolve Strike-2 failures, and deliver the final report.

## 3. Advisor-First Subagent Model Routing

Every specialist agent under [.claude/agents/](../agents) pins `model:` and `effort:` frontmatter to the following Advisor-First table (zero `model: opus` frontmatter):

| Rung | Model & Effort | Agents |
| :--- | :--- | :--- |
| **Rung 1 — Architects & Planners** | `model: sonnet`, `effort: high` (+ inherited Opus advisor) | `a11y-architect`, `architect`, `code-architect`, `planner`, `spec-miner` |
| **Rung 2 — Security, Skeptic, Reviewers, Evaluators & Complex Builders** | `model: sonnet`, `effort: high` (+ inherited Opus advisor) | `security-auditor`, `skeptic`, `agent-evaluator`, `code-reviewer`, `database-reviewer`, `fastapi-reviewer`, `go-reviewer`, `php-reviewer`, `react-reviewer`, `rust-reviewer`, `silent-failure-hunter`, `typescript-reviewer`, `vue-reviewer`, `tdd-guide`, `performance-optimizer`, `penetration-tester` |
| **Rung 3 — Routine Builders & Build Resolvers** | `model: sonnet`, `effort: medium` (+ inherited Opus advisor) | `code-simplifier`, `refactor-cleaner`, `e2e-runner`, `build-error-resolver`, `cpp-build-resolver`, `django-build-resolver`, `go-build-resolver`, `pytorch-build-resolver`, `react-build-resolver`, `rust-build-resolver` |
| **Rung 4 — Explorer / Recon / Simple Checks** | `model: haiku`, `effort: high` | `explorer` |
| **Strike-2 Exception — Per-Invocation Escalation** | `Agent(model: "opus")` only after Opus advisor fails twice | Any specialist escalated on Strike-2 after two failed attempts with Opus advisor guidance |

- **Zero `model: opus` Frontmatter**: Keeping every agent's frontmatter on `sonnet` or `haiku` prevents Opus-on-Opus advisor overlap (`advisor >= executor`) across both `/swarm` orchestration and direct `@agent` calls.
- **Haiku Advisor Inheritance**: `haiku` subagents (such as `explorer`) also inherit the session's `advisorModel` when configured.
- **Model Precedence (Claude Code v2.1.251+)**: `Agent` tool `model:` > agent frontmatter `model:` > `CLAUDE_CODE_SUBAGENT_MODEL` > parent session model. Never set `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`, which overrides per-agent frontmatter and breaks Advisor-First routing.

## 4. Closure Guard (`SubagentStop` Hook)

- **Native Hook (No Polling Worker)**: Claude Code enforces subagent reporting via the native `SubagentStop` hook running `node .claude/scripts/swarm-subagent-guard.cjs` ([swarm-subagent-guard.cjs](../scripts/swarm-subagent-guard.cjs)). Do not spawn a background polling monitor worker.
- **Completion Contract**: Every subagent must end with a non-empty summary listing modified files or verified findings. If `last_assistant_message` is empty, `swarm-subagent-guard.cjs` exits `2` with a stderr prompt requiring a completion report before closing.
