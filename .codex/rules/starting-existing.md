> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Existing Codebase Design & Remediation Pipeline

Transform an existing frontend codebase into a validated, design-token-compliant application by executing these 7 bounded phases sequentially.

---

## Phase 0: Pre-Flight & Environment Setup
Establish tooling before modifying any source files:
1. **Package Manifest**: Verify `package.json` exists. If absent, run `npm init -y`. If present, preserve existing scripts.
2. **Browser Verification Policy**: All browser inspections and responsive audits must strictly follow [UI_Always.md](UI_Always.md) (Section 8).
3. **Git Hygiene**: Verify `.gitignore` exists (create if absent) and includes:
   - `node_modules/`, `scratch/`, `test-results/`, `tests/screenshots/`
   - `.impeccable/*.png`, `.impeccable/live/`, `.impeccable/config.local.json`

---

## Phase 1: Codebase Audit & Legacy Pattern Extraction
Analyze existing code to establish the current design baseline:
1. **Extract Patterns via `impeccable:document` Workflow**: Follow [impeccable/reference/document.md](../skills/impeccable/reference/document.md) to inspect templates, stylesheets, and components (run `.codex/skills/impeccable/scripts/impeccable.cmd detect .` for automated anti-pattern discovery).
2. **Extract Current Design Tokens**: Reverse-engineer from the codebase:
   - Font families, sizes, weights, and line-heights in active use.
   - Color palette (hex/HSL values from CSS variables, inline styles, and class definitions).
   - Spacing scale, border-radius values, shadow definitions, and breakpoints.
   - Component patterns (cards, navbars, modals, forms) and their structural conventions.
3. **Produce `DESIGN.md` Baseline**: Write the extracted tokens into `./DESIGN.md` under a `## Current State (Extracted)` section. This captures what exists — not what the target is.

---

## Phase 2: Target Aesthetic Direction
Define where the redesign is heading. Two paths:
1. **Path A — Select from [awesome-design-md](../skills/awesome-design-md/SKILL.md) Library** (full visual overhaul):
   - Present up to 5 curated brand design systems from `.codex/skills/awesome-design-md/design-md/` (when the existing user instructions leave a material choice unresolved).
   - Copy the selected spec to `./DESIGN.md`, replacing the baseline while preserving the `## Current State (Extracted)` section as a reference appendix.
2. **Path B — Refine Extracted Baseline** (incremental polish):
   - Keep the extracted `DESIGN.md` as the foundation.
   - Define target typography pairing (curated Google Font imports) and a cohesive, tinted palette to supersede legacy hardcoded values.
3. **Configure Taste Dials**: Add a `## Target Redesign Specification` section to `DESIGN.md` with the three canonical dials from [design-taste-frontend](../skills/design-taste-frontend/SKILL.md):
   - **`DESIGN_VARIANCE`** [1–10]: Layout asymmetry, grid structures, rhythm variance.
   - **`MOTION_INTENSITY`** [1–10]: Transition bounds, easing curves, micro-interaction restraints.
   - **`VISUAL_DENSITY`** [1–10]: Whitespace discipline, padding scales, information hierarchy.
4. **Per-Page Overrides (Optional)**: For specialized sub-pages, specify per-view dial overrides in `DESIGN.md` (e.g., `VISUAL_DENSITY: 8` for data tables, `DESIGN_VARIANCE: 9` with `VISUAL_DENSITY: 3` for hero/landing sections).

---

## Phase 3: Product Truth & Scope ([prompt-enhancer](../skills/prompt-enhancer/SKILL.md))
Establish or confirm the product specification:
1. **If `PRODUCT.md` Exists**: Review and confirm with the user — reuse as-is, or refine via domain enhancer ([prompt-enhancer-frontend](../skills/prompt-enhancer-frontend/SKILL.md), [prompt-enhancer-backend](../skills/prompt-enhancer-backend/SKILL.md), or [prompt-enhancer](../skills/prompt-enhancer/SKILL.md)).
2. **If `PRODUCT.md` is Absent**: Extract product intent, target audience, and key workflows from existing documentation/codebase. Run the appropriate domain enhancer to expand into:
   - **Frontend / Client UI**: [prompt-enhancer-frontend](../skills/prompt-enhancer-frontend/SKILL.md) (Component matrix, responsive transitions, state models).
   - **Backend / Data API**: [prompt-enhancer-backend](../skills/prompt-enhancer-backend/SKILL.md) (Endpoints, DB schema migrations, state machines, RBAC).
   - **Fullstack System**: General [prompt-enhancer](../skills/prompt-enhancer/SKILL.md) (Strategic Scope, P0–P3 Feature Matrix, Core Data Entities, User Journeys, and NFRs).
3. **Commit `PRODUCT.md`**: Write the domain analysis artifact (Sections 1–5) to `./PRODUCT.md`.
4. **Retain Master Specification**: Use the Section 6 Master Prompt as the execution contract for downstream phases.

---

## Phase 4: Aesthetic & Visitor-Mode Synthesis ([impeccable](../skills/impeccable/SKILL.md) & [design-taste-frontend](../skills/design-taste-frontend/SKILL.md))
Synthesize `PRODUCT.md` and the target `DESIGN.md` into the formal configuration required by Stage 2 of [frontend.md](frontend.md) ([impeccable](../skills/impeccable/SKILL.md) primary visual craft and [design-taste-frontend](../skills/design-taste-frontend/SKILL.md) taste calibration):
1. **Formulate Skill Input Specification**:
   ```text
   Primary Craft Engine: impeccable (Visitor Mode: [Persuade | Operate | Read | Experience])
   Taste Calibration: design-taste-frontend
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

## Phase 5: Implementation & Code Assembly (via [impeccable](../skills/impeccable/SKILL.md) & [frontend.md](frontend.md))
Apply the redesign strictly adhering to target `DESIGN.md` tokens, `PRODUCT.md` P0 features, and Stage 2 of [frontend.md](frontend.md) ([impeccable](../skills/impeccable/SKILL.md) visitor-mode composition and [craft-floor.md](../skills/impeccable/reference/craft-floor.md)):
1. **Component Architecture & Visual Craft**: When integrating components, templates, or shaders, or authoring UI layouts, execute strictly following Stages 1–2 of [frontend.md](frontend.md).
2. **Confirm Tech Stack**: For existing codebases, preserve the stack already in use unless the user requests a migration. When migrating or scaffolding new application modules, default to a modern tech stack (Next.js App Router + React 19 + TypeScript + Tailwind CSS + shadcn/ui + `@bsmnt/scrollytelling`, Vite + React + TypeScript + Tailwind CSS, Astro, or SvelteKit) — never migrate to or default to vanilla HTML/CSS/JS unless explicitly requested.
3. **Standard Layout Archetypes**:
   - **Archetype A: High-Conversion SaaS & Product Dashboard**:
     - CSS Grid / Flexbox data tables with sticky headers and sortable columns.
     - `prefers-color-scheme` media query for system dark/light modes.
     - ≥16px body text, ≥44px interactive targets, and tactile hover/active micro-interactions governed by [MOTION.md](MOTION.md) (composite-only `transform`/`opacity`, settling ≤300ms).
   - **Archetype B: Clean Editorial & Content Platform**:
     - Asymmetrical CSS Grid layouts (e.g., `2fr 1fr` or `1fr 3fr`) with generous `clamp()`-based spacing.
     - Typographic rhythm: distinct heading scale (1.333+ ratio), styled pull-quotes, and ≥1.6 line-height body.
     - Image curation with `object-fit: cover`, art-directed `<picture>` sources, and lazy loading.
   - **Tighter Hero Spacing Standard**: Set hero top padding strictly to `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` (24px inset below fixed header) to eliminate dead vertical whitespace and seat the hero headline and bento showcase immediately below the navigation bar.
   - **Real Photography Sourcing (Strict: No AI Generation)**: Enforce Section 4 of [UI_Always.md](UI_Always.md): populate all hero showcase cards and product catalog cards with real, authentic photography sourced from the internet or template assets (Unsplash, Pexels, CDN) paired with `object-fit: cover` and contrast scrim overlays—**never use AI generation** for showcase or product imagery.
4. **Ban Generic AI Clichés (Visual Slop & AI Writing)**:
   - **Visual & Structural Slop**: Enforce Section 6 of [UI_Always.md](UI_Always.md) as the canonical anti-slop baseline (zero floating pill badges, icon-tile stacks, ghost cards, side-tab stripes, nested cards, unstyled fonts, or uncalibrated gradients).
   - **Textual Slop (`avoid-ai-writing`)**: Enforce Section 7 of [UI_Always.md](UI_Always.md) as the canonical copy floor (zero Tier 1A machine vocabulary, hollow intensifiers, em dashes in headings/buttons, `"It's not X — it's Y"` tropes, or section header emojis).
5. **Scope: P0 Delivery Only**: Build/refactor UI modules implementing the **P0 roadmap** from `PRODUCT.md`. P1–P3 features are cataloged in `PRODUCT.md` but deferred to iterative development cycles after this pipeline completes.

---

## Phase 6: Automated Verification & Handoff
Validate the running application inside real Chromium viewports:
1. **Browser Verification Mandate**: Execute browser inspection and multi-viewport responsive verification strictly following Section 8 of [UI_Always.md](UI_Always.md).
2. **Quality & Token Compliance Check**:
   - Verify 0 horizontal scroll overflows, 0 console errors, >=44px tap targets.
   - Run `.codex/skills/impeccable/scripts/impeccable.cmd detect .` (or Unix `.codex/skills/impeccable/scripts/impeccable detect .`) to verify compliance against target `DESIGN.md` tokens.
3. **Git Commit**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`, `test-results/`) are in `.gitignore`. Commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.