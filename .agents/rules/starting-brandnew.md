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

## Phase 4: Component Architecture & Token Theming
Prepare components adhering strictly to `DESIGN.md` tokens and `PRODUCT.md` P0 features:
1. **Default Component Blueprints & Link-Pulling Engine (21st.dev Catalog)**:
   - **Link-Pulling Engine**: Pull components directly from 21st.dev links via headless browser automation (`playwright-skill`). The engine inspects 21st.dev preview links directly, extracts bundled preview iframes (`cdn.21st.dev/bundled/...`) or live demo domains (e.g. `nexstudio.demos.tailgrids.com`, `v0-ecommerce-hero-section-myp89k.vercel.app`), extracts the exact rendered DOM, classes, and SVG assets, and transpiles them into the selected `DESIGN.md` token system.
   - **Option A: Standard Website (Default)**:
     - **Main Page Architecture**: **TailGrids NexStudio** (`https://21st.dev/community/templates/free?preview=%2F%40tailgrids%2Ftemplates%2Ftailgrids-nexstudio`): sticky header, hero with interactive preview, metrics telemetry bar, asymmetric bento capabilities grid, interactive developer sandbox, and conversion CTA.
     - **Footer Architecture**: **Spectrum UI Footer Section** by Arihant Jain (`https://21st.dev/community/components?q=footer&qs=downloads&preview=%2F%40arihantcodes_1f7b8c4d%2Fcomponents%2Ffooter-section`): integrated newsletter/inquiry subscription bar, multi-column directory, prominent brand wordmark, live system status pill, and compliance/social links.
   - **Option B: Website with Hero (Default)**:
     - **Main Page Architecture**: **E-commerce Marketplace Template** by Md Adul (`https://21st.dev/community/templates/free?preview=%2F%40mdadul%2Ftemplates%2Fe-commerce-marketplace-template`, preview `https://v0-ecommerce-hero-section-myp89k.vercel.app/?pv=1`): prominent hero banner with curated product showcases, integrated marketplace search bar, quick artisan/product CTAs, asymmetric image bento showcase, and platform statistics bar.
     - **Footer Architecture**: The same **Spectrum UI Footer Section** by Arihant Jain (`https://21st.dev/community/components?q=footer&qs=downloads&preview=%2F%40arihantcodes_1f7b8c4d%2Fcomponents%2Ffooter-section`).
     - **Tighter Hero Spacing Standard**: Set hero top padding strictly to `calc(var(--header-height) + var(--space-lg))` (24px inset below fixed header) to eliminate dead vertical whitespace and seat the hero headline and bento showcase immediately below the navigation bar.
     - **Real Photography Sourcing (Strict: No AI Generation)**: When Website with Hero is selected, populate all hero bento showcase cards and product catalog cards with real, authentic photography sourced from the internet or scraped from template assets (e.g. Unsplash, Pexels, or CDN assets). **Never use AI generation** for showcase or product imagery. Pair images with `object-fit: cover` and semi-transparent scrim overlays (e.g. `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA contrast for text labels and badges.
2. **Universal DESIGN.md Theming**:
   - Both default blueprints **must dynamically inherit and map all styles** (backgrounds, surfaces, borders, text, typography, border radius, and spacing) to the chosen `DESIGN.md` tokens.
   - Never use raw uncalibrated defaults or untinted grays; all color tokens and type scales must strictly resolve to `DESIGN.md` CSS variables.
3. **Copy Sanitization (`avoid-ai-writing`)**:
   - Audit all headline, button, and body copy.
   - Ban Tier 1A machine words (`delve`, `tapestry`, `seamless`, `robust`, `cutting-edge`, `leverage`, `game-changer`, `synergy`).
   - Remove em dashes (`—` or `--`) from titles/slogans. Ground all copy in concrete functionality and numbers.
4. **Overdrive Delegation**: When Overdrive mode is requested, activate [.agents/rules/overdrive.md](file:///c:/xampp/htdocs/YEAR%204/Skills/.agents/rules/overdrive.md).

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

## Phase 6: Automated Verification & Handoff (`playwright-skill` + `impeccable`)
Validate the running application inside real Chromium viewports:
1. **Playwright Multi-Viewport Audit**: Run headless Chromium checks via `node .agents/skills/playwright-skill/run.js` writing to `./scratch/`:
   - Mobile: 375 × 667
   - Tablet: 768 × 1024
   - Desktop: 1280 × 800
2. **Quality & Token Compliance Check**:
   - Verify 0 horizontal scroll overflows, 0 console errors, >=44px tap targets.
   - Run `.agents/skills/impeccable/scripts/impeccable.cmd detect .` (or Unix `.agents/skills/impeccable/scripts/impeccable detect .`) to verify compliance against `DESIGN.md` tokens.
3. **Git Hygiene & Lock**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`) are in `.gitignore`. Commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.