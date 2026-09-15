---
trigger: manual
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
   cp .agents/skills/awesome-design-md/design-md/<brand>/DESIGN.md ./DESIGN.md
   ```

---

## Phase 2: Product Truth & Architecture Expansion (`prompt-enhancer`)
Transform brief user concepts into an exhaustive, stack-agnostic specification:
1. **Capture Raw Product Intent**: Prompt the user via `ask_question` for their product concept, target audience, and primary problem solved (keep stack-agnostic).
2. **Execute `prompt-enhancer` Pipeline**:
   - **Disambiguate**: If ambiguous across 2+ paradigms, ask 1 targeted clarifying question.
   - **Deconstruct**: Map Strategic Scope, P0–P3 Feature Matrix, Core Data Entities, User Journeys, and NFRs.
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

## Phase 4: Implementation & Creative Engineering
Build components strictly adhering to `DESIGN.md` tokens, `PRODUCT.md` P0 features, and chosen architecture:
1. **Confirm Tech Stack**: Confirm implementation framework before generating code. Examples include Next.js App Router, Vite/React, Astro, SvelteKit, or Static HTML5/CSS3 — any framework the user selects is valid.
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
4. **Scope: P0 Delivery Only**: Build UI modules implementing the **P0 roadmap** from `PRODUCT.md`. P1–P3 features are cataloged in `PRODUCT.md` but deferred to iterative development cycles after this pipeline completes.

---

## Phase 5: Automated Verification & Handoff (`playwright-skill` + `impeccable`)
Validate the running application inside real Chromium viewports:
1. **Playwright Multi-Viewport Audit**: Run headless Chromium visual checks to `./scratch/`:
   - Mobile: 375 × 667
   - Tablet: 768 × 1024
   - Desktop: 1280 × 800
2. **Quality & Token Compliance Check**:
   - Verify 0 horizontal scroll overflows, 0 console errors, >=44px tap targets.
   - Run `impeccable detect` to verify compliance against `DESIGN.md` tokens.
3. **Git Hygiene & Lock**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`) are in `.gitignore`. Commit `package.json`, `PRODUCT.md`, and `DESIGN.md`.