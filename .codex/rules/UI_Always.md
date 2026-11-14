# Frontend Quality Floor (`UI_Always.md`)

Apply these rules automatically whenever inspecting, creating, or refactoring web interfaces, components, or styles. Keep the user's design choices and existing project conventions.

---

## 1. Viewport & Layout Integrity (Zero Overflow)
- **Horizontal Scrollbar Prevention:** Never allow accidental horizontal scrolling (`overflow-x`). Ensure containers have `max-width: 100%` and `box-sizing: border-box`. Never use `overflow-x: hidden` on `body` as a band-aid.
- **Flex Child Blowout:** Always set `min-width: 0` on flex/grid items containing text or wrapping elements.
- **Sticky Footer & Stable Gutter:** Use `min-height: 100dvh` (or `100vh`) with flex column layout so footers never float mid-screen on sparse pages, and add `scrollbar-gutter: stable;` on root/body.
- **Header Height Ceiling & Hero Clearance:** Keep top navigation header height strictly under `80px` (`--header-height` max `4rem`–`5rem`). Set hero section top padding strictly to `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` (24px inset below fixed header) to eliminate dead vertical whitespace between fixed navigation and hero headlines/bento showcases.
- **Concentric Corner Radius Math & Differentiated Geometry:** Differentiate control vs. container geometry (`4px–6px` for inputs/buttons vs. `12px–16px` for outer containers) and calculate nested inner radii mathematically to prevent pinched corners: `R_inner = Math.max(0, R_outer - Padding)`.

---

## 2. Touch, Pointer & Mobile Affordance
- **Pointer Affordance:** Every interactive control (`<button>`, `<a>`, custom dropdowns, tabs, accordions, clickable cards) must have `cursor: pointer`.
- **Minimum Touch Targets:** Interactive targets require at least a `44×44px` hit area on touch viewports.
- **iOS Safari Auto-Zoom:** Form `<input>`, `<select>`, and `<textarea>` font sizes must never be smaller than `16px` on mobile.
- **Focus Rings:** Never set `outline: none` without a visible, high-contrast `:focus-visible` replacement ring.

---

## 3. Typography & Scannability
- **Line Length & Font Smoothing:** Cap body copy at `max-width: 65ch`–`75ch`, and apply `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.
- **Mandatory Tabular Numerals:** Always apply `font-variant-numeric: tabular-nums` (`tabular-nums`) to prices, dates, counters, and data tables to prevent digit jitter.
- **Text Truncation:** When using `text-overflow: ellipsis`, keep the full string accessible (e.g., via `title` or an accessible disclosure).
- **Contrast Floor (WCAG AA):** Maintain ≥4.5:1 for body text and ≥3:1 for large headlines using the project's typography and color tokens.

---

## 4. Media & Asset Stability (Zero CLS)
- **Layout Shift & Distortion Prevention:** Declare explicit `width`/`height` or `aspect-ratio` on images, videos, and iframes. Use `object-fit: cover` and `display: block` on responsive showcase media when cropping is appropriate. When overlaying text on photography or media, apply semi-transparent scrim overlays (e.g., `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA contrast.
- **Icon Accessibility & Sizing:** Use SVG icons at consistent `16px`/`20px` sizing and `1.5px` stroke, with `aria-hidden="true"` on decorative icons or a descriptive `aria-label` on standalone icon controls.

---

## 5. Forms & 8-State Interactive Primitive Standard
- **Form Labels & Button Types:** Associate every input with a `<label>` (`for="id"`) or `aria-label`. Non-submitting `<button>` elements inside `<form>` must specify `type="button"`.
- **8-State Interactive Primitive Standard:** Never output hover-only interactive primitives (`<button>`, `<input>`, tabs, selects). Account for all 8 states: `Default`, `Hover`, `Focus-Visible` (`2px` offset ring), `Active` (`scale(0.97)` over `60ms`), `Loading` (inline spinner + locked width), `Error` (`aria-invalid="true"`), `Success`, and `Disabled` (`disabled` + `cursor: not-allowed; opacity: 0.6;`).

---

## 6. Anti-AI-Slop & Natural Copy Delegation
- **Visual, Structural, Palette & Media Anti-Slop:** Delegate all structural anti-slop rules (pill kickers, fake macOS windows, ghost cards, static glassmorphism, side-tab stripes, icon-tile stacks, gridline backgrounds, Cardocalypse nesting, empty Bento cells), tinted neutrals and First/Second-Order palette bans, dashboard/headline typography bans, icon/photography sourcing rules, and scroll/marquee anti-slop discipline to [anti-ai-slop](../skills/anti-ai-slop/SKILL.md).
- **Copywriting & Synthetic Data Anti-Slop:** Delegate prose voice, Tier 1A machine vocabulary bans, hollow intensifier elimination, em-dash/trope/heading-emoji bans, Arabic numeral formatting, organic domain metrics, and automated copy gates to [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) paired with [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md).

---

<a id="browser-verification"></a>

## 7. Browser Verification Policy

For meaningful layout or interaction changes, use the bundled `playwright-skill` runner (`--audit` or inline `-e`) paired with `agent-browser` (`open`, `snapshot -i`, `click @e1`, `fill @e2`, `close`). Create no scratch `.js` files for these audits and do not delegate browser verification to subagents. A host browser tool can be used when the user requests it or the Playwright/Agent Browser workflow is unavailable; report that substitution. A preview viewer alone does not establish runtime correctness.

Check 375, 768, and 1280 CSS pixels, plus project-specific widths when needed. Capture page exceptions and console errors and detect accidental horizontal overflow. Resolve the actual target URL through `node .codex/skills/playwright-skill/run.js --detect-url` or `helpers.resolveTargetUrl()` using the project configuration, running server, or an explicit user-provided URL. Do not guess a port.

From the project root, run the built-in multi-viewport layout audit (saves screenshots in `scratch/`, audits 375/768/1280, reports overflow and console/page errors, and closes Chromium):

```text
node .codex/skills/playwright-skill/run.js --audit --screenshots scratch --touch-targets
```

Use `node .codex/skills/playwright-skill/run.js -e "..."` when custom inline Playwright assertions are needed, and use `agent-browser` for token-efficient semantic navigation, accessibility-tree `@eN` element interaction, and multi-step user flow testing:

```text
agent-browser --session <sid> open <url> && agent-browser --session <sid> snapshot -i
agent-browser --session <sid> fill @e1 "<value>" && agent-browser --session <sid> click @e2
agent-browser --session <sid> close
```

Keep `scratch/` git-ignored and add the requested flow's meaningful interaction checks alongside the layout audit. Preserve existing project tests. Do not require browser checks for every unrelated or trivial edit, or claim that this layout audit validates the complete UI. Report missing tooling, servers, and unresolved errors accurately.

