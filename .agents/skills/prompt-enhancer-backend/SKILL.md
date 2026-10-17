---
name: prompt-enhancer-backend
description: Backend & data layer prompt enhancement engine. Deconstructs raw concepts into exhaustive API architecture, database schemas, entity relationships, state machines, auth flows, service boundaries, queue/job systems, and generates AI-feedable Master Prompts for backend coding agents.
---

# PROMPT ENHANCER — BACKEND & DATA

Transforms any product concept into an exhaustive backend architecture specification covering every API endpoint, database entity, service boundary, auth flow, background job, and data pipeline — generating an **AI-feedable Master Prompt** purpose-built for backend coding agents.

---

## Core Directives

1. **Zero Roleplay Fluff**: Lead directly with the system specification. No persona prefixes.
2. **Stack-Agnostic**: Do not dictate Express, FastAPI, Django, or any specific framework unless already chosen by the user. Focus on what the backend must do, not how to implement it.
3. **Exhaustive API & Data Surface Coverage**: Catalog every endpoint, entity, relationship, migration, queue, cron job, webhook, and middleware. Never abbreviate with "etc." or cap to 3 examples.
4. **Priority Tiers (P0–P3)**: Organize all backend capabilities into strict execution phases so the backend agent builds the P0 core data layer and APIs first while structuring service/schema boundaries cleanly for P1–P3.
5. **Pipeline-Aware Disambiguation Gate & Connected Skill Dispatch**:
   - **Skip When Resolved**: When invoked inside [starting-brandnew.md](.agents/rules/starting-brandnew.md), [starting-existing.md](.agents/rules/starting-existing.md), or [backend.md](.agents/rules/backend.md) after the batched discovery gate or codebase audit, or when the user's brief already defines the core backend workflow, proceed directly without asking follow-up questions.
   - **Single-Question Cap**: Only when invoked standalone on an ambiguous prompt that maps to 2+ fundamentally different backend paradigms (e.g., *"notifications system"* → push notifications vs. email drip vs. in-app feed), ask **at most one** targeted question (`ask_question`) with up to 5 concise options before proceeding.
   - **Sibling Enhancer & Companion Skill Routing**: For fullstack systems or non-web surfaces, delegate to [prompt-enhancer](.agents/skills/prompt-enhancer/SKILL.md); for client UI/UX tasks, delegate to [prompt-enhancer-frontend](.agents/skills/prompt-enhancer-frontend/SKILL.md). When moving to backend implementation, inspect only the 1–2 companion skills matching the active surface via `view_file`: [api-patterns](.agents/skills/api-patterns/SKILL.md), [architecture-patterns](.agents/skills/architecture-patterns/SKILL.md), [senior-architect](.agents/skills/senior-architect/SKILL.md), [backend-dev-guidelines](.agents/skills/backend-dev-guidelines/SKILL.md), [database-architect](.agents/skills/database-architect/SKILL.md), [database-design](.agents/skills/database-design/SKILL.md), [sql-pro](.agents/skills/sql-pro/SKILL.md), [postgres-best-practices](.agents/skills/postgres-best-practices/SKILL.md), [observability-engineer](.agents/skills/observability-engineer/SKILL.md), [test-driven-development](.agents/skills/test-driven-development/SKILL.md), [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md), [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md), and [fix-security-vulnerabilities-with-strix](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md).
6. **Clean Unicode Formatting**: Use `→` or `->` for flows. Never use LaTeX.
7. **Mandatory Backend & Security Rule Alignment ([backend.md](.agents/rules/backend.md), [security.md](.agents/rules/security.md), [penetrating-and-testing.md](.agents/rules/penetrating-and-testing.md))**: Every generated backend specification and Master Prompt must enforce:
   - **Schema & Connection Hygiene ([backend.md](.agents/rules/backend.md))**: Connection pooling with clean release on function exit (graceful `503 Service Unavailable` on pool exhaustion), sequential versioned migrations, explicit `BEGIN`/`COMMIT`/`ROLLBACK` transactions, row-level locking (`SELECT ... FOR UPDATE`) or optimistic concurrency tokens, and strict foreign-key enforcement (`ON DELETE RESTRICT` or `CASCADE`; zero polymorphic relations that bypass DB foreign keys).
   - **Attack Surface & Input Boundary Lockdown ([security.md](.agents/rules/security.md) Phases 0–1)**: Clean semantic routes (zero `.php`/`.py`/`.asp` script extensions), stripped server fingerprint headers, uniform `"Invalid credentials"` anti-enumeration responses with constant-time delays, strict edge schema validation (`extra: forbid` to block mass assignment / BOPLA), HTTP Parameter Pollution (HPP) defense, 100% prepared statements (zero SQL interpolation; strict allowlists for dynamic `ORDER BY`/identifier fields), command injection ban (`shell: false`), and unsafe deserialization/XXE/SSTI lockdown.
   - **Auth, BOLA/IDOR, CORS, File Intake & SSRF Defense ([security.md](.agents/rules/security.md) Phases 2–6)**: Argon2id (`memory_cost=65536, time_cost=4, threads=1`) or bcrypt (cost ≥12) password hashing, constant-time token comparison, rate limiting (`5/15m` on auth routes, `60/m` on public endpoints), hardened `Secure; HttpOnly; SameSite` cookies + CSRF tokens, tenant/owner scoping on every query (`WHERE id = :id AND organization_id = :auth_org_id`) with non-enumerable UUIDv4/NanoID IDs, explicit CORS origin allowlists (never `*` with `Access-Control-Allow-Credentials: true`), magic-byte file upload verification stored outside webroot, and SSRF private-CIDR/loopback/metadata blocking.

---

## 5-Phase Backend Enhancement Pipeline

### Phase 1: System Domain Classification & Service Boundaries
- **System Architecture Type**: Monolith, modular monolith, microservices, serverless functions, or event-driven pipeline.
- **Primary Actors & Access Tiers**: End-users, organizational admins, system super-admins, service accounts, external API consumers, and webhooks.
- **Service Map & Bounded Contexts**: Top-level service domains, repository/storage boundaries, and inter-service communication patterns (REST, gRPC, message queues, events).
- **Core Data Flow**: The primary data lifecycle (Ingest → Edge Validate → Authorize → Process in Transaction → Persist → Respond).

### Phase 2: Exhaustive API & Capability Catalog (P0–P3)
Catalog every backend capability and assign execution priority:
- **P0 (Core Data Layer & Auth)**: Database schemas, sequential migrations, primary CRUD endpoints, authentication/authorization, and the minimum viable API surface (built completely in the initial implementation pass).
- **P1 (Business Logic & Workflows)**: Validation pipelines, state machine transitions, calculated fields, search/filter/sort APIs (using strict column allowlists), and pagination.
- **P2 (Admin, Audit & Reporting)**: Admin-only endpoints, audit trail logging, data export APIs, role management, and analytics aggregation queries.
- **P3 (Scale, Automation & Integration)**: Background job queues, scheduled cron tasks, webhook dispatch/receipt, third-party API integrations, tenant-isolated caching layers, and advanced rate limiting.

### Phase 3: Database Schema, Entity Relationships & State Machines
- **Entity-Relationship Model ([backend.md](.agents/rules/backend.md) Stage 2)**: Every table/collection, non-enumerable public primary keys (UUIDv4 or NanoID), tenant/owner foreign keys (`organization_id` / `user_id`) with explicit `ON DELETE RESTRICT` or `CASCADE` rules, targeted/composite indexes for `WHERE`/`JOIN`/`ORDER BY` columns, and cardinality (1:1, 1:N, N:M with explicit junction tables; ban polymorphic relations that bypass DB foreign keys).
- **Attribute Specifications**: Column types, nullable constraints, default values, unique constraints, and computed/virtual fields.
- **Lifecycle State Machines & Concurrency ([backend.md](.agents/rules/backend.md) Stage 3)**: Status enums with valid transitions, transition triggers, and guard conditions. Mandate explicit transaction blocks (`BEGIN` / `COMMIT` / `ROLLBACK`) and race-condition defenses (`SELECT ... FOR UPDATE` or optimistic concurrency version columns).
- **Migration & Secret Hygiene ([backend.md](.agents/rules/backend.md) Phase 0)**: Sequential version-controlled migration files, seed data requirements, rollback procedures, `.env` excluded in `.gitignore`, and `.env.example` template maintenance.

### Phase 4: Auth Architecture, Security Hardening & Connection Infrastructure
- **Authentication & Anti-Automation ([security.md](.agents/rules/security.md) Phase 2)**: Session-based, JWT, OAuth2/OIDC, API keys, or MFA — with Argon2id/bcrypt password hashing, constant-time token checks, uniform `"Invalid credentials"` anti-enumeration responses, CSPRNG ≥128-bit session entropy, session regeneration on privilege change, `Secure; HttpOnly; SameSite` cookie flags, cryptographic CSRF protection, and concrete rate limits (`5 failed attempts / 15 min` on auth routes; `60 req/min` on public endpoints).
- **Authorization & BOLA / IDOR Defense ([security.md](.agents/rules/security.md) Phase 3)**: Function-level RBAC/ABAC plus mandatory object-level tenant ownership filters (`WHERE id = :id AND organization_id = :auth_org_id`) on every read, update, and delete; never trust client-supplied `user_id`, `org_id`, or `role` fields.
- **Input, Query, Transport, File & SSRF Integrity ([security.md](.agents/rules/security.md) Phases 0, 1, 4, 5)**:
  - Clean semantic URLs (zero script extensions), stripped server fingerprint headers, and blocked web access to sensitive dotfiles/configs.
  - Strict edge schema validation (`extra: forbid`) and 100% parameterized queries / prepared statements (zero dynamic SQL string concatenation; strict allowlists for dynamic `ORDER BY` identifiers).
  - Binary magic-byte verification, extension allowlists (`jpg`, `jpeg`, `png`, `webp`, `pdf`), and randomized UUID filenames stored outside webroot for file uploads.
  - Outbound URL allowlists (`https://` only) with DNS pre-resolution blocking loopback (`127.0.0.1`), RFC 1918 private CIDRs, and cloud metadata (`169.254.169.254`), plus TLS 1.2+ and explicit CORS origin allowlists (never pair `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`).
- **Infrastructure, Pooling & Resilience ([backend.md](.agents/rules/backend.md) Stages 1 & 4)**: Database connection pooling (min/max connections, idle timeouts, release on function exit, `503 Service Unavailable` on pool exhaustion), tenant-isolated caching, health check endpoints (`/health`, `SELECT 1`), structured JSON logging with request IDs, retry/circuit-breaker policies, and production error responses that suppress stack traces, SQL errors, and file paths.

### Phase 5: AI-Feedable Backend Master Prompt Synthesis
Generate a self-contained prompt formatted for immediate execution by a backend coding agent.

---

## Standardized Output Layout

> **Execution Note**: Sections 1–5 are the comprehensive backend analysis artifact (written directly to `./PRODUCT.md` during [starting-brandnew.md](.agents/rules/starting-brandnew.md) or [starting-existing.md](.agents/rules/starting-existing.md) pipelines). Section 6 is the standalone, copy-pasteable Master Prompt and execution contract for a backend AI coding agent.

````markdown
# Backend Architecture & Data Specification: [Product / Concept]

## 1. System Domain & Service Architecture
- **Architecture Pattern**: [Monolith | Modular Monolith | Microservices | Serverless | Event-Driven]
- **Primary Actors & Access Tiers**: [End-users, Org Admins, Super-Admins, Service Accounts, External Consumers]
- **Service Map & Bounded Contexts**:
  | Service / Module | Responsibility | Communication Pattern |
  |---|---|---|
  | [Service 1] | ... | REST / gRPC / Events |
  | [Service 2] | ... | ... |
- **Core Data Flow**: [Ingest → Edge Validate (`extra: forbid`) → Authorize (RBAC + Tenant Scope) → Process in Transaction → Persist → Respond]

## 2. Exhaustive API & Capability Matrix (P0–P3)
| Priority | Domain / Module | Clean Semantic Endpoints & Capabilities | Request / Response Shape & Rate Limit |
|---|---|---|---|
| **P0** | [Auth & Core CRUD] | `POST /api/v1/auth/login` (`5/15m`), `GET /api/v1/resource`, `POST /api/v1/resource` (`60/m`) | ... |
| **P1** | [Business Logic] | `PATCH /api/v1/resource/:uuid/status`, `GET /api/v1/resource?filter=` | ... |
| **P2** | [Admin & Reporting] | `GET /api/v1/admin/audit-log`, `GET /api/v1/reports/export` | ... |
| **P3** | [Automation & Integrations] | `POST /api/v1/webhooks/stripe`, background job: `syncInventory` | ... |

## 3. Database Schema & Entity Relationships
| Entity | Key Attributes (UUIDv4 / Types) | Relationships & Cascade Rules | Targeted Indexes | Lifecycle States |
|---|---|---|---|---|
| [Entity 1] | `id (UUID PK)`, `organization_id (UUID FK)`, `name (VARCHAR)`, `status (ENUM)` | 1:N with Entity 2 (`ON DELETE RESTRICT`) | `idx_org_status`, `idx_created_at` | `Draft` → `Active` → `Archived` |
| [Entity 2] | `id (UUID PK)`, `organization_id (UUID FK)`, `entity1_id (UUID FK)`, `value (DECIMAL)` | N:1 with Entity 1 (`ON DELETE CASCADE`) | `idx_org_entity1_id` | `Pending` → `Processed` |

- **State Machine Transitions & Concurrency**:
  | Current State | Event / Trigger | Guard Condition & Lock Strategy | Next State |
  |---|---|---|---|
  | `Draft` | `publish` | `content.length > 0` (`BEGIN`/`COMMIT` + `SELECT ... FOR UPDATE`) | `Active` |
  | `Active` | `archive` | `admin_role == true` (`organization_id == auth_org_id`) | `Archived` |

## 4. Auth Architecture, Security & Non-Functional Requirements
- **Authentication**: [JWT | Session | OAuth2 | API Key] — Argon2id/bcrypt password hashing, constant-time token checks, uniform `"Invalid credentials"` anti-enumeration responses, `Secure; HttpOnly; SameSite` cookies, CSRF protection, token refresh/revocation
- **Authorization (RBAC + BOLA/IDOR Matrix)**:
  | Role | Create | Read | Update | Delete | Admin Actions |
  |---|---|---|---|---|---|
  | User | ✓ (own org/user) | ✓ (own org/user) | ✓ (own org/user) | ✗ | ✗ |
  | Admin | ✓ (own org) | ✓ (own org) | ✓ (own org) | ✓ (own org) | ✓ |
- **Security Hardening**: Clean semantic URLs, stripped server headers, strict edge schema validation (`extra: forbid`), 100% prepared statements (allowlisted sort columns), rate limiting (`5/15m` auth, `60/m` public), explicit CORS origin allowlists (never `*` with credentials), magic-byte file upload checks outside webroot, SSRF private-CIDR blocking, security headers (CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`)
- **Performance, Pooling & Caching**: [Connection pooling with clean exit release & `503` exhaustion fallback, latency targets, tenant-isolated cache keys]
- **Error Format (Zero Leakage)**: `{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "...", "requestId": "..." } }` (suppress stack traces, SQL errors, and system paths in prod)

## 5. Background Jobs, Queues & Integration Points
- **Scheduled Jobs**: [Job name, schedule, purpose, idempotency & failure handling]
- **Event-Driven Workflows**: [Event trigger → handler → transactional side effects]
- **Third-Party Integrations**: [Service, `https://` endpoint, auth method, SSRF guard, retry/circuit-breaker policy]

---

## 6. AI-Feedable Backend Master Prompt (Direct Agent Execution)

> **Copy and run the prompt below directly in any backend AI coding agent:**

```markdown
Design and build a complete, production-ready backend system for [Product Name / Type].

### System Vision & Objective
[Detailed description of the backend system, data flows, and primary operational outcome]

### Priority Execution Roadmap
> **Execution Rule**: Implement **Phase 1 (P0)** end-to-end for the initial production release unless full P0–P3 implementation is explicitly requested. Catalog P1–P3 in `PRODUCT.md` and structure service/schema boundaries cleanly to support iterative expansion.

<!-- Enumerate ALL discovered backend capabilities for each tier without truncation -->
#### Phase 1: P0 Core Data Layer & Auth (Build Now)
1. [Database Schema / Migration 1]: [Tables, UUIDv4 PKs, `organization_id` FKs with explicit `ON DELETE` rules, constraints, targeted indexes]
2. [Auth Endpoint 1]: [Clean semantic route, method, Argon2id/bcrypt hashing, rate limit `5/15m`, token/cookie lifecycle]
3. [Core CRUD Endpoint 1]: [Route, method, edge schema validation (`extra: forbid`), tenant-scoped query (`WHERE id = :id AND organization_id = :auth_org_id`), response shape]
[... enumerate all remaining P0 endpoints and schemas]

#### Phase 2: P1 Business Logic & Workflow APIs
1. [Status Transition API 1]: [Route, state machine rules, guard conditions, `BEGIN`/`COMMIT` transaction + `SELECT ... FOR UPDATE`]
2. [Search / Filter API 1]: [Query parameters, allowlisted sort columns, pagination, rate limit `60/m`]
[... enumerate all remaining P1 capabilities]

#### Phase 3: P2 Admin, Audit & Reporting
1. [Admin Endpoint 1]: [Route, server-side RBAC gate, response]
2. [Audit Log / Export 1]: [Data shape, tenant-isolated filters, output format]
[... enumerate all remaining P2 capabilities]

#### Phase 4: P3 Background Jobs, Integrations & Scale
1. [Background Job 1]: [Trigger, schedule, idempotent handler logic, dead-letter/failure policy]
2. [Webhook / Integration 1]: [External service, `https://` endpoint, signature verification, SSRF guard, retry strategy]
[... enumerate all remaining P3 capabilities]

### Complete Data Entity Schema & State Models
- [Entity 1]: Columns [`id UUIDv4 PK`, `organization_id UUID FK`, `name VARCHAR`, `status ENUM`], FK [`entity2_id` (`ON DELETE RESTRICT`)], Indexes [`idx_org_status`], States [`Draft` → `Active` → `Archived`]
- [Entity 2]: Columns [`id UUIDv4 PK`, `organization_id UUID FK`, `amount DECIMAL`, `processed_at TIMESTAMP`], States [`Pending` → `Processed`]

### Auth & Security Architecture (security.md)
- Attack Surface & Routing: Clean semantic routes (zero `.php`/`.py`/`.asp` extensions in URLs), stripped server fingerprint headers (`X-Powered-By`, `Server`), blocked access to dotfiles/configs (`.env*`, `.git/`, `*.sql`), and uniform `"Invalid credentials"` anti-enumeration responses with constant-time delays.
- Authentication & Session Security: [Mechanism, Argon2id/bcrypt password hashing, constant-time token comparison, CSPRNG ≥128-bit tokens, `Secure; HttpOnly; SameSite` cookies, session regeneration on login/privilege change, CSRF tokens on state-changing routes].
- Authorization (BOLA / IDOR & RBAC): Enforce server-side RBAC on every route and scope every object lookup/mutation to authenticated tenant ownership (`WHERE id = :id AND organization_id = :auth_org_id`) using non-enumerable UUIDv4/NanoID IDs. Never trust client-supplied `user_id`, `org_id`, or `role`.
- Edge Validation & Query Integrity: Validate all bodies, query params, and headers against strict schemas (`extra: forbid` to prevent mass assignment / BOPLA). Use 100% parameterized queries/prepared statements (zero SQL string interpolation; strict allowlists for `ORDER BY` identifiers). Ban shell command interpolation (`shell: false` only) and unsafe deserialization.
- Rate Limiting & Transport (TLS / CORS): Max `5 failed attempts / 15 min` per IP/account on auth endpoints; max `60 req/min` per IP on public mutation/search endpoints. Enforce TLS 1.2+, HSTS, and explicit CORS origin allowlists (never pair `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`).
- File Intake & SSRF Defense (when applicable): Verify file magic bytes, enforce extension allowlists (`jpg`, `jpeg`, `png`, `webp`, `pdf`), randomize UUID filenames, and store outside webroot with script execution disabled. Block outbound requests to loopback (`127.0.0.1`), RFC 1918 private CIDRs, and cloud metadata (`169.254.169.254`).

### Infrastructure, Pooling & Resilience (backend.md & penetrating-and-testing.md)
- Environment & Migrations: Secrets strictly in `.env` (git-ignored) with `.env.example` template; all schema changes in sequential version-controlled migration files.
- Connection Pooling: Mandate connection pool (min/max size, idle timeouts, guaranteed release on function exit, graceful `503 Service Unavailable` on pool exhaustion).
- Atomic Mutations & Concurrency: Wrap multi-step mutations in explicit `BEGIN`/`COMMIT`/`ROLLBACK` transactions with row-level locking (`SELECT ... FOR UPDATE`) or optimistic version tokens.
- Observability & Error Suppression: Structured JSON logging with request IDs, `/health` endpoint (`SELECT 1`), and production error responses that suppress stack traces, SQL errors, and system paths.
- Defensive Verification Gates: Run dependency audits (`npm/composer/pip audit`), verify `401` on unauthenticated access, `403`/`404` on cross-tenant IDOR probes, clean validation rejection on `' OR 1=1 --` payloads, `429` on rapid auth failures, and remediate any Strix findings (`strix_runs/<run-name>/vulnerabilities.json`) via root-cause patches.

### Business Rules & Concurrency Edge Cases
- [Critical validation / calculation rule 1]
- [Concurrency handling / optimistic locking or SELECT FOR UPDATE rule 2]
- [Handling of orphaned records, explicit foreign key deletion cascades, and data integrity constraints]
```
````
