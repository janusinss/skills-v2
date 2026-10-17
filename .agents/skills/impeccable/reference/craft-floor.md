# Craft floor

Load this after the direction is settled, and build without announcing the checklist. A pinned brief or the committed visual world overrides anything here; your own habit does not. When the design hook is active it already enforces the mechanical checks below as you edit: act on its findings instead of re-auditing each rule.

## Verify

Each of these is a check on the built result, not an intention. Run them together in the batched inspection rounds, not as separate screenshot trips; the checks share one render.

- **Contrast:** body and placeholder text ≥4.5:1, large text ≥3:1. On colored surfaces tint secondary text from that hue or the foreground; never gray.
- **Depth:** shadows carry an offset and a soft blur. A zero-offset colored halo is decoration.
- **Spacing:** tight groups, generous separation, more space above a heading than below it. Read the computed values.
- **Type:** body measure 65–75ch, display max 6rem, tracking floor -0.04em, balanced headings, obvious scale and weight steps. Run the real copy at every breakpoint and fix what overflows.
- **Motion:** one authored moment, not scattered effects and not one identical entrance (`opacity: 0, y: 20` scroll fade-up) on every section. Exponential ease-out from an already-visible default. Reach past transform and opacity: blur, backdrop-filter, clip-path, mask, and shadow belong to the palette when they stay smooth.
- **States (8-State Interactive Standard):** `default`, `hover`, `focus-visible` (`2px` offset ring), `active` (tactile `scale(0.97)` over `60ms`), `loading` (inline spinner + width lock), `error` (`aria-invalid`), `success`, and `disabled` (`cursor: not-allowed; opacity: 0.6`), plus view-level `empty` and `403` states.
- **Browser surfaces:** the parts you did not draw still carry the design. Text selection, the caret, custom scrollbars, focus rings, underline offset, and the numerals in tabular data (`tabular-nums`) all ship with browser defaults that belong to no design system. Theme them from the palette. This is the cheapest signal that a page was built rather than assembled, and the one models skip most reliably.
- **Copy:** the product's own language. Controls name their action; errors name the problem and the recovery. Write quantities as Arabic numerals (`3 steps`, `10x`, `2 days`) rather than spelled-out words, keep hero `H1 ≤ 2 lines` and subtext `≤ 20 words`, and never populate mockups with synthetic personas (`Sarah Chen`, `Jane Doe`), slop brand names (`Acme`, `Nexus`), or round vanity stats (`99.99%`).
- **Coverage:** every brief requirement present and findable within seconds.

## Refuse

These are the category's defaults, not bans: the brief's own words can earn any of them. Reaching for one when the axis is free means you were not deciding; recognizing that means rewriting the element, not softening it.

Page scaffolds:

- Same-size cards of icon plus heading plus text as the page structure, or replacing 3-card equal rows with arbitrary dark Bento grids containing empty filler cells. Cards are the lazy container; nested cards are always wrong.
- Centered hero stack paired with a fake macOS terminal window and red/yellow/green traffic-light dots, or top navigation headers taller than `80px`.
- The hero-metric template: big number, small label, supporting stats, accent. On dashboards, never repeat the same KPI across headers and cards or duplicate date pickers/filters inside individual cards (enforce a Single Source of Metric Truth with one page-level toolbar and max `3` data points per card).
- A kicker or eyebrow above a heading. This one is a ban, not a default: no brief earns it back. The heading carries its own weight; delete the label and let the heading speak.
- Section numbers (01 / 02 / 03) unless the sequence itself carries information the reader needs.
- A modal for a task that needs neither interruption nor protected focus.

Surface habits:

- First-order purple/indigo gradients (`#6366F1` / `#8B5CF6`) AND second-order slop fallbacks (reflexively escaping purple into default `#10B981` emerald-on-slate, unprompted cream/terracotta, `Space Grotesk`, or italic `Instrument Serif`). Never use serif type inside software or SaaS dashboards.
- Gradient text (`background-clip: text`), or italicizing/coloring a single isolated word inside a sans-serif headline `<span>`. Emphasis comes from weight or size.
- Glass and `backdrop-filter: blur()` over floating color blobs on static content cards or data tables. Restrict glass strictly to floating fixed navbars or modals.
- A colored `border-left`, `border-right`, or `border-top` above 1px on cards, list items, or metric containers.
- Hard offset shadows (`box-shadow: 4px 4px 0`) outside a world that is actually neobrutalist. The zero-blur block shadow is a costume, not a depth system; a world that did not choose it never earns it as a default.
- Sparklines, progress rings, and soft-shadowed rounded rectangles standing in for content.
- Monospace as a costume for "technical" (`UPPERCASE_WITH_UNDERSCORE` button labels) rather than for code, data, or measurement.
- A system display face (Impact, Arial Black, the platform sans) as the display voice of an own-world page. Source and self-host a face whose character matches the approved lettering; the closest installed font is a failure, not a fallback.
- Unicode glyphs/emoji or reflexive **"Lucide Five"** (`Sparkles`, `Zap`, `Shield`, `Check`, `BarChart3`) filler icons standing in for an icon system. Omit icons when typography carries hierarchy, or draw from a real library at consistent `16px`/`20px` sizing and `1.5px` stroke.
- Geometric masks standing in for organic contours. A circle, polygon, or radial-gradient cutout approximating a photographic subject's edge is the cheap version of the effect and reads worse than omitting it. Derive an alpha matte from the actual image, or produce a cut-out asset.
- Light or dark picked by category. Pick it from the use scene: who, where, under what ambient light.

- Tracking stops at -0.04em. -0.02 to -0.03em usually reads better.
- Declare elevation once, border or shadow. A 1px border under a wide soft shadow is the ghost card. Differentiate geometry (`4px–6px` for inputs/buttons vs `12px–16px` for outer cards; never uniform `rounded-2xl` everywhere) and compute concentric nested radii mathematically: `R_inner = Math.max(0, R_outer - Padding)`.
- Real illustration or none. Sketch-style SVG scenes, `loose-sketch` / `doodle` class names, and `feTurbulence` grain read as amateur. This bans SVG imitating pictures, never SVG doing geometry: crisp vector shapes, diagrams, animated linework, and shader-driven effects remain first-class media. A shaded, perspectived, or figure-bearing illustration is a picture even in line-art style; geometry means shapes a session can specify exactly.
- Backgrounds are surfaces, textured only from the subject's world. `repeating-linear-gradient` stripes and two-axis grid overlays need an actual canvas, map, blueprint, or measuring tool under them.
- Claims and configuration come from supplied truth; label illustrative values honestly. Naming a concept and then ironizing it is not a claim.

The floor holds the mechanics; it never picks the direction. With every check green, spend the page on the committed world, and when torn between refined and committed, commit.
