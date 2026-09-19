---
name: prompt-enhancer-frontend
description: Frontend & UX prompt enhancement engine. Deconstructs raw concepts into exhaustive UI architecture, page/component taxonomy, interaction design, user journeys, information architecture, responsive behavior, accessibility, and generates AI-feedable Master Prompts for frontend coding agents.
---

# PROMPT ENHANCER — FRONTEND & UX

Transforms any product concept into an exhaustive frontend architecture specification covering every page, component, interaction pattern, user journey, and UX detail — generating an **AI-feedable Master Prompt** purpose-built for frontend coding agents.

---

## Core Directives

1. **Zero Roleplay Fluff**: Lead directly with the UI specification. No persona prefixes.
2. **Stack-Agnostic**: Do not dictate React, Vue, Svelte, or any specific framework. Focus on what the interface must do, not how to implement it.
3. **Exhaustive UI Surface Coverage**: Catalog every page, view, modal, drawer, toast, empty state, loading skeleton, and error boundary. Never abbreviate with "etc." or cap to 3 examples.
4. **Priority Tiers (P0–P3)**: Organize all UI features into strict execution phases so the frontend agent builds the core experience first.
5. **Input Disambiguation Gate**: If a concept maps to 2+ fundamentally different UI paradigms (e.g., "dashboard" → analytics vs. admin panel vs. IoT monitor), ask **one** targeted question before proceeding.
6. **Clean Unicode Formatting**: Use `→` or `->` for flows. Never use LaTeX.
7. **Strict Anti-AI-Slop Law (Mandatory)**: Every generated prompt must explicitly ban structural AI frontend slop:
   - 🚫 **No floating eyebrow pills / pastel chips**: No `rounded-full` pastel bubbles with colored uppercase text hovering over titles. Use unboxed typographic kickers or lead directly with the headline.
   - 🚫 **No icon-tile stacks**: No rounded-square icon badges placed directly over card headings (`rule-icon-tile-stack`).
   - 🚫 **No ghost cards**: No pairing 1px hairline borders with wide diffused drop shadows (`box-shadow: 0 20px 25px`). Pick either a border OR a shadow.
   - 🚫 **No side-tab accent stripes**: No `border-left: 4px solid <color>` on neutral cards unless communicating a genuine status alert.
   - 🚫 **No decorative gridlines or radial halo glows**: No `background-size: 18px 18px` faux-developer grids or purple/cyan dark-mode glowing balls.
   - 🚫 **No container nesting (Cardocalypse)**: No cards inside cards with identical borders and padding. Use whitespace and dividers.
   - 🚫 **No identical 3-column symmetry**: Ban repetitive 3-card rows. Enforce asymmetric layouts (bento grids, `2fr 1fr` splits, or list layouts).
   - 🚫 **No raw Unicode emojis as icons**: Strictly mandate SVG icons (Lucide or Phosphor).
   - 🚫 **No unstyled/overused fonts or flat hierarchy**: Avoid default uncalibrated Inter/Geist with flat sizing; specify distinct display/body pairings with high visual tension.
   - 🚫 **No untinted pure black/gray**: Tint all darks and grays into the brand hue.

---

## 5-Phase Frontend Enhancement Pipeline

### Phase 1: UI Domain Classification & Aesthetic Archetype
- **Product Surface Type**: Landing page, SPA dashboard, multi-page marketing site, admin console, mobile-first PWA, or e-commerce storefront.
- **Visual Archetype Selection**: Select one authoritative aesthetic direction to prevent generic defaults:
  - *Linear Dark-Tech*: Obsidian surfaces (`#0d0f12`), hairline tinted borders, monospace metadata chips, micro-interactions ≤150ms.
  - *Kinetic Editorial*: Large expressive display serifs, asymmetrical `2fr 1fr` layout, generous clamp spacing, curated imagery.
  - *Warm Minimalist*: Cream/oatmeal canvas, espresso typography, flat border-driven bento grids, zero drop shadows.
  - *Swiss Brutalist*: High-contrast monochrome, visible gridlines, heavy grotesk type scale, utilitarian status badges.
  - *Luxury Consumer*: Deep rich brand hues, soft organic radii, subtle frosted accents, refined physics-based transitions.
- **Site Map & Navigation Model**: Top-level routes, nested views, tab structures, sidebar/header navigation hierarchy.
- **Core Interaction Loop**: The primary UI cycle (Discover → Configure → Commit → Confirm).

### Phase 2: Exhaustive Page & Component Catalog (P0–P3)
Catalog every UI surface and assign execution priority:
- **P0 (Core Views & Atomic Loop)**: The non-negotiable pages and interactions that deliver baseline value (e.g., product listing, checkout flow, login).
- **P1 (Essential UX & Secondary Views)**: Search/filter panels, notification centers, user preferences, onboarding flows.
- **P2 (Power-User & Admin Views)**: Data tables with sort/filter/export, audit logs, role management screens, analytics dashboards.
- **P3 (Delight & Polish)**: Micro-animations, skeleton loaders, keyboard shortcuts, drag-and-drop reordering, dark mode toggle.

### Phase 3: Interaction Design, Component Specs & Design Tokens
- **Design Tokens & Aesthetic Dials**: Declare authoritative color tokens (brand, neutral tints, accents), typography pairings, spacing scale, and taste dials (`DESIGN_VARIANCE`, `VISUAL_DENSITY`, `MOTION_INTENSITY` from 1–10).
- **Asymmetric Composition & Anti-Slop Layout**:
  - Replace symmetrical 3-card rows with staggered bento grids, variable-span cards (`col-span-2` / `col-span-1`), or horizontal detail split.
  - Typography scale: High visual tension (display title 3.5×–4× body size with `-0.03em` tracking; body copy with `1.6` line height).
- **Interactive Components**: Modals, drawers, dropdowns, toasts, popovers, accordions — with trigger conditions, animation curves/durations, and dismissal rules.
- **Form Architecture**: Multi-step forms, inline validation rules, error message placement, autosave behavior, and button submit states.
- **State Variants for Every Component**: Default, hover, active, focus (`:focus-visible`), disabled, loading, error, empty, and success states.

### Phase 4: User Journeys, Responsive Behavior & Mobile Affordance
- **Step-by-Step User Journeys**: Primary, secondary, error-recovery, and first-time-user flows with exact screen transitions.
- **Responsive Breakpoint Strategy**: Mobile (≤480px), tablet (481–768px), desktop (769–1280px), wide (1281px+) — layout shifts and hidden/revealed elements.
- **Mobile & Touch Floor (UI_Always standards)**: Minimum `44×44px` interactive touch targets, minimum `16px` font on mobile inputs (prevent iOS Safari zoom), and zero horizontal scroll overflow (`max-width: 100%`, `min-width: 0` on flex items).
- **Accessibility Requirements**: WCAG 2.1 AA compliance targets, keyboard navigation order, ARIA landmarks, focus trap behavior in modals, color contrast ratios (≥4.5:1 text, ≥3:1 headlines).
- **UX Copy & Microcopy**: Button labels, empty state messages, error text, confirmation dialogs, and tooltip content.

### Phase 5: AI-Feedable Frontend Master Prompt Synthesis
Generate a self-contained prompt formatted for immediate execution by a frontend coding agent.

---

## Standardized Output Layout

> **Execution Note**: Sections 1–5 are the comprehensive frontend analysis artifact. Section 6 is the final, copy-pasteable Master Prompt for a frontend AI coding agent.

````markdown
# Frontend Architecture & UI Specification: [Product / Concept]

## 1. UI Domain & Information Architecture
- **Product Surface**: [Landing | SPA | Dashboard | Storefront | Admin Console | PWA]
- **Target User Personas**: [Primary users and their core tasks]
- **Navigation Model**: [Sidebar | Top Nav | Tab Bar | Hamburger | Breadcrumb]
- **Site Map**:
  - `/` → [Home / Landing]
  - `/[route]` → [View description]
  - `/[route]/[sub]` → [Nested view description]

## 2. Exhaustive Page & Component Matrix (P0–P3)
| Priority | Page / View | Key Components | Interactions & Behavior |
|---|---|---|---|
| **P0** | [Core View 1] | ... | ... |
| **P0** | [Core View 2] | ... | ... |
| **P1** | [Secondary View] | ... | ... |
| **P2** | [Admin / Analytics] | ... | ... |
| **P3** | [Polish / Delight] | ... | ... |

## 3. Component Specifications & State Matrix
| Component | Trigger | States (Default / Hover / Active / Error / Empty) | Animation |
|---|---|---|---|
| [Component 1] | ... | ... | ... |
| [Component 2] | ... | ... | ... |

## 4. User Journeys & Responsive Behavior
- **Primary Journey**: [Screen A] → [Action] → [Screen B] → [Confirmation]
- **Error Recovery**: [Screen A] → [Invalid input] → [Inline error] → [Corrected submission]
- **First-Time User (Empty State)**: [Landing] → [Onboarding prompt] → [First action]
- **Responsive Rules**:
  | Breakpoint | Layout Shift | Hidden / Revealed Elements |
  |---|---|---|
  | Mobile ≤480px | ... | ... |
  | Tablet 481–768px | ... | ... |
  | Desktop 769px+ | ... | ... |

## 5. Accessibility & UX Copy
- **Keyboard Navigation**: [Tab order, focus traps, skip links]
- **ARIA Requirements**: [Landmarks, roles, live regions]
- **Microcopy Inventory**: [Button labels, empty states, error messages, tooltips]

---

## 6. AI-Feedable Frontend Master Prompt (Direct Agent Execution)

> **Copy and run the prompt below directly in any frontend AI coding agent:**

```markdown
Design and build a complete, production-ready frontend for [Product Name / Type].

### Design Read
"Reading this as: [page kind] for [target audience], with a [vibe/tone] language, leaning toward [design system/archetype]."

### Anti-Slop Visual Directives (Mandatory Quality Standards)
- **Hero & Eyebrow Treatment**: Zero floating pill badges or pastel chip capsules above headlines (no `rounded-full` pastel bubbles like `[☕ HOMEMADE & SMALL-BATCH]`). Either lead directly with the headline or use a clean, unboxed typographic kicker (plain text with tracking, zero borders/background bubbles). No generic centered hero over a blurry glowing sphere.
- **Layout Rhythm**: Zero symmetrical 3-card equal grids. Use staggered bento structures, variable column spans (`col-span-2` / `col-span-1`), or asymmetric split columns.
- **Color Palette & Contrast**: All colors declared in `:root`. Zero untinted `#000000` or `#808080` (tint all darks/neutrals toward the brand hue). Zero purple-to-blue default AI mesh gradients.
- **Typography Scale**: Curated font pairing with high visual tension: Display font [`font-family`] with tight tracking (`letter-spacing: -0.03em`) for headings; readable body font [`font-family`] with generous leading (`line-height: 1.6`).
- **Card Architecture**: Zero cards nested inside cards with identical borders/backgrounds. Use surface elevation, contrast shifts, or borderless grouping.
- **Iconography**: Never use Unicode emojis as UI icons. Use SVG icons (Lucide or Phosphor) with `aria-hidden="true"`.
- **Interactive Affordance**: All clickable elements must have `cursor: pointer` and visible `:focus-visible` rings. Hover/active micro-interactions capped at ≤200ms.

### Design Tokens & Aesthetic Dials
- Aesthetic Dials: `DESIGN_VARIANCE: [1-10]`, `MOTION_INTENSITY: [1-10]`, `VISUAL_DENSITY: [1-10]`
- Color Palette: Primary [`hex`], Neutrals [`tinted darks & lights`], Accents [`hex`] (Declared as CSS tokens in `:root`)
- Typography Pairing: Headings [`font-family`], Body [`font-family`]
- Touch & Viewport Floor: Minimum `44×44px` touch targets, `≥16px` mobile form inputs, `min-width: 0` flex items (zero overflow)

### Priority Execution Roadmap
<!-- Enumerate ALL discovered UI capabilities for each tier without truncation -->
#### Phase 1: P0 Core Views & Atomic UI Loop
1. [Core Page / View 1]: [Layout, key components, primary interaction]
2. [Core Page / View 2]: [Layout, key components, primary interaction]
[... enumerate all remaining P0 views and components]

#### Phase 2: P1 Essential UX & Secondary Views
1. [Secondary View 1]: [Components and behavior]
2. [Secondary View 2]: [Components and behavior]
[... enumerate all remaining P1 capabilities]

#### Phase 3: P2 Admin, Analytics & Power-User Tools
1. [Admin View 1]: [Data tables, filters, exports]
[... enumerate all remaining P2 capabilities]

#### Phase 4: P3 Polish, Animation & Delight
1. [Micro-interaction / Animation 1]: [Trigger, behavior, duration]
[... enumerate all remaining P3 capabilities]

### Complete User Journeys
- Primary Flow: [Step-by-step screen transitions]
- Error Recovery Flow: [Invalid state → correction → success]
- Empty State / First-Time User Flow: [Onboarding sequence]

### Responsive Breakpoint Rules
- Mobile (≤480px): [Layout, hidden elements, touch targets]
- Tablet (481–768px): [Layout adjustments]
- Desktop (769px+): [Full layout]

### Accessibility & UX Copy
- Keyboard navigation order and focus management
- ARIA landmarks and roles for interactive components
- Complete microcopy: button labels, error messages, empty states, tooltips

### Component State Requirements
- Every interactive component must handle: default, hover, active, focus, disabled, loading, error, empty, and success states
```
````
