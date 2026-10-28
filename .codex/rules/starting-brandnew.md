> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Greenfield Design & Development Pipeline

Transform an empty workspace into a validated, production-grade web application by executing these 6 bounded phases sequentially.

---

## Phase 0: Pre-Flight Guard & Workspace Check
Prevent accidental destruction of existing work:
1. **Existing Artifact Check**: Check if `./DESIGN.md` or `./PRODUCT.md` already exists in the project root.
2. **Conflict Resolution (when the existing user instructions leave a material choice unresolved)**: If artifacts exist, confirm whether the user wishes to overwrite them, reuse existing specifications, or abort before modifying files.
3. **Skip Logic**: If the user chooses to reuse an existing `DESIGN.md`, skip Phase 1 entirely. If reusing an existing `PRODUCT.md`, skip Phase 2 entirely. Proceed to the next applicable phase.

---

## Phase 1: Visual Foundation & DESIGN.md Selection ([awesome-design-md](../skills/awesome-design-md/SKILL.md))
Establish the visual ground truth before gathering product requirements or writing code:
1. **Analyze User Intent**: Evaluate the user's initial prompt against the 74 production brand design systems in `.codex/skills/awesome-design-md/design-md/`.
2. **Batched Interactive Discovery Gate (when the existing user instructions leave a material choice unresolved)**: Combine all unresolved project choices (Phase 1.2 design system, Phase 2.1 product intent & website archetype, and Phase 5.1 tech stack) into a single batched prompt:
   - Present up to 5 curated `DESIGN.md` recommendations closely matching the user's prompt (e.g., `linear.app`, `stripe`, `apple`, `vercel`, `supabase`); rely on the prompt's built-in write-in field (or a custom brand response) if the user prefers any other brand from the 74 available.
3. **Install Ground Truth**: Copy the selected specification directly to the project root:
   ```bash
   # Unix / PowerShell:
   cp .codex/skills/awesome-design-md/design-md/<brand>/DESIGN.md ./DESIGN.md
   # Windows CMD:
   copy ".codex\skills\awesome-design-md\design-md\<brand>\DESIGN.md" .\DESIGN.md
   ```

---

## Phase 2: Product Truth & Architecture Expansion ([prompt-enhancer](../skills/prompt-enhancer/SKILL.md))
Transform brief user concepts into an exhaustive, modern-stack-grounded specification:
1. **Capture Raw Product Intent & Archetype Selection (when the existing user instructions leave a material choice unresolved)**:
   - Batched into the Phase 1.2 discovery prompt when unspecified: capture the user's product concept, target audience, primary problem solved, and modern tech stack selection (defaulting to **Next.js App Router + React 19 + TypeScript + Tailwind CSS + shadcn/ui + `@bsmnt/scrollytelling` / Motion**; never defaulting to or offering vanilla HTML/CSS/JS unless explicitly requested by the user).
   - **Website Archetype Gate (Default Landing / Marketing Builds)**: When building a landing page, marketing site, or storefront and no custom layout is requested, ask if the user wants a **Standard Website** or a **Website with Hero** (skip for pure dashboards, internal tools, or custom-specified layouts):
     - *Standard Website*: TailGrids NexStudio blueprint + Spectrum UI footer.
     - *Website with Hero*: Md Adul E-commerce Marketplace blueprint + Spectrum UI footer.
2. **Execute Domain-Specific Enhancer**:
   - **Frontend / Client UI**: Apply [prompt-enhancer-frontend](../skills/prompt-enhancer-frontend/SKILL.md) (Page/Component Matrix, modern React/Next.js/Tailwind stack, responsive breakpoints, state variants).
   - **Backend / Data API**: Apply [prompt-enhancer-backend](../skills/prompt-enhancer-backend/SKILL.md) (API endpoints, DB schemas, modern typed backend stack, state machines, RBAC tables).
   - **Fullstack System**: Apply general [prompt-enhancer](../skills/prompt-enhancer/SKILL.md) (End-to-end scope, modern fullstack architecture, core loop, and full domain analysis).
3. **Commit Exhaustive `PRODUCT.md`**: Write the generated domain analysis artifact (Sections 1–5) directly to `./PRODUCT.md`.
4. **Retain Master Specification**: Use the Section 6 Master Prompt as the primary execution contract for downstream phases.

---

## Phase 3: Aesthetic & Visitor-Mode Synthesis ([impeccable](../skills/impeccable/SKILL.md) & [design-taste-frontend](../skills/design-taste-frontend/SKILL.md))
Synthesize `PRODUCT.md` and `DESIGN.md` into the formal configuration required by Stage 2 of [frontend.md](frontend.md) ([impeccable](../skills/impeccable/SKILL.md) primary visual craft and [design-taste-frontend](../skills/design-taste-frontend/SKILL.md) taste calibration):
1. **Formulate Skill Input Specification**:
   ```text
   Primary Craft Engine: impeccable (Visitor Mode: [Persuade | Operate | Read | Experience])
   Taste Calibration: design-taste-frontend
   Page: [Landing | Portfolio | Redesign | Editorial | Dashboard]
   Audience: [Target user group extracted from PRODUCT.md]
   Vibe & Aesthetic: [Visual world & tone from the chosen DESIGN.md]
   References: [The chosen brand from awesome-design-md + competitor inspirations]
   Dials (inferred): DESIGN_VARIANCE [1-10], MOTION_INTENSITY [1-10], VISUAL_DENSITY [1-10]
   Key Assets / Constraints: [Color tokens from DESIGN.md, accessibility, dark/light mode]
   ```
2. **Declare Design Read**: Emit the mandatory one-line summary before generating code:
   `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system>."`

---

## Phase 4: Component Architecture & Blueprint Extraction
Prepare components adhering strictly to `DESIGN.md` tokens and `PRODUCT.md` P0 features:
1. **Default Component Blueprints (Landing / Marketing Builds)**:
   - **Scope Mandate**: When a default landing or marketing archetype was selected in Phase 2.1 (and no custom layout overrides it), construct the selected archetype components following [frontend.md](frontend.md) and [ui-styling](../skills/ui-styling/SKILL.md).
   - **Option A: Standard Website (Default)**:
     - **Main Page**: Sticky header, hero with interactive preview, metrics telemetry bar, asymmetric bento capabilities grid, interactive developer sandbox, and conversion CTA.
     - **Footer**: Integrated newsletter/inquiry subscription bar, multi-column directory, prominent brand wordmark, live system status pill, and compliance/social links.
   - **Option B: Website with Hero (Default)**:
     - **Main Page**: Prominent hero banner with curated product showcases, integrated marketplace search bar, quick artisan/product CTAs, asymmetric image bento showcase, and platform statistics bar.
     - **Footer**: Integrated newsletter/inquiry subscription bar, multi-column directory, prominent brand wordmark, live system status pill, and compliance/social links.
2. **Universal DESIGN.md Theming**:
   - Both default blueprints **must dynamically inherit and map all styles** (backgrounds, surfaces, borders, text, typography, border radius, and spacing) to the chosen `DESIGN.md` tokens.
   - Never use raw uncalibrated defaults or untinted grays; all color tokens and type scales must strictly resolve to `DESIGN.md` CSS variables.
3. **Execution & Hygiene Delegation**:
   - Spacing, responsive layout, and photography standards delegate strictly to [UI_Always.md](UI_Always.md).
   - Component intake, [impeccable](../skills/impeccable/SKILL.md) Stage 2 visual craft, shader physics, anti-slop rules, and writing sanitization delegate strictly to [frontend.md](frontend.md).
   - Animations, spring physics, and interactive micro-interactions delegate strictly to [MOTION.md](MOTION.md) (and [scrollytelling](../skills/scrollytelling/SKILL.md) via `@bsmnt/scrollytelling` + GSAP for scroll-driven timelines, pinned stages, and 3D/canvas scrubbing).

---

## Phase 5: Implementation & Code Assembly (via [impeccable](../skills/impeccable/SKILL.md) & [frontend.md](frontend.md))
Build components strictly adhering to `DESIGN.md` tokens, `PRODUCT.md` P0 features, and Stage 2 of [frontend.md](frontend.md) ([impeccable](../skills/impeccable/SKILL.md) visitor-mode composition and [craft-floor.md](../skills/impeccable/reference/craft-floor.md)):
1. **Modern Tech Stack Mandate (when the existing user instructions leave a material choice unresolved)**: Always default to and scaffold new projects with a modern production tech stack — **Next.js App Router (React 19 + TypeScript + Tailwind CSS + shadcn/ui + Motion / `@bsmnt/scrollytelling` + GSAP)** by default, or **Vite + React + TypeScript + Tailwind CSS**, **Astro**, or **SvelteKit** (paired with modern typed backend stacks such as Next.js Route Handlers/Server Actions, FastAPI + SQLAlchemy 2.0, or Go + PostgreSQL/Prisma/Drizzle when backend persistence is required). **Never default to, recommend, or output vanilla HTML/CSS/JS (`Static HTML5/CSS3`)** when starting a new project unless the user explicitly asks for vanilla. Confirm the modern stack in the Phase 1.2 batched discovery prompt when not already specified.
2. **Standard Layout Archetypes**:
   - **Archetype A: High-Conversion SaaS & Product Dashboard**:
     - CSS Grid / Flexbox data tables with sticky headers and sortable columns.
     - `prefers-color-scheme` media query for system dark/light modes.
     - ≥16px body text, ≥44px interactive targets, and tactile hover/active micro-interactions governed by [MOTION.md](MOTION.md) (composite-only `transform`/`opacity`, settling ≤300ms).
   - **Archetype B: Clean Editorial & Content Platform**:
     - Asymmetrical CSS Grid layouts (e.g., `2fr 1fr` or `1fr 3fr`) with generous `clamp()`-based spacing.
     - Typographic rhythm: distinct heading scale (1.333+ ratio), styled pull-quotes, and ≥1.6 line-height body.
     - Image curation with `object-fit: cover`, art-directed `<picture>` sources, and lazy loading.
3. **Ban Generic AI Clichés (Visual Slop & AI Writing)**:
   - **Visual & Structural Slop**: Enforce Section 6 of [UI_Always.md](UI_Always.md) as the canonical anti-slop baseline (zero floating pill badges, icon-tile stacks, ghost cards, side-tab stripes, nested cards, unstyled fonts, or uncalibrated gradients).
   - **Textual Slop (`avoid-ai-writing`)**: Enforce Section 7 of [UI_Always.md](UI_Always.md) as the canonical copy floor (zero Tier 1A machine words, hollow intensifiers, em dashes in headings/buttons, `"It's not X — it's Y"` tropes, or section header emojis).
4. **Scope: P0 Delivery Only**: Build UI modules implementing the **P0 roadmap** from `PRODUCT.md`. P1–P3 features are cataloged in `PRODUCT.md` but deferred to iterative development cycles after this pipeline completes.

---

## Phase 6: Automated Verification & Handoff
Validate the running application inside real Chromium viewports:
1. **Browser Verification Mandate**: Execute browser inspection and multi-viewport responsive verification strictly following Section 8 of [UI_Always.md](UI_Always.md).
2. **Quality & Token Compliance Check**:
   - Verify 0 horizontal scroll overflows, 0 console errors, >=44px tap targets.
   - Run `.codex/skills/impeccable/scripts/impeccable.cmd detect .` (or Unix `.codex/skills/impeccable/scripts/impeccable detect .`) to verify compliance against `DESIGN.md` tokens.
3. **Git Hygiene & Lock**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`) are in `.gitignore`. Commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.