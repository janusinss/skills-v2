---
trigger: manual
description: Greenfield design and development pipeline. Activate when starting a new web app, greenfield project, or building an application from scratch.
---

# Greenfield Design & Development Pipeline

Transform an empty workspace into a validated, production-grade web application by executing these 6 bounded phases sequentially.

---

## Phase 0: Pre-Flight Guard & Workspace Check
Prevent accidental destruction of existing work:
1. **Existing Artifact Check**: Check if `./DESIGN.md` or `./PRODUCT.md` already exists in the project root.
2. **Conflict Resolution (`ask_question`)**: If artifacts exist, confirm whether the user wishes to overwrite them, reuse existing specifications, or abort before modifying files.
3. **Skip Logic**: If the user chooses to reuse an existing `DESIGN.md`, skip Phase 1 entirely. If reusing an existing `PRODUCT.md`, skip Phase 2 entirely. Proceed to the next applicable phase.

---

## Phase 1: Visual Foundation & DESIGN.md Selection (`awesome-design-md`)
Establish the visual ground truth before gathering product requirements or writing code:
1. **Analyze User Intent**: Evaluate the user's initial prompt against the 74 production brand design systems in `.agents/skills/awesome-design-md/design-md/`.
2. **Interactive Selection Gate (`ask_question`)**: Present at least 6 choices to the user:
   - 5 curated `DESIGN.md` recommendations closely matching the user's prompt (e.g., `linear.app`, `stripe`, `apple`, `vercel`, `supabase`, `raycast`).
   - 1 option to choose manually (allowing the user to specify any other brand from the 74 available).
3. **Install Ground Truth**: Copy the selected specification directly to the project root:
   ```bash
   # Unix / PowerShell:
   cp .agents/skills/awesome-design-md/design-md/<brand>/DESIGN.md ./DESIGN.md
   # Windows CMD:
   copy ".agents\skills\awesome-design-md\design-md\<brand>\DESIGN.md" .\DESIGN.md
   ```

---

## Phase 2: Product Truth & Architecture Expansion (`prompt-enhancer`)
Transform brief user concepts into an exhaustive, stack-agnostic specification:
1. **Capture Raw Product Intent & Archetype Selection (`ask_question`)**:
   - Prompt the user for their product concept, target audience, and primary problem solved (keep stack-agnostic).
   - **Website Archetype Gate**: Explicitly ask the user if they want a **Standard Website** or a **Website with Hero**:
     - *Standard Website*: TailGrids NexStudio blueprint + Spectrum UI footer.
     - *Website with Hero*: Md Adul E-commerce Marketplace blueprint + Spectrum UI footer.
2. **Execute Domain-Specific Enhancer**:
   - **Frontend / Client UI**: Apply `prompt-enhancer-frontend` (Page/Component Matrix, responsive breakpoints, state variants).
   - **Backend / Data API**: Apply `prompt-enhancer-backend` (API endpoints, DB schemas, state machines, RBAC tables).
   - **Fullstack System**: Apply general `prompt-enhancer` (End-to-end scope, core loop, and full domain analysis).
3. **Commit Exhaustive `PRODUCT.md`**: Write the generated domain analysis artifact (Sections 1–5) directly to `./PRODUCT.md`.
4. **Retain Master Specification**: Use the Section 6 Master Prompt as the primary execution contract for downstream phases.

---

## Phase 3: Prompt Synthesis for `design-taste-frontend`
Synthesize `PRODUCT.md` and `DESIGN.md` into the formal configuration required by the `design-taste-frontend` skill:
1. **Formulate Skill Input Specification**:
   ```text
   Skill: design-taste-frontend
   Page: [Landing | Portfolio | Redesign | Editorial | Dashboard]
   Audience: [Target user group extracted from PRODUCT.md]
   Vibe & Aesthetic: [Visual world & tone from the chosen DESIGN.md]
   References: [The chosen brand from awesome-design-md + competitor inspirations]
   Dials (inferred): Variance [1-10], Motion [1-10], Density [1-10]
   Key Assets / Constraints: [Color tokens from DESIGN.md, accessibility, dark/light mode]
   ```
2. **Declare Design Read**: Emit the mandatory one-line summary before generating code:
   `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system>."`

---

## Phase 4: Component Architecture & Blueprint Extraction
Prepare components adhering strictly to `DESIGN.md` tokens and `PRODUCT.md` P0 features:
1. **Default Component Blueprints (21st.dev Extraction)**:
   - **Extraction Mandate**: Pull the selected archetype components (from Phase 2 Website Archetype Gate) strictly via Stage 1 of [.agents/rules/frontend.md](.agents/rules/frontend.md) using `helpers.extract21stComponent('<url>', { writeTo: '<target-file>' })`.
   - **Option A: Standard Website (Default)**:
     - **Main Page**: **TailGrids NexStudio** (`https://21st.dev/community/templates/free?preview=%2F%40tailgrids%2Ftemplates%2Ftailgrids-nexstudio`): sticky header, hero with interactive preview, metrics telemetry bar, asymmetric bento capabilities grid, interactive developer sandbox, and conversion CTA.
     - **Footer**: **Spectrum UI Footer Section** by Arihant Jain (`https://21st.dev/community/components?q=footer&qs=downloads&preview=%2F%40arihantcodes_1f7b8c4d%2Fcomponents%2Ffooter-section`): integrated newsletter/inquiry subscription bar, multi-column directory, prominent brand wordmark, live system status pill, and compliance/social links.
   - **Option B: Website with Hero (Default)**:
     - **Main Page**: **E-commerce Marketplace Template** by Md Adul (`https://21st.dev/community/templates/free?preview=%2F%40mdadul%2Ftemplates%2Fe-commerce-marketplace-template`): prominent hero banner with curated product showcases, integrated marketplace search bar, quick artisan/product CTAs, asymmetric image bento showcase, and platform statistics bar.
     - **Footer**: The same **Spectrum UI Footer Section** by Arihant Jain (`https://21st.dev/community/components?q=footer&qs=downloads&preview=%2F%40arihantcodes_1f7b8c4d%2Fcomponents%2Ffooter-section`).
2. **Universal DESIGN.md Theming**:
   - Both default blueprints **must dynamically inherit and map all styles** (backgrounds, surfaces, borders, text, typography, border radius, and spacing) to the chosen `DESIGN.md` tokens.
   - Never use raw uncalibrated defaults or untinted grays; all color tokens and type scales must strictly resolve to `DESIGN.md` CSS variables.
3. **Execution & Hygiene Delegation**:
   - Spacing, responsive layout, and photography standards delegate strictly to [.agents/rules/UI_Always.md](.agents/rules/UI_Always.md).
   - Component intake, shader physics, anti-slop rules, and writing sanitization delegate strictly to [.agents/rules/frontend.md](.agents/rules/frontend.md).

---

## Phase 5: Implementation & Code Assembly
Build components strictly adhering to `DESIGN.md` tokens and `PRODUCT.md` P0 features:
1. **Confirm Tech Stack**: Confirm implementation framework before generating code (Next.js App Router, Vite/React, Astro, SvelteKit, or Static HTML5/CSS3).
2. **Standard Layout Archetypes**:
   - **Archetype A: High-Conversion SaaS & Product Dashboard**:
     - CSS Grid / Flexbox data tables with sticky headers and sortable columns.
     - `prefers-color-scheme` media query for system dark/light modes.
     - ≥16px body text, ≥44px interactive targets, subtle hover micro-interactions (opacity/translate, ≤200ms).
   - **Archetype B: Clean Editorial & Content Platform**:
     - Asymmetrical CSS Grid layouts (e.g., `2fr 1fr` or `1fr 3fr`) with generous `clamp()`-based spacing.
     - Typographic rhythm: distinct heading scale (1.333+ ratio), styled pull-quotes, and ≥1.6 line-height body.
     - Image curation with `object-fit: cover`, art-directed `<picture>` sources, and lazy loading.
3. **Ban Generic AI Clichés (Visual Slop & AI Writing)**:
   - **Visual Slop**: Zero floating pastel pills, zero icon-tile stacks, zero ghost cards, zero side-tab stripes, zero cards-in-cards nesting, zero unstyled browser fonts, zero uncalibrated purple/blue gradients.
   - **Textual Slop (`avoid-ai-writing`)**: Zero Tier 1A machine words, zero em dashes in headings, zero "It's not X — it's Y" tropes.
4. **Scope: P0 Delivery Only**: Build UI modules implementing the **P0 roadmap** from `PRODUCT.md`. P1–P3 features are cataloged in `PRODUCT.md` but deferred to iterative development cycles after this pipeline completes.

---

## Phase 6: Automated Verification & Handoff
Validate the running application inside real Chromium viewports:
1. **Browser Verification Mandate**: Execute browser inspection and multi-viewport responsive verification strictly following Section 8 of [.agents/rules/UI_Always.md](.agents/rules/UI_Always.md).
2. **Quality & Token Compliance Check**:
   - Verify 0 horizontal scroll overflows, 0 console errors, >=44px tap targets.
   - Run `.agents/skills/impeccable/scripts/impeccable.cmd detect .` (or Unix `.agents/skills/impeccable/scripts/impeccable detect .`) to verify compliance against `DESIGN.md` tokens.
3. **Git Hygiene & Lock**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`) are in `.gitignore`. Commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.