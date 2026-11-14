> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Existing Codebase Design & Remediation Pipeline

Transform an existing frontend codebase into a validated, design-token-compliant application by executing these 7 bounded phases sequentially.

---

## Phase 0: Pre-Flight & Environment Setup
Establish tooling before modifying any source files:
1. **Package Manifest**: Verify `package.json` exists. If absent, run `npm init -y`. If present, preserve existing scripts.
2. **Browser Verification Policy**: All browser inspections and responsive audits must strictly follow [UI_Always.md](UI_Always.md) (Section 7).
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
4. **Architecture Mapping & Structural Untangling**: Use [archify](../skills/archify/SKILL.md) (`architecture` / `dataflow` diagrams) to map existing component boundaries and data flows, and apply [untangle-codebase](../skills/untangle-codebase/SKILL.md) to identify hidden links, needless links, surplus wrappers, and special cases before redesigning.

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

## Phase 4: Aesthetic & Visitor-Mode Synthesis ([frontend.md](frontend.md) Stage 2)
1. **Synthesize Configuration**: Map `PRODUCT.md` and the target `DESIGN.md` into the canonical `Skill Input Specification` (Visitor Mode, Page, Audience, Vibe, References, `DESIGN_VARIANCE`/`MOTION_INTENSITY`/`VISUAL_DENSITY` dials, and brand Assets/Constraints) defined in Stage 2 of [frontend.md](frontend.md).
2. **Declare Design Read**: Emit the mandatory one-line `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system>."` summary before generating code.

---

## Phase 5: Implementation & Code Assembly (via [impeccable](../skills/impeccable/SKILL.md) & [frontend.md](frontend.md))
Apply the redesign strictly adhering to target `DESIGN.md` tokens, `PRODUCT.md` P0 features, and Stages 1–2 of [frontend.md](frontend.md):
1. **Component Architecture & Tech Stack**: Preserve the existing stack in use unless the user requests a migration; when migrating or scaffolding new modules, follow Stage 1 of [frontend.md](frontend.md) (never migrate to or default to vanilla HTML/CSS/JS unless requested). Apply the Stage 2 Standard Layout Archetypes (`Archetype A` or `Archetype B`) in [frontend.md](frontend.md), and enforce hero header clearance per [UI_Always.md](UI_Always.md) §1.
2. **Anti-AI-Slop & Natural Voice Enforcement**: Load and apply [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) (paired with [craft-floor.md](../skills/impeccable/reference/craft-floor.md) and [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md)) for all visual, structural, palette, typography, photography sourcing, scroll/marquee, and copy/domain-data rules.
3. **Scope: P0 Delivery Only**: Build/refactor UI modules implementing the **P0 roadmap** from `PRODUCT.md`; defer P1–P3 features to iterative cycles after this pipeline completes.
4. **Structural Debt Elimination**: When eliminating structural debt across coupled modules or legacy seams, apply [untangle-codebase](../skills/untangle-codebase/SKILL.md) to remove hidden links, needless links, surplus wrappers, and single-case special cases.

---

## Phase 6: Automated Verification & Handoff
Validate the running application inside real Chromium viewports:
1. **Audit & Chromium Verification**: Execute bounded quality audits per Stage 3 of [frontend.md](frontend.md) (`impeccable detect .` + anti-slop gates) and multi-viewport Chromium verification (`0` horizontal overflow, `0` console errors, `>=44x44px` targets) per Stage 4 of [frontend.md](frontend.md) and [UI_Always.md](UI_Always.md#7-browser-verification-policy).
2. **Git Hygiene**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`, `test-results/`) are in `.gitignore`, then commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.