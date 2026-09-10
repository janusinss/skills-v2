---
trigger: manual
---

# Frontend Design & Development Pipeline (Greenfield / Brand New Projects)

## Phase 0: Project Context, Runtimes & Source of Truth
Establish the project environment, testing runtimes, and design baseline before writing UI code:

- **Environment & Package Initialization:**
  - If using a framework (e.g. Vite), initialize using the framework scaffold; otherwise verify if `package.json` exists in the project root. If absent, execute `npm init -y` so scripts and metadata are properly tracked.

- **Playwright Automation Runtime Setup:**
  - Ensure the browser automation engine is available. If uninitialized, execute:
    ```bash
    npm --prefix .agents/skills/playwright-skill run setup
    ```
  - This installs local dependencies and downloads the Chromium browser binary required for responsive visual verification.

- **Brand & Product Initialization (via Impeccable):** 
  - Consult `impeccable` init guidelines to establish target audience, product purpose, voice, and user workflow.
  - Generate `PRODUCT.md` in the project root as the persistent source of truth for product facts.

- **Aesthetic Direction & Token Setup (via `taste-skill`):**
  - Invoke `design-taste-frontend` (`taste-skill`) to select the visual archetype (e.g., Editorial, Minimalist, Technical, Brutalist, or Soft).
  - Configure and document the three core design dials directly inside `DESIGN.md`:
    - **`DESIGN_VARIANCE`** (Low / Balanced / High): Controls layout asymmetry, dynamic grid composition, and rhythm variation.
    - **`VISUAL_DENSITY`** (Compact / Balanced / Spacious): Dictates whitespace discipline, padding scales, and information hierarchy.
    - **`MOTION_INTENSITY`** (None / Subtle / Expressive): Sets transition bounds, easing curves, and micro-interaction restraints.
  - Define curated typography pairings (Google Font imports) and a brand-tinted color palette directly within `DESIGN.md` to establish the initial design system.

- **Repository Hygiene & Version Control:**
  - **Shared Design Assets (MUST BE TRACKED IN GIT):**
    - Always commit and track project manifests and persistent sources of truth: `package.json`, `PRODUCT.md`, and `DESIGN.md`.
  - **Ignored Artifacts (Ensure present in .gitignore):**
    - If `.gitignore` is absent, create it immediately.
    - Ensure dependencies are ignored (`node_modules/` and `**/node_modules/`).
    - Ensure ephemeral Impeccable review artifacts are ignored (`.impeccable/*.png`, `.impeccable/live/`, `.impeccable/config.local.json`).
    - Ensure browser test traces and visual dumps are ignored (`tests/screenshots/`, `test-results/`).
