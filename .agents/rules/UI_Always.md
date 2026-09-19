---
trigger: model_decision
description: ACTIVATE WHEN DESIGNING, Proactive self-correction for frontend layout, UI, mobile responsiveness, styling bugs, and common CSS issues. Activate whenever inspecting, writing, or refactoring web interfaces, components, or styles.
---

# Always-On Frontend Quality Floor

Apply these rules automatically whenever viewing, writing, or refactoring frontend code. Never wait for the user to prompt or invoke a tool to fix these common issues.

---

## 1. Viewport & Layout Integrity (Zero Overflow)
- **Horizontal Scrollbar Prevention:**
  - Never allow accidental horizontal scrolling (`overflow-x`).
  - Fix the root cause: ensure containers have `max-width: 100%` and `box-sizing: border-box`.
  - **Flex child blowout:** Always set `min-width: 0` on flex items containing text or wrapping elements.
  - Never use `overflow-x: hidden` on `body` as a lazy band-aid.
- **Sticky Footer:**
  - Full-page shells must use `min-height: 100dvh` (or `100vh`) with flex column layout so footers never float mid-screen on sparse content.
- **Scrollbar Gutter:**
  - Add `scrollbar-gutter: stable;` on root/body to avoid layout jumping when scrollbars appear/disappear.

---

## 2. Touch, Pointer & Mobile Affordance
- **Pointer Affordance:** Every interactive element (`<button>`, `<a>`, custom dropdowns, tabs, accordions, clickable cards) **must** have `cursor: pointer`.
- **Minimum Touch Targets:** Interactive targets must have at least `44×44px` clickable area (use padding or pseudo-elements if the visual element is smaller).
- **iOS Safari Auto-Zoom:** Form `<input>`, `<select>`, and `<textarea>` font sizes must **never** be smaller than `16px` on mobile to prevent iOS zoom-on-focus.
- **Focus Rings:** Never set `outline: none` without providing a visible, high-contrast `:focus-visible` replacement ring.

---

## 3. Typography & Scannability
- **Line Length:** Body copy capped at `max-width: 65ch` or `70ch`.
- **Font Smoothing:**
  ```css
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  ```
- **Text Truncation:** When using `text-overflow: ellipsis`, always add a `title` attribute with the full unclipped string.
- **Contrast Floor (WCAG AA):** ≥4.5:1 for body text, ≥3:1 for large headlines. No washed-out gray on light, no low-contrast gray on black.

---

## 4. Media & Asset Stability (Zero CLS)
- **Layout Shift Prevention:** Always declare explicit `width`/`height` attributes or `aspect-ratio` on images, videos, and iframes.
- **Image Distortion:** Responsive images must use `object-fit: cover` and `display: block` to prevent distortion and inline baseline gaps.
- **No Raw Emojis as Icons:** Never use Unicode emojis as UI icons. Use SVG icons (Lucide or Phosphor) with `aria-hidden="true"` or descriptive `aria-label`.
- **No Placeholder Domains:** Never link to `via.placeholder.com` or similar. Use inline SVG, themed skeleton boxes, or actual assets.

---

## 5. Forms & Interactive Feedback
- **Form Labels:** Every input must have an associated `<label>` (`for="id"`) or a descriptive `aria-label`.
- **Button Type Safety:** Non-submitting `<button>` inside `<form>` must specify `type="button"`.
- **State Feedback:** All buttons and interactive elements must have `:hover`, `:active`, and `:disabled` (`cursor: not-allowed; opacity: 0.6;`) visual states.

---

## 6. Color & Aesthetic Floor (Structural Anti-Slop)
- **No Floating Eyebrow Pill Badges:** Never place floating rounded pill badges or pastel chip capsules (`rounded-full` with colored backgrounds/borders) above headings. Lead directly with the headline, or use clean unboxed typographic kickers (plain text with tracking, zero borders or background bubbles).
- **No Ghost Cards:** Never combine a 1px hairline border with a wide, diffused drop shadow (`box-shadow: 0 20px 25px`). Choose either a crisp border OR a subtle directional elevation shadow, never both.
- **No Side-Tab Accent Stripes:** Never put decorative `border-left: 4px solid <color>` on cards unless it communicates a genuine functional warning or status.
- **No Icon-Tile Stacks:** Never center an icon inside a rounded square directly stacked on top of a card heading (`rule-icon-tile-stack`). Place icons inline with headings or let the text lead.
- **No Decorative Grid Backgrounds:** Never apply faux-developer gridline backgrounds (`background-size: 18px 18px` linear-gradient grid) unless building an actual interactive canvas or mapping tool.
- **No Container Over-Nesting (Cardocalypse):** Limit container depth to 1 level. Use whitespace, typography, and light divider borders rather than nesting cards inside cards.
- **Tinted Neutrals:** Never use raw `#000000` or untinted `#808080`. Tint darks toward the brand palette (slate, zinc, deep navy, warm charcoal).
- **No Default AI Gradients:** No uncalibrated purple-to-blue gradients or glowing dark radial halos unless explicitly requested.

---

## 7. Browser Verification Policy
- **Engine Mandate:** Use `playwright-skill` (`node .agents/skills/playwright-skill/run.js`) exclusively for all browser inspections, responsive checks, and visual tests. Built-in website viewers, IDE preview windows, and `browser_subagent` are banned for verification.
- **Minor / 1-Line Fixes** (text, colors, padding): Skip browser automation. Verify CSS rules statically in code.
- **Structural / Layout Changes** (grids, navigation, full pages): Launch `playwright-skill` (`node .agents/skills/playwright-skill/run.js`) across breakpoints (375px, 768px, 1280px). Confirm 0 console errors, 0 broken assets.
- **Output Location:** All test scripts and screenshot captures go to the git-ignored `scratch/` directory.