---
trigger: manual
---

# Frontend Design, Quality & Remediation Pipeline

## Phase 0: Project Context & Source of Truth
Establish the design baseline before generating or editing UI code:
- **Environment & Package Initialization:**
  - Verify if `package.json` exists in the project root; if absent, execute `npm init -y` to initialize the project manifest so scripts, tools, and dependencies are properly tracked.
- **Redesign / Existing Codebase:** 
  1. Extract legacy patterns and voice into `DESIGN.md` via `/impeccable document`.
  2. Generate the upgraded target design system via `ui-ux-pro-max` and persist it to `design-system/MASTER.md`.
  3. (Optional) For specialized sub-pages with distinct layouts, generate page-level overrides in `design-system/pages/<page>.md`.
- **Greenfield / New Project:** Initialize brand identity and context via `/impeccable init` and persist tokens to `design-system/MASTER.md`.
- **Repository Hygiene:** Confirm `.gitignore` includes ephemeral Impeccable review artifacts (`.impeccable/*.png`, `.impeccable/live/`) and Playwright test traces.
