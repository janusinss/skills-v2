---
name: prompt-enhancer-backend
description: Backend & data layer prompt enhancement engine. Deconstructs raw concepts into exhaustive API architecture, database schemas, entity relationships, state machines, auth flows, service boundaries, queue/job systems, and generates AI-feedable Master Prompts for backend coding agents.
---

# PROMPT ENHANCER — BACKEND & DATA

Transforms any product concept into an exhaustive backend architecture specification covering every API endpoint, database entity, service boundary, auth flow, background job, and data pipeline — generating an **AI-feedable Master Prompt** purpose-built for backend coding agents.

---

## Core Directives

1. **Zero Roleplay Fluff**: Lead directly with the system specification. No persona prefixes.
2. **Stack-Agnostic**: Do not dictate Express, FastAPI, Django, or any specific framework. Focus on what the backend must do, not how to implement it.
3. **Exhaustive API & Data Surface Coverage**: Catalog every endpoint, entity, relationship, migration, queue, cron job, webhook, and middleware. Never abbreviate with "etc." or cap to 3 examples.
4. **Priority Tiers (P0–P3)**: Organize all backend capabilities into strict execution phases so the backend agent builds the core data layer and APIs first.
5. **Input Disambiguation Gate**: If a concept maps to 2+ fundamentally different backend paradigms (e.g., "notifications system" → push notifications vs. email drip vs. in-app feed), ask **one** targeted question before proceeding.
6. **Clean Unicode Formatting**: Use `→` or `->` for flows. Never use LaTeX.

---

## 5-Phase Backend Enhancement Pipeline

### Phase 1: System Domain Classification & Service Boundaries
- **System Architecture Type**: Monolith, modular monolith, microservices, serverless functions, or event-driven pipeline.
- **Primary Actors & Access Tiers**: End-users, admins, service accounts, external API consumers, and webhooks.
- **Service Map & Bounded Contexts**: Top-level service domains, their responsibilities, and inter-service communication patterns (REST, gRPC, message queues, events).
- **Core Data Flow**: The primary data lifecycle (Ingest → Validate → Process → Persist → Respond).

### Phase 2: Exhaustive API & Capability Catalog (P0–P3)
Catalog every backend capability and assign execution priority:
- **P0 (Core Data Layer & Auth)**: Database schemas, primary CRUD endpoints, authentication/authorization, and the minimum viable API surface.
- **P1 (Business Logic & Workflows)**: Validation pipelines, state machine transitions, calculated fields, search/filter/sort APIs, and pagination.
- **P2 (Admin, Audit & Reporting)**: Admin-only endpoints, audit trail logging, data export APIs, role management, and analytics aggregation queries.
- **P3 (Scale, Automation & Integration)**: Background job queues, scheduled cron tasks, webhook dispatch/receipt, third-party API integrations, caching layers, and rate limiting.

### Phase 3: Database Schema, Entity Relationships & State Machines
- **Entity-Relationship Model**: Every table/collection, primary keys, foreign keys, indexes, and cardinality (1:1, 1:N, N:M with junction tables).
- **Attribute Specifications**: Column types, nullable constraints, default values, unique constraints, and computed/virtual fields.
- **Lifecycle State Machines & Concurrency**: Status enums with valid transitions, transition triggers, and guard conditions. Mandate explicit transaction blocks (`BEGIN` / `COMMIT` / `ROLLBACK`) and race-condition defenses (`SELECT ... FOR UPDATE` or optimistic concurrency tokens).
- **Migration Strategy**: Schema versioning approach, sequential migration files, seed data requirements, and rollback procedures.

### Phase 4: Auth Architecture, NFRs & Connection Infrastructure
- **Authentication Flow**: Session-based, JWT, OAuth2/OIDC, API keys, or multi-factor — with token lifecycle (issuance, refresh, revocation).
- **Authorization Model**: RBAC, ABAC, or row-level security — with permission matrices per role per resource.
- **Security & Query Integrity**: 100% parameterized queries / prepared statements (ban dynamic SQL string concatenation), input sanitization, CSRF/XSS protection, rate limiting, and secret management (.env with .env.example).
- **Infrastructure & Connection Pooling**: Mandate database connection pooling (min/max connections, idle timeouts, release on function exit); zero raw unpooled connections per request.
- **Error Handling & Resilience**: Standardized error response format (suppress internal stack traces in production), retry policies, circuit breakers, dead-letter queues, and graceful degradation.

### Phase 5: AI-Feedable Backend Master Prompt Synthesis
Generate a self-contained prompt formatted for immediate execution by a backend coding agent.

---

## Standardized Output Layout

> **Execution Note**: Sections 1–5 are the comprehensive backend analysis artifact. Section 6 is the final, copy-pasteable Master Prompt for a backend AI coding agent.

````markdown
# Backend Architecture & Data Specification: [Product / Concept]

## 1. System Domain & Service Architecture
- **Architecture Pattern**: [Monolith | Modular Monolith | Microservices | Serverless | Event-Driven]
- **Primary Actors & Access Tiers**: [End-users, Admins, Service Accounts, External Consumers]
- **Service Map & Bounded Contexts**:
  | Service / Module | Responsibility | Communication Pattern |
  |---|---|---|
  | [Service 1] | ... | REST / gRPC / Events |
  | [Service 2] | ... | ... |
- **Core Data Flow**: [Ingest → Validate → Process → Persist → Respond]

## 2. Exhaustive API & Capability Matrix (P0–P3)
| Priority | Domain / Module | Endpoints & Capabilities | Request / Response Shape |
|---|---|---|---|
| **P0** | [Auth & Core CRUD] | `POST /auth/login`, `GET /resource`, `POST /resource` | ... |
| **P1** | [Business Logic] | `PATCH /resource/:id/status`, `GET /resource?filter=` | ... |
| **P2** | [Admin & Reporting] | `GET /admin/audit-log`, `GET /reports/export` | ... |
| **P3** | [Automation & Integrations] | `POST /webhooks/stripe`, background job: `syncInventory` | ... |

## 3. Database Schema & Entity Relationships
| Entity | Key Attributes (Type) | Relationships | Indexes | Lifecycle States |
|---|---|---|---|---|
| [Entity 1] | `id (UUID)`, `name (VARCHAR)`, `status (ENUM)` | 1:N with Entity 2 | `idx_status`, `idx_created_at` | `Draft` → `Active` → `Archived` |
| [Entity 2] | `id (UUID)`, `entity1_id (FK)`, `value (DECIMAL)` | N:1 with Entity 1 | `idx_entity1_id` | `Pending` → `Processed` |

- **State Machine Transitions**:
  | Current State | Event / Trigger | Guard Condition | Next State |
  |---|---|---|---|
  | `Draft` | `publish` | `content.length > 0` | `Active` |
  | `Active` | `archive` | `admin_role == true` | `Archived` |

## 4. Auth Architecture & Non-Functional Requirements
- **Authentication**: [JWT | Session | OAuth2 | API Key] — token lifecycle, refresh strategy, revocation
- **Authorization (RBAC Matrix)**:
  | Role | Create | Read | Update | Delete | Admin Actions |
  |---|---|---|---|---|---|
  | User | ✓ (own) | ✓ (own) | ✓ (own) | ✗ | ✗ |
  | Admin | ✓ | ✓ (all) | ✓ (all) | ✓ | ✓ |
- **Security**: Input validation, rate limiting, CORS policy, secret management
- **Performance**: [Latency targets, throughput expectations, caching strategy]
- **Error Format**: `{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "...", "details": [...] } }`

## 5. Background Jobs, Queues & Integration Points
- **Scheduled Jobs**: [Job name, schedule, purpose, failure handling]
- **Event-Driven Workflows**: [Event trigger → handler → side effects]
- **Third-Party Integrations**: [Service, endpoint, auth method, retry policy]

---

## 6. AI-Feedable Backend Master Prompt (Direct Agent Execution)

> **Copy and run the prompt below directly in any backend AI coding agent:**

```markdown
Design and build a complete, production-ready backend system for [Product Name / Type].

### System Vision & Objective
[Detailed description of the backend system, data flows, and primary operational outcome]

### Priority Execution Roadmap
<!-- Enumerate ALL discovered backend capabilities for each tier without truncation -->
#### Phase 1: P0 Core Data Layer & Auth
1. [Database Schema / Migration 1]: [Tables, columns, constraints, indexes]
2. [Auth Endpoint 1]: [Route, method, request/response, token lifecycle]
3. [Core CRUD Endpoint 1]: [Route, method, validation, response shape]
[... enumerate all remaining P0 endpoints and schemas]

#### Phase 2: P1 Business Logic & Workflow APIs
1. [Status Transition API 1]: [Route, state machine rules, guard conditions]
2. [Search / Filter API 1]: [Query parameters, pagination, sort options]
[... enumerate all remaining P1 capabilities]

#### Phase 3: P2 Admin, Audit & Reporting
1. [Admin Endpoint 1]: [Route, permission gate, response]
2. [Audit Log / Export 1]: [Data shape, filters, output format]
[... enumerate all remaining P2 capabilities]

#### Phase 4: P3 Background Jobs, Integrations & Scale
1. [Background Job 1]: [Trigger, schedule, handler logic, failure policy]
2. [Webhook / Integration 1]: [External service, endpoint, retry strategy]
[... enumerate all remaining P3 capabilities]

### Complete Data Entity Schema & State Models
- [Entity 1]: Columns [`id UUID PK`, `name VARCHAR`, `status ENUM`], FK [`entity2_id`], States [`Draft` → `Active` → `Archived`]
- [Entity 2]: Columns [`id UUID PK`, `amount DECIMAL`, `processed_at TIMESTAMP`], States [`Pending` → `Processed`]

### Auth & Security Architecture
- Authentication: [Mechanism, token format, refresh/revocation flow]
- Authorization: [RBAC matrix per role per resource]
- Query Integrity: 100% parameterized queries/prepared statements (zero dynamic string concatenation)
- Input validation: [Sanitization rules, max lengths, type coercion]
- Rate limiting: [Requests per minute per tier]

### Infrastructure & Non-Functional Requirements
- Connection Pooling: Mandate connection pool (pool size, idle timeouts, release on function return)
- Atomic Mutations: Multi-step mutations wrapped in explicit `BEGIN`/`COMMIT`/`ROLLBACK` transactions
- Performance: [Target p95 latency, max concurrent connections]
- Resilience: [Retry policies, circuit breakers, dead-letter queues]
- Observability: [Structured JSON logging, health checks (/health, SELECT 1), suppressed stack traces in prod]

### Business Rules & Concurrency Edge Cases
- [Critical validation / calculation rule 1]
- [Concurrency handling / optimistic locking or SELECT FOR UPDATE rule 2]
- [Handling of orphaned records, cascading deletes, and data integrity constraints]
```
````
