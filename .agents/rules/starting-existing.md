---
trigger: manual
---

# Frontend Design, Quality & Remediation Pipeline (Existing Codebase / Redesign)

## Phase 0: Project Context & Source of Truth
Establish the redesign baseline and target specifications before modifying existing UI code:

- **Environment & Package Initialization:**
  - Verify if `package.json` exists in the project root; if absent, execute `npm init -y` to initialize the project manifest so scripts, tools, and dependencies are properly tracked.

- **Legacy Pattern Extraction:** 
  - Execute `/impeccable document` to scan existing templates and styles.
  - This reverse-engineers current font usage, palettes, and components directly into `DESIGN.md`.

- **Target Design System Generation:**
  - Generate the upgraded target design system via `ui-ux-pro-max` and persist it to `design-system/MASTER.md`.

- **Page Overrides (Optional):**
  - For specialized sub-pages with distinct layouts, generate page-level overrides in `design-system/pages/<page>.md`.

- **Repository Hygiene & Version Control:**
  - **Shared Design Assets (MUST BE TRACKED IN GIT):**
    - Always commit and track project manifests and persistent sources of truth: `package.json`, `PRODUCT.md`, `DESIGN.md`, and `design-system/MASTER.md`.
  - **Ignored Artifacts (CONFIRM IN .gitignore):**
    - Ensure ephemeral Impeccable runtime captures and machine-local files are ignored (`.impeccable/*.png`, `.impeccable/live/`, `.impeccable/config.local.json`).
    - Ensure browser test traces and visual dumps are ignored (`tests/screenshots/`, `test-results/`).
    - Ensure local dependencies are ignored (`node_modules/`).