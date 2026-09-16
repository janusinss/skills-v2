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

---

## 5-Phase Frontend Enhancement Pipeline

### Phase 1: UI Domain Classification & Information Architecture
- **Product Surface Type**: Landing page, SPA dashboard, multi-page marketing site, admin console, mobile-first PWA, or e-commerce storefront.
- **Primary User Personas & Goals**: Who interacts with the UI and what task they need to complete.
- **Site Map & Navigation Model**: Top-level routes, nested views, tab structures, sidebar/header navigation hierarchy.
- **Core Interaction Loop**: The primary UI cycle (Discover → Configure → Commit → Confirm).

### Phase 2: Exhaustive Page & Component Catalog (P0–P3)
Catalog every UI surface and assign execution priority:
- **P0 (Core Views & Atomic Loop)**: The non-negotiable pages and interactions that deliver baseline value (e.g., product listing, checkout flow, login).
- **P1 (Essential UX & Secondary Views)**: Search/filter panels, notification centers, user preferences, onboarding flows.
- **P2 (Power-User & Admin Views)**: Data tables with sort/filter/export, audit logs, role management screens, analytics dashboards.
- **P3 (Delight & Polish)**: Micro-animations, skeleton loaders, keyboard shortcuts, drag-and-drop reordering, dark mode toggle.

### Phase 3: Interaction Design & Component Specifications
- **Interactive Components**: Modals, drawers, dropdowns, toasts, popovers, accordions — with trigger conditions, animation behavior, and dismissal rules.
- **Form Architecture**: Multi-step forms, inline validation rules, error message placement, autosave behavior.
- **State Variants for Every Component**: Default, hover, active, focus, disabled, loading, error, empty, and success states.

### Phase 4: User Journeys, Responsive Behavior & Accessibility
- **Step-by-Step User Journeys**: Primary, secondary, error-recovery, and first-time-user flows with exact screen transitions.
- **Responsive Breakpoint Strategy**: Mobile (≤480px), tablet (481–768px), desktop (769–1280px), wide (1281px+) — layout shifts, hidden/revealed elements, and touch target adjustments.
- **Accessibility Requirements**: WCAG 2.1 AA compliance targets, keyboard navigation order, ARIA landmarks, focus trap behavior in modals, color contrast ratios.
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

### UI Vision & Objective
[Detailed description of the interface, target users, and primary UX outcome]

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
