# Frontend Quality Floor (`UI_Always.md`)

Apply these rules automatically whenever inspecting, writing, or refactoring frontend code. Fix violations directly without waiting for a prompt.

---

## 1. Viewport & Layout Integrity (Zero Overflow)
- **Horizontal Scrollbar Prevention:** Never allow accidental horizontal scrolling (`overflow-x`). Set `max-width: 100%` and `box-sizing: border-box` on containers. Never apply `overflow-x: hidden` on `body` as a band-aid.
- **Flex & Grid Blowout:** Set `min-width: 0` on flex/grid items containing text or wrapping elements.
- **Sticky Footer & Stable Gutter:** Use `min-height: 100dvh` (or `100vh`) with a flex column shell so footers stay anchored on sparse pages. Add `scrollbar-gutter: stable;` on root/body.
- **Header Height Ceiling:** Keep top navigation headers under `80px` (`--header-height` max `4rem`-`5rem`).
- **Fixed-Header Hero Clearance:** On marketing heroes placed under a fixed header, set hero top padding to `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` (24px inset). Omit this offset on sticky/static headers, full-bleed heroes, and dashboards.
- **Concentric Corner Radius Math:** Use smaller radii on controls (`4px`-`6px`) than outer containers (`12px`-`16px`). Compute nested inner radii as `R_inner = Math.max(0, R_outer - Padding)`.

---

## 2. Touch, Pointer & Mobile Affordance
- **Pointer Affordance:** Set `cursor: pointer` on every interactive control (`<button>`, `<a>`, dropdowns, tabs, accordions, clickable cards).
- **Minimum Touch Targets:** Interactive targets need at least a `44x44px` hit area on mobile (use padding or pseudo-elements if smaller; inline text links follow the WCAG 2.5.8 exemption).
- **iOS Safari Auto-Zoom:** Keep `<input>`, `<select>`, and `<textarea>` font sizes at `>=16px` on mobile.
- **Focus Rings:** Never remove `outline` without a visible, high-contrast `:focus-visible` replacement ring.

---

## 3. Typography & Scannability
- **Line Length & Font Smoothing:** Cap body copy at `max-width: 65ch`-`75ch` and apply `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.
- **Tabular Numerals:** Apply `font-variant-numeric: tabular-nums` (`tabular-nums`) to prices, dates, counters, and data tables.
- **Text Truncation:** Pair `text-overflow: ellipsis` with a `title` attribute or accessible disclosure carrying the full string.
- **Contrast Floor (WCAG AA):** Maintain `>=4.5:1` for body text and `>=3:1` for large headlines.

---

## 4. Media & Asset Stability (Zero CLS)
- **Layout Shift Prevention:** Declare explicit `width`/`height` attributes or `aspect-ratio` on images, videos, and iframes.
- **Image Fit & Contrast Scrims:** Use `object-fit: cover` and `display: block` on responsive showcase media. Place a semi-transparent scrim (e.g., `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) behind text over photography.
- **Icon Accessibility & Sizing:** Keep SVG icons consistent (`16px`/`20px`, `1.5px` stroke). Add `aria-hidden="true"` on decorative icons and `aria-label` on standalone icon controls.

---

## 5. Forms & Interactive Control States
- **Form Labels & Button Types:** Associate every input with `<label for="id">` or `aria-label`. Set `type="button"` on non-submitting `<button>` elements inside `<form>`.
- **Native Platform Primitives:** Prefer native `<dialog>`, `popover`, CSS Anchor Positioning, `@starting-style`, and `:user-invalid` per [modern-web-guidance](../skills/modern-web-guidance/SKILL.md).
- **Baseline Interactive States (all controls: buttons, links, tabs, selects, inputs):**
  1. `Default` (resting surface/border)
  2. `Hover` (surface/ink shift)
  3. `Focus-Visible` (`2px` high-contrast ring, `2px` offset)
  4. `Active` (press feedback `scale(0.97)` over `60ms` ease-out, unified with [MOTION.md](MOTION.md))
  5. `Disabled` (`disabled` attribute + `cursor: not-allowed; opacity: 0.6;`)
- **Async & Submittable Control States (form submits, inputs, async mutations):**
  6. `Loading` (inline spinner + locked width to prevent layout shift)
  7. `Error` (semantic error border/text + `aria-invalid="true"`)
  8. `Success` (semantic confirmation feedback)

---

## 6. Anti-AI-Slop & Copy Hygiene Delegation
- Delegate visual, structural, palette, typography, media, and scroll/marquee anti-slop rules to [anti-ai-slop](../skills/anti-ai-slop/SKILL.md).
- Delegate prose voice, synthetic-data bans, and automated copy gates to [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) paired with [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md).

---

## 7. Browser Verification Policy
- **Engine Mandate (per `CLAUDE.md` §3):** Pair [playwright-skill](../skills/playwright-skill/SKILL.md) with [agent-browser](../skills/agent-browser/SKILL.md). Never use IDE preview viewers, subagents, or scratch `.js` files; the main agent runs ad-hoc checks directly.
- **Target Resolution:** Resolve running apps via `--detect-url`, `helpers.resolveTargetUrl()`, local `index.html`, or `$env:URL` (`URL=...`). Never guess a port.
- **Scope Rule:** Skip browser automation for minor 1-line CSS/copy edits (verify statically). Run full audits for layout, navigation, responsive, or multi-step UI changes.
- **Multi-Viewport Layout, Network & A11y Audit (`375x667`, `768x1024`, `1280x800`):**
  ```powershell
  node .claude/skills/playwright-skill/run.js --audit --screenshots scratch --touch-targets --a11y
  ```
  On Windows PowerShell, pass custom Playwright assertions via `--stdin` or base64 `-b` instead of `-e`.
- **Interactive Flows & Shared-Browser CDP Handoff (`agent-browser` -> `--audit --session`):**
  ```powershell
  # PowerShell
  $SESSION = (agent-browser session id --scope worktree --prefix ui).Trim()
  agent-browser --session $SESSION open <url>
  agent-browser --session $SESSION snapshot -i
  agent-browser --session $SESSION fill @e1 "value"
  agent-browser --session $SESSION click @e2
  node .claude/skills/playwright-skill/run.js --audit --session $SESSION --touch-targets --a11y
  agent-browser --session $SESSION errors
  agent-browser --session $SESSION console
  agent-browser --session $SESSION close
  ```
  ```bash
  # Bash / zsh
  SID=$(agent-browser session id --scope worktree --prefix ui)
  agent-browser --session "$SID" open <url>
  agent-browser --session "$SID" snapshot -i
  agent-browser --session "$SID" fill @e1 "value"
  agent-browser --session "$SID" click @e2
  node .claude/skills/playwright-skill/run.js --audit --session "$SID" --touch-targets --a11y
  agent-browser --session "$SID" errors
  agent-browser --session "$SID" console
  agent-browser --session "$SID" close
  ```
- **Artifacts:** Save screenshots in git-ignored `scratch/` only when visual proof is needed; create zero scratch `.js` files.
