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
- **Header Height Ceiling & Hero Clearance:**
  - Keep top navigation header height strictly under `80px` (`--header-height` max `4rem`–`5rem`).
  - Set hero section top padding strictly to `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` (24px inset below fixed header) to eliminate dead vertical whitespace between fixed navigation and hero headlines/bento showcases.
- **Concentric Corner Radius Math & Differentiated Geometry:**
  - Differentiate control vs. container geometry (`4px–6px` for inputs/buttons vs. `12px–16px` for outer containers) and calculate nested inner radii mathematically to prevent pinched corners: `R_inner = Math.max(0, R_outer - Padding)`.

---

## 2. Touch, Pointer & Mobile Affordance
- **Pointer Affordance:** Every interactive element (`<button>`, `<a>`, custom dropdowns, tabs, accordions, clickable cards) **must** have `cursor: pointer`.
- **Minimum Touch Targets:** Interactive targets must have at least `44×44px` clickable area (use padding or pseudo-elements if the visual element is smaller).
- **iOS Safari Auto-Zoom:** Form `<input>`, `<select>`, and `<textarea>` font sizes must **never** be smaller than `16px` on mobile to prevent iOS zoom-on-focus.
- **Focus Rings:** Never set `outline: none` without providing a visible, high-contrast `:focus-visible` replacement ring.

---

## 3. Typography & Scannability
- **Line Length:** Cap body copy at `max-width: 65ch`–`75ch` for readable editorial measure.
- **Mandatory Tabular Numerals:** Always apply `font-variant-numeric: tabular-nums` (`tabular-nums`) to prices, dates, counters, and data tables to prevent digit jitter.
- **Font Smoothing:**
  ```css
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  ```
- **Text Truncation:** When using `text-overflow: ellipsis`, always add a `title` attribute with the full unclipped string.
- **Contrast Floor (WCAG AA):** ≥4.5:1 for body text, ≥3:1 for large headlines.

---

## 4. Media & Asset Stability (Zero CLS)
- **Layout Shift Prevention:** Always declare explicit `width`/`height` attributes or `aspect-ratio` on images, videos, and iframes.
- **Image Distortion & Contrast Scrims:** Responsive images must use `object-fit: cover` and `display: block` to prevent distortion and inline baseline gaps. When overlaying text on photography or media, apply semi-transparent scrim overlays (e.g. `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA contrast.
- **Icon Accessibility & Sizing:** Use SVG icons at consistent `16px`/`20px` sizing and `1.5px` stroke, with `aria-hidden="true"` on decorative icons or a descriptive `aria-label` on standalone icon controls.

---

## 5. Forms & 8-State Interactive Primitive Standard
- **Form Labels:** Every input must have an associated `<label>` (`for="id"`) or a descriptive `aria-label`.
- **Button Type Safety:** Non-submitting `<button>` inside `<form>` must specify `type="button"`.
- **8-State Interactive Primitive Standard:** Never output hover-only interactive primitives (`<button>`, `<input>`, tabs, selects). Every interactive control must account for all 8 states:
  1. `Default` (resting surface/border)
  2. `Hover` (surface/ink shift)
  3. `Focus-Visible` (`2px` high-contrast ring with `2px` offset)
  4. `Active` (tactile press `scale(0.97)` over `60ms` ease-out)
  5. `Loading` (inline spinner + locked width to prevent layout shift)
  6. `Error` (semantic error border/text + `aria-invalid="true"`)
  7. `Success` (semantic confirmation feedback)
  8. `Disabled` (`disabled` attribute + `cursor: not-allowed; opacity: 0.6;`)

---

## 6. Anti-AI-Slop & Natural Copy Delegation
- **Visual, Structural, Palette & Media Anti-Slop:** Delegate all structural anti-slop rules (pill kickers, fake macOS windows, ghost cards, static glassmorphism, side-tab stripes, icon-tile stacks, gridline backgrounds, Cardocalypse nesting, empty Bento cells), tinted neutrals and First/Second-Order palette bans, dashboard/headline typography bans, icon/photography sourcing rules, and scroll/marquee anti-slop discipline to [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md).
- **Copywriting & Synthetic Data Anti-Slop:** Delegate prose voice, Tier 1A machine vocabulary bans, hollow intensifier elimination, em-dash/trope/heading-emoji bans, Arabic numeral formatting, organic domain metrics, and automated copy gates to [anti-ai-slop](.agents/skills/anti-ai-slop/SKILL.md) paired with [avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md).

---

<a id="browser-verification"></a>

## 7. Browser Verification Policy
- **Combined Browser Engine Mandate:** Use [playwright-skill](.agents/skills/playwright-skill/SKILL.md) (`node .agents/skills/playwright-skill/run.js --audit` or `-e`) for deterministic viewport, horizontal-overflow, touch-target, console/page-error, and screenshot checks, paired with [agent-browser](.agents/skills/agent-browser/SKILL.md) (`open`, `snapshot -i`, `click @e1`, `fill @e2`, `close`) for accessibility-tree navigation and multi-step interactive flows. Built-in website viewers, IDE preview windows, and `browser_subagent` are banned for verification.
- **Universal Target Resolution (`--detect-url` / `helpers.resolveTargetUrl()`):** Auto-resolves running servers without hardcoded ports—probes `localhost`/`127.0.0.1` (`3000`, `4321`, `5173`, `8080`, `80`, etc.), maps `htdocs`/`www`/`public_html` webroots, falls back to local `index.html`, or respects `$env:URL`.
- **Minor / 1-Line Fixes** (text, colors, padding): Skip browser automation; verify CSS rules statically in code.
- **Structural / Layout Audit** (grids, navigation, full pages): Audit `375x667` (mobile), `768x1024` (tablet), and `1280x800` (desktop) for horizontal overflow (`document.documentElement.scrollWidth > window.innerWidth`), `>=44x44px` mobile touch targets, and console/page errors:
  ```powershell
  node .agents/skills/playwright-skill/run.js --audit --screenshots scratch --touch-targets
  ```
  (Use `node .agents/skills/playwright-skill/run.js -e "..."` for custom inline assertions; never write scratch `.js` files.)
- **Interactive Flow Testing (`agent-browser`):** Isolate sessions and interact via `@eN` accessibility refs:
  ```bash
  SID=$(agent-browser session id --scope worktree --prefix ui)
  agent-browser --session "$SID" open <url>
  agent-browser --session "$SID" snapshot -i
  agent-browser --session "$SID" fill @e1 "value"
  agent-browser --session "$SID" click @e2
  agent-browser --session "$SID" close
  ```
- **Output Location:** Save viewport screenshots to the git-ignored `scratch/` directory when visual proof is needed; never create scratch `.js` files on disk.