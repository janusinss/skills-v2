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
  - Never apply uniform `rounded-2xl` (`16px–24px`) across every card, button, and input in the DOM. Differentiate geometry (`4px–6px` for inputs/buttons vs. `12px–16px` for outer containers) and calculate nested inner radii mathematically to prevent pinched corners: `R_inner = Math.max(0, R_outer - Padding)`.

---

## 2. Touch, Pointer & Mobile Affordance
- **Pointer Affordance:** Every interactive element (`<button>`, `<a>`, custom dropdowns, tabs, accordions, clickable cards) **must** have `cursor: pointer`.
- **Minimum Touch Targets:** Interactive targets must have at least `44×44px` clickable area (use padding or pseudo-elements if the visual element is smaller).
- **iOS Safari Auto-Zoom:** Form `<input>`, `<select>`, and `<textarea>` font sizes must **never** be smaller than `16px` on mobile to prevent iOS zoom-on-focus.
- **Focus Rings:** Never set `outline: none` without providing a visible, high-contrast `:focus-visible` replacement ring.

---

## 3. Typography & Scannability
- **Line Length & Hero Proportions:** Body copy capped at `max-width: 65ch`–`75ch`. Keep hero `H1 ≤ 2 lines` and hero subtext `≤ 20 words`.
- **No Serif Type in Software Dashboards & No Single-Word Headline Spans:**
  - Never use serif fonts inside software, SaaS, or admin dashboards (pair a deliberate UI sans-serif with a tabular monospace font for data).
  - Never wrap a single isolated word inside a headline in a colored, gradient, or italic serif `<span>`.
  - Never apply `background-clip: text` (`bg-clip-text`) gradient fills to headlines, subheads, or metric numerals.
- **No Monospace Button Spray & Mandatory Tabular Numerals:**
  - Never use monospace fonts or `UPPERCASE_WITH_UNDERSCORE` formatting on standard marketing or UI buttons.
  - Always apply `font-variant-numeric: tabular-nums` (`tabular-nums`) to prices, dates, counters, and data tables to prevent digit jitter.
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
- **No Raw Emojis or "Lucide Five" Icon Clichés:**
  - Never use Unicode emojis (`🚀`, `✨`, `⚙️`) as UI icons.
  - Never reflexively spray **"The Lucide Five"** (`Sparkles`, `Zap`, `Shield`, `Check`, `BarChart3`) across every feature block. Omit icons when typography carries hierarchy, or select domain-specific SVG glyphs (Lucide or Phosphor at consistent `16px`/`20px` sizing, `1.5px` stroke, with `aria-hidden="true"` or descriptive `aria-label`).
- **No Placeholder Domains:** Never link to `via.placeholder.com` or similar. Use inline SVG, themed skeleton boxes, or actual assets.
- **Authentic Photography (Strict: No AI Generation):** Populate showcase, hero, and product cards with real photography from the web (Unsplash, Pexels, CDN). Never generate AI images for UI showcases or product cards. Always apply semi-transparent scrim overlays (e.g. `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA text contrast.

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

## 6. Color & Aesthetic Floor (Structural Anti-Slop)
- **No Floating Eyebrow Pill Badges or Kickers:** Never place floating rounded pill badges, pastel chip capsules (`rounded-full` with colored backgrounds/borders), fake `NEW`/`AI` badges, pulsing green `LIVE` dots on static pages, or eyebrow/kicker labels above headings. Delete the label and lead directly with the headline so the heading carries its own weight.
- **No Centered Hero + Fake macOS Terminal Formula:** Do not default to a centered vertical hero stack (eyebrow badge + centered H1 + two centered buttons + fake macOS window with red/yellow/green traffic-light dots). Prefer asymmetric or artifact-led heroes with real functional UI showcases.
- **No Ghost Cards:** Never combine a 1px hairline border with a wide, diffused drop shadow (`box-shadow: 0 20px 25px`). Choose either a crisp border OR a subtle directional elevation shadow, never both.
- **No Reflexive Glassmorphism Over Color Blobs:** Never apply `backdrop-filter: blur()` (`backdrop-blur`) to static content cards, data tables, or dashboards layered over floating color blobs. Use opaque surface tokens for data containers and restrict glass strictly to floating fixed navbars or modals.
- **No Side-Tab Accent Stripes:** Never put decorative `border-left: 4px solid <color>` or `border-t-4` on cards unless communicating a genuine semantic system warning or error alert.
- **No Icon-Tile Stacks:** Never center an icon inside a rounded square directly stacked on top of a card heading (`rule-icon-tile-stack`). Place icons inline with headings or let the text lead.
- **No Decorative Grid Backgrounds:** Never apply faux-developer gridline backgrounds (`background-size: 18px 18px` linear-gradient grid) unless building an actual interactive canvas or mapping tool.
- **No Container Over-Nesting (Cardocalypse) or Empty Bento Cells:** Limit container depth to 1 level (never nest bordered boxes inside bordered cards). Never force content into arbitrary dark Bento grids with empty filler cells—require genuine visual diversity and 1:1 artifact mapping.
- **Tinted Neutrals & Zero Second-Order Default Fallbacks:**
  - Never use raw `#000000` or untinted `#808080`. Tint darks and light canvases (`#121215` dark / `#F8FAFC` light) subtly toward the brand hue.
  - **Ban Both First-Order & Second-Order Slop Palettes:** Never use uncalibrated purple/indigo/violet gradients (`#6366F1`, `#8B5CF6`, `#A855F7`), and when avoiding purple, **do not reflexively cascade into Second-Order Slop defaults** (default Tailwind `emerald-500` `#10B981` on dark slate, unprompted cream/terracotta, `Space Grotesk`, or italic `Instrument Serif`). Define a deliberate 5-token Visual DNA (`--canvas`, `--surface`, `--ink`, `--muted`, `--accent`, `--border`).

---

## 7. Copy & Natural Voice Floor (`avoid-ai-writing`)
- **No Tier 1A Machine Vocabulary:** Zero `delve`, `tapestry`, `realm`, `paradigm`, `embark`, `testament to`, `robust`, `comprehensive`, `cutting-edge`, `leverage`, `meticulous`, `seamless`, `game-changer`, `vibrant`, `thriving`, `deep dive`, `unpack`, `intricacies`, `ever-evolving`, `actionable`, `impactful`, `synergy`, `at its core`.
- **No Hollow Intensifiers:** Eliminate `truly`, `genuinely`, `quite frankly`, `worth noting`, `worth your time`, `actually` (unless contrasting factual errors).
- **No Em Dashes in Headings/Buttons:** Replace `—` and `--` with periods, commas, or direct declarative sentence structure.
- **No AI Rhetorical Tropes:** Zero "It's not X — it's Y" or multi-sentence countdown reveals.
- **No Section Title Emojis:** Ban emojis in headings (e.g. `## 🚀 Our Features`).
- **Arabic Numerals & Organic Domain Data (No "Jane Doe" Slop):**
  - Write all quantities as **Arabic numerals** (`3 steps`, `10x`, `2 days`) instead of spelled-out words (`three simple steps`) to anchor visual eye-tracking.
  - Never populate mockups with synthetic LLM personas (`Sarah Chen`, `Marcus Williams`, `Jane Doe`), slop brand names (`Acme`, `Nexus`, `SmartFlow`), or round vanity stats (`99.99%`, `10k+ users`). Use organic domain metrics with natural variance (`$14,892.40`, `+12.4%`, `47.2%`).

---

## 8. Browser Verification Policy
- **Engine Mandate:** Use `playwright-skill` exclusively for all browser inspections, responsive checks, and visual tests via inline Node execution (fast in-memory execution, zero disk I/O, no scratch script files). Built-in website viewers, IDE preview windows, and `browser_subagent` are banned for verification.
- **Universal Target Resolution (`helpers.resolveTargetUrl()`):** Automatically resolves any environment without hardcoded ports—scans dev servers (`3000`, `5173`, `8080`), auto-maps Apache/XAMPP/WAMP/LAMP webroots (`htdocs`, `www`, `public_html`), falls back to local `index.html`, or respects `$env:URL`.
- **Minor / 1-Line Fixes** (text, colors, padding): Skip browser automation. Verify CSS rules statically in code.
- **Structural / Layout Audit** (grids, navigation, full pages): Execute multi-viewport check across 375px (mobile), 768px (tablet), and 1280px (desktop) auditing horizontal overflow (`scrollWidth > innerWidth`) and console errors:
  ```powershell
  node .agents/skills/playwright-skill/run.js -e "const url = await helpers.resolveTargetUrl(); if (!url) { console.error('No target URL or active server found. Start server or set URL env.'); process.exit(1); } const b = await chromium.launch(); try { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); await p.goto(url, { waitUntil: 'domcontentloaded' }); let failed = false; for (const { w, h } of [{ w: 375, h: 667 }, { w: 768, h: 1024 }, { w: 1280, h: 800 }]) { await p.setViewportSize({ width: w, height: h }); const leak = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth); if (leak) failed = true; console.log('Viewport ' + w + 'x' + h + ': ' + (leak ? 'OVERFLOW' : 'OK')); } if (errs.length) { failed = true; console.log('Console errors:', errs); } else { console.log('Console errors: 0'); } if (failed) process.exitCode = 1; } catch (e) { console.error('Audit failed: ' + e.message.split('\n')[0]); process.exitCode = 1; } finally { await b.close(); }"
  ```
- **Output Location:** Save viewport screenshots to the git-ignored `scratch/` directory when visual proof is needed. Do not create scratch `.js` files on disk.