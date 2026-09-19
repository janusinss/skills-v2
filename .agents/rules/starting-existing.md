---
trigger: manual
description: Existing codebase design and remediation pipeline. Activate when auditing, refactoring, or redesigning an existing web application or frontend codebase.
---

# Existing Codebase Design & Remediation Pipeline

Transform an existing frontend codebase into a validated, design-token-compliant application by executing these 7 bounded phases sequentially.

---

## Phase 0: Pre-Flight & Environment Setup
Establish tooling before modifying any source files:
1. **Package Manifest**: Verify `package.json` exists. If absent, run `npm init -y`. If present, preserve existing scripts.
2. **Playwright Runtime**: Ensure the browser automation engine is available. If uninitialized:
   ```bash
   npm --prefix .agents/skills/playwright-skill run setup
   ```
3. **Git Hygiene**: Verify `.gitignore` exists (create if absent) and includes:
   - `node_modules/`, `scratch/`, `test-results/`, `tests/screenshots/`
   - `.impeccable/*.png`, `.impeccable/live/`, `.impeccable/config.local.json`
4. **Browser Policy**: Use `playwright-skill` exclusively for all browser verification. Built-in website viewers, IDE browser tabs, and `browser_subagent` are banned for audit/verification steps.

---

## Phase 1: Codebase Audit & Legacy Pattern Extraction
Analyze existing code to establish the current design baseline:
1. **Extract Patterns via `impeccable:document` Workflow**: Follow [.agents/skills/impeccable/reference/document.md](file:///C:/xampp/htdocs/YEAR%204/Skills/.agents/skills/impeccable/reference/document.md) to inspect templates, stylesheets, and components (run `.agents/skills/impeccable/scripts/impeccable.cmd detect .` for automated anti-pattern discovery).
2. **Extract Current Design Tokens**: Reverse-engineer from the codebase:
   - Font families, sizes, weights, and line-heights in active use.
   - Color palette (hex/HSL values from CSS variables, inline styles, and class definitions).
   - Spacing scale, border-radius values, shadow definitions, and breakpoints.
   - Component patterns (cards, navbars, modals, forms) and their structural conventions.
3. **Produce `DESIGN.md` Baseline**: Write the extracted tokens into `./DESIGN.md` under a `## Current State (Extracted)` section. This captures what exists — not what the target is.

---

## Phase 2: Target Aesthetic Direction
Define where the redesign is heading. Two paths:
1. **Path A — Select from `awesome-design-md` Library** (full visual overhaul):
   - Present 5+ curated brand design systems from `.agents/skills/awesome-design-md/design-md/` via `ask_question`.
   - Copy the selected spec to `./DESIGN.md`, replacing the baseline while preserving the `## Current State (Extracted)` section as a reference appendix.
2. **Path B — Refine Extracted Baseline** (incremental polish):
   - Keep the extracted `DESIGN.md` as the foundation.
   - Define target typography pairing (curated Google Font imports) and a cohesive, tinted palette to supersede legacy hardcoded values.
3. **Configure Taste Dials**: Add a `## Target Redesign Specification` section to `DESIGN.md` with the three canonical dials from `design-taste-frontend`:
   - **`DESIGN_VARIANCE`** [1–10]: Layout asymmetry, grid structures, rhythm variance.
   - **`MOTION_INTENSITY`** [1–10]: Transition bounds, easing curves, micro-interaction restraints.
   - **`VISUAL_DENSITY`** [1–10]: Whitespace discipline, padding scales, information hierarchy.
4. **Per-Page Overrides (Optional)**: For specialized sub-pages, specify per-view dial overrides in `DESIGN.md` (e.g., `VISUAL_DENSITY: 8` for data tables, `DESIGN_VARIANCE: 9` with `VISUAL_DENSITY: 3` for hero/landing sections).

---

## Phase 3: Product Truth & Scope (`prompt-enhancer`)
Establish or confirm the product specification:
1. **If `PRODUCT.md` Exists**: Review and confirm with the user — reuse as-is, or refine via `prompt-enhancer`.
2. **If `PRODUCT.md` is Absent**: Extract product intent, target audience, and key workflows from existing documentation/codebase. Run `prompt-enhancer` to expand into:
   - Strategic Scope, P0–P3 Feature Matrix, Core Data Entities, User Journeys, and NFRs.
3. **Commit `PRODUCT.md`**: Write the domain analysis artifact (Sections 1–5) to `./PRODUCT.md`.
4. **Retain Master Specification**: Use the Section 6 Master Prompt as the execution contract for downstream phases.

---

## Phase 4: Taste Synthesis for `design-taste-frontend`
Synthesize `PRODUCT.md` and the target `DESIGN.md` into the formal configuration required by the `design-taste-frontend` skill:
1. **Formulate Skill Input Specification**:
   ```text
   Skill: design-taste-frontend
   Page: [Redesign | Landing | Dashboard | Editorial | Portfolio]
   Audience: [Target user group extracted from PRODUCT.md]
   Vibe & Aesthetic: [Visual world & tone from target DESIGN.md]
   References: [Chosen brand or extracted baseline + competitor inspirations]
   Dials: DESIGN_VARIANCE [1-10], MOTION_INTENSITY [1-10], VISUAL_DENSITY [1-10]
   Key Assets / Constraints: [Color tokens from DESIGN.md, existing brand assets, accessibility, dark/light mode]
   ```
2. **Declare Design Read**: Emit the mandatory one-line summary before generating code:
   `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system>."`

---

## Phase 5: Implementation & Creative Engineering
Apply the redesign strictly adhering to target `DESIGN.md` tokens and `PRODUCT.md` P0 features:
1. **Confirm Tech Stack**: Confirm implementation framework before generating code. Examples include Next.js App Router, Vite/React, Astro, SvelteKit, or Static HTML5/CSS3 — any framework the user selects is valid. For existing codebases, default to the stack already in use unless the user requests a migration.
2. **Select Creative Archetype**:
   - **Archetype A: High-Conversion SaaS & Product Dashboard**:
     - CSS Grid / Flexbox data tables with sticky headers and sortable columns.
     - `prefers-color-scheme` media query for system dark/light modes.
     - ≥16px body text, ≥44px interactive targets, subtle hover micro-interactions (opacity/translate, ≤200ms).
   - **Archetype B: Immersive 3D & Scroll Storytelling** (when requested):
     - *Lenis Smooth Scroll*: Initialize momentum physics (`duration: 1.2`, `smoothWheel: true`).
     - *ScrollTrigger Bridge*: Hook `lenis.raf` into GSAP ticker; lock `gsap.ticker.lagSmoothing(0)`.
     - *Unified Three.js Loop*: Render WebGL inside GSAP ticker; scrub camera orbits via ScrollTrigger.
     - *Source References*: Reference `.agents/resources/creative-libraries/` (`gsap/`, `lenis/`, `three.js/`).
   - **Archetype C: Editorial & Content Platform**:
     - Asymmetrical CSS Grid layouts (e.g., `2fr 1fr` or `1fr 3fr`) with generous `clamp()`-based spacing.
     - Typographic rhythm: distinct heading scale (1.333+ ratio), styled pull-quotes, and ≥1.6 line-height body.
     - Image curation with `object-fit: cover`, art-directed `<picture>` sources, and lazy loading.
3. **Ban Generic AI Clichés**: Zero unstyled browser fonts, zero nested cards-in-cards, zero uncalibrated purple/blue gradients.
4. **Scope: P0 Delivery Only**: Build/refactor UI modules implementing the **P0 roadmap** from `PRODUCT.md`. P1–P3 features are cataloged in `PRODUCT.md` but deferred to iterative development cycles after this pipeline completes.

---

## Phase 6: Automated Verification & Handoff (`playwright-skill` + `impeccable`)
Validate the running application inside real Chromium viewports:
1. **Playwright Multi-Viewport Audit**: Run headless Chromium checks via `node .agents/skills/playwright-skill/run.js` writing to `./scratch/`:
   - Mobile: 375 × 667
   - Tablet: 768 × 1024
   - Desktop: 1280 × 800
2. **Quality & Token Compliance Check**:
   - Verify 0 horizontal scroll overflows, 0 console errors, >=44px tap targets.
   - Run `impeccable detect` to verify compliance against target `DESIGN.md` tokens.
3. **Git Commit**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`, `test-results/`) are in `.gitignore`. Commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.