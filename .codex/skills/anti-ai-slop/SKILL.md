---
name: "anti-ai-slop"
description: "Eliminate generic AI-generated visual, structural, motion, and copywriting slop across web and mobile UIs. Use when designing, building, auditing, or refactoring frontend interfaces, layouts, palettes, icons, motion, or UI copy."
license: "MIT"
---

# Anti-AI-Slop Standards

Eliminate visual, structural, chromatic, typographic, motion, and copywriting clichés across all web and mobile interfaces unless the user explicitly overrides a rule. Apply this skill alongside [UI_Always.md](../../rules/UI_Always.md) (layout/CSS/accessibility floor), [MOTION.md](../../rules/MOTION.md) (physics and GPU hygiene), [impeccable](../impeccable/SKILL.md), [design-taste-frontend](../design-taste-frontend/SKILL.md), and [avoid-ai-writing](../avoid-ai-writing/SKILL.md).

---

## 1. Structural & Layout Anti-Slop

Reject generic LLM scaffolding patterns in favor of purposeful, asymmetric, artifact-led composition:

- **No Floating Eyebrow Pill Badges or Kickers:** Never place floating rounded pill badges, pastel chip capsules (`rounded-full` with tinted backgrounds/borders), fake `NEW` / `AI` pills, pulsing green `LIVE` dots on static pages, or eyebrow/kicker labels above headings. Delete the kicker and lead directly with the headline so the heading carries its own weight.
- **No Centered Hero + Fake macOS Terminal Formula:** Never default to a centered vertical hero stack (eyebrow badge + centered `H1` + two centered buttons + fake macOS window with red/yellow/green traffic-light dots). Use asymmetric or artifact-led heroes showcasing real functional UI.
- **No Ghost Cards:** Never combine a `1px` hairline border with a wide, diffused drop shadow (`box-shadow: 0 20px 25px ...`). Pick either a crisp border OR a subtle directional elevation shadow, never both.
- **No Reflexive Glassmorphism Over Color Blobs:** Never apply `backdrop-filter: blur()` (`backdrop-blur`) to static content cards, data tables, or dashboards layered over floating color blobs. Use opaque surface tokens for data containers; restrict glass strictly to floating fixed navbars or modals.
- **No Side-Tab Accent Stripes:** Never add decorative `border-left: 4px solid <color>` or `border-t-4` stripes to cards unless communicating a genuine semantic system warning or error alert.
- **No Icon-Tile Stacks:** Never center an icon inside a rounded square stacked directly on top of a card heading (`rule-icon-tile-stack`). Place icons inline with headings or let typography lead.
- **No Decorative Gridline or Halo Backgrounds:** Never apply faux-developer gridline backgrounds (`background-size: 18px 18px` linear-gradient grids) or radial halo glows unless building an actual interactive canvas or mapping tool.
- **Max 1-Level Container Depth (No Cardocalypse):** Limit container nesting to 1 level; never nest bordered boxes inside bordered cards.
- **No Empty Bento Filler Cells:** Never force content into arbitrary dark Bento grids containing empty filler cells. Require genuine visual diversity and 1:1 artifact mapping.
- **Asymmetric Rhythm Over Uniform 3-Card Rows:** Replace repetitive, equal-width 3-column feature card rows with asymmetric splits, editorial proportions, or varied cadence unless tabular data genuinely requires uniform cells.
- **Differentiated Corner Geometry:** Never spray uniform `rounded-2xl` across every card, button, and input. Differentiate interactive control radii (`4px`–`6px`) from outer containers (`12px`–`16px`) using concentric radius math from [UI_Always.md](../../rules/UI_Always.md).

---

## 2. Color & Palette Anti-Slop

Commit to an intentional, domain-calibrated palette instead of default AI gradients or reflexive fallback themes:

- **Tinted Neutrals Only:** Never use raw `#000000` or untinted `#808080`. Subtly tint darks (`#121215`), light canvases (`#F8FAFC`), and muted text toward the brand hue.
- **Ban First-Order AND Second-Order Slop Palettes:**
  - **First-Order Slop:** Never use uncalibrated purple/indigo/violet gradients (`#6366F1`, `#8B5CF6`, `#A855F7`).
  - **Second-Order Slop:** When avoiding purple, **never reflexively cascade into predictable AI fallback themes** such as default Tailwind `emerald-500` (`#10B981`) on dark slate, unprompted cream/terracotta palettes, `Space Grotesk`, or italic `Instrument Serif`.
- **Committed Visual DNA Tokens:** Define and map every surface through CSS custom properties in `:root` (matching `DESIGN.md` when present):
  - `--canvas` (page background)
  - `--surface` (elevated card/panel fill)
  - `--ink` (primary foreground text)
  - `--muted` (hue-tinted secondary text)
  - `--accent` (single intentional action/brand color)
  - `--border` (subtle structural hairline)

---

## 3. Typography, Iconography & Photography Anti-Slop

Keep type crisp, icons purposeful, and media authentic:

- **No Serif Type in Software Dashboards:** Never use serif fonts inside software, SaaS, or admin dashboards. Pair a deliberate UI sans-serif with a tabular monospace font (`tabular-nums`) for data.
- **No Single-Word Headline Spans:** Never wrap an isolated word inside a headline in a colored, gradient, or italic serif `<span>`.
- **No `bg-clip-text` Gradient Text Fills:** Never apply `background-clip: text` (`bg-clip-text`) gradient fills to headlines, subheads, or metric numerals.
- **No Monospace Button Spray:** Never style standard marketing or UI buttons with monospace fonts or `UPPERCASE_WITH_UNDERSCORE` labels.
- **No Unicode Emojis as UI Icons:** Never use Unicode emojis (`🚀`, `✨`, `⚙️`) as interface icons.
- **Ban "The Lucide Five" Filler Icons:** Never reflexively spray `Sparkles`, `Zap`, `Shield`, `Check`, or `BarChart3` across every feature block. Omit icons when typography carries hierarchy, or select domain-specific Lucide or Phosphor SVG glyphs (`16px` / `20px`, `1.5px` stroke, with `aria-hidden="true"` or descriptive `aria-label`).
- **No Placeholder Domains:** Never link to `via.placeholder.com` or invent broken image URLs. Use inline SVG, themed skeleton containers, or real assets.
- **Authentic Photography Only (Strict: No AI Generation):** Populate hero, showcase, and product cards with real photography from Unsplash, Pexels, or verified CDNs paired with `object-fit: cover` and semi-transparent contrast scrim overlays (e.g., `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA contrast. Never generate AI images for UI showcases or product cards unless explicitly requested.

---

## 4. Motion & Scroll Anti-Slop

Motion must communicate state or guide spatial storytelling, never delay content or manufacture false dynamism. Pair these rules with [MOTION.md](../../rules/MOTION.md):

- **No Uniform Section Scroll Fade-Ups:** Never wrap every page section in identical `initial={{ opacity: 0, y: 20 }}` scroll-triggered fade-up entrances. Render text content immediately visible for fast scrollers and reserve scroll-linked motion for intentional storytelling.
- **No Unrequested Continuous Marquees:** Never add auto-scrolling logo walls, ticker tapes, or infinite decorative loops unless the user specifically asks for one.
- **No `transition: all` or Layout-Property Animations:** Never animate `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding` directly, and never write `transition: all`. Animate composite-only `transform` and `opacity` (or FLIP transforms) with `@media (prefers-reduced-motion: reduce)` fallbacks per [MOTION.md](../../rules/MOTION.md).

---

## 5. Copywriting & Synthetic Data Anti-Slop

Enforce natural human prose and realistic domain metrics across UI copy, headings, labels, and mockups. Pair with [avoid-ai-writing](../avoid-ai-writing/SKILL.md):

- **No Tier 1A Machine Vocabulary:** Ban `delve`, `tapestry`, `realm`, `paradigm`, `embark`, `testament to`, `robust`, `comprehensive`, `cutting-edge`, `leverage`, `meticulous`, `seamless`, `game-changer`, `vibrant`, `thriving`, `deep dive`, `unpack`, `intricacies`, `ever-evolving`, `actionable`, `impactful`, `synergy`, `at its core`.
- **No Hollow Intensifiers:** Eliminate `truly`, `genuinely`, `quite frankly`, `worth noting`, `worth your time`, `actually` (unless contrasting factual errors).
- **No Em Dashes in Headings or Buttons:** Replace `—` and `--` in headings, titles, and CTA buttons with periods, commas, or direct declarative phrasing.
- **No AI Rhetorical Tropes:** Ban `"It's not X — it's Y"` constructions and multi-sentence countdown reveals.
- **No Emojis in Section Headings:** Never put emojis in headings (e.g., `## 🚀 Our Features`).
- **Arabic Numerals:** Write quantities as Arabic numerals (`3 steps`, `10x`, `2 days`) instead of spelled-out words (`three simple steps`) to anchor visual eye-tracking.
- **Organic Domain Data (No Synthetic Personas or Vanity Stats):**
  - **Ban LLM Persona Clichés:** Never use `"Sarah Chen"`, `"Marcus Williams"`, `"Jane Doe"`, `"Alex Rivera"`, or similar synthetic names.
  - **Ban Slop Brand Names:** Never use `"Acme"`, `"Nexus"`, `"SmartFlow"`, or `"Aura"`.
  - **Ban Round Vanity Metrics:** Replace `"99.99%"`, `"10k+ users"`, and `"100%"` with realistic domain metrics featuring natural variance (e.g., `$14,892.40`, `+12.4%`, `47.2%`).

---

## 6. Automated Anti-Slop Verification Gates

Run all 3 deterministic gates together on frontend deliverables and resolve every finding in a single bounded pass:

1. **Taste, Layout & Copy-Lint Gate (`design-taste-frontend`):**
   ```bash
   # Arm the finish gate on a static entry file or local dev server URL
   node .codex/skills/design-taste-frontend/scripts/gate.mjs --start <page.html | http://localhost:5173/>
   # Run full layout, consistency, and copy-lint checks
   node .codex/skills/design-taste-frontend/scripts/gate.mjs <page.html | http://localhost:5173/>
   ```
2. **Design Craft & Anti-Pattern Detector (`impeccable`):**
   ```powershell
   # Windows
   .codex/skills/impeccable/scripts/impeccable.cmd detect <file-or-dir>
   ```
   ```bash
   # macOS / Linux
   .codex/skills/impeccable/scripts/impeccable detect <file-or-dir>
   ```
3. **Prose & Microcopy Detector Gate (`avoid-ai-writing`):**
   ```bash
   node .codex/skills/avoid-ai-writing/bin/avoid-ai-writing-gate.js --context marketing --threshold 6 <files...>
   # Or scan markdown/copy across a repo glob:
   node .codex/skills/avoid-ai-writing/bin/avoid-ai-writing-gate.js --glob "**/*.md" --context technical --threshold 6
   ```

Verify zero horizontal overflow and responsive touch targets afterwards via [UI_Always.md](../../rules/UI_Always.md#7-browser-verification-policy).
