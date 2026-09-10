---
trigger: manual
---

# Active Frontend Development Pipeline

Follow this pipeline whenever designing, building, or refactoring UI. Enforce [.agents/rules/UI_Always.md] for core layout, touch target, and CSS hygiene standards.

## Stage 1: Target Aesthetic & System Alignment
- **Aesthetic Precedence:** The specification established via `design-taste-frontend` in `DESIGN.md` is the **authoritative target** for typography pairings, tinted palettes, spacing, and radius scales.
- Replace legacy CSS variables, inline styles, and unapproved fonts in the codebase with the `DESIGN.md` tokens.
- Never use unapproved fonts, hardcoded hex values, or untinted neutrals (tint all darks and grays toward the brand hue; no raw `#000000` or `#808080`). All colors must be declared as CSS tokens in `:root`.

## Stage 2: Composition & Anti-Slop Standards
- Apply `design-taste-frontend` layout principles (`DESIGN_VARIANCE`, `VISUAL_DENSITY`, `MOTION_INTENSITY`): prioritize intentional whitespace, asymmetric layout balance, and disciplined visual rhythm.
- **Strict Anti-Pattern Checks (Unless explicitly overridden in the user brief):**
  - No card-inside-card nesting or repetitive identical card grids.
  - No generic centered hero sections or default purple-to-blue gradients.
  - No decorative side-stripe borders (`border-left` / `border-right` accents).
  - No `background-clip: text` gradient text (use solid, high-contrast type).
- **Iconography & Assets:** Never use Unicode emojis as UI icons. Use SVG icons (Lucide or Phosphor) with proper accessibility attributes (`aria-hidden="true"` or descriptive `aria-label`). Never use placeholder URLs.
- Ensure all interactive elements feature visible `:focus-visible` rings and `cursor: pointer`.

## Stage 3: Bounded Quality Audit (via Impeccable)
- **Audit**: Run `.agents\skills\impeccable\scripts\impeccable.cmd audit --target <file>`.
- **Single-Pass Remediation**: Resolve all detected contrast, rhythm, and token violations in **one single edit**. No iterative multi-turn patching.
- **Extraction**: Extract repeated UI blocks into reusable components.

## Stage 4: Real Browser & Responsive Verification
- **Server Detection**: Check `package.json` for `dev` script; verify active port before navigating.
- **Viewport Check**: Test at 375px, 768px, and 1280px using `browser_subagent` or `playwright-skill`.
- **Runtime Zero-Defect**: Verify 0 console errors and 0 broken assets (`page.on('console')`).
- **Visual Proof**: Capture clean viewport screenshots into session artifacts.