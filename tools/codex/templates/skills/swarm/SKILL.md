---
name: swarm
description: Run parallel multi-agent workflows in Codex Desktop App and VS Code Extension with Multi-Agent V2, .codex/agents/*.toml profiles, and 4-rung GPT-6.2 routing. Use when splitting tasks across builders, reviewers, or explorers.
license: MIT
---

# Codex `$swarm` Workflow

Follow [rules/swarm.md](../../rules/swarm.md) for model routing, sandbox modes, and concurrency limits.

## 1. Pre-Flight Check

1. Confirm `.codex/config.toml` enables `[features]` (`multi_agent = true`) and `[features.multi_agent_v2]` (`enabled = true`, `default_wait_timeout_ms = 30000`). Reference template: [config.example.toml](../../config.example.toml).
2. Keep the coordinator on the user's chosen `gpt-6.2-astra` (`xhigh` or `max`) or `gpt-6.2-sol` (`xhigh` or `max`). Do not auto-escalate.
3. Partition the task into disjoint file sets before spawning any `workspace-write` worker.

## 2. Spawn Waves

Spawn each worker with its native `.codex/agents/<role>.toml` profile and `fork_turns: "none"` so child threads do not inherit parent effort:

1. **Wave 1 — Recon & Design (`read-only`)**:
   - Spawn `explorer` (`gpt-6.2-sol`, `medium`) to map files and call sites.
   - Spawn Rung 1 roles (`planner`, `code-architect`, `architect`, `a11y-architect`, or `spec-miner`) at `gpt-6.2-sol` (`high`, or `xhigh` for complex multi-module architecture) when design boundaries are unclear.
2. **Wave 2 — Parallel Implementation (`workspace-write`)**:
   - Spawn Rung 2 complex builders (`tdd-guide`, `performance-optimizer`, `penetration-tester`) at `gpt-6.2-sol` (`high`).
   - Spawn Rung 3 routine builders and `*-build-resolver` roles at `gpt-6.2-sol` (`medium`).
   - Include exact owned file paths, forbidden files, and required verification commands in every `spawn_agent` prompt.
3. **Wave 3 — Collect & Verify (`read-only`)**:
   - Block on child completions with native parent `wait` (`default_wait_timeout_ms = 30000`). Send follow-up fixes with `send_input` instead of spawning duplicate workers.
   - Spawn Rung 2 reviewers (`code-reviewer`, stack `*-reviewer`, `silent-failure-hunter`, `security-auditor`, `skeptic`, or `agent-evaluator`) at `gpt-6.2-sol` (`high`) to audit the resulting diff.

## 3. Closure

- Verify every acceptance command passes after the final builder edit.
- Report modified files, verification output, and any unresolved blockers directly to the user.
