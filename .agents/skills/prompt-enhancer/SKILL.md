---
name: prompt-enhancer
description: Universal prompt enhancement engine that deconstructs raw concepts into domain-adaptive product architecture, exhaustive feature catalogs, data models, priority tiers (P0-P3), and execution-ready Master Prompts for AI coding agents.
---

# PROMPT ENHANCER (Universal Product & Systems Engine)

Transforms any concept, question, or brief prompt—spanning web apps, CLIs, developer SDKs, data pipelines, mobile apps, or enterprise platforms—into an exhaustive, execution-ready architecture and **AI-feedable Master Prompt**.

---

## Core Directives

1. **Zero Roleplay Fluff**: Never prefix prompts with *"Act as an elite product designer..."* or persona fluff. Lead directly with the objective and precise build specifications.
2. **Domain-Adaptive & Modern Tech Stack Default (Never Vanilla)**: Adapt dynamically to the problem domain (SaaS, CLI, SDK, mobile app, data engine, marketplace). Do not force e-commerce templates onto non-commerce domains. When starting a new project and no stack is already locked by the user, **always default to and output a modern production tech stack** — e.g., **Next.js App Router (React 19 + TypeScript + Tailwind CSS + shadcn/ui + Motion / `@bsmnt/scrollytelling` + GSAP)** or **Vite + React + TypeScript + Tailwind CSS** for web UI, and **Node.js/TypeScript (Next.js Route Handlers / Hono / Fastify + Prisma/Drizzle), FastAPI (Python 3.12 + SQLAlchemy 2.0 + Pydantic v2), or Go + PostgreSQL** for backend/APIs. **Never default to or output vanilla HTML/CSS/JS** for a new web project unless the user explicitly asks for vanilla.
3. **Exhaustive Scope with Priority Tiers (P0–P3)**: Catalog every conceivable feature without truncation, organizing them into strict execution tiers so an AI coding agent builds the P0 atomic loop first while structuring clean boundaries for P1–P3.
4. **Data Model & Entity Grounding**: Always define core business entities, non-enumerable public IDs (UUIDv4/NanoID), cardinality, key attributes, and deterministic lifecycle state machines.
5. **Domain Enhancer Routing & Connected Skill Dispatch**:
   - **Sibling Enhancer Delegation**: Use this universal `prompt-enhancer` for fullstack web apps, CLIs, SDKs, data pipelines, mobile apps, or multi-surface platforms. For strictly client-side UI/UX tasks, delegate to [prompt-enhancer-frontend](.agents/skills/prompt-enhancer-frontend/SKILL.md); for strictly server/API/database tasks, delegate to [prompt-enhancer-backend](.agents/skills/prompt-enhancer-backend/SKILL.md).
   - **Selective Companion Skill Loading**: When moving from specification to implementation, inspect only the 1–2 companion skills matching the active surface via `view_file` rather than loading all skills at once:
     - *Frontend / Design Surface*: [impeccable](.agents/skills/impeccable/SKILL.md) (primary Stage 2 visual craft, spatial composition & Stage 3 token/anti-pattern audit), [awesome-design-md](.agents/skills/awesome-design-md/SKILL.md) (`./DESIGN.md` ground truth), [design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md) (taste dials & `Design Read`), [scrollytelling](.agents/skills/scrollytelling/SKILL.md) (declarative React + GSAP `@bsmnt/scrollytelling` scroll timelines, pinned stages, parallax, & 3D/canvas scrubbing), [avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md) (human copy), [playwright-skill](.agents/skills/playwright-skill/SKILL.md) (21st.dev extraction & browser verification), [frontend-security-coder](.agents/skills/frontend-security-coder/SKILL.md) (XSS/CSP).
     - *Backend / Data / Security Surface*: [api-patterns](.agents/skills/api-patterns/SKILL.md), [architecture-patterns](.agents/skills/architecture-patterns/SKILL.md), [database-architect](.agents/skills/database-architect/SKILL.md), [sql-pro](.agents/skills/sql-pro/SKILL.md), [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md), [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md), [fix-security-vulnerabilities-with-strix](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md).
6. **Non-Functional & Workspace Rule Alignment**: Enforce workspace quality floors across every applicable surface:
   - **Frontend & Motion Surface**: Delegate layout, concentric radius math (`R_inner = Math.max(0, R_outer - Padding)`), `< 80px` header height ceiling, 8-state interactive primitives (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`, `success`), first- and second-order anti-slop, authentic web photography (zero AI-generated showcase/product images), and natural copy ([avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md)) to [UI_Always.md](.agents/rules/UI_Always.md) and [frontend.md](.agents/rules/frontend.md); delegate spring physics (`Gentle`/`Snappy`/`Bouncy`, settling `≤300ms`), composite-only `transform`/`opacity` animations, deterministic rest states (`[Rest] → [Action] → [Rest]`), zero uniform section scroll fade-ups, and `@media (prefers-reduced-motion: reduce)` fallbacks to [MOTION.md](.agents/rules/MOTION.md).
   - **Backend, Data & Security Surface**: Delegate connection pooling, sequential migrations, explicit `BEGIN`/`COMMIT`/`ROLLBACK` transactions, and row-level locking (`SELECT ... FOR UPDATE`) to [backend.md](.agents/rules/backend.md); delegate edge schema validation (`extra: forbid`), 100% prepared statements, Argon2id/bcrypt password hashing, anti-enumeration response uniformity, rate limiting, tenant-scoped BOLA/IDOR checks, XSS/DOMPurify & CORS lockdown, magic-byte file upload verification, and SSRF CIDR blocking to [security.md](.agents/rules/security.md) and [penetrating-and-testing.md](.agents/rules/penetrating-and-testing.md).
7. **Pipeline-Aware Disambiguation Gate**:
   - **Skip When Resolved**: When invoked inside [starting-brandnew.md](.agents/rules/starting-brandnew.md) or [starting-existing.md](.agents/rules/starting-existing.md) after the batched discovery gate or codebase audit, or when the user's prompt already specifies the core workflow, proceed directly without asking follow-up questions.
   - **Single-Question Cap**: Only when invoked standalone on an ambiguous prompt that maps to 2+ fundamentally different product paradigms (e.g., *"build a dashboard"* without domain context), ask **at most one** targeted question (`ask_question`) with up to 5 concise options before generating the blueprint.
8. **Clean Unicode Formatting**: Use Unicode arrows (`→`) or ASCII (`->`) for workflows and state transitions. Never use LaTeX syntax (`$\rightarrow$`).

---

## 5-Phase Enhancement Pipeline

### Phase 1: Disambiguation, Strategic Scope & Aesthetic Grounding
- **Domain Classification**: CLI, API/SDK, Web SaaS, Mobile App, Data Pipeline, E-Commerce, or Internal Tool.
- **Problem Statement & Target Personas**: Primary users, operators, and administrative stakeholders.
- **Core Value Loop**: The atomic interaction cycle (Trigger → Action → State Mutation → Value Delivery).
- **Visual Direction & Blueprint Alignment (when Web UI exists)**:
  - Inherit `./DESIGN.md` tokens ([awesome-design-md](.agents/skills/awesome-design-md/SKILL.md)), select the [impeccable](.agents/skills/impeccable/SKILL.md) Visitor Mode (`Persuade`, `Operate`, `Read`, or `Experience`), and formulate the [design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md) `Design Read` and Taste Dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY` from 1–10).
  - For greenfield landing/marketing/storefront builds under [starting-brandnew.md](.agents/rules/starting-brandnew.md) (when no custom layout is requested), align with the selected 21st.dev blueprint (*Standard Website*: TailGrids NexStudio + Spectrum UI Footer; *Website with Hero*: Md Adul E-commerce Marketplace + Spectrum UI Footer) themed dynamically via `./DESIGN.md`.

### Phase 2: Exhaustive Feature Catalog & Priority Phasing
Catalog every capability across the full problem surface and assign execution tiers:
- **P0 (Atomic MVP)**: The non-negotiable core loop required to deliver baseline value (built completely in the initial implementation pass).
- **P1 (Core Experience & Retention)**: Essential secondary workflows, search/filtering, notifications, and user preferences.
- **P2 (Power-User & Administrative)**: Batch actions, exports, audit trails, role-based controls, and analytical views.
- **P3 (Scale, Automation & Delighters)**: Integrations, background queues, smart heuristics, automated reporting, and advanced customizations.

### Phase 3: Core Data Entities & Lifecycle States
- **Entity Model**: Primary objects, non-enumerable public identifiers (UUIDv4/NanoID), tenant/owner foreign keys (`organization_id` / `user_id`), targeted indexes, and relationships (1:1, 1:N, N:M with explicit junction tables and `ON DELETE RESTRICT`/`CASCADE` rules; zero polymorphic relations that bypass DB foreign keys).
- **Lifecycle State Machines**: Deterministic status transitions (e.g., `Initialized` → `Processing` → `Completed` → `Failed`) with guard conditions, explicit transaction boundaries (`BEGIN`/`COMMIT`/`ROLLBACK`), and concurrency locks (`SELECT ... FOR UPDATE`).

### Phase 4: User Journeys, UI/UX Hygiene, NFRs & Security
- **Step-by-Step User Journeys**: End-to-end paths for primary, secondary, exception/recovery, and administrative workflows across all 5 operational states (`Success`, `Failure`, `Empty`, `Loading`, `Permission-Denied`).
- **UI, Layout & Motion Hygiene (when UI is present)**:
  - Structural & Second-Order anti-slop ([UI_Always.md](.agents/rules/UI_Always.md) Section 6 & [impeccable/reference/craft-floor.md](.agents/skills/impeccable/reference/craft-floor.md): concentric radius math `R_inner = Math.max(0, R_outer - Padding)`, `< 80px` top header ceiling, 8-state interactive primitives, `1-to-3` & `85%-15%` dashboard telemetry hierarchy, zero eyebrow pill badges or kickers above headings, zero single-word colored/italic serif `<span>` in headlines, zero `#10B981` emerald-on-slate default or serif fonts in dashboards, zero empty Bento cells, icon-tile stacks, ghost cards, side-tab stripes, nested cards, or symmetrical 3-card rows) and natural copy ([UI_Always.md](.agents/rules/UI_Always.md) Section 7 / [avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md): Arabic numerals `3` not `"three"`, zero Tier 1A AI vocabulary, hollow intensifiers, em dashes in headings/buttons, header emojis, or `"Jane Doe"`/`"Acme Corp"`/`"99.9%"` placeholder slop).
  - Authentic web photography ([UI_Always.md](.agents/rules/UI_Always.md) Section 4: Unsplash/Pexels/CDN with `object-fit: cover` and contrast scrims; zero AI-generated showcase/product images), hero fixed-header clearance (`calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))`), `min-height: 100dvh` flex-column shells with `scrollbar-gutter: stable`, `≥44×44px` touch targets, `≥16px` mobile inputs, and zero horizontal overflow across `375px`, `768px`, and `1280px`.
  - Tactile motion ([MOTION.md](.agents/rules/MOTION.md): spring physics or `cubic-bezier(0.25, 1, 0.5, 1)` settling `≤300ms`, composite-only `transform`/`opacity`, deterministic rest state, zero uniform section `opacity: 0, y: 20` scroll fade-ups, and `@media (prefers-reduced-motion: reduce)` fallback).
- **Security & Access Control ([security.md](.agents/rules/security.md) & [penetrating-and-testing.md](.agents/rules/penetrating-and-testing.md))**: Clean semantic URLs (zero `.php`/`.py`/`.asp` extensions), stripped server fingerprint headers, edge schema validation (`extra: forbid`), 100% prepared statements (allowlisted sort columns), Argon2id/bcrypt password hashing, constant-time token checks, uniform `"Invalid credentials"` anti-enumeration responses, rate limiting (`5/15m` auth, `60/m` public), tenant-scoped BOLA/IDOR checks (`WHERE id = :id AND organization_id = :auth_org_id`), CSRF tokens, context-aware XSS encoding (ban `dangerouslySetInnerHTML`/`v-html`/`innerHTML`; sanitize rich text with DOMPurify), explicit CORS origin allowlists (never `*` with credentials), magic-byte file upload validation outside webroot, and SSRF private-CIDR blocking.
- **Performance, Pooling & Resilience ([backend.md](.agents/rules/backend.md))**: Database connection pooling with lifecycle cleanup and graceful `503` pool exhaustion handling, latency targets, tenant-isolated caching, structured JSON logging (suppressing stack traces in production), and health checks (`/health`, `SELECT 1`).

### Phase 5: AI-Feedable Master Prompt Synthesis
Generate a self-contained, high-density prompt formatted for immediate execution by an AI coding agent.

---

## Standardized Output Layout

> **Execution Note**: Sections 1–5 serve as the comprehensive domain analysis artifact (written directly to `./PRODUCT.md` during [starting-brandnew.md](.agents/rules/starting-brandnew.md) or [starting-existing.md](.agents/rules/starting-existing.md) pipelines). Section 6 is the standalone, copy-pasteable Master Prompt and execution contract for the coding agent.

````markdown
# Product Architecture & Specification: [Product / Concept]

## 1. Domain, Strategic Scope & Visual Grounding
- **Product Classification**: [Web App | Mobile App | CLI | SDK | Data Pipeline | Platform]
- **Modern Tech Stack (Never Vanilla HTML/CSS/JS)**: [e.g., Next.js App Router (React 19 + TypeScript + Tailwind CSS + shadcn/ui + Motion / `@bsmnt/scrollytelling` + GSAP) + PostgreSQL / Prisma / Drizzle | FastAPI + SQLAlchemy 2.0 | Go]
- **Target Personas**: [Primary User Groups & Operators]
- **Core Value Loop**: [Trigger → Mutation → Value Delivered]
- **Visual Direction & Blueprint (when Web UI exists)**:
  - **Primary Craft Engine & Visitor Mode (`impeccable`)**: `[Persuade | Operate | Read | Experience]` (enforcing `craft-floor.md` & `layout.md` spatial hierarchy)
  - **Design System & Archetype**: [`./DESIGN.md` brand / aesthetic direction] | **Website Blueprint**: [Standard Website (TailGrids NexStudio + Spectrum UI Footer) | Website with Hero (Md Adul E-commerce Marketplace + Spectrum UI Footer) | Custom App / Dashboard]
  - **Taste Dials (`design-taste-frontend`)**: `DESIGN_VARIANCE: [1-10]`, `MOTION_INTENSITY: [1-10]`, `VISUAL_DENSITY: [1-10]`
  - **Design Read**: `"Reading this as: [page kind] for [audience], with a [vibe] language, leaning toward [design system]."`

## 2. Exhaustive Feature Matrix & Priority Tiers
| Priority | Module / Area | Feature Capabilities | Value & Behavior |
|---|---|---|---|
| **P0** | [Core Engine] | ... | Non-negotiable atomic loop (initial build target) |
| **P1** | [Core Workflow] | ... | Essential operational features |
| **P2** | [Admin / Analytics] | ... | Management & governance |
| **P3** | [Automation / Integrations] | ... | Enhancements & scale |

## 3. Core Data Entities & Schema Relationships
| Entity | Key Attributes (UUIDv4 / Types) | Relationships, Tenant Scope & Indexes | Lifecycle States |
|---|---|---|---|
| Entity 1 | `id (UUID PK)`, `organization_id (UUID FK)`, ... | 1:N with Entity 2 (`ON DELETE RESTRICT`), `idx_org_status` | `StateA` → `StateB` → `StateC` |
| Entity 2 | `id (UUID PK)`, `organization_id (UUID FK)`, `entity1_id (UUID FK)` | N:1 with Entity 1 (`ON DELETE CASCADE`), `idx_org_entity1` | `Active` → `Archived` |

## 4. End-to-End User Journeys & Operational States
- **Primary User Journey**: [Entry point] → [Action] → [State mutation] → [Success confirmation]
- **Secondary / Exception Journey**: [Entry point] → [Edge condition] → [Fallback / Recovery path]
- **Administrative / Governance Journey**: [Operator login] → [Audit / Action] → [System reconciliation]
- **5 Mandatory Operational States**: `Success`, `Failure (inline validation)`, `Empty (onboarding CTA)`, `Loading (skeleton/disabled submit)`, `Permission-Denied (403)`

## 5. Non-Functional Requirements, UI Hygiene & Security
- **UI, Anti-Slop & Motion (if applicable)**: [`./DESIGN.md` CSS tokens in `:root`, tinted neutrals, asymmetric bento/split layout, concentric radius math `R_inner = Math.max(0, R_outer - Padding)`, `< 80px` top header ceiling, 8-state interactive primitives, real web photography with scrims, `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))` hero clearance, `≥44×44px` touch targets, spring physics `≤300ms` on `transform`/`opacity` (and `@bsmnt/scrollytelling` + GSAP for pinned/scrubbed scroll timelines), zero uniform section scroll fade-ups, `prefers-reduced-motion` fallback, Arabic numerals, zero Tier 1A AI words or `"Jane Doe"`/`"Acme Corp"` placeholder slop]
- **Security & Access Control**: [Clean semantic URLs, stripped server headers, edge validation (`extra: forbid`), 100% prepared statements, Argon2id/bcrypt, uniform anti-enumeration responses, rate limiting (`5/15m` auth, `60/m` public), tenant-scoped BOLA/IDOR checks, CSRF + DOMPurify XSS defense, explicit CORS origins, magic-byte file checks outside webroot, SSRF CIDR blocks]
- **Performance, Pooling & Verification**: [Connection pooling with `503` exhaustion fallback, explicit `BEGIN`/`COMMIT`/`ROLLBACK` transactions, `SELECT ... FOR UPDATE` concurrency locks, `/health` endpoint, suppressed prod stack traces, `impeccable detect` + Playwright `375px`/`768px`/`1280px` layout & negative security gates]

---

## 6. AI-Feedable Master Prompt (Direct Agent Execution)

> **Copy and run the prompt below directly in any AI coding agent:**

```markdown
Design and build a complete, production-ready [Product Name / Type].

### Product Vision, Modern Tech Stack, Visitor Mode, Design Read & Aesthetic Dials
- **Vision & Objective**: [Comprehensive description of the system, problem solved, target users, and end-to-end operational vision]
- **Modern Tech Stack (Never Vanilla HTML/CSS/JS)**: [Default to Next.js App Router + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Motion / `@bsmnt/scrollytelling` + GSAP (or Vite + React + TypeScript + Tailwind CSS) + typed backend/ORM; never use vanilla HTML/CSS/JS unless explicitly requested]
- **Visitor Mode (`impeccable` Stage 2, when UI exists)**: `[Persuade | Operate | Read | Experience]`
- **Design Read (when UI exists)**: "Reading this as: [page kind] for [target audience], with a [vibe/tone] language, leaning toward [design system/archetype]."
- **Aesthetic Dials & Tokens (when UI exists)**: `DESIGN_VARIANCE: [1-10]`, `MOTION_INTENSITY: [1-10]`, `VISUAL_DENSITY: [1-10]`, mapped strictly to `./DESIGN.md` CSS variables in `:root` (inheriting selected 21st.dev blueprint when applicable).

### Priority Execution Roadmap
> **Execution Rule**: Implement **Phase 1 (P0)** end-to-end for the initial production release unless full P0–P3 implementation is explicitly requested. Catalog P1–P3 in `PRODUCT.md` and structure code/schema boundaries cleanly to support iterative expansion.

<!-- Enumerate ALL discovered capabilities for each tier without truncation or capping -->
#### Phase 1: P0 Core Loop (Atomic MVP — Build Now)
1. [Core Capability 1]: [Detailed behavior, UI/API surface, & validation requirements]
2. [Core Capability 2]: [Detailed behavior, UI/API surface, & validation requirements]
3. [Core Capability 3]: [Detailed behavior, UI/API surface, & validation requirements]
[... enumerate all remaining P0 capabilities required for the baseline loop]

#### Phase 2: P1 Quality of Life & Essential Workflows
1. [Secondary Workflow 1]: [Detailed behavior & requirements]
2. [Secondary Workflow 2]: [Detailed behavior & requirements]
3. [Secondary Workflow 3]: [Detailed behavior & requirements]
[... enumerate all remaining P1 capabilities]

#### Phase 3: P2 Management, Admin & Power-User Tools
1. [Admin/Governance Capability 1]: [Detailed behavior & requirements]
2. [Reporting/Audit Capability 2]: [Detailed behavior & requirements]
[... enumerate all remaining P2 capabilities]

#### Phase 4: P3 Automation, Integrations & Scale
1. [Integration/Scale Feature 1]: [Detailed behavior & requirements]
2. [Optimization/Scale Feature 2]: [Detailed behavior & requirements]
[... enumerate all remaining P3 capabilities]

### Complete User Journeys & 5 Operational States
- Primary User Journey: [Entry point] → [Action] → [State mutation] → [Success confirmation]
- Secondary / Exception Flow: [Entry point] → [Edge condition] → [Fallback / Recovery path]
- Administrative Flow: [Operator login] → [Audit / Moderation action] → [System reconciliation]
- Mandatory Operational States: Implement `Success`, `Failure`, `Empty`, `Loading`, and `Permission-Denied (403)` states across all views and endpoints.

### Core Data Entities & State Models
- [Entity 1]: Attributes [`id UUIDv4 PK`, `organization_id UUID FK`, ...], Relations [relation + `ON DELETE RESTRICT`/`CASCADE`], Indexes [`idx_org_status`], States [`Draft` → `Active` → `Archived`]
- [Entity 2]: Attributes [`id UUIDv4 PK`, `organization_id UUID FK`, ...], Relations [relation + `ON DELETE` rule], States [`Pending` → `Executed`]

### UI, Motion & Copy Standards (When Frontend Surface Exists)
- Visual Craft & Structural Anti-Slop (impeccable & UI_Always.md): Enforce `impeccable` visitor-mode composition (`craft-floor.md` & `layout.md`: squint-test hierarchy, proximity grouping, `4px` base rhythm, themed browser surfaces) and Section 6 of `UI_Always.md` (concentric radius math `R_inner = Math.max(0, R_outer - Padding)`, `< 80px` top header ceiling, 8-state interactive primitives (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`, `success`), `1-to-3` & `85%-15%` dashboard telemetry hierarchy, zero floating eyebrow pill badges or kickers above headings, zero single-word colored/italic serif `<span>` in headlines, zero `#10B981` emerald-on-slate default or serif fonts in dashboards, zero empty Bento cells, icon-tile stacks, ghost cards, decorative `border-left` stripes, nested cards, or symmetrical 3-card grids). Use asymmetric bento/split layouts, `min-height: 100dvh` flex-column shells with `scrollbar-gutter: stable`, tinted neutrals in `:root`, and SVG icons (Lucide/Phosphor, zero Unicode emoji icons or unrequested "Lucide Five" filler icons).
- Authentic Media & Viewport Integrity: Real web photography (Unsplash/Pexels/CDN) with `object-fit: cover`, explicit `width`/`height` or `aspect-ratio`, and contrast scrims (zero AI-generated showcase images or placeholder URLs). Hero top padding `calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))`, `≥44×44px` touch targets, `≥16px` mobile inputs, `<label for="id">`, `type="button"` on non-submit buttons, and zero horizontal overflow across `375px`, `768px`, and `1280px`.
- Motion & Physics (MOTION.md): Physical springs (`Gentle`: `stiffness: 120, damping: 14`; `Snappy`: `stiffness: 280, damping: 20`; `Bouncy`: `stiffness: 400, damping: 12`) or `cubic-bezier(0.25, 1, 0.5, 1)` settling `≤300ms`; animate only `transform` and `opacity`; enforce deterministic `[Rest] → [Action] → [Rest]` state machines, ban uniform section `opacity: 0, y: 20` scroll fade-ups, and include `@media (prefers-reduced-motion: reduce)` fallbacks.
- Natural Human Copy (avoid-ai-writing): Use Arabic numerals (`3` not `"three"`). Zero Tier 1A AI words (`delve`, `tapestry`, `seamless`, `robust`, `comprehensive`, `cutting-edge`, `leverage`, `synergy`), zero hollow intensifiers, zero `"It's not X — it's Y"` tropes, zero em dashes (`—` or `--`) in headings/buttons, zero emojis in section headers, and zero `"Jane Doe"`, `"Acme Corp"`, or `"99.9%"` placeholder slop.

### Backend, Security & Non-Functional Requirements (When API / Data Surface Exists)
- Security & Auth (security.md): Clean semantic routes (zero `.php`/`.py`/`.asp` script extensions), stripped server fingerprint headers, strict edge schema validation (`extra: forbid`), 100% parameterized queries (zero SQL string interpolation; allowlisted `ORDER BY` identifiers), Argon2id/bcrypt password hashing, constant-time token checks, uniform `"Invalid credentials"` anti-enumeration responses, rate limiting (`5/15m` on auth routes, `60/m` on public endpoints), hardened `Secure; HttpOnly; SameSite` cookies + CSRF protection, DOMPurify XSS defense (zero raw `dangerouslySetInnerHTML`/`v-html`/`innerHTML`), explicit CORS origin allowlists (never `*` with credentials), magic-byte file upload checks outside webroot, and SSRF private-CIDR blocking.
- Authorization (BOLA / IDOR Defense): Enforce server-side RBAC and scope every record read/write to authenticated tenant/user ownership (`WHERE id = :id AND organization_id = :auth_org_id`) using non-enumerable UUIDv4/NanoID identifiers.
- Data, Pooling & Verification (backend.md & penetrating-and-testing.md): Connection pooling with clean release on exit and `503` pool exhaustion fallback, sequential migration files, explicit `BEGIN`/`COMMIT`/`ROLLBACK` transactions with `SELECT ... FOR UPDATE` or optimistic locking on concurrent mutations, `/health` check (`SELECT 1`), structured JSON logging, suppressed stack traces in production, single-pass `impeccable detect` + Playwright `375px`/`768px`/`1280px` audit (when UI exists), and negative security checks (`401`, `403`/`404` IDOR, `' OR 1=1 --`, `429`).

### Business Rules & Edge Cases
- [Critical business logic / calculation formula 1]
- [Critical business logic / validation rule 2]
- [Handling of empty states, network timeouts, and concurrency conflicts]
```
````
