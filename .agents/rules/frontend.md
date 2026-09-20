---
trigger: model_decision
description: Follow this pipeline whenever designing, building, or refactoring UI. Enforce UI_Always.md for core layout, touch target, and CSS hygiene standards.
---

# Active Frontend Development Pipeline

Follow this pipeline whenever designing, building, or refactoring UI. Enforce [UI_Always.md](.agents/rules/UI_Always.md) for core layout, touch target, and CSS hygiene standards.

## Stage 1: Target Aesthetic & System Alignment
- **UI Scoping & Component Architecture:** When building new views or complex interfaces, invoke `prompt-enhancer-frontend` to deconstruct the concept into an exhaustive P0–P3 component matrix, state variants, and responsive journeys before generating code.
- **Component Intake & Link-Pulling Engine (21st.dev & ThreeUI):**
  - **Fastest 21st.dev Extraction & Instant Deploy:** When given any 21st.dev link (preview query parameter, community URL, or direct component page), execute the universal extractor via inline Node:
    ```powershell
    node .agents/skills/playwright-skill/run.js -e "const r = await helpers.extract21stComponent('<url>', { writeTo: '<target-file>' }); console.log(JSON.stringify(r));"
    ```
    - **Universal Target Destination**: `<target-file>` adapts dynamically to wherever the user wants the extracted content placed (`index.html`, `index.php`, `src/App.tsx`, `components/Hero.tsx`, `pages/index.astro`, etc.). When integrating into an existing component rather than writing a standalone file, omit `{ writeTo }` to receive the clean bundle JSON (`demoCode`, `shaders`, `standaloneHtml`) and merge it directly into the user's chosen destination.
    - **1-Step Paywall Bypass**: Pulls the compiled, 100% self-contained production bundle, TSX usage code, and raw GLSL shaders directly from `cdn.21st.dev` in ~2 seconds, bypassing all web copy locks and daily unlock limits.
    - **Zero Approximation Rule**: Never approximate Framer Motion spring physics, SVG bezier coordinates, or WebGL shaders with generic CSS keyframes. Always extract the exact spring constants (`stiffness`, `damping`), SVG path formulas, and GLSL uniforms directly from the bundle.
    - **Dark Theme Preservation**: Automatically pre-configures `<html class="dark">` and `defaultTheme: "dark"` to eliminate text-gradient clipping or inverted background defects.
  - **ThreeUI Package Intake:** When ThreeUI components or shaders are requested, run `npm install @designcodeio/threeui three @types/three` and import the requested background shader or canvas directly.
  - **Shadcn Registry Fallback:** For standard CLI registry items, run `npx shadcn@latest add "<url>"`.
- **Aesthetic Precedence:** The specification established via `design-taste-frontend` in `DESIGN.md` is the **authoritative target** for typography pairings, tinted palettes, spacing, and radius scales.
- Replace legacy CSS variables, inline styles, and unapproved fonts in the codebase with the `DESIGN.md` tokens.
- Never use unapproved fonts, hardcoded hex values, or untinted neutrals (tint all darks and grays toward the brand hue; no raw `#000000` or `#808080`). All colors must be declared as CSS tokens in `:root`.

## Stage 2: Composition & Anti-Slop Standards
- Apply `design-taste-frontend` layout principles (`DESIGN_VARIANCE`, `VISUAL_DENSITY`, `MOTION_INTENSITY`): prioritize intentional whitespace, asymmetric layout balance, and disciplined visual rhythm.
- **Strict Anti-Pattern Checks (Unless explicitly overridden in the user brief):**
  - **No Floating Eyebrow Pill Badges:** Never place floating rounded pill badges or pastel chip capsules (`rounded-full` with colored backgrounds/borders) above headings. Lead directly with the headline, or use clean unboxed typographic kickers (plain text with tracking, zero borders or background bubbles).
  - **No Ghost Cards & Fake Side Tabs:** No 1px hairline borders paired with 30px diffused drop shadows; no decorative `border-left` stripes.
  - **No Icon-Tile Stacks:** No rounded square icon containers stacked directly above card headings.
  - **No Card Nesting & Identical Grids:** Limit container depth to 1 level; replace uniform 3-card grids with asymmetric bento layouts.
  - **No Decorative Gridlines or Radial Halo Glows:** No graph-paper linear gradients or neon dark-mode glow orbs.
  - **Iconography & Assets:** Never use Unicode emojis as UI icons. Use SVG icons (Lucide or Phosphor) with proper accessibility attributes (`aria-hidden="true"` or descriptive `aria-label`). Never use placeholder URLs.
  - **Real Photography Sourcing (Strict: No AI Generation):** Populate showcase, hero, and product cards with real, authentic photography sourced from the internet or scraped from template assets (e.g. Unsplash, Pexels, or CDN assets). **Never use AI generation** for showcase or product imagery. Pair images with `object-fit: cover` and semi-transparent scrim overlays (e.g. `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA contrast for text labels and badges.
  - **Anti-AI Writing & Natural Voice Standards (`avoid-ai-writing`):** Ground all UI copy, headlines, microcopy, and empty states in natural, human voice:
    - **Zero Tier 1A Buzzwords:** Ban `delve`, `tapestry`, `realm`, `paradigm`, `embark`, `testament to`, `robust`, `comprehensive`, `cutting-edge`, `leverage`, `meticulous`, `seamless`, `game-changer`, `vibrant`, `thriving`, `deep dive`, `unpack`, `intricacies`, `ever-evolving`, `actionable`, `impactful`, `synergy`, `at its core`.
    - **Zero Hollow Intensifiers:** Cut `truly`, `genuinely`, `quite frankly`, `worth noting`, `worth your time`, `actually` (unless marking factual contrast).
    - **Zero Formulaic Rhetoric:** Ban "It's not X — it's Y", split-sentence reveals, and em dashes (`—` or `--`) in titles/headers/slogans.
    - **Zero Header Emojis:** Ban decorative emojis in section titles (`## 🚀 Features` is strictly prohibited).
- Ensure all interactive elements feature visible `:focus-visible` rings and `cursor: pointer`.

## Stage 3: Bounded Quality Audit (via Impeccable)
- **Audit**: Run `.agents/skills/impeccable/scripts/impeccable.cmd detect <file-or-dir>` (or Unix `.agents/skills/impeccable/scripts/impeccable detect <file-or-dir>`).
- **Single-Pass Remediation**: Resolve all detected contrast, rhythm, and token violations in **one single edit**. No iterative multi-turn patching.
- **Extraction**: Extract repeated UI blocks into reusable components.

## Stage 4: Real Browser & Responsive Verification
- **Verification Mandate:** Execute browser inspection and multi-viewport responsive verification strictly following Section 8 of [.agents/rules/UI_Always.md](.agents/rules/UI_Always.md).
- **Quality Gates:** Verify zero horizontal scroll leaks (`scrollWidth > innerWidth`), zero console errors, and valid touch targets across mobile (375px), tablet (768px), and desktop (1280px).
- **Visual Proof:** Capture clean viewport screenshots into `scratch/` when needed. Do not create scratch `.js` files on disk.