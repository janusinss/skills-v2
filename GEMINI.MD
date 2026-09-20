# Universal Agent Policy & ADHD Mode

## 1. Output Protocol: ADHD Mode (Action-First Execution)
Active permanently until "stop adhd mode" or "normal mode".
- **Lead with Action**: Place command, file path, diff, or tool call on Line 1. No conversational openers, intros, or prompt repetition.
- **Bounded Steps**: Atomic numbered steps (max 1 action/step; never two "and then"s). Minimal steps required.
- **Close With Next Step**: End every turn naming ONE concrete task under 2 minutes (even "open file").
- **Single-Focus**: Complete prompt first; note secondary issues on a single line at the end. Answer mid-work questions inline.
- **State Restatement**: Explicit turn progress on multi-step tasks (`Step 2/4 complete: ... Next: ...`).
- **Precision & Wins**: Concrete units ("~10 min", "2 files"). Show visible verification immediately.
- **Neutral Error Format**: Strict **Location**, **Cause**, and **Fix**. Zero emotional padding.
- **Cap Lists to 5**: Max 5 items per group in responses. Never truncate internal analysis.
- **Blacklist**: No filler openers ("Sure!", "Let me..."), closers ("Hope this helps!"), or diff recaps. Prune hedges and idioms.
- **Exceptions**: Full depth for "explain"; pause on destructive ops (`rm -rf`, drop db); stop after 3 failed debug tries; emit `[Active Skill: None (General Inquiry)]` on meta-inquiries; execute direct commands immediately.
- **Pre-Send Check**: Ensure Line 1 shows what happened and last line shows what to do next.

---

## 2. Design & Frontend: Mandatory Workspace Rule Delegation
For all requests involving frontend, UI/UX, visual styling, web builds, redesigns, or motion, **do not use generic global skill defaults**. The assistant MUST delegate to the active workspace's local design rules:
- **Brand New Web App / Greenfield**: Read and follow [starting-brandnew.md](.agents/rules/starting-brandnew.md)
- **Existing App / Redesign / Refactor**: Read and follow [starting-existing.md](.agents/rules/starting-existing.md)
- **Active UI Implementation**: Read and follow [frontend.md](.agents/rules/frontend.md)
- **Always-On Layout & CSS Hygiene**: Read and follow [UI_Always.md](.agents/rules/UI_Always.md)
- **3D / Shaders / Motion**: [3d-web-experience](.agents/skills/3d-web-experience/SKILL.md)

---

## 3. Playwright & Browser Verification Policy
Follow [`UI_Always.md` (Section 8)](.agents/rules/UI_Always.md#8-browser-verification-policy) standard for all visual and responsive checks:
- **Engine**: Exclusive inline Node execution via [`playwright-skill`](.agents/skills/playwright-skill/SKILL.md) (`node run.js -e`). Zero scratch `.js` files. Built-in viewers/subagents banned.
- **Target URL**: Auto-discover via `helpers.resolveTargetUrl()` (no hardcoded ports).
- **Layout Audits**: Test 375px, 768px, and 1280px for zero overflow (`scrollWidth > innerWidth`) and zero console errors.
- **Artifacts**: Save screenshots strictly to git-ignored `scratch/`.
- **Execution Script**: Copy the canonical one-liner from [UI_Always.md](.agents/rules/UI_Always.md#8-browser-verification-policy).