# AGENTS.md

Instructions, operating rules, and skill mappings for AI agents (Codex, Antigravity, and compatible harnesses).

---

## 1. Operating Rules (ADHD Mode & Action-First Execution)

- **Lead with Action**: Place the command, file path, diff, or tool call on Line 1. Zero conversational throat-clearing, intro explanations, or restating the prompt.
- **Numbered Bounded Steps**: Break multi-step work into atomic steps. Maximum one verb/action per step. Zero compound steps (ban "and then", "afterward", "while").
- **Agent Tool Autonomy**: Inside an agent harness, execute tool calls directly rather than asking permission or instructing the user to run commands manually.
- **Concrete Time & Scale**: Never use vague qualifiers ("in a bit", "takes a while"). Ballpark in concrete units ("~10 minutes", "2 files").
- **Visible Wins**: Immediately demonstrate what works and how to verify it (e.g., test commands, curl endpoints).
- **Neutral Error Reporting**: Report strictly: **Location**, **Cause**, and **Fix**. No emotional padding.
- **Cap Lists to 5 Items**: Display at most 5 items per group in user-facing output to prevent cognitive overload.
- **Circuit Breaker (3-Strike Limit)**: After 3 failed attempts to fix the same issue, STOP modifying code and revert to the last working state. Output strictly:
  1. **Invalid Assumption**: 1 sentence on what failed.
  2. **Diagnostic Check**: 1 concrete question or a 2-option choice (A/B) to unblock.
- **Blacklist (Zero Filler)**:
  - **Forbidden Openers**: "Sure!", "Great question", "Let me...", "I'll...", "Looking at your...", "To answer your question...", "Certainly".
  - **Forbidden Closers**: "Hope this helps!", "Let me know if you need anything else", "Happy coding!", "Feel free to ask".
  - **Forbidden Recaps**: Do not narrate what code was just written if the diff or edit already shows it.
  - **Prune on Send**: Delete hedging adverbs ("perhaps", "might", "could possibly") and idioms.

---

## 2. Design, Architecture & Security: Mandatory Workspace Rule Selection

Read and apply the active workspace's local rules before choosing generic skills:

- **Frontend, UI/UX & Motion**:
  - **Brand New Web App / Greenfield**: [.codex/rules/starting-brandnew.md](.codex/rules/starting-brandnew.md)
  - **Existing App / Redesign / Refactor**: [.codex/rules/starting-existing.md](.codex/rules/starting-existing.md)
  - **Active UI Implementation**: [.codex/rules/frontend.md](.codex/rules/frontend.md)
  - **Layout & CSS Hygiene**: [.codex/rules/UI_Always.md](.codex/rules/UI_Always.md)
  - **Motion, Physics & Micro-Interactions**: [.codex/rules/MOTION.md](.codex/rules/MOTION.md) (and [.codex/skills/3d-web-experience/SKILL.md](.codex/skills/3d-web-experience/SKILL.md) for 3D/WebGL)
- **Backend, Security & QA**:
  - **Backend Architecture, Data Layer & APIs**: [.codex/rules/backend.md](.codex/rules/backend.md)
  - **Application Security & Exploit Defense**: [.codex/rules/security.md](.codex/rules/security.md)
  - **Penetration Testing, Strix & Functional Flow QA**: [.codex/rules/penetrating-and-testing.md](.codex/rules/penetrating-and-testing.md)

---

## 3. Playwright & Browser Verification Policy

Follow [.codex/rules/UI_Always.md](.codex/rules/UI_Always.md#8-browser-verification-policy) for visual and responsive checks:

- **Engine**: Use the bundled [playwright-skill](.codex/skills/playwright-skill/SKILL.md) through inline Node execution from the project root: `node .codex/skills/playwright-skill/run.js -e "..."`. Create no scratch `.js` files for these audits and do not delegate browser verification to subagents.
- **Target URL**: Resolve the running application through `helpers.resolveTargetUrl()`. Respect a user-provided URL or project configuration; do not guess a port.
- **Layout Audits**: Check 375px, 768px, and 1280px for accidental horizontal overflow (`document.documentElement.scrollWidth > window.innerWidth`), page exceptions, and console errors.
- **Artifacts**: Save screenshots and temporary browser diagnostics in the project's git-ignored `scratch/` directory.
- **Execution Script**: Start with the canonical inline layout audit in `UI_Always.md`.

---

## 4. Subagents & Specialized Roles

Delegate specialized lifecycle tasks to the agents defined under [.codex/agents/](.codex/agents):

- **Planning & Architecture**:
  - Implementation Planning: [.codex/agents/planner.md](.codex/agents/planner.md)
  - Domain & System Architecture: [.codex/agents/code-architect.md](.codex/agents/code-architect.md)
  - Web Accessibility (WCAG 2.2): [.codex/agents/a11y-architect.md](.codex/agents/a11y-architect.md)
- **Quality Gates & Failure Hunting**:
  - Swallowed Exception & Fallback Audits: [.codex/agents/silent-failure-hunter.md](.codex/agents/silent-failure-hunter.md)
  - Code Simplification & Dead Weight Removal: [.codex/agents/code-simplifier.md](.codex/agents/code-simplifier.md)
  - Pre-Delivery Verification: [.codex/agents/agent-evaluator.md](.codex/agents/agent-evaluator.md)
- **Security & Penetration Testing**:
  - Pre-Commit Security & Invariant Audits: [.codex/agents/security-auditor.md](.codex/agents/security-auditor.md)
  - Exploit Validation & Penetration QA: [.codex/agents/penetration-tester.md](.codex/agents/penetration-tester.md)
- **Closed-Loop Build & Error Repair**:
  - TypeScript & Generic Build Repair: [.codex/agents/build-error-resolver.md](.codex/agents/build-error-resolver.md)
  - Framework Resolvers: [.codex/agents/react-build-resolver.md](.codex/agents/react-build-resolver.md), [.codex/agents/go-build-resolver.md](.codex/agents/go-build-resolver.md), [.codex/agents/rust-build-resolver.md](.codex/agents/rust-build-resolver.md)

---

## 5. Standard Engineering Lifecycle & Loop Execution

For non-trivial features, refactoring, or multi-file changes, route through the bounded five-stage lifecycle:

1. **Phase 1: Planning & Scope**: Delegate to [.codex/agents/planner.md](.codex/agents/planner.md) (or [.codex/agents/code-architect.md](.codex/agents/code-architect.md) for boundaries) to produce numbered atomic checklists before writing code.
2. **Phase 2: Test Specification (TDD)**: Delegate to [.codex/agents/tdd-guide.md](.codex/agents/tdd-guide.md) to author failing unit or integration tests verifying invariants before implementation.
3. **Phase 3: Implementation & Repair**: Implement minimal code to turn tests green; on compiler/type failure, delegate strictly to [.codex/agents/build-error-resolver.md](.codex/agents/build-error-resolver.md) for micro-patches.
4. **Phase 4: Defensive Audit**: Delegate to [.codex/agents/silent-failure-hunter.md](.codex/agents/silent-failure-hunter.md) for swallowed errors and [.codex/agents/security-auditor.md](.codex/agents/security-auditor.md) for boundary defenses.
5. **Phase 5: Verification & Gate Evaluation**: Run tests and Playwright audits, then evaluate output completeness with [.codex/agents/agent-evaluator.md](.codex/agents/agent-evaluator.md) and [.codex/skills/agent-self-evaluation/SKILL.md](.codex/skills/agent-self-evaluation/SKILL.md).
