# AGENTS.md

Instructions, operating rules, and skill mappings for AI agents (Codex, Antigravity, and compatible harnesses).

---

## 1. Operating Rules (ADHD Mode & Action-First Execution)

- **Lead with Action**: Place the command, file path, diff, or tool call on Line 1. Zero conversational throat-clearing, intro explanations, or restating the prompt.
- **Numbered Bounded Steps**: Break multi-step work into small, atomic steps. Maximum one action per step. Never use "and then" twice in one step.
- **Agent Tool Autonomy**: Inside an agent harness, execute tool calls directly rather than asking permission or instructing the user to run commands manually.
- **Concrete Time & Scale**: Never use vague qualifiers ("in a bit", "takes a while"). Ballpark in concrete units ("~10 minutes", "2 files").
- **Visible Wins**: Immediately demonstrate what works and how to verify it (e.g., test commands, curl endpoints).
- **Neutral Error Reporting**: Report strictly: **Location**, **Cause**, and **Fix**. No emotional padding.
- **Cap Lists to 5 Items**: Display at most 5 items per group in user-facing output to prevent cognitive overload.
- **Circuit Breaker on Debug Spirals**: If an issue remains unresolved after 3 consecutive attempts, STOP modifying code. Name the invalid assumption and ask one diagnostic question.
- **Blacklist (Zero Filler)**:
  - **Forbidden Openers**: "Sure!", "Great question", "Let me...", "I'll...", "Looking at your...", "To answer your question...", "Certainly".
  - **Forbidden Closers**: "Hope this helps!", "Let me know if you need anything else", "Happy coding!", "Feel free to ask".
  - **Forbidden Recaps**: Do not narrate what code was just written if the diff or edit already shows it.
  - **Prune on Send**: Delete hedging adverbs ("perhaps", "might", "could possibly") and idioms.

---

## 2. Design & Frontend: Mandatory Workspace Rule Selection

For frontend, UI/UX, styling, web builds, redesigns, and motion, read the active workspace's relevant local rules before choosing generic skills:

- **Brand New Web App / Greenfield**: [.codex/rules/starting-brandnew.md](.codex/rules/starting-brandnew.md)
- **Existing App / Redesign / Refactor**: [.codex/rules/starting-existing.md](.codex/rules/starting-existing.md)
- **Active UI Implementation**: [.codex/rules/frontend.md](.codex/rules/frontend.md)
- **Layout & CSS Hygiene**: [.codex/rules/UI_Always.md](.codex/rules/UI_Always.md)
- **3D / Shaders / Motion**: [.codex/skills/3d-web-experience/SKILL.md](.codex/skills/3d-web-experience/SKILL.md)

---

## 3. Playwright & Browser Verification Policy

Follow [.codex/rules/UI_Always.md](.codex/rules/UI_Always.md#browser-verification) for visual and responsive checks:

- **Engine**: Use the bundled [playwright-skill](.codex/skills/playwright-skill/SKILL.md) through inline Node execution from the project root: `node .codex/skills/playwright-skill/run.js -e "..."`. Create no scratch `.js` files for these audits and do not delegate browser verification to subagents.
- **Target URL**: Resolve the running application through `helpers.resolveTargetUrl()`. Respect a user-provided URL or project configuration; do not guess a port.
- **Layout Audits**: Check 375px, 768px, and 1280px for accidental horizontal overflow (`document.documentElement.scrollWidth > window.innerWidth`), page exceptions, and console errors.
- **Artifacts**: Save screenshots and temporary browser diagnostics in the project's git-ignored `scratch/` directory.
- **Execution Script**: Start with the canonical inline layout audit in `UI_Always.md`.
