# Frontend Quality Floor (`UI_Always.md`)

Apply these rules automatically whenever inspecting, creating, or refactoring web interfaces, components, or styles. Keep the user's design choices and existing project conventions.

---

## 1. Viewport & Layout Integrity (Zero Overflow)
- **Horizontal Scrollbar Prevention:** Never allow accidental horizontal scrolling (`overflow-x`). Ensure containers have `max-width: 100%` and `box-sizing: border-box`. Never use `overflow-x: hidden` on `body` as a band-aid.
- **Flex Child Blowout:** Always set `min-width: 0` on flex/grid items containing text or wrapping elements.
- **Sticky Footer & Stable Gutter:** Use `min-height: 100dvh` (or `100vh`) with flex column layout so footers never float mid-screen on sparse pages, and add `scrollbar-gutter: stable;` on root/body.
- **Header Height Ceiling & Hero Clearance:** Keep top navigation header height strictly under `80px` (`--header-height` max `4rem`–`5rem`). Set hero section top padding strictly to `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` (24px inset below fixed header) to eliminate dead vertical whitespace between fixed navigation and hero headlines/bento showcases.
- **Concentric Corner Radius Math & Differentiated Geometry:** Never apply uniform `rounded-2xl` (`16px–24px`) across every card, button, and input in the DOM. Differentiate geometry (`4px–6px` for inputs/buttons vs. `12px–16px` for outer containers) and calculate nested inner radii mathematically to prevent pinched corners: `R_inner = Math.max(0, R_outer - Padding)`.

---

## 2. Touch, Pointer & Mobile Affordance
- **Pointer Affordance:** Every interactive control (`<button>`, `<a>`, custom dropdowns, tabs, accordions, clickable cards) must have `cursor: pointer`.
- **Minimum Touch Targets:** Interactive targets require at least a `44×44px` hit area on touch viewports.
- **iOS Safari Auto-Zoom:** Form `<input>`, `<select>`, and `<textarea>` font sizes must never be smaller than `16px` on mobile.
- **Focus Rings:** Never set `outline: none` without a visible, high-contrast `:focus-visible` replacement ring.

---

## 3. Typography & Scannability
- **Line Length & Hero Proportions:** Cap body copy at `max-width: 65ch`–`75ch`, keep hero `H1 ≤ 2 lines` and hero subtext `≤ 20 words`, and apply `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.
- **No Serif Type in Software Dashboards & No Single-Word Headline Spans:** Never use serif fonts inside software, SaaS, or admin dashboards (pair a deliberate UI sans-serif with a tabular monospace font for data). Never wrap a single isolated word inside a headline in a colored, gradient, or italic serif `<span>`, and never apply `background-clip: text` (`bg-clip-text`) gradient fills to headlines, subheads, or metric numerals.
- **No Monospace Button Spray & Mandatory Tabular Numerals:** Never use monospace fonts or `UPPERCASE_WITH_UNDERSCORE` formatting on standard UI buttons. Always apply `font-variant-numeric: tabular-nums` (`tabular-nums`) to prices, dates, counters, and data tables to prevent digit jitter.
- **Text Truncation:** When using `text-overflow: ellipsis`, keep the full string accessible (e.g., via `title` or an accessible disclosure).
- **Contrast Floor (WCAG AA):** Maintain ≥4.5:1 for body text and ≥3:1 for large headlines using the project's typography and color tokens.

---

## 4. Media & Asset Stability (Zero CLS)
- **Layout Shift & Distortion Prevention:** Declare explicit `width`/`height` or `aspect-ratio` on images, videos, and iframes. Use `object-fit: cover` and `display: block` on responsive showcase media when cropping is appropriate.
- **No Raw Emojis or "Lucide Five" Icon Clichés:** Never use Unicode emojis (`🚀`, `✨`, `⚙️`) as UI icons, and never reflexively spray **"The Lucide Five"** (`Sparkles`, `Zap`, `Shield`, `Check`, `BarChart3`) across every feature block. Omit icons when typography carries hierarchy, or use domain-specific SVG icons (Lucide or Phosphor at `16px`/`20px` sizing, `1.5px` stroke, with `aria-hidden="true"` or a descriptive `aria-label`).
- **No Placeholder Domains:** Never link to `via.placeholder.com` or invent broken asset URLs. Use inline SVG, themed skeleton boxes, or approved assets.
- **Authentic Photography (Strict: No AI Generation):** Populate showcase, hero, and product cards with real photography (Unsplash, Pexels, CDN, or approved project assets) paired with semi-transparent scrim overlays (`linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA text contrast. Never generate AI images for UI showcases or product cards unless explicitly requested.

---

## 5. Forms & 8-State Interactive Primitive Standard
- **Form Labels & Button Types:** Associate every input with a `<label>` (`for="id"`) or `aria-label`. Non-submitting `<button>` elements inside `<form>` must specify `type="button"`.
- **8-State Interactive Primitive Standard:** Never output hover-only interactive primitives (`<button>`, `<input>`, tabs, selects). Account for all 8 states: `Default`, `Hover`, `Focus-Visible` (`2px` offset ring), `Active` (`scale(0.97)` over `60ms`), `Loading` (inline spinner + locked width), `Error` (`aria-invalid="true"`), `Success`, and `Disabled` (`disabled` + `cursor: not-allowed; opacity: 0.6;`).

---

## 6. Color & Aesthetic Floor (Structural Anti-Slop)
- **No Floating Eyebrow Pill Badges or Kickers:** Never place floating rounded pill badges, pastel chip capsules (`rounded-full` with colored backgrounds/borders), fake `NEW`/`AI` badges, pulsing green `LIVE` dots on static pages, or eyebrow/kicker labels above headings. Delete the label and lead directly with the headline so the heading carries its own weight.
- **No Centered Hero + Fake macOS Terminal Formula:** Do not default to a centered vertical hero stack paired with a fake macOS window and traffic-light dots. Prefer asymmetric or artifact-led heroes with real functional UI showcases.
- **No Ghost Cards & No Reflexive Glassmorphism Over Blobs:** Never combine a 1px hairline border with a wide, diffused drop shadow (`box-shadow: 0 20px 25px`). Never apply `backdrop-filter: blur()` (`backdrop-blur`) to static content cards, data tables, or dashboards layered over floating color blobs (restrict glass strictly to floating fixed navbars or modals).
- **No Side-Tab Accent Stripes:** Never put decorative `border-left: 4px solid <color>` or `border-t-4` on cards unless communicating a genuine semantic system warning or error alert.
- **No Icon-Tile Stacks:** Never center an icon inside a rounded square directly stacked on top of a card heading (`rule-icon-tile-stack`). Place icons inline with headings or let the text lead.
- **No Decorative Grid Backgrounds:** Never apply faux-developer gridline backgrounds (`background-size: 18px 18px` linear-gradient grid) unless building an actual interactive canvas or mapping tool.
- **No Container Over-Nesting (Cardocalypse) or Empty Bento Cells:** Limit container depth to 1 level (no bordered boxes inside bordered cards). Never force content into arbitrary dark Bento grids with empty filler cells—require genuine visual diversity and 1:1 artifact mapping.
- **Tinted Neutrals & Zero Second-Order Default Fallbacks:** Never use raw `#000000` or untinted `#808080`; tint neutrals (`#121215` dark / `#F8FAFC` light) subtly toward the brand hue. Avoid uncalibrated purple/indigo/violet gradients (`#6366F1`, `#8B5CF6`), and when avoiding purple, **do not reflexively cascade into Second-Order Slop defaults** (default `#10B981` emerald-on-slate, unprompted cream/terracotta, `Space Grotesk`, or italic `Instrument Serif`). Define a deliberate 5-token Visual DNA (`--canvas`, `--surface`, `--ink`, `--muted`, `--accent`, `--border`).

---

## 7. Copy & Natural Voice Floor (`avoid-ai-writing`)
- **No Tier 1A Machine Vocabulary:** Zero `delve`, `tapestry`, `realm`, `paradigm`, `embark`, `testament to`, `robust`, `comprehensive`, `cutting-edge`, `leverage`, `meticulous`, `seamless`, `game-changer`, `vibrant`, `thriving`, `deep dive`, `unpack`, `intricacies`, `ever-evolving`, `actionable`, `impactful`, `synergy`, `at its core`.
- **No Hollow Intensifiers:** Eliminate `truly`, `genuinely`, `quite frankly`, `worth noting`, `worth your time`, `actually` (unless contrasting factual errors).
- **No Em Dashes in Headings/Buttons:** Replace `—` and `--` with periods, commas, or direct declarative sentence structure.
- **No AI Rhetorical Tropes:** Zero `"It's not X — it's Y"` or multi-sentence countdown reveals.
- **No Section Title Emojis:** Ban emojis in headings (e.g., `## 🚀 Our Features`).
- **Arabic Numerals & Organic Domain Data (No "Jane Doe" Slop):** Write all quantities as **Arabic numerals** (`3 steps`, `10x`, `2 days`) instead of spelled-out words (`three simple steps`). Never populate mockups with synthetic LLM personas (`Sarah Chen`, `Marcus Williams`, `Jane Doe`), slop brand names (`Acme`, `Nexus`, `SmartFlow`), or round vanity stats (`99.99%`, `10k+`); use organic domain metrics with natural variance (`$14,892.40`, `+12.4%`, `47.2%`).

---

<a id="browser-verification"></a>

## 8. Browser Verification Policy

For meaningful layout or interaction changes, use the bundled Playwright runner through inline Node execution. Create no scratch `.js` files for these audits and do not delegate browser verification to subagents. A host browser tool can be used when the user requests it or the Playwright workflow is unavailable; report that substitution. A preview viewer alone does not establish runtime correctness.

Check 375, 768, and 1280 CSS pixels, plus project-specific widths when needed. Capture page exceptions and console errors and detect accidental horizontal overflow. Resolve the actual target URL through `helpers.resolveTargetUrl()` using the project configuration, running server, or an explicit user-provided URL. Do not guess a port.

From the project root, use this canonical inline layout audit. It saves screenshots in `scratch/`, audits all three widths, reports failures, and closes Chromium:

```text
node .codex/skills/playwright-skill/run.js -e "const fs = require('node:fs'); const url = await helpers.resolveTargetUrl(); if (!url) throw new Error('Start the target server or specify its URL'); fs.mkdirSync('scratch', { recursive: true }); const browser = await chromium.launch({ headless: true }); const errors = []; const overflowWidths = []; try { const page = await browser.newPage(); page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); }); for (const width of [375, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); await page.goto(url); await page.evaluate(() => document.fonts.ready); const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth); if (overflow) overflowWidths.push(width); await page.screenshot({ path: 'scratch/ui-' + width + '.png', fullPage: true }); console.log(JSON.stringify({ width, overflow })); } if (overflowWidths.length || errors.length) throw new Error(JSON.stringify({ overflowWidths, errors })); } finally { await browser.close(); }"
```

Keep `scratch/` git-ignored and add the requested flow's meaningful interaction checks to the inline audit. Preserve existing project tests. Do not require browser checks for every unrelated or trivial edit, or claim that this layout audit validates the complete UI. Report missing tooling, servers, and unresolved errors accurately.

