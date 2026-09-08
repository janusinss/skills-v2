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

- **Repository Hygiene & Version Control:**
  - **Shared Design Assets (MUST BE TRACKED IN GIT):**
    - Always commit and track project manifests and persistent sources of truth: `package.json`, `PRODUCT.md`, `DESIGN.md`, and `design-system/MASTER.md`.
  - **Ignored Artifacts (CONFIRM IN .gitignore):**
    - Ensure ephemeral Impeccable runtime captures and machine-local files are ignored (`.impeccable/*.png`, `.impeccable/live/`, `.impeccable/config.local.json`).
    - Ensure browser test traces and visual dumps are ignored (`tests/screenshots/`, `test-results/`).
    - Ensure local dependencies are ignored (`node_modules/`).