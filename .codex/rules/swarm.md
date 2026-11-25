# Codex Swarm Policy (Desktop App & VS Code Extension)

Apply this rule when running `$swarm` or spawning subagents with Multi-Agent V2 in the Codex Desktop App or VS Code Extension.

## 1. Execution Engine & Configuration

- **Multi-Agent V2**: Enable `[features]` (`multi_agent = true`) and `[features.multi_agent_v2]` in `.codex/config.toml` (template: [config.example.toml](../config.example.toml)).
- **Native Role Profiles**: Spawn specialists from `.codex/agents/<role>.toml` so each child receives its pinned `model`, `model_reasoning_effort`, `sandbox_mode`, and `developer_instructions`.
- **No Parent Effort Inheritance**: Pass `fork_turns: "none"` on every `spawn_agent` call so child agents start from their `.toml` profile instead of inheriting parent `xhigh` or `max` effort.
- **Native Parent Wait**: Use native parent `wait` (`default_wait_timeout_ms = 30000`) to collect child completions. Do not spawn a polling monitor worker.

## 2. Coordinator & 4-Rung Model Routing

There is no separate capped mode. Preserve the coordinator model and effort selected by the user in the UI or `.codex/config.toml`, and never auto-escalate it.

| Role / Rung | Model & Effort | Sandbox | Agents (`.codex/agents/<role>.toml`) |
| :--- | :--- | :--- | :--- |
| **Coordinator** (UI / `.codex/config.toml`) | `gpt-6.2-astra` (`xhigh` or `max`) OR `gpt-6.2-sol` (`xhigh` or `max`) — preserve user choice | Workspace | Parent session |
| **Rung 1 — Architects & Planners** | `gpt-6.2-sol` (`high`; `xhigh` for complex multi-module architecture) | `read-only` | `a11y-architect`, `architect`, `code-architect`, `planner`, `spec-miner` |
| **Rung 2 — Reviewers, Verifiers & Security** | `gpt-6.2-sol` (`high`) | `read-only` | `security-auditor`, `skeptic`, `agent-evaluator`, `code-reviewer`, `database-reviewer`, `fastapi-reviewer`, `go-reviewer`, `php-reviewer`, `react-reviewer`, `rust-reviewer`, `silent-failure-hunter`, `typescript-reviewer`, `vue-reviewer` |
| **Rung 2 — Complex Builders** | `gpt-6.2-sol` (`high`) | `workspace-write` | `tdd-guide`, `performance-optimizer`, `penetration-tester` |
| **Rung 3 — Routine Builders & Build Resolvers** | `gpt-6.2-sol` (`medium`) | `workspace-write` | `code-simplifier`, `refactor-cleaner`, `e2e-runner`, `build-error-resolver`, `cpp-build-resolver`, `django-build-resolver`, `go-build-resolver`, `pytorch-build-resolver`, `react-build-resolver`, `rust-build-resolver` |
| **Rung 4 — Explorer / Recon / Test Runners** | `gpt-6.2-sol` (`medium`) | `read-only` | `explorer` |

## 3. File Ownership & Concurrency Rules

1. **Disjoint Write Scopes**: Assign each writable worker an explicit, non-overlapping file list. Two `workspace-write` workers must never edit the same file in parallel.
2. **Read-Only First**: Run Rung 4 (`explorer`) and Rung 1 (`planner` / `code-architect`) before dispatching parallel builders when the task spans 3 or more files.
3. **Direct Task Briefs**: Send concrete file paths, acceptance checks, and exact stop conditions via `spawn_agent` or `send_input`.
4. **Rung 2 Verification Gate**: After builders finish, collect results with `wait` and run matching Rung 2 read-only reviewers (stack `*-reviewer`, `silent-failure-hunter`, `security-auditor`, or `skeptic`) before reporting done.
5. **Strike-2 Escalation**: After 2 failed verification passes on the same issue, route root-cause redesign to Rung 1 (`code-architect` at `xhigh`) or resolve it in the coordinator session.
