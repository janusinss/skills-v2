---
trigger: model_decision
description: Proactive self-correction for frontend layout, UI, mobile responsiveness, styling bugs, and common CSS issues. Activate whenever inspecting, writing, or refactoring web interfaces, components, or styles
---

# Always-On Frontend Proactive Fixes & Quality Floor

Apply these rules automatically whenever viewing, writing, or refactoring frontend code. Never wait for the user to prompt or invoke a tool to fix these common issues.

---

## 1. Viewport & Layout Integrity (Zero Overflow & Glitches)
- **Unwanted Horizontal Scrollbars:**
  - Never allow accidental horizontal scrolling (`overflow-x`).
  - Fix the root cause immediately: ensure containers have `max-width: 100%` and `box-sizing: border-box`.
  - **Flex child blowout:** Always set `min-width: 0` on flex items containing text or wrapping elements to prevent them from forcing parents wider than the screen.
  - Never use `overflow-x: hidden` on `body` as a lazy band-aid.
- **Sticky Footer / Short Page Fix:**
  - Full-page shells must use `min-height: 100dvh` (or `100vh`) with a flex column layout (`display: flex; flex-direction: column;`) so footers never awkwardly float mid-screen on sparse content.
- **Scrollbar Gutter Shifts:**
  - Add `scrollbar-gutter: stable;` on the root/body to avoid layout jumping when scrollbars appear and disappear.

---

## 2. Touch, Pointer & Mobile Affordance
- **Pointer Affordance:**
  - Every interactive element (`<button>`, `<a>`, custom dropdowns, tabs, accordions, clickable card wrappers) **must** have `cursor: pointer`.
- **Minimum Touch Boundaries:**
  - Interactive targets on mobile must have at least `44×44px` clickable area (use padding or pseudo-elements if the visual icon is smaller).
- **iOS Safari Auto-Zoom Trap:**
  - Form `<input>`, `<select>`, and `<textarea>` font sizes must **never** be smaller than `16px` (1rem) on mobile; anything below 16px forces iOS Safari to jarringly zoom into the input field on focus.
- **Accessible Focus Rings:**
  - Never set `outline: none` without providing an immediate visible, high-contrast `:focus-visible` replacement ring.

---

## 3. Typography & Scannability
- **Comfortable Reading Line Length:**
  - Body copy and descriptions must be capped at `max-width: 65ch` or `70ch` to prevent exhausting horizontal eye tracking.
- **Font Smoothing:**
  - Always ensure clean subpixel text rendering:
    ```css
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    ```
- **Text Truncation Defense:**
  - When truncating text with `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`, always add a `title="..."` attribute containing the full unclipped string so users can inspect it on hover.
- **Contrast Floor (WCAG AA):**
  - Always maintain high contrast (≥ 4.5:1 for body text, ≥ 3:1 for large headlines). Never render washed-out light gray text on light backgrounds or low-contrast dark gray on black.

---

## 4. Media & Asset Stability (Zero CLS & Zero Placeholders)
- **Cumulative Layout Shifts (CLS):**
  - Always declare explicit `width` and `height` attributes or an `aspect-ratio` on images, videos, and iframe containers so the layout does not jump while loading.
- **Image Distortion:**
  - Responsive images must include `object-fit: cover` and `display: block` to prevent distortion or mysterious 4px baseline inline gaps.
- **No Raw Emojis as Icons:**
  - Never use Unicode emojis (e.g. ⚙️, 🚀, ❌) as UI icons. Use SVG icons (Lucide or Phosphor) with `aria-hidden="true"`.
- **No Third-Party Placeholder Domains:**
  - Never link to `via.placeholder.com` or similar dead services. Use inline SVG illustrations, themed skeleton boxes, or actual assets.

---

## 5. Forms & Interactive State Feedback
- **Form Labels:**
  - Every input must have an associated `<label>` (`for="id"`) or a descriptive `aria-label`.
- **Button Type Safety:**
  - Non-submitting `<button>` elements inside `<form>` elements must always specify `type="button"` to avoid accidental form submissions on Enter.
- **Micro-Interaction States:**
  - All buttons and interactive elements must provide immediate visual feedback on `:hover`, `:active`, and `:disabled` (`cursor: not-allowed; opacity: 0.6;`).

---

## 6. Color & Aesthetic Floor (Zero AI Slop)
- **Tinted Neutrals:**
  - Never use dead raw black (`#000000`) or untinted gray (`#808080`). Tint darks and backgrounds toward the brand palette (e.g., slate, zinc, deep navy, warm charcoal).
- **Anti-Nesting Rule:**
  - Never nest a card inside another card with identical backgrounds and borders.

## Stage 7: Real Browser & Responsive Verification
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