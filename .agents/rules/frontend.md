---
trigger: manual
---

# Active Frontend Development Pipeline

Follow this pipeline whenever designing, building, or refactoring UI. For minor copy or 1-line styling fixes, execute Stage 2 and a quick visual check.

## Stage 1: Target Aesthetic & System Alignment
- **Aesthetic Precedence:** The specification established via `taste-skill` in `DESIGN.md` is the **authoritative target** for typography pairings, tinted palettes, spacing, and radius scales.
- Replace legacy CSS variables, inline styles, and unapproved fonts in the codebase with the `DESIGN.md` tokens.
- Never use unapproved fonts, hardcoded hex values, or untinted neutrals (tint all darks and grays toward the brand hue; no raw `#000000` or `#808080`). All colors must be declared as CSS tokens in `:root`.

## Stage 2: Composition & Anti-Slop Standards
- Apply `taste-skill` layout principles (`DESIGN_VARIANCE`, `VISUAL_DENSITY`, `MOTION_INTENSITY`): prioritize intentional whitespace, asymmetric layout balance, and disciplined visual rhythm.
- **Strict Anti-Pattern Checks (Unless explicitly overridden in the user brief):**
  - No card-inside-card nesting or repetitive identical card grids.
  - No generic centered hero sections or default purple-to-blue gradients.
  - No decorative side-stripe borders (`border-left` / `border-right` accents).
  - No `background-clip: text` gradient text (use solid, high-contrast type).
- **Iconography & Assets:** Never use Unicode emojis as UI icons. Use SVG icons (Lucide or Phosphor) with proper accessibility attributes (`aria-hidden="true"` or descriptive `aria-label`). Never use placeholder URLs.
- Ensure all interactive elements feature visible `:focus-visible` rings and `cursor-pointer`.

## Stage 3: Bounded Quality Review & Remediation (via Impeccable)
1. **Audit:** Run a batched technical and visual review using `@impeccable` guidelines:
   - Check contrast ratios, touch targets, hierarchy, rhythm, and layout overflow.
   - Run `.agents/skills/impeccable/scripts/impeccable.cmd audit --target <file>` when the CLI runner is available.
2. **Batched Remediation:** Fix all detected spacing, contrast, typography, and edge-case issues in a **single editing pass** rather than unbounded iterative loops.
3. **Component Extraction:** Consolidate repeated UI patterns into reusable components.

## Stage 4: Real Browser & Responsive Verification
1. Ensure the local web server is running (start one if needed).
2. Use `playwright-skill` or browser tools to inspect the rendered page across standard breakpoints:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1280px+
3. Validate runtime behavior:
   - Zero console errors or broken asset/image links (`page.on('console')`).
   - Confirm text reflows without clipping or unwanted horizontal scrollbars.
   - Ensure touch/click targets meet minimum dimensions (≥ 44×44px).
4. Capture clean viewport screenshots across breakpoints as proof of task completion.
