---
name: agent-evaluation
description: "Test and benchmark LLM agents: behavioral testing, capability assessment, reliability metrics and production monitoring. Use when evaluating agent quality, building agent test suites or measuring reliability."
---

# Agent Evaluation

Testing and benchmarking LLM agents including behavioral testing, capability assessment, reliability metrics, and production monitoring—where even top agents achieve less than 50% on real-world benchmarks

## Capabilities

- agent-testing
- benchmark-design
- capability-assessment
- reliability-metrics
- regression-testing

## Prerequisites

- Knowledge: Testing methodologies, Statistical analysis basics, LLM behavior patterns
- Skills_recommended: autonomous-agents, multi-agent-orchestration
- Required skills: testing-fundamentals, llm-fundamentals

## Scope

- Does_not_cover: Model training evaluation (loss, perplexity), Fairness and bias testing, User experience testing
- Boundaries: Focus is agent capability and reliability, Covers functional and behavioral testing

## Ecosystem

### Primary_tools

- AgentBench - Multi-environment benchmark for LLM agents (ICLR 2024)
- τ-bench (Tau-bench) - Sierra's real-world agent benchmark
- ToolEmu - Risky behavior detection for agent tool use
- Langsmith - LLM tracing and evaluation platform

### Alternatives

- Braintrust - When: Need production monitoring integration LLM evaluation and monitoring
- PromptFoo - When: Focus on prompt-level evaluation Prompt testing framework

### Deprecated

- Manual testing only

## Patterns

## References

- [references/statistical-and-contract-testing.md](references/statistical-and-contract-testing.md): Read this when writing statistical test evaluations or behavioral contract tests.
- [references/adversarial-and-regression-testing.md](references/adversarial-and-regression-testing.md): Read this when building adversarial test suites or a regression testing pipeline.
- [references/sharp-edges-benchmarks-and-flaky-tests.md](references/sharp-edges-benchmarks-and-flaky-tests.md): Read this when an agent scores well on benchmarks but fails in production, or tests pass intermittently.
- [references/sharp-edges-metric-gaming-and-data-leakage.md](references/sharp-edges-metric-gaming-and-data-leakage.md): Read this when an agent optimizes a metric instead of the task, or test data may have leaked into training or prompts.

## Collaboration

### Delegation Triggers

- implement|fix|improve -> autonomous-agents (Need to fix issues found in evaluation)
- orchestration|coordination -> multi-agent-orchestration (Need to evaluate orchestration patterns)
- communication|message -> agent-communication (Need to evaluate communication)

### Complete Agent Development Cycle

Skills: agent-evaluation, autonomous-agents, multi-agent-orchestration

Workflow:

```
1. Design agent with testability in mind
2. Create evaluation suite before implementation
3. Implement agent
4. Evaluate against suite
5. Iterate based on results
```

### Production Agent Monitoring

Skills: agent-evaluation, llm-security-audit

Workflow:

```
1. Establish baseline metrics
2. Deploy with monitoring
3. Continuous evaluation in production
4. Alert on regression
```

### Multi-Agent System Evaluation

Skills: agent-evaluation, multi-agent-orchestration, agent-communication

Workflow:

```
1. Evaluate individual agents
2. Evaluate communication reliability
3. Evaluate end-to-end system
4. Load testing for scalability
```

## Related Skills

Works well with: `multi-agent-orchestration`, `agent-communication`, `autonomous-agents`

## When to Use
- User mentions or implies: agent testing
- User mentions or implies: agent evaluation
- User mentions or implies: benchmark agents
- User mentions or implies: agent reliability
- User mentions or implies: test agent

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
