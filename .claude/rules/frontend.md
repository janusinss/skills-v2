# Active Frontend Development Pipeline (`frontend.md`)

Enforce [UI_Always.md](UI_Always.md) (layout/CSS), [MOTION.md](MOTION.md) (motion), and [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) (visual/copy).

## Task-Driven Skill Routing
Load only the 1-2 skills matching the active surface (`CLAUDE.md` §2/§4 holds the full catalog):
- **Scoping & Tokens:** [prompt-enhancer-frontend](../skills/prompt-enhancer-frontend/SKILL.md) · [awesome-design-md](../skills/awesome-design-md/SKILL.md) · [design-system](../skills/design-system/SKILL.md)
- **Visual Direction, Typography & Copy:** [design-taste-frontend](../skills/design-taste-frontend/SKILL.md) · [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) · [unslop](../skills/unslop/SKILL.md) · [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md)
- **Layout Architecture, Ergonomics & Craft Floor:** [impeccable](../skills/impeccable/SKILL.md) (`layout.md`, `craft-floor.md`, `operate.md`, `adapt.md`, `polish.md`, `harden.md`, `detect`)
- **Frameworks & Styling:** [frontend-developer](../skills/frontend-developer/SKILL.md) · [ui-styling](../skills/ui-styling/SKILL.md) · [tailwind-patterns](../skills/tailwind-patterns/SKILL.md) · [modern-web-guidance](../skills/modern-web-guidance/SKILL.md)
- **Motion, 3D & Media:** [interaction-catalog.md](../resources/creative-libraries/interaction-catalog.md) · [scrollytelling](../skills/scrollytelling/SKILL.md) · [3d-web-experience](../skills/3d-web-experience/SKILL.md) · [image-to-code](../skills/image-to-code/SKILL.md)
- **Browser QA & Review:** [playwright-skill](../skills/playwright-skill/SKILL.md) · [agent-browser](../skills/agent-browser/SKILL.md) · [a11y-architect](../agents/a11y-architect.md) · [react-reviewer](../agents/react-reviewer.md)

---

## Stage 1: Stack, Scoping & Token Alignment
- **Greenfield Stack:** Default to **Next.js App Router + React 19 + TypeScript + Tailwind CSS + shadcn/ui** (or Vite + React + TS + Tailwind, Astro, or SvelteKit); never vanilla HTML/CSS/JS unless requested or editing a vanilla app.
- **UI Scoping:** Run `prompt-enhancer-frontend` on new views or complex UIs for P0-P3 components, states, and responsive flows.
- **Baseline Web API Check:** Query [modern-web-guidance](../skills/modern-web-guidance/SKILL.md) (`search`->`retrieve`) before polyfills for `<dialog>`, `popover`, anchors, View Transitions, Scroll-Driven CSS, forms, or CWV; skip backend/trivial tasks; degrade gracefully offline.
- **Component & Library Intake:**
  - **Creative Libraries:** Use [creative-libraries](../resources/creative-libraries/README.md) (GSAP Club Suite, Lenis, `LenisGsapBridge`) + `interaction-catalog.md` for scroll, hero, hover, loader, text, and transition mechanics.
  - **Scrollytelling:** `npm install @bsmnt/scrollytelling gsap` (`scrollytelling`) for pinned stages or scrubbed canvases.
  - **ThreeUI:** `npm install @designcodeio/threeui three @types/three`; copy `node_modules/@designcodeio/threeui/lib-dist/assets/` to `./public/`.
  - **Shadcn Registry:** `npx shadcn@latest add "<url>"` for registry primitives.
- **Token Precedence:** Treat `DESIGN.md` as authoritative; declare palette colors as `:root` CSS variables and drop hardcoded hex.

---

## Stage 2: Visual Direction, Layout Architecture & Interactive Feel
- **Silent Direction Synthesis:** Resolve Visitor Mode (`Persuade` | `Operate` | `Read` | `Experience`), Page Type, Audience, Visual World, and Constraints from `PRODUCT.md` + `DESIGN.md` without a preamble.
- **Primary Design Director (`design-taste-frontend`):**
  - Owns visual identity, trade-matched palette dealing (`start.mjs deal`/`css`/`brand`; zero AI violet or template palettes), and typography pairings (`layout-v4.md`, `system.md`).
  - Owns copy voice (`copy.md`, `copy-voice.md`, `copy-lint.mjs`), real photos and brand icons (`photos.mjs`, `icons.mjs`; zero captions), and visual moments (`moments.mjs`, `effects-creative.md`).
- **Layout & Craft Floor Architect (`impeccable`):**
  - Owns grid structure, spatial rhythm, and multi-surface ergonomics via [layout.md](../skills/impeccable/reference/layout.md), [adapt.md](../skills/impeccable/reference/adapt.md), and [operate.md](../skills/impeccable/reference/operate.md).
  - Enforces contrast, depth, spacing floor, and refusals via [craft-floor.md](../skills/impeccable/reference/craft-floor.md) (`polish.md`, `harden.md`, `bolder.md`, `delight.md` for refinement passes).
- **Surface-Mode Coordination (Zero Contradiction):**
  - **`Persuade` & `Experience` (Marketing, Launches, Portfolios, Studios, Storefronts):** `design-taste-frontend` drives identity, palette/type deal, hero, copy voice, and moments; `impeccable` enforces grids, rhythm, `craft-floor.md`, and polish.
    - Pair `MOTION.md` + `interaction-catalog.md` for interactive feel, honoring `gate.mjs` rules on tasteskill-gated static sites.
  - **`Operate` & `Read` (SaaS, Dashboards, Admin, Editors, Docs):** `design-taste-frontend` supplies typography pairings, tinted palettes, and direct copy; `impeccable` (`layout.md`, `operate.md`, `craft-floor.md`, `harden.md`) owns app ergonomics and Archetype A tables.
    - Apply `1-to-3` / `85%-15%` telemetry hygiene below; never apply marketing-only `one-section-per-screen` rules or `gate.mjs` to dashboards.
- **Layout Archetypes:**
  - **Archetype A (SaaS & Dashboards):** Grid/Flex tables with sticky headers, sortable columns, `prefers-color-scheme`, and `>=44px` interactive targets.
  - **Archetype B (Editorial & Content):** Asymmetric grids (`2fr 1fr`, `1fr 3fr`), `clamp()` spacing, `>=1.333` heading ratio, `>=1.6` body line-height, and art-directed media.
- **Dashboard Telemetry Hygiene (`1-to-3` / `85%-15%` Rule):**
  - Keep one metric source of truth; never repeat KPIs across headers and cards.
  - Use one page-level filter/date bar instead of per-card controls; skip decorative tip banners and 3D globes.
  - Cap each zone at `1` focal element (max `3` data points/card); keep `85%` of primary flows at `0` clicks and collapse `>=5` secondary actions into popovers.
- **Delegated Standards:** Defer motion to `MOTION.md`, layout/states to `UI_Always.md`, and anti-slop/copy to `anti-ai-slop` + `avoid-ai-writing` (`unslop` for 9-pass redlining of existing screens, live URLs, or RTL).

---

## Stage 3: Bounded Quality Audit & Remediation
- **Impeccable & Copy Gates:** Run `.claude/skills/impeccable/scripts/impeccable detect <file-or-dir>` (Windows: `impeccable.cmd`), `copy-lint.mjs` (when applicable), and the `avoid-ai-writing` gate in `anti-ai-slop`.
- **Scoped Tasteskill Gate:** Run `design-taste-frontend` `gate.mjs` **only** on marketing/company sites built with tasteskill 2.5.1 (`.taste-skill/build.json` and `<meta name="page-type">`/`site-kind`); never on SaaS dashboards or non-tasteskill apps.
- **Bounded Remediation:** Fix contrast, token, rhythm, and copy findings in one bounded pass, then re-verify. Extract repeated UI blocks into reusable components.

---

## Stage 4: Real Browser & Responsive Verification
- Verify `375x667`, `768x1024`, and `1280x800` per [UI_Always.md](UI_Always.md#7-browser-verification-policy) (`0` overflow, `0` console/network errors, `>=44x44px` touch targets, `--a11y`).
- Save screenshots in git-ignored `scratch/` when visual proof is needed; create zero scratch `.js` files.
