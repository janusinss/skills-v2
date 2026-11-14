---
trigger: model_decision
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

## Phase 1: Visual Foundation & DESIGN.md Selection ([awesome-design-md](../skills/awesome-design-md/SKILL.md))
Establish the visual ground truth before gathering product requirements or writing code:
1. **Analyze User Intent**: Evaluate the user's initial prompt against the 84 production brand design systems in `.claude/skills/awesome-design-md/design-md/`.
2. **Batched Interactive Discovery Gate (`ask_question`)**: Combine all unresolved project choices (Phase 1.2 design system, Phase 2.1 product intent & website archetype, and tech stack) into a single batched prompt:
   - Present up to 5 curated `DESIGN.md` recommendations closely matching the user's prompt (e.g., `linear.app`, `stripe`, `apple`, `vercel`, `supabase`); rely on the prompt's built-in write-in field if the user prefers any other brand from the 84 available.
3. **Install Ground Truth**: Copy the selected specification directly to the project root:
   ```bash
   # Unix / PowerShell:
   cp .claude/skills/awesome-design-md/design-md/<brand>/DESIGN.md ./DESIGN.md
   # Windows CMD:
   copy ".claude\skills\awesome-design-md\design-md\<brand>\DESIGN.md" .\DESIGN.md
   ```

---

## Phase 2: Product Truth & Architecture Expansion ([prompt-enhancer](../skills/prompt-enhancer/SKILL.md))
Transform brief user concepts into an exhaustive, modern-stack-grounded specification:
1. **Capture Raw Product Intent & Archetype Selection (`ask_question`)**:
   - Batched into the Phase 1.2 prompt when unspecified: capture the product concept, target audience, primary problem solved, and modern stack per Stage 1 of [frontend.md](frontend.md) (paired with Next.js Route Handlers/Server Actions, FastAPI + SQLAlchemy 2.0, or Go + PostgreSQL/Prisma/Drizzle when backend persistence is required).
   - **Website Archetype Gate (Default Landing / Marketing Builds)**: When building a landing page, marketing site, or storefront and no custom layout is requested, ask if the user wants a **Standard Website** or a **Website with Hero** (skip for pure dashboards, internal tools, or custom-specified layouts):
     - *Standard Website*: TailGrids NexStudio blueprint + Spectrum UI footer.
     - *Website with Hero*: Md Adul E-commerce Marketplace blueprint + Spectrum UI footer.
2. **Execute Domain-Specific Enhancer**:
   - **Frontend / Client UI**: Apply [prompt-enhancer-frontend](../skills/prompt-enhancer-frontend/SKILL.md) (Page/Component Matrix, modern React/Next.js/Tailwind stack, responsive breakpoints, state variants).
   - **Backend / Data API**: Apply [prompt-enhancer-backend](../skills/prompt-enhancer-backend/SKILL.md) (API endpoints, DB schemas, modern typed backend stack, state machines, RBAC tables).
   - **Fullstack System**: Apply general [prompt-enhancer](../skills/prompt-enhancer/SKILL.md) (End-to-end scope, modern fullstack architecture, core loop, and full domain analysis).
3. **Commit Exhaustive `PRODUCT.md`**: Write the generated domain analysis artifact (Sections 1–5) directly to `./PRODUCT.md`.
4. **Architecture & Schema Visualization**: Generate verified standalone HTML `architecture`, `sequence`, `dataflow`, and `erd` diagrams alongside `PRODUCT.md` using [archify](../skills/archify/SKILL.md) when mapping service boundaries, request lifecycles, data pipelines, or relational schemas.
5. **Retain Master Specification**: Use the Section 6 Master Prompt as the primary execution contract for downstream phases.

---

## Phase 3: Aesthetic & Visitor-Mode Synthesis ([frontend.md](frontend.md) Stage 2)
1. **Synthesize Configuration**: Map `PRODUCT.md` and `DESIGN.md` into the canonical `Skill Input Specification` (Visitor Mode, Page, Audience, Vibe, References, inferred `DESIGN_VARIANCE`/`MOTION_INTENSITY`/`VISUAL_DENSITY` dials, and Assets/Constraints) defined in Stage 2 of [frontend.md](frontend.md).
2. **Declare Design Read**: Emit the mandatory one-line `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system>."` summary before generating code.

---

## Phase 4: Component Architecture & Blueprint Extraction
Prepare components adhering strictly to `DESIGN.md` tokens and `PRODUCT.md` P0 features:
1. **Default Component Blueprints (Landing / Marketing Builds)**:
   - **Scope Mandate**: When a default landing or marketing archetype was selected in Phase 2.1 (and no custom layout overrides it), construct the selected archetype components following [frontend.md](frontend.md) and [ui-styling](../skills/ui-styling/SKILL.md).
   - **Option A: Standard Website (Default)**: Sticky header, hero with interactive preview, metrics telemetry bar, asymmetric bento capabilities grid, interactive developer sandbox, conversion CTA, and multi-column footer with newsletter bar, brand wordmark, and live status pill.
   - **Option B: Website with Hero (Default)**: Prominent hero banner with curated product showcases, marketplace search bar, quick artisan/product CTAs, asymmetric image bento showcase, platform stats bar, and matching directory footer.
2. **Universal `DESIGN.md` Theming & Rule Delegation**:
   - Map all blueprint backgrounds, surfaces, borders, text, typography, radii, and spacing dynamically to `DESIGN.md` CSS variables (zero raw uncalibrated defaults or untinted grays).
   - Delegate layout/8-state/media hygiene to [UI_Always.md](UI_Always.md), visual craft/intake/anti-slop to [frontend.md](frontend.md) and [anti-ai-slop](../skills/anti-ai-slop/SKILL.md), copy gates to [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md), and physics/scrollytelling to [MOTION.md](MOTION.md) + [scrollytelling](../skills/scrollytelling/SKILL.md).

---

## Phase 5: Implementation & Code Assembly (via [impeccable](../skills/impeccable/SKILL.md) & [frontend.md](frontend.md))
Build components strictly adhering to `DESIGN.md` tokens, `PRODUCT.md` P0 features, and Stages 1–2 of [frontend.md](frontend.md):
1. **Modern Tech Stack & Archetypes**: Follow the Stage 1 Modern Tech Stack Default (paired with typed Next.js/FastAPI/Go + PostgreSQL backends when persistence is required) and apply the Stage 2 Standard Layout Archetypes (`Archetype A` SaaS/Dashboard or `Archetype B` Editorial/Content) in [frontend.md](frontend.md).
2. **Anti-AI-Slop & Natural Voice Enforcement**: Load and apply [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) (paired with [craft-floor.md](../skills/impeccable/reference/craft-floor.md) and [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md)) across all visual, structural, media, and copywriting surfaces.
3. **Scope: P0 Delivery Only**: Build UI modules implementing the **P0 roadmap** from `PRODUCT.md`; defer P1–P3 features to iterative cycles after this pipeline completes.

---

## Phase 6: Automated Verification & Handoff
Validate the running application inside real Chromium viewports:
1. **Audit & Chromium Verification**: Execute bounded quality audits per Stage 3 of [frontend.md](frontend.md) (`impeccable detect .` + anti-slop gates) and multi-viewport Chromium verification (`0` horizontal overflow, `0` console errors, `>=44x44px` targets) per Stage 4 of [frontend.md](frontend.md) and [UI_Always.md](UI_Always.md#7-browser-verification-policy).
2. **Git Hygiene & Lock**: Ensure ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`) are in `.gitignore`, then commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.