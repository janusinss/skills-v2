---
name: "prompt-enhancer-frontend"
description: "Expand UI concepts into exhaustive P0-P3 page/component matrices, interaction states, responsive journeys, and frontend Master Prompts."
---

# PROMPT ENHANCER — FRONTEND & UX

Transforms any product concept into an exhaustive frontend architecture specification covering every page, component, interaction pattern, user journey, and UX detail — generating an **AI-feedable Master Prompt** purpose-built for frontend coding agents.

---

## Core Directives

1. **Zero Roleplay Fluff**: Lead directly with the UI specification. No persona prefixes.
2. **Stack-Agnostic**: Do not dictate React, Vue, Svelte, or any specific framework unless already chosen by the user. Focus on what the interface must do, not how to implement it.
3. **Exhaustive UI Surface Coverage**: Catalog every page, view, modal, drawer, toast, empty state, loading skeleton, error boundary, and permission-denied (`403`) screen. Never abbreviate with "etc." or cap to 3 examples.
4. **Priority Tiers (P0–P3)**: Organize all UI features into strict execution phases so the frontend agent builds the P0 core loop first while structuring component boundaries cleanly for P1–P3.
5. **Pipeline-Aware Disambiguation Gate & Connected Skill Dispatch**:
   - **Skip When Resolved**: When invoked inside [starting-brandnew.md](../../rules/starting-brandnew.md), [starting-existing.md](../../rules/starting-existing.md), or [frontend.md](../../rules/frontend.md) after the batched discovery gate or codebase audit, or when the user's brief already defines the core UI workflow, proceed directly without asking follow-up questions.
   - **Single-Question Cap**: Only when invoked standalone on an ambiguous prompt that maps to 2+ fundamentally different UI paradigms (e.g., *"dashboard"* → analytics vs. admin panel vs. IoT monitor), ask **at most one** targeted question (when the existing user instructions leave a material choice unresolved) with up to 5 concise options before proceeding.
   - **Sibling Enhancer & Companion Skill Routing**: For fullstack systems or non-web surfaces, delegate to [prompt-enhancer](../prompt-enhancer/SKILL.md); for server/API/database tasks, delegate to [prompt-enhancer-backend](../prompt-enhancer-backend/SKILL.md). When moving to UI implementation, inspect only the 1–2 companion skills matching the active surface using the available file-reading tool or shell: [impeccable](../impeccable/SKILL.md) (primary Stage 2 visual craft, spatial composition, visitor modes & Stage 3 `impeccable detect` single-pass audit), [awesome-design-md](../awesome-design-md/SKILL.md) (`./DESIGN.md` ground truth), [design-taste-frontend](../design-taste-frontend/SKILL.md) (taste dials & `Design Read`), [avoid-ai-writing](../avoid-ai-writing/SKILL.md) (human copy), [playwright-skill](../playwright-skill/SKILL.md) (`helpers.extract21stComponent` & `helpers.resolveTargetUrl`), [3d-web-experience](../3d-web-experience/SKILL.md) / [scroll-world](../scroll-world/SKILL.md) (WebGL/ThreeUI shaders & scroll-scrubbed 3D camera flights), and [frontend-security-coder](../frontend-security-coder/SKILL.md) (XSS/CSP).
6. **Clean Unicode Formatting**: Use `→` or `->` for flows. Never use LaTeX.
7. **Strict Anti-AI-Slop & Authentic Media Law ([UI_Always.md](../../rules/UI_Always.md) Sections 1, 3, 4, 5, 6 & [impeccable/reference/craft-floor.md](../impeccable/reference/craft-floor.md))**: Every generated specification and Master Prompt must enforce:
   - 🚫 **No floating eyebrow pills, pastel chips, or kickers above headings**: No `rounded-full` pastel bubbles, fake `NEW`/`AI` badges, pulsing green `LIVE` dots on static pages, or eyebrow/kicker labels hovering over titles. Delete the label and lead directly with the headline (`H1 ≤ 2 lines`, hero subtext `≤ 20 words`, top header `< 80px`).
   - 🚫 **No centered hero + fake macOS terminal formula**: Do not default to a centered vertical hero stack paired with a fake macOS window and red/yellow/green traffic-light dots.
   - 🚫 **No icon-tile stacks or "Lucide Five" filler**: No rounded-square icon badges placed directly over card headings (`rule-icon-tile-stack`), and no reflexive spraying of **"The Lucide Five"** (`Sparkles`, `Zap`, `Shield`, `Check`, `BarChart3`) across every block.
   - 🚫 **No ghost cards or glassmorphism over blobs**: No pairing 1px hairline borders with wide diffused drop shadows (`box-shadow: 0 20px 25px`), and no `backdrop-filter: blur()` over floating color blobs on static content cards or tables (restrict glass strictly to fixed navbars/modals).
   - 🚫 **No side-tab accent stripes**: No `border-left: 4px solid <color>` or `border-t-4` on neutral cards unless communicating a genuine semantic system warning.
   - 🚫 **No decorative gridlines or radial halo glows**: No `background-size: 18px 18px` faux-developer grids or purple/cyan dark-mode glowing balls.
   - 🚫 **No container nesting (Cardocalypse), uniform `rounded-2xl`, or empty Bento cells**: Max 1-level container depth; differentiate radii (`4px–6px` controls vs. `12px–16px` containers) and compute concentric nested radii mathematically (`R_inner = Math.max(0, R_outer - Padding)`). Ban symmetrical 3-card rows AND empty/arbitrary dark Bento grids lacking 1:1 artifact mapping.
   - 🚫 **No duplicated dashboard telemetry**: Enforce a **Single Source of Metric Truth**—never repeat the same KPI across headers and cards or duplicate date pickers/filters inside individual cards (`1-to-3` focal hierarchy: max `3` data points per card; `85%` primary workflows at `0` clicks, `≥ 5` secondary actions collapsed into popovers).
   - 🚫 **No raw Unicode emojis as icons or placeholder image URLs**: Strictly mandate domain-specific SVG icons (Lucide or Phosphor at `16px`/`20px` `1.5px` stroke with `aria-hidden="true"`). Populate showcase, hero, and product cards with real web photography (Unsplash, Pexels, CDN) paired with `object-fit: cover`, explicit `width`/`height` or `aspect-ratio` (zero CLS), and contrast scrim overlays—**never generate AI images** or link `via.placeholder.com` for UI showcases.
   - 🚫 **No First-Order or Second-Order Slop Palettes & Typography**: Avoid uncalibrated Inter/Geist single-font defaults, never use serif fonts inside software/SaaS dashboards, never wrap a single isolated headline word in a colored/italic serif `<span>`, never use `bg-clip-text` gradient text, and never use `UPPERCASE_WITH_UNDERSCORE` monospace button labels (use `tabular-nums` on all metrics/tables). Ban purple/indigo gradients (`#6366F1`/`#8B5CF6`) AND Second-Order Slop escapes (reflexive `#10B981` emerald-on-slate or unprompted cream/terracotta); tint all neutrals toward the brand hue in `:root`.
8. **Strict Anti-AI-Writing Law ([UI_Always.md](../../rules/UI_Always.md) Section 7 / [avoid-ai-writing](../avoid-ai-writing/SKILL.md))**: Every generated UI prompt, headline, microcopy string, empty state, and button label must eliminate synthetic machine writing patterns:
   - 🚫 **Ban Tier 1A Machine Vocabulary**: Never use `delve`, `tapestry`, `realm`, `paradigm`, `embark`, `testament to`, `robust`, `comprehensive`, `cutting-edge`, `leverage`, `meticulous`, `seamless`, `game-changer`, `vibrant`, `thriving`, `deep dive`, `unpack`, `intricacies`, `ever-evolving`, `actionable`, `impactful`, `synergy`, `at its core`.
   - 🚫 **Ban Hollow Intensifiers & Fake Endorsements**: Cut `truly`, `genuinely`, `quite frankly`, `worth noting`, `worth your time`, `actually` (unless marking factual contrast).
   - 🚫 **Ban Formulaic Sentence Formulas**: No "It's not X — it's Y" / "This isn't about X, it's about Y". No split-sentence reveal countdowns ("It's not speed. It's not price. It's trust.").
   - 🚫 **Ban Em Dashes in Headings & Buttons**: Zero em dashes (`—` or `--`) in titles, hero headers, buttons, or slogans. Replace with periods, commas, or direct declarative syntax.
   - 🚫 **Ban Emojis in Headers**: Zero emojis in section headings (no `## 🚀 Features`).
   - ✅ **Mandate Arabic Numerals, Organic Domain Data & Concrete Copy**: Write all quantities as Arabic numerals (`3 steps`, `10x`, `2 days`) instead of spelled-out words, ban synthetic personas (`Sarah Chen`, `Jane Doe`), slop brand names (`Acme`, `Nexus`), and round vanity stats (`99.99%`), and use realistic domain variance (`$14,892.40`, `+12.4%`).
9. **Tactile Motion & Physics Law ([MOTION.md](../../rules/MOTION.md))**: Every generated UI specification and Master Prompt must govern animations and micro-interactions by [MOTION.md](../../rules/MOTION.md):
   - **Springs Over Linear Easing & No Section Scroll Fade-Ups**: Use physical spring presets (`Gentle`: `stiffness: 120, damping: 14`; `Snappy`: `stiffness: 280, damping: 20`; `Bouncy`: `stiffness: 400, damping: 12`) or `cubic-bezier(0.25, 1, 0.5, 1)` settling within `≤300ms` (max 3%–8% overshoot). Never use flat `linear` transitions, `transition: all`, or uniform section-wide `initial={{ opacity: 0, y: 20 }}` scroll fade-ups that delay reading for fast scrollers.
   - **Composite-Only GPU Properties**: Animate only `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Never animate `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding` (use FLIP for layout transitions).
   - **Deterministic Rest State**: Enforce `[Rest State] → [Active Action] → [Settled Rest State]` with smooth mid-flight interruption handling.
   - **Reduced-Motion Accessibility**: Always mandate a `@media (prefers-reduced-motion: reduce)` fallback that collapses spatial translations and bounces into gentle 150ms opacity fades.
10. **Frontend Security & Verification Hygiene ([security.md](../../rules/security.md) Phase 6 & [frontend.md](../../rules/frontend.md) Stages 3–4)**:
    - **XSS & Client Security ([frontend-security-coder](../frontend-security-coder/SKILL.md))**: Ban raw DOM injection (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`), sanitize rich text with DOMPurify using an explicit tag allowlist, include anti-CSRF tokens on state-changing requests, and never treat client-side UI hiding as an authorization boundary.
    - **Quality & Browser Verification ([impeccable](../impeccable/SKILL.md) & [playwright-skill](../playwright-skill/SKILL.md))**: Mandate a single-pass `impeccable detect` token/contrast check and real Chromium verification via `helpers.resolveTargetUrl()` across `375px`, `768px`, and `1280px` (`scrollWidth <= innerWidth`, zero console errors).

---

## 5-Phase Frontend Enhancement Pipeline

### Phase 1: UI Domain Classification & Aesthetic Archetype
- **Product Surface Type**: Landing page, SPA dashboard, multi-page marketing site, admin console, mobile-first PWA, or e-commerce storefront.
  - *Default Landing / Marketing Archetype Alignment*: For greenfield landing/marketing/storefront builds following [starting-brandnew.md](../../rules/starting-brandnew.md) (when no custom layout is requested), align component mapping with the selected 21st.dev blueprint (*Standard Website*: TailGrids NexStudio + Spectrum UI Footer; *Website with Hero*: Md Adul E-commerce Marketplace + Spectrum UI Footer) extracted via `helpers.extract21stComponent()` and themed dynamically via `./DESIGN.md` tokens ([awesome-design-md](../awesome-design-md/SKILL.md)).
- **Visitor Mode ([impeccable](../impeccable/SKILL.md)), Visual Archetype & [design-taste-frontend](../design-taste-frontend/SKILL.md) Dials**: Select the surface's [impeccable](../impeccable/SKILL.md) Visitor Mode (`Persuade`, `Operate`, `Read`, or `Experience`), choose one authoritative aesthetic direction (or inherit directly from `./DESIGN.md` if present), and calibrate `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY` (`1–10`):
  - *Linear Dark-Tech*: Obsidian surfaces (`#0d0f12`), hairline tinted borders, monospace metadata chips, snappy spring micro-interactions (`stiffness: 280, damping: 20`, settling `≤300ms`).
  - *Kinetic Editorial*: Large expressive display serifs, asymmetrical `2fr 1fr` layout, generous `clamp()` spacing, curated real web photography with contrast scrims.
  - *Warm Minimalist*: Cream/oatmeal canvas, espresso typography, flat border-driven bento grids, zero drop shadows.
  - *Swiss Brutalist*: High-contrast monochrome, visible structural gridlines, heavy grotesk type scale, utilitarian status badges.
  - *Luxury Consumer*: Deep rich brand hues, soft organic radii, subtle frosted accents, gentle spring transitions (`stiffness: 120, damping: 14`).
- **Site Map & Navigation Model**: Top-level routes, nested views, tab structures, sidebar/header navigation hierarchy.
- **Core Interaction Loop**: The primary UI cycle (Discover → Configure → Commit → Confirm).

### Phase 2: Exhaustive Page & Component Catalog (P0–P3)
Catalog every UI surface and assign execution priority:
- **P0 (Core Views & Atomic Loop)**: The non-negotiable pages and interactions that deliver baseline value (built completely in the initial implementation pass).
- **P1 (Essential UX & Secondary Views)**: Search/filter panels, notification centers, user preferences, onboarding flows.
- **P2 (Power-User & Admin Views)**: Data tables with sort/filter/export, audit logs, role management screens, analytics dashboards.
- **P3 (Delight & Polish)**: Advanced choreographed motion, skeleton loaders, keyboard shortcuts, drag-and-drop reordering, theme toggles.

### Phase 3: Interaction Design, Motion Physics, Component Specs & Design Tokens
- **Design Tokens & Aesthetic Dials**: Declare authoritative color tokens (brand, neutral tints, accents in `:root`), typography pairings, spacing scale, and taste dials (`DESIGN_VARIANCE`, `VISUAL_DENSITY`, `MOTION_INTENSITY` from 1–10).
- **Asymmetric Composition, Concentric Geometry & Viewport Integrity ([UI_Always.md](../../rules/UI_Always.md))**:
  - Replace symmetrical 3-card rows with staggered bento grids, variable-span cards (`col-span-2` / `col-span-1`), or horizontal detail splits (never arbitrary dark Bento grids with empty filler cells). Differentiate geometry (`4px–6px` controls vs. `12px–16px` containers) and calculate nested radii via `R_inner = Math.max(0, R_outer - Padding)`.
  - Keep top header height `< 80px`, set hero section top padding strictly to `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` (24px inset below fixed header), and use `min-height: 100dvh` flex-column page shells with `scrollbar-gutter: stable`.
  - Typography scale: High visual tension (display title 3.5×–4× body size with `-0.02em` to `-0.03em` tracking, `H1 ≤ 2 lines`, hero subtext `≤ 20 words`; body copy capped at `65ch–75ch` with `1.6` line height; `tabular-nums` on all metrics/tables).
- **Interactive Components & [MOTION.md](../../rules/MOTION.md) Physics**: Modals, drawers, dropdowns, toasts, popovers, accordions — with trigger conditions, spring presets (`Gentle`/`Snappy`/`Bouncy`) or `cubic-bezier(0.25, 1, 0.5, 1)` settling `≤300ms` on `transform`/`opacity`, deterministic `[Rest] → [Action] → [Rest]` transitions, dismissal rules, and zero uniform section-wide `opacity: 0, y: 20` scroll fade-ups.
- **Form Architecture & Client Security ([security.md](../../rules/security.md))**: Multi-step forms, explicit `<label for="id">` or `aria-label`, `type="button"` on non-submit buttons, inline validation rules, error message placement, anti-CSRF token submission, DOMPurify rich-text sanitization (zero `dangerouslySetInnerHTML`/`v-html`/`innerHTML`), autosave behavior, and disabled submit states during in-flight requests.
- **State Variants for Every View & Component**:
  - **5 Operational View States ([penetrating-and-testing.md](../../rules/penetrating-and-testing.md))**: `Success`, `Failure / Inline Error`, `Empty (onboarding CTA)`, `Loading (skeleton/spinner)`, and `Permission-Denied (403)`.
  - **8-State Interactive Primitive Standard ([UI_Always.md](../../rules/UI_Always.md) Section 5)**: `Default`, `Hover`, `Focus-Visible` (`2px` offset ring), `Active` (tactile press `scale(0.97)` over `60ms`), `Loading` (inline spinner + width lock), `Error` (`aria-invalid="true"`), `Success`, and `Disabled` (`cursor: not-allowed; opacity: 0.6`).

### Phase 4: User Journeys, Responsive Viewports & Mobile Affordance
- **Step-by-Step User Journeys**: Primary, secondary, error-recovery, and first-time-user flows with exact screen transitions.
- **Responsive Breakpoint & Verification Strategy ([UI_Always.md](../../rules/UI_Always.md) Section 8 & [MOTION.md](../../rules/MOTION.md) Section 4)**:
  - **Mobile (`375px` audit viewport, ≤480px)**: Single-column stack, bottom sheet/drawer navigation, thumb-zone actions, motion displacement capped at `16px–32px`, particle cap `30–40`.
  - **Tablet (`768px` audit viewport, 481–1024px)**: 2-column asymmetric grid, collapsible rail/sidebar, FLIP layout transitions on orientation change.
  - **Desktop (`1280px+` audit viewport, 1025px+)**: Full asymmetric bento/split layout, sticky headers, subtle cursor magnetic pull (`≤4px`), travel clamped inside centered containers.
- **Mobile & Touch Floor ([UI_Always.md](../../rules/UI_Always.md) Section 2)**: Minimum `44×44px` interactive touch targets, minimum `16px` font on mobile inputs (prevent iOS Safari auto-zoom), `cursor: pointer` on all interactive elements, and zero horizontal scroll overflow (`max-width: 100%`, `min-width: 0` on flex items; never mask leaks with `body { overflow-x: hidden }`).
- **Accessibility Requirements**: WCAG 2.1 AA compliance targets, keyboard navigation order, ARIA landmarks, focus trap behavior in modals, color contrast ratios (`≥4.5:1` body text, `≥3:1` large headlines), and `@media (prefers-reduced-motion: reduce)` support.
- **UX Copy & Microcopy**: Button labels, empty state messages, error text, confirmation dialogs, and tooltip content complying with [UI_Always.md](../../rules/UI_Always.md) Section 7 ([avoid-ai-writing](../avoid-ai-writing/SKILL.md)).

### Phase 5: AI-Feedable Frontend Master Prompt Synthesis
Generate a self-contained prompt formatted for immediate execution by a frontend coding agent.

---

## Standardized Output Layout

> **Execution Note**: Sections 1–5 are the comprehensive frontend analysis artifact (written directly to `./PRODUCT.md` during [starting-brandnew.md](../../rules/starting-brandnew.md) or [starting-existing.md](../../rules/starting-existing.md) pipelines). Section 6 is the standalone, copy-pasteable Master Prompt and execution contract for a frontend AI coding agent.

````markdown
# Frontend Architecture & UI Specification: [Product / Concept]

## 1. UI Domain, Visual Direction & Information Architecture
- **Product Surface**: [Landing | SPA | Dashboard | Storefront | Admin Console | PWA]
- **Target User Personas**: [Primary users and their core tasks]
- **Visual Direction & Blueprint**:
  - **Primary Craft Engine & Visitor Mode (`impeccable`)**: `[Persuade | Operate | Read | Experience]` (enforcing `craft-floor.md` & `layout.md` spatial hierarchy)
  - **Design System & Archetype**: [`./DESIGN.md` brand / visual archetype] | **Website Blueprint**: [Standard Website (TailGrids NexStudio + Spectrum UI Footer) | Website with Hero (Md Adul E-commerce Marketplace + Spectrum UI Footer) | Custom App / Dashboard]
  - **Taste Dials (`design-taste-frontend`)**: `DESIGN_VARIANCE: [1-10]`, `MOTION_INTENSITY: [1-10]`, `VISUAL_DENSITY: [1-10]`
  - **Design Read**: `"Reading this as: [page kind] for [audience], with a [vibe] language, leaning toward [design system]."`
- **Navigation Model**: [Sidebar | Top Nav | Tab Bar | Drawer | Breadcrumb]
- **Site Map**:
  - `/` → [Home / Landing]
  - `/[route]` → [View description]
  - `/[route]/[sub]` → [Nested view description]

## 2. Exhaustive Page & Component Matrix (P0–P3)
| Priority | Page / View | Key Components | Interactions & Operational States |
|---|---|---|---|
| **P0** | [Core View 1] | ... | ... |
| **P0** | [Core View 2] | ... | ... |
| **P1** | [Secondary View] | ... | ... |
| **P2** | [Admin / Analytics] | ... | ... |
| **P3** | [Polish / Delight] | ... | ... |

## 3. Component Specifications, State Matrix & Motion Physics
| Component | Trigger | 8-State Primitives (`Default / Hover / Focus-Visible / Active / Loading / Error / Success / Disabled`) + View (`Empty / 403`) | Motion & Physics (`transform`/`opacity`, ≤300ms) |
|---|---|---|---|
| [Component 1] | ... | ... | e.g., `Snappy` spring (`stiffness: 280, damping: 20`), `[Rest] → [Action] → [Rest]` |
| [Component 2] | ... | ... | e.g., `Gentle` spring (`stiffness: 120, damping: 14`) or `cubic-bezier(0.25, 1, 0.5, 1)` |

## 4. User Journeys & Responsive Behavior
- **Primary Journey**: [Screen A] → [Action] → [Screen B] → [Confirmation]
- **Error Recovery**: [Screen A] → [Invalid input] → [Inline error] → [Corrected submission]
- **First-Time User (Empty State)**: [Landing] → [Onboarding prompt] → [First action]
- **Permission-Denied (403) Flow**: [Unauthorized route/action] → [Graceful 403 state or `/login?returnUrl=` redirect]
- **Responsive & Cross-Device Motion Rules**:
  | Breakpoint (Audit Viewport) | Layout Shift & Clearance | Hidden / Revealed & Motion Bounds |
  |---|---|---|
  | Mobile ≤480px (`375px`) | Single-column, `44×44px` targets, `≥16px` inputs | Drawer nav, max `16px–32px` drift, `:active` `scale(0.96)` |
  | Tablet 481–1024px (`768px`) | 2-column asymmetric grid | Collapsible rail, FLIP orientation transitions |
  | Desktop 1025px+ (`1280px`) | Full asymmetric bento/split, header `< 80px`, hero padding `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` | Full nav, cursor pull `≤4px`, container-clamped motion |

## 5. Accessibility, Client Security, UX Copy & Verification
- **Keyboard & Reduced Motion**: [Tab order, focus traps, skip links, `@media (prefers-reduced-motion: reduce)` opacity fallback]
- **ARIA, Form Hygiene & XSS Safety**: [Landmarks, `<label for="id">`, `type="button"` on non-submit buttons, CSRF tokens, DOMPurify sanitization, zero raw `dangerouslySetInnerHTML`/`v-html`/`innerHTML`]
- **Microcopy Inventory**: [Button labels, empty states, error messages, tooltips — zero Tier 1A AI words, heading em dashes, or spelled-out numbers]
- **Verification Gates**: [Single-pass `impeccable detect` token/contrast check + inline Playwright `helpers.resolveTargetUrl()` audit across `375px`, `768px`, and `1280px`]

---

## 6. AI-Feedable Frontend Master Prompt (Direct Agent Execution)

> **Copy and run the prompt below directly in any frontend AI coding agent:**

```markdown
Design and build a complete, production-ready frontend for [Product Name / Type].

### Design Read & Visitor Mode (impeccable Stage 2)
- **Visitor Mode (`impeccable`)**: `[Persuade | Operate | Read | Experience]`
- **Design Read**: "Reading this as: [page kind] for [target audience], with a [vibe/tone] language, leaning toward [design system/archetype]."

### Anti-Slop Visual & Authentic Media Directives (impeccable & UI_Always.md)
- **Header Ceiling, Hero Clearance & Proportions**: Keep top navigation header height strictly `< 80px`, hero `H1 ≤ 2 lines`, and hero subtext `≤ 20 words`. Set hero section top padding strictly to `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` (24px inset below fixed header). Zero floating pill badges, pastel chip capsules, or eyebrow/kicker labels above headlines; zero centered hero + fake macOS traffic-light terminal windows.
- **Layout Rhythm, Concentric Radii & Telemetry Hygiene**: Pass the squint test with a clear reading order, group by proximity before adding containers, and pair tight internal grouping with generous section separation on a `4px` base scale. Zero symmetrical 3-card equal grids and zero arbitrary dark Bento grids with empty filler cells. Differentiate corner radii (`4px–6px` inputs/buttons vs. `12px–16px` containers; zero uniform `rounded-2xl` everywhere) and compute nested radii via `R_inner = Math.max(0, R_outer - Padding)`. On dashboards, enforce a Single Source of Metric Truth (no repeated KPIs across headers and cards, no duplicated in-card date pickers/filters, max `3` data points per card, `85%` primary workflows at `0` clicks and `≥ 5` secondary actions collapsed into popovers). Use `min-height: 100dvh` flex-column page shells with `scrollbar-gutter: stable`.
- **Color Palette, Contrast, Second-Order Slop Ban & Browser Surfaces**: Declare all colors as CSS variables in `:root` (`--canvas`, `--surface`, `--ink`, `--muted`, `--accent`, `--border`) mapped to `./DESIGN.md` tokens (when present). Zero untinted `#000000` or `#808080` (tint all darks/neutrals toward the brand hue). Ban both First-Order purple/indigo gradients (`#6366F1`/`#8B5CF6`) AND Second-Order Slop escapes (reflexive `#10B981` emerald-on-slate or unprompted cream/terracotta). Enforce WCAG AA contrast (`≥4.5:1` body, `≥3:1` large headlines) and theme browser surfaces (text selection, caret, scrollbars, `:focus-visible` rings, `tabular-nums`).
- **Typography Scale**: Curated font pairing with high visual tension: Display font [`font-family`] with tight tracking (`letter-spacing: -0.02em` to `-0.03em`), balanced headings, zero `bg-clip-text` gradient text, zero single-word colored/italic serif `<span>` accents in headlines, zero serif fonts inside software dashboards, and zero `UPPERCASE_WITH_UNDERSCORE` monospace button labels; readable body font [`font-family`] capped at `65ch–75ch` with `line-height: 1.6`.
- **Card Architecture**: Max 1-level container depth; zero cards nested inside cards, zero ghost cards (pick either a 1px border OR an elevation shadow, never both), zero `backdrop-filter: blur()` over floating color blobs on static cards/tables, zero icon-tile stacks above headings, and zero decorative `border-left` stripes.
- **Iconography & Authentic Photography (Zero AI Images)**: Use domain-specific SVG icons (Lucide or Phosphor at `16px`/`20px` `1.5px` stroke) with `aria-hidden="true"` (zero Unicode emojis as UI icons and zero reflexive `"Lucide Five"` `Sparkles`/`Zap`/`Shield`/`Check`/`BarChart3` filler icons). Populate hero showcases and product cards with real web photography (Unsplash, Pexels, CDN) using `object-fit: cover`, explicit `width`/`height` or `aspect-ratio` (zero CLS), and semi-transparent contrast scrim overlays—never generate AI images or use `via.placeholder.com`.

### Tactile Motion & Physics Directives (MOTION.md)
- **Spring Physics, Easing & No Section Scroll Fade-Ups**: Use physical spring presets (`Gentle`: `stiffness: 120, damping: 14`; `Snappy`: `stiffness: 280, damping: 20`; `Bouncy`: `stiffness: 400, damping: 12`) or `cubic-bezier(0.25, 1, 0.5, 1)` settling within `≤300ms`. Never use flat `linear` easing, `transition: all`, or uniform section-wide `initial={{ opacity: 0, y: 20 }}` scroll fade-ups that delay reading for fast scrollers.
- **Composite-Only GPU Properties**: Animate only `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Never animate `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding`.
- **Deterministic State Machine**: Every interactive component must follow `[Rest State] → [Active Action] → [Settled Rest State]` and blend mid-flight interruptions smoothly without snapping.
- **Reduced Motion Fallback**: Include `@media (prefers-reduced-motion: reduce)` to collapse spatial motion and bounce into gentle 150ms opacity fades.

### Anti-AI Copy & Natural Voice Directives (avoid-ai-writing)
- **Zero Tier 1A Buzzwords**: Never use `delve`, `tapestry`, `realm`, `paradigm`, `embark`, `testament to`, `robust`, `comprehensive`, `cutting-edge`, `leverage`, `meticulous`, `seamless`, `game-changer`, `vibrant`, `thriving`, `deep dive`, `unpack`, `intricacies`, `ever-evolving`, `actionable`, `impactful`, `synergy`, `at its core`.
- **Zero Em Dashes in Headings/Buttons**: Never use `—` or `--` in titles, heroes, buttons, or taglines. Use simple declarative punctuation.
- **Zero AI Sentence Tropes**: Never use "It's not X — it's Y", hollow intensifiers (`truly`, `genuinely`), or multi-sentence countdown reveals.
- **Zero Emoji in Titles**: Strip all emojis from section headings (`## 🚀 Features` is strictly banned).
- **Arabic Numerals & Organic Domain Data (Zero "Jane Doe" Slop)**: Write all quantities as Arabic numerals (`3 steps`, `10x`, `2 days`) instead of spelled-out words. Never use synthetic personas (`Sarah Chen`, `Jane Doe`), slop brand names (`Acme`, `Nexus`), or round vanity stats (`99.99%`, `10k+`); use realistic domain variance (`$14,892.40`, `+12.4%`).

### Design Tokens & Aesthetic Dials
- Visitor Mode (`impeccable`) & Aesthetic Dials (`design-taste-frontend`): `Mode: [Persuade | Operate | Read | Experience]`, `DESIGN_VARIANCE: [1-10]`, `MOTION_INTENSITY: [1-10]`, `VISUAL_DENSITY: [1-10]`
- Website Blueprint (when applicable): [Standard Website (TailGrids NexStudio + Spectrum UI Footer) | Website with Hero (Md Adul E-commerce Marketplace + Spectrum UI Footer) | Custom App / Dashboard], themed dynamically via `./DESIGN.md` tokens
- Color Palette: Primary [`hex`], Neutrals [`tinted darks & lights`], Accents [`hex`] (Declared as CSS tokens in `:root`)
- Typography Pairing: Headings [`font-family`], Body [`font-family`]
- Touch & Viewport Floor: Minimum `44×44px` touch targets, `cursor: pointer` on all interactive controls, `≥16px` mobile form inputs, `min-width: 0` on flex items, and zero horizontal overflow (`scrollWidth <= innerWidth`) across `375px`, `768px`, and `1280px`.

### Priority Execution Roadmap
> **Execution Rule**: Implement **Phase 1 (P0)** completely for the initial production release unless full P0–P3 implementation is explicitly requested. Catalog P1–P3 in `PRODUCT.md` and structure component boundaries cleanly to support iterative expansion.

<!-- Enumerate ALL discovered UI capabilities for each tier without truncation -->
#### Phase 1: P0 Core Views & Atomic UI Loop (Build Now)
1. [Core Page / View 1]: [Layout, key components, primary interaction, 5 operational states]
2. [Core Page / View 2]: [Layout, key components, primary interaction, 5 operational states]
[... enumerate all remaining P0 views and components]

#### Phase 2: P1 Essential UX & Secondary Views
1. [Secondary View 1]: [Components and behavior]
2. [Secondary View 2]: [Components and behavior]
[... enumerate all remaining P1 capabilities]

#### Phase 3: P2 Admin, Analytics & Power-User Tools
1. [Admin View 1]: [Data tables, filters, exports]
[... enumerate all remaining P2 capabilities]

#### Phase 4: P3 Polish, Animation & Delight
1. [Micro-interaction / Animation 1]: [Trigger, spring physics, duration ≤300ms, reduced-motion fallback]
[... enumerate all remaining P3 capabilities]

### Complete User Journeys
- Primary Flow: [Step-by-step screen transitions]
- Error Recovery Flow: [Invalid state → inline field error → correction → success]
- Empty State / First-Time User Flow: [Onboarding sequence]
- Permission-Denied (403) Flow: [Unauthorized access → graceful 403 view or login redirect]

### Responsive Breakpoint Rules (Verified at 375px, 768px, 1280px)
- Mobile (≤480px, audited at `375px`): [Single-column layout, hidden elements, `44×44px` touch targets, `≥16px` inputs, max `16px–32px` motion drift]
- Tablet (481–1024px, audited at `768px`): [2-column asymmetric layout adjustments, FLIP orientation transitions]
- Desktop (1025px+, audited at `1280px`): [Full asymmetric bento/split layout, `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` hero clearance]

### Accessibility, Form Hygiene, Client Security & Verification
- Keyboard navigation order, focus traps in modals, and visible `:focus-visible` rings
- ARIA landmarks/roles, `<label for="id">` on all inputs, and `type="button"` on non-submit buttons inside forms
- Client Security (security.md Phase 6): Zero raw DOM insertion (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`); sanitize rich text via DOMPurify with an explicit tag allowlist; include anti-CSRF tokens on state-changing requests
- Verification Gates (frontend.md Stages 3–4): Single-pass `impeccable detect` compliance check and real browser layout audit via `playwright-skill` (`helpers.resolveTargetUrl()`) at `375px`, `768px`, and `1280px` with zero horizontal overflow and zero console errors
- Complete microcopy: button labels, error messages, empty states, tooltips

### Component & View State Requirements
- Every view and interactive component must handle: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`, `error / failure`, `empty`, `permission-denied (403)`, and `success` states.
```
````
