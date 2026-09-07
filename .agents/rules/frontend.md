---
trigger: manual
---

# Active Development Pipeline (Run on All UI Tasks)

Execute these 4 stages sequentially whenever creating, refactoring, or updating UI:

## Stage 1: Design Tokens & System Alignment
- **Token Precedence:** When refactoring existing UI, `design-system/MASTER.md` (or `design-system/pages/<page>.md` if present) is the **authoritative target** for colors, typography, spacing, and radius scales. 
- Use `DESIGN.md` and `PRODUCT.md` strictly for brand tone, audience intent, and legacy component inventory—replace legacy CSS variables and hex codes with the new `MASTER.md` tokens.
- Never use unapproved fonts, hardcoded hex values, or untinted neutrals (tint all darks and grays toward the brand hue; no raw `#000000` or `#808080`).

## Stage 2: Composition & Asset Standards
- Apply `taste-skill` layout principles: prioritize visual density discipline, asymmetric balance, and intentional whitespace before assembling components.
- **Strict Anti-Pattern Checks:**
  - No card-inside-card nesting or repetitive identical card grids.
  - No generic centered hero sections or default purple-to-blue gradients.
  - No decorative side-stripe borders (`border-left` / `border-right` accents).
  - No `background-clip: text` gradient text (use solid, high-contrast type).
- **Iconography:** Never use Unicode emojis as UI icons. Use SVG icon sets (Lucide or Phosphor) with proper accessibility attributes (`aria-hidden="true"` or descriptive `aria-label`s).
- Ensure all interactive elements feature visible `:focus-visible` rings and `cursor-pointer`.

## Stage 3: Two-Phase Quality Review, Remediation & Extraction
1. **Visual & UX Critique:** Run `/impeccable critique <target>` to review hierarchy, rhythm, emotional resonance, and UX copy.
2. **Technical Audit:** Run `/impeccable audit <target>` to execute the 59 deterministic anti-pattern checks (contrast ratios, line length, touch boundaries).
3. **Targeted Remediation:** Execute matching specialized Impeccable commands to resolve flagged items:
   - Spacing & alignment ➔ `/impeccable layout <target>`
   - Palette & contrast ➔ `/impeccable colorize <target>`
   - Typography scales ➔ `/impeccable typeset <target>`
   - Edge cases & overflow ➔ `/impeccable harden <target>`
   - Clutter & visual noise ➔ `/impeccable distill <target>` or `/impeccable quiet <target>`
   - Flat / dull styling ➔ `/impeccable bolder <target>`
   - Transitions & interaction states ➔ `/impeccable animate <target>`
4. **Final Polish & Extraction:**
   - Run `/impeccable polish <target>` to complete final alignment before shipping.
   - For recurring patterns refactored during the redesign, run `/impeccable extract <target>` to consolidate them into reusable components.

## Stage 4: Real Browser & Responsive Verification
1. Verify the local web server is running and accessible prior to launching browser tests.
2. Invoke `playwright-skill` to inspect the rendered page across standard breakpoints:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1280px+
3. Validate runtime behavior:
   - Verify zero console errors or broken asset/image links (`page.on('console')`).
   - Confirm essential text containers reflow naturally without clipping or horizontal overflow.
   - Ensure interactive touch/click targets meet minimum dimensions (≥ 44×44px).
4. Capture clean viewport screenshots across breakpoints as proof of task completion.