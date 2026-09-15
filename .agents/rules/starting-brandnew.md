---
trigger: manual
---

# Greenfield Design & Development Pipeline

Transform an empty directory into a validated, production-grade web application by executing these 5 bounded phases sequentially.

---

## Phase 1: Product Truth & Tech Stack (`impeccable init`)
Establish factual requirements and tech stack before proposing visual design or writing code:
1. **Playwright Runtime Check**: Verify `.agents/skills/playwright-skill` dependencies exist; run setup if absent.
2. **Product & Stack Discovery Interview**: Prompt the user via `ask_question` for:
   - Target audience and their exact job-to-be-done.
   - Core mechanism, key workflows, and constraints.
   - **Framework & Architecture**: Next.js (App Router), React with TypeScript, Vite, or Static HTML5/CSS3.
   - **Creative & Motion Stack**: Three.js with custom GLSL shaders (day, night, atmosphere), Lenis smooth scroll, and GSAP ScrollTrigger animations.
3. **Commit Product Manifest**: Write confirmed facts and stack decisions to `PRODUCT.md`. Never ask for visual styles or CSS values in this phase.

---

## Phase 2: Design Choice & Architecture (`impeccable shape` + `archify`)
Lock the visual world and system topology with the user:
1. **Visual Direction Workshop**: Run `impeccable shape` with `concept-seed --scope direction` to generate 3 distinct aesthetic directions (typography, palette, density, materials).
2. **Interactive Decision Gate**: Present the directions via `ask_question` or decision board for user selection.
3. **Direction Contract**: Record the chosen visual world and first-viewport layout into the surface brief.
4. **Architecture Blueprint**: Invoke `archify` to generate `ARCHITECTURE.html` showing component hierarchy, trust boundaries, and data flow.

---

## Phase 3: Slop-Free Implementation & Creative Engineering
Build components while enforcing strict anti-AI-slop rules in memory and activating specialized creative skills:
1. **Creative Tech Routing**:
   - **3D & Shaders**: Route Three.js, WebGL canvas, and custom GLSL shader pipelines through `3d-web-experience`.
   - **Kinetic Motion & Scroll**: Route smooth scroll (Lenis) and pinned/scrubbed scroll animations through `scroll-experience` and `gpt-taste`.
2. **Enforce Taste Dials (`design-taste-frontend`)**:
   - `DESIGN_VARIANCE > 4`: Ban centered H1 heroes; mandate asymmetric 50/50 splits or left-aligned layouts.
   - `VISUAL_DENSITY`: Enforce intentional spacing; ban floaty, low-information cards.
   - `MOTION_INTENSITY`: Restrict transitions to purposeful, hardware-accelerated micro-interactions.
3. **Ban Generic AI Clichés**: Zero purple/blue neon gradients, zero nested cards-inside-cards, zero default system serifs without intent.
4. **Assemble UI Components**: Implement responsive layout using semantic HTML5, clean CSS/Tailwind, and verified components.

---

## Phase 4: Automated Verification (`playwright-skill`)
Validate the running application inside real Chromium viewports:
1. **Launch Dev Server & Test Engine**: Run local dev server and connect `playwright-skill`.
2. **Multi-Viewport Visual Audit**: Capture screenshots to `./scratch/`:
   - Mobile: 375 × 667
   - Tablet: 768 × 1024
   - Desktop: 1280 × 800
3. **Automated Accessibility & Layout Check**: Inspect DOM overflow, tap targets (min 44px), contrast ratios, and console errors. Auto-remediate any defects found.

---

## Phase 5: System Documentation & Git Lock (`impeccable document`)
Extract durable tokens and the complete design system from the working code into `DESIGN.md`:
1. **Reverse-Document Tokens (Google Stitch Spec)**: Run `impeccable document` on the finished codebase to extract confirmed tokens and populate the 8 canonical sections in `DESIGN.md`:
   - `## Overview`: Atmosphere, emotional register, and design rationale.
   - `## Colors`: Machine-readable YAML token ramp, semantic roles, and dark/light contrast rules.
   - `## Typography`: Curated font pairings, type scales, tracking, and clamp formulas.
   - `## Layout`: Grid geometry, spacing scales, breakpoints, and responsive topology.
   - `## Elevation & Depth`: Shadow tokens, backdrop blur filters, and z-index layers.
   - `## Shapes`: Corner radii and border treatments.
   - `## Components`: Variants, hover/active states, and reusable markup snippets.
   - `## Do's and Don'ts`: Strict anti-drift guardrails.
2. **Generate Sidecar**: Extract `.impeccable/design.json` containing live rendered component snippets.
3. **Git Hygiene & Lock**: Verify ephemeral artifacts (`scratch/`, `.impeccable/`, `node_modules/`) are in `.gitignore`. Commit `package.json`, `PRODUCT.md`, `DESIGN.md`, and `ARCHITECTURE.html`.