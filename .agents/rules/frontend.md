---
trigger: model_decision
description: Follow this pipeline whenever designing, building, or refactoring UI. Enforce UI_Always.md for core layout, touch target, and CSS hygiene standards, and MOTION.md for animations and micro-interactions.
---

# Active Frontend Development Pipeline

Follow this pipeline whenever designing, building, or refactoring UI. Enforce [UI_Always.md](.agents/rules/UI_Always.md) for core layout, touch target, and CSS hygiene standards, [MOTION.md](.agents/rules/MOTION.md) for animations, spring physics, and micro-interactions, and [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md) to eliminate visual, structural, motion, and copywriting slop.

## Mandatory Frontend Skill Dispatch Matrix
Inspect only the 1–2 skills matching the active surface:
- **UI Scoping & Specs**: [prompt-enhancer-frontend](.agents/skills/prompt-enhancer-frontend/SKILL.md) · [prompt-enhancer](.agents/skills/prompt-enhancer/SKILL.md)
- **Design Systems, Tokens & Palettes**: [awesome-design-md](.agents/skills/awesome-design-md/SKILL.md) · [design-system](.agents/skills/design-system/SKILL.md) · [ui-ux-pro-max](.agents/skills/ui-ux-pro-max/SKILL.md)
- **Visual Craft, Taste & Anti-Slop**: [impeccable](.agents/skills/impeccable/SKILL.md) · [design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md) · [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md) · [avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md)
- **Components, React/Next.js & Styling**: [frontend-developer](.agents/skills/frontend-developer/SKILL.md) · [ui-styling](.agents/skills/ui-styling/SKILL.md) · [tailwind-patterns](.agents/skills/tailwind-patterns/SKILL.md) · [react-patterns](.agents/skills/react-patterns/SKILL.md) · [react-best-practices](.agents/skills/react-best-practices/SKILL.md) · [nextjs-best-practices](.agents/skills/nextjs-best-practices/SKILL.md) · [nextjs-app-router-patterns](.agents/skills/nextjs-app-router-patterns/SKILL.md)
- **Brand Assets & Image-Driven Builds**: [brandkit](.agents/skills/brandkit/SKILL.md) · [design](.agents/skills/design/SKILL.md) · [image-to-code](.agents/skills/image-to-code/SKILL.md) · [imagegen-frontend-web](.agents/skills/imagegen-frontend-web/SKILL.md)
- **Motion, Scrollytelling & 3D WebGL**: [MOTION.md](.agents/rules/MOTION.md) · [scrollytelling](.agents/skills/scrollytelling/SKILL.md) · [scroll-experience](.agents/skills/scroll-experience/SKILL.md) · [3d-web-experience](.agents/skills/3d-web-experience/SKILL.md)
- **SEO, Comparison & Editorial Pages**: [seo-audit](.agents/skills/seo-audit/SKILL.md) · [programmatic-seo](.agents/skills/programmatic-seo/SKILL.md) · [competitor-alternatives](.agents/skills/competitor-alternatives/SKILL.md) · [content-creator](.agents/skills/content-creator/SKILL.md)
- **Client Security & E2E Browser QA**: [frontend-security-coder](.agents/skills/frontend-security-coder/SKILL.md) · [playwright-skill](.agents/skills/playwright-skill/SKILL.md) · [agent-browser](.agents/skills/agent-browser/SKILL.md) · [e2e-testing-patterns](.agents/skills/e2e-testing-patterns/SKILL.md)

## Stage 1: Target Aesthetic & System Alignment
- **Modern Tech Stack Default (Greenfield Builds):** Always default to **Next.js App Router + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Motion / `@bsmnt/scrollytelling` + GSAP**, or **Vite + React + TypeScript + Tailwind CSS**, **Astro**, or **SvelteKit**. **Never default to or output vanilla HTML/CSS/JS** unless the user explicitly asks for vanilla or the existing codebase is already vanilla.
- **UI Scoping & Component Architecture:** When building new views or complex interfaces, invoke [prompt-enhancer-frontend](.agents/skills/prompt-enhancer-frontend/SKILL.md) to deconstruct the concept into an exhaustive P0–P3 component matrix, state variants, and responsive journeys before generating code.
- **Component Intake Engine (Scrollytelling, ThreeUI & Registries):**
  - **Scrollytelling (`@bsmnt/scrollytelling`) Intake:** For scroll-driven storytelling, pinned stages, parallax, or scroll-scrubbed 2D/3D canvas sequences, follow [scrollytelling](.agents/skills/scrollytelling/SKILL.md) (`npm install @bsmnt/scrollytelling gsap`).
  - **ThreeUI Package Intake:** When ThreeUI components or shaders are requested, run `npm install @designcodeio/threeui three @types/three` and import the requested background shader or canvas directly.
  - **Shadcn Registry Fallback:** For standard CLI registry items, run `npx shadcn@latest add "<url>"`.
- **Aesthetic Precedence:** The specification in `DESIGN.md` (guided by [impeccable](.agents/skills/impeccable/SKILL.md) and [design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md)) is the **authoritative target** for typography pairings, tinted palettes, spacing, and radius scales.
- Replace legacy CSS variables, inline styles, and unapproved fonts in the codebase with the `DESIGN.md` tokens. Declare all palette colors as CSS variables in `:root` (following [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md) for tinted neutrals and calibrated Visual DNA tokens).

## Stage 2: Composition, Motion & Anti-Slop Standards (via [impeccable](.agents/skills/impeccable/SKILL.md) & [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md))
- **Design Synthesis & Design Read Contract:** Before writing UI code, synthesize `PRODUCT.md` and `DESIGN.md` into this configuration and emit the 1-line Design Read summary:
  ```text
  Primary Craft Engine: impeccable (Visitor Mode: [Persuade | Operate | Read | Experience])
  Taste Calibration: design-taste-frontend · Anti-Slop: anti-ai-slop
  Page: [Landing | Dashboard | Editorial | Portfolio | Redesign]
  Audience: [Target user group from PRODUCT.md]
  Vibe & Aesthetic: [Visual world & tone from DESIGN.md]
  References: [Chosen brand from awesome-design-md + inspirations]
  Dials: DESIGN_VARIANCE [1-10], MOTION_INTENSITY [1-10], VISUAL_DENSITY [1-10]
  Key Assets / Constraints: [DESIGN.md color tokens, brand assets, a11y, dark/light mode]
  ```
  Emit: `"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system>."`
- **Standard Layout Archetypes:**
  - **Archetype A: High-Conversion SaaS & Product Dashboard:** CSS Grid/Flexbox tables with sticky headers and sortable columns, `prefers-color-scheme` system dark/light support, `≥16px` body text, `≥44px` interactive targets, and [MOTION.md](.agents/rules/MOTION.md) micro-interactions.
  - **Archetype B: Clean Editorial & Content Platform:** Asymmetric CSS Grids (e.g., `2fr 1fr` or `1fr 3fr`) with `clamp()` spacing, `1.333+` heading ratio, `≥1.6` body line-height, and curated imagery (`object-fit: cover`, art-directed `<picture>`, lazy loading).
- **Primary Visual Craft & Spatial Composition ([impeccable](.agents/skills/impeccable/SKILL.md)):** Use [impeccable](.agents/skills/impeccable/SKILL.md) as the primary design engine when creating or refactoring UI. Load [craft-floor.md](.agents/skills/impeccable/reference/craft-floor.md) and [layout.md](.agents/skills/impeccable/reference/layout.md) (plus [typeset.md](.agents/skills/impeccable/reference/typeset.md) and [colorize.md](.agents/skills/impeccable/reference/colorize.md) when tuning typography or color):
  - **Visitor Mode, Spatial Thesis & Concentric Geometry:** Align composition with the surface's visitor mode (`Persuade`, `Operate`, `Read`, `Experience`). Establish a clear reading order that passes the squint test (primary, secondary, and major groups distinct), group by proximity before adding containers, pair tight internal grouping with generous section separation on a `4px` base scale (honoring `DESIGN.md` `DESIGN_VARIANCE`, `VISUAL_DENSITY`, and `MOTION_INTENSITY` dials when present), and calculate concentric nested radii (`R_inner = Math.max(0, R_outer - Padding)`).
  - **Dashboard Telemetry & Density Hygiene (`1-to-3` / `85%-15%` Rule):** Enforce a **Single Source of Metric Truth**—never repeat the same KPI across headers and cards, never duplicate date pickers or filters inside individual cards (use one unified page-level control bar), and never add decorative tip banners or 3D globes. Enforce `1` focal element per zone (max `3` data points per card) and keep `85%` of primary workflows at `0` clicks while collapsing `≥ 5` secondary actions into popovers.
  - **Typography, Color & Browser Surfaces:** Enforce clear typographic hierarchy (`65ch–75ch` measure, `-0.02em` to `-0.03em` display tracking), WCAG AA contrast (`≥4.5:1` body / `≥3:1` large text), single-source elevation (crisp `1px` border OR directional shadow, never both), and themed browser surfaces (text selection, caret, scrollbars, `:focus-visible` rings, `tabular-nums`).
- **Motion & Micro-Interactions:** Delegate all transitions, spring physics (`stiffness`/`damping`), deterministic rest states, and `@media (prefers-reduced-motion: reduce)` fallbacks strictly to [MOTION.md](.agents/rules/MOTION.md).
- **Anti-AI-Slop & Natural Voice Enforcement:** Load and apply [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md) alongside [impeccable](.agents/skills/impeccable/SKILL.md), [design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md), and [avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md) to enforce all structural, palette, typography, icon/photography, scroll/marquee, and human-copy/domain-data rules (and verify via their automated gates unless explicitly overridden in the user brief).
- Ensure all interactive elements feature visible `:focus-visible` rings, `cursor: pointer`, and all 8 interactive states defined in Section 5 of [UI_Always.md](.agents/rules/UI_Always.md).

## Stage 3: Bounded Quality Audit (via Impeccable)
- **Audit**: Run `.agents/skills/impeccable/scripts/impeccable.cmd detect <file-or-dir>` (or Unix `.agents/skills/impeccable/scripts/impeccable detect <file-or-dir>`), plus the automated `design-taste-frontend` and `avoid-ai-writing` gates documented in [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md).
- **Single-Pass Remediation**: Resolve all detected contrast, rhythm, and token violations in **one single edit**. No iterative multi-turn patching.
- **Extraction**: Extract repeated UI blocks into reusable components.

## Stage 4: Real Browser & Responsive Verification
- **Verification Mandate:** Execute browser inspection and multi-viewport responsive verification strictly following Section 7 of [UI_Always.md](.agents/rules/UI_Always.md).
- **Quality Gates:** Verify zero horizontal scroll leaks (`scrollWidth > innerWidth`), zero console errors, and valid touch targets across mobile (375px), tablet (768px), and desktop (1280px).
- **Visual Proof:** Capture clean viewport screenshots into `scratch/` when needed. Do not create scratch `.js` files on disk.