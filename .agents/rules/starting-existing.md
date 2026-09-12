---
trigger: manual
---

# Frontend Design, Quality & Remediation Pipeline (Existing Codebase / Redesign)

## Phase 0: Project Context & Source of Truth
Establish the redesign baseline and target aesthetic specifications before modifying existing UI code:

- **Environment & Package Initialization:**
  - Verify if `package.json` exists in the project root. If absent, execute `npm init -y` to initialize the project manifest so scripts, tools, and dependencies are properly tracked. If already present, preserve existing scripts.

- **Playwright Automation Runtime Setup:**
  - Ensure the browser automation engine is available. If uninitialized, execute:
    ```bash
    npm --prefix .agents/skills/playwright-skill run setup
    ```
  - This installs local dependencies and downloads the Chromium browser binary required for Stage 4 visual verification.

- **Legacy Pattern & Context Extraction:** 
  - Follow `impeccable` document guidelines or run `.agents/skills/impeccable/scripts/impeccable.cmd document` to scan existing templates and stylesheets.
  - Reverse-engineer current font usage, palettes, and components directly into `DESIGN.md`.
  - If `PRODUCT.md` is absent, extract product intent, target audience, and key workflows from existing documentation/codebase into a concise `PRODUCT.md`.
- **System Topology Baseline (via Archify):**
  - Scan directory structure and routes to generate an interactive `ARCHITECTURE.html` map using `archify architecture` to establish the codebase baseline before refactoring.


- **Target Aesthetic & Direction Setup (via `taste-skill`):**
  - Invoke `design-taste-frontend` (`taste-skill`) to define the target aesthetic archetype (e.g., Editorial, Minimalist, Technical, or Brutalist).
  - Configure and document the three core design dials directly in `DESIGN.md` under a `## Target Redesign Specification` section:
    - **`DESIGN_VARIANCE`** (Low / Balanced / High): Controls layout asymmetry, dynamic grid structures, and rhythm variance.
    - **`VISUAL_DENSITY`** (Compact / Balanced / Spacious): Dictates whitespace discipline, padding scales, and information hierarchy.
    - **`MOTION_INTENSITY`** (None / Subtle / Expressive): Sets transition bounds, easing curves, and micro-interaction restraints.
  - Define the target typography pairing (curated Google Font imports) and a cohesive, tinted palette to supersede legacy hardcoded values.

- **Page & Surface Overrides (Optional):**
  - For specialized sub-pages, specify per-view dial overrides inside `DESIGN.md` (e.g., set `VISUAL_DENSITY: Compact` for data tables/dashboards and `DESIGN_VARIANCE: High` with `VISUAL_DENSITY: Spacious` for portfolio landing and hero sections).

- **Repository Hygiene & Version Control:**
  - **Shared Design Assets (MUST BE TRACKED IN GIT):**
    - Always commit and track project manifests and persistent sources of truth: `package.json`, `PRODUCT.md`, `DESIGN.md`, and `ARCHITECTURE.html`.
  - **Ignored Artifacts (Ensure present in .gitignore):**
    - If `.gitignore` is absent, create it immediately.
    - Ensure ephemeral Impeccable runtime captures and machine-local files are ignored (`.impeccable/*.png`, `.impeccable/live/`, `.impeccable/config.local.json`).
    - Ensure browser test traces and visual dumps are ignored (`tests/screenshots/`, `test-results/`).
    - Ensure local dependencies are ignored (`node_modules/`).