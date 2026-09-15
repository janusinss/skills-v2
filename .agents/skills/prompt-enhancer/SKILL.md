---
name: prompt-enhancer
description: Universal prompt enhancement engine that deconstructs raw concepts into domain-adaptive product architecture, exhaustive feature catalogs, data models, priority tiers (P0-P3), and execution-ready Master Prompts for AI coding agents.
---

# PROMPT ENHANCER (Universal Product & Systems Engine)

Transforms any concept, question, or brief prompt—spanning web apps, CLIs, developer SDKs, data pipelines, mobile apps, or enterprise platforms—into an exhaustive, execution-ready architecture and **AI-feedable Master Prompt**.

---

## Core Directives

1. **Zero Roleplay Fluff**: Never prefix prompts with *"Act as an elite product designer..."* or persona fluff. Lead directly with the objective and precise build specifications.
2. **Domain-Neutral & Stack-Agnostic**: Adapt dynamically to the problem domain (SaaS, CLI, SDK, mobile app, data engine, marketplace). Do not default to e-commerce templates or dictate specific programming languages/frameworks.
3. **Exhaustive Scope with Priority Tiers (P0–P3)**: Catalog every conceivable feature without truncation, organizing them into strict execution tiers so an AI coding agent knows exactly what to build first.
4. **Data Model & Entity Grounding**: Always define core business entities, cardinality, key attributes, and lifecycle state machines.
5. **Non-Functional Requirements (NFRs)**: Explicitly specify security models, performance targets, data privacy, and operational resilience.
6. **Input Disambiguation Gate**: If a user's prompt is ambiguous and maps to 2+ fundamentally different product paradigms (e.g., *"build a dashboard"*), ask **exactly one** targeted question to clarify intent before generating the blueprint.
7. **Clean Unicode Formatting**: Use Unicode arrows (`→`) or ASCII (`->`) for workflows and state transitions. Never use LaTeX syntax (`$\rightarrow$`).

---

## 5-Phase Enhancement Pipeline

### Phase 1: Disambiguation & Strategic Scope
- **Domain Classification**: CLI, API/SDK, Web SaaS, Mobile App, Data Pipeline, E-Commerce, or Internal Tool.
- **Problem Statement & Target Personas**: Primary users, operators, and administrative stakeholders.
- **Core Value Loop**: The atomic interaction cycle (Trigger → Action → State Mutation → Value Delivery).

### Phase 2: Exhaustive Feature Catalog & Priority Phasing
Catalog every capability across the full problem surface and assign execution tiers:
- **P0 (Atomic MVP)**: The non-negotiable core loop required to deliver baseline value.
- **P1 (Core Experience & Retention)**: Essential secondary workflows, search/filtering, notifications, and user preferences.
- **P2 (Power-User & Administrative)**: Batch actions, exports, audit trails, role-based controls, and analytical views.
- **P3 (Scale, Automation & Delighters)**: Integrations, smart heuristics, automated reporting, and advanced customizations.

### Phase 3: Core Data Entities & Lifecycle States
- **Entity Model**: Primary objects, unique identifiers, foreign relationships (1:1, 1:N, N:M).
- **Lifecycle State Machines**: Status transitions (e.g., `Initialized` → `Processing` → `Completed` → `Failed`).

### Phase 4: User Journeys, NFRs & Edge Cases
- **Step-by-Step User Journeys**: End-to-end paths for primary, secondary, and administrative workflows.
- **Security & Authorization**: Auth mechanics, RBAC roles, encryption, token handling.
- **Performance & Scalability**: Latency thresholds, concurrency ceilings, caching strategies.
- **Resilience & Edge Handling**: Zero data states, network recovery, rate limiting, and failure fallbacks.

### Phase 5: AI-Feedable Master Prompt Synthesis
Generate a self-contained, high-density prompt formatted for immediate execution by an AI coding agent.

---

## Standardized Output Layout

> **Execution Note**: Sections 1–5 serve as the comprehensive domain analysis artifact. Section 6 is the final, standalone, copy-pasteable Master Prompt ready to feed directly into an AI coding agent.

````markdown
# Product Architecture & Specification: [Product / Concept]

## 1. Domain & Strategic Scope
- **Product Classification**: [Web App | Mobile App | CLI | SDK | Data Pipeline | Platform]
- **Target Personas**: [Primary User Groups & Operators]
- **Core Value Loop**: [Trigger -> Mutation -> Value Delivered]

## 2. Exhaustive Feature Matrix & Priority Tiers
| Priority | Module / Area | Feature Capabilities | Value & Behavior |
|---|---|---|---|
| **P0** | [Core Engine] | ... | Non-negotiable atomic loop |
| **P1** | [Core Workflow] | ... | Essential operational features |
| **P2** | [Admin / Analytics] | ... | Management & governance |
| **P3** | [Automation / Integrations] | ... | Enhancements & scale |

## 3. Core Data Entities & Schema Relationships
| Entity | Key Attributes | Relationships | Lifecycle States |
|---|---|---|---|
| Entity 1 | ... | 1:N with Entity 2 | `StateA` → `StateB` → `StateC` |
| Entity 2 | ... | N:1 with Entity 1 | `Active`, `Archived` |

## 4. End-to-End User Journeys
- **Primary User Journey**: [Entry point] → [Action] → [State mutation] → [Success confirmation]
- **Secondary / Exception Journey**: [Entry point] → [Edge condition] → [Fallback / Recovery path]
- **Administrative / Governance Journey**: [Operator login] → [Audit / Action] → [System reconciliation]

## 5. Non-Functional Requirements & Edge Cases
- **Security & Access Control**: [Auth, RBAC, input sanitization]
- **Performance Targets**: [Latency benchmarks, throughput expectations]
- **Edge Conditions & Fail-safes**: [Empty states, offline recovery, rate limiting]

---

## 6. AI-Feedable Master Prompt (Direct Agent Execution)

> **Copy and run the prompt below directly in any AI coding agent:**

```markdown
Design and build a complete, production-ready [Product Name / Type].

### Product Vision & Objective
[Comprehensive description of the system, problem solved, target users, and end-to-end operational vision]

### Priority Execution Roadmap
<!-- Enumerate ALL discovered capabilities for each tier without truncation or capping -->
#### Phase 1: P0 Core Loop (Atomic MVP)
1. [Core Capability 1]: [Detailed behavior & requirements]
2. [Core Capability 2]: [Detailed behavior & requirements]
3. [Core Capability 3]: [Detailed behavior & requirements]
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

### Complete User Journeys
- Primary User Journey: [Entry point] → [Action] → [State mutation] → [Success confirmation]
- Secondary / Exception Flow: [Entry point] → [Edge condition] → [Fallback / Recovery path]
- Administrative Flow: [Operator login] → [Audit / Moderation action] → [System reconciliation]

### Core Data Entities & State Models
- [Entity 1]: Attributes [attr1, attr2], Relations [relation], States [`Draft`, `Active`, `Archived`]
- [Entity 2]: Attributes [attr1, attr2], Relations [relation], States [`Pending`, `Executed`]

### Non-Functional Requirements (NFRs)
- Security: [Authentication mechanism, role permissions, input validation]
- Performance: [Target response latency, concurrency expectations]
- Observability & Resilience: [Error logging, fallback handling, retry policies]

### Business Rules & Edge Cases
- [Critical business logic / calculation formula 1]
- [Critical business logic / validation rule 2]
- [Handling of empty states, network timeouts, and concurrency conflicts]
```
````
