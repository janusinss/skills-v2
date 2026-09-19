---
trigger: model_decision
description: Follow this pipeline whenever designing, building, or refactoring UI. Enforce UI_Always.md for core layout, touch target, and CSS hygiene standards.
---

# Active Frontend Development Pipeline

Follow this pipeline whenever designing, building, or refactoring UI. Enforce [UI_Always.md](file:///C:/xampp/htdocs/YEAR%204/Skills/.agents/rules/UI_Always.md) for core layout, touch target, and CSS hygiene standards.

## Stage 1: Target Aesthetic & System Alignment
- **UI Scoping & Component Architecture:** When building new views or complex interfaces, invoke `prompt-enhancer-frontend` to deconstruct the concept into an exhaustive P0–P3 component matrix, state variants, and responsive journeys before generating code.
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
- Ensure all interactive elements feature visible `:focus-visible` rings and `cursor: pointer`.

## Stage 3: Bounded Quality Audit (via Impeccable)
- **Audit**: Run `.agents/skills/impeccable/scripts/impeccable.cmd detect <file-or-dir>` (or Unix `.agents/skills/impeccable/scripts/impeccable detect <file-or-dir>`).
- **Single-Pass Remediation**: Resolve all detected contrast, rhythm, and token violations in **one single edit**. No iterative multi-turn patching.
- **Extraction**: Extract repeated UI blocks into reusable components.

## Stage 4: Real Browser & Responsive Verification
- **Engine Mandate:** Strictly use `playwright-skill` (`node .agents/skills/playwright-skill/run.js`) for all browser inspections and DOM verifications. Never use the built-in website viewer, IDE browser preview, or `browser_subagent`. All test scripts and visual captures auto-target the ignored `scratch/` directory.
- **Server Detection:** Check `package.json` for `dev` script; verify active port before navigating.
- **Viewport Check:** Test across mobile (375px), tablet (768px), and desktop (1280px) via `playwright-skill`.
- **Runtime Zero-Defect:** Verify 0 console errors and 0 broken assets (`page.on('console')`).
- **Visual Proof:** Capture clean viewport screenshots into `scratch/` via Playwright.