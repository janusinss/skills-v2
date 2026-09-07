---
trigger: manual
---

# Frontend Design & Development Pipeline (Greenfield / Brand New Projects)

## Phase 0: Project Context & Source of Truth
Establish the project environment and design baseline before writing any UI code:

- **Environment & Package Initialization:**
  - Verify if `package.json` exists in the project root; if absent, execute `npm init -y` to initialize the project manifest so scripts, tools, and dependencies are properly tracked.

- **Brand & Product Initialization:** 
  - Execute `/impeccable init` inside the AI chat to define the surface type (Brand vs. Product), audience, voice, and design lane.
  - This generates the baseline `PRODUCT.md` and `DESIGN.md` files in the project root.

- **Design System Token Generation:**
  - Generate the design system via `ui-ux-pro-max` based on the product category and persist it to `design-system/MASTER.md`.

- **Repository Hygiene:** 
  - Confirm `.gitignore` includes ephemeral Impeccable review artifacts (`.impeccable/*.png`, `.impeccable/live/`) and Playwright test traces.