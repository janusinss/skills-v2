---
trigger: model_decision
description: Backend architecture, data layer, and persistence standards. Activate when implementing database schemas, ORM queries, API routes, connection management, or data access patterns.
---

# Backend Architecture & Data Layer Standards

Execute this pipeline when designing, implementing, or refactoring server-side architecture, data access layers, database connections, and API endpoints. Defer to [security.md](.agents/rules/security.md) for input validation, authentication, authorization, and attack surface defense.

---

## Mandatory Backend Skill Dispatch Matrix
Before generating backend architecture, database schemas, or API code, inspect the corresponding skill instructions via `view_file`:

| Domain / Task | Required Skill & Direct Specification Link |
| :--- | :--- |
| **API Contract & Scoping** | [prompt-enhancer-backend](.agents/skills/prompt-enhancer-backend/SKILL.md) · [api-patterns](.agents/skills/api-patterns/SKILL.md) |
| **Architecture & Reliability** | [senior-architect](.agents/skills/senior-architect/SKILL.md) · [architecture-patterns](.agents/skills/architecture-patterns/SKILL.md) · [backend-dev-guidelines](.agents/skills/backend-dev-guidelines/SKILL.md) |
| **Database Design & ORM** | [database-architect](.agents/skills/database-architect/SKILL.md) · [database-design](.agents/skills/database-design/SKILL.md) · [sql-pro](.agents/skills/sql-pro/SKILL.md) |
| **PostgreSQL Optimization** | [postgres-best-practices](.agents/skills/postgres-best-practices/SKILL.md) |
| **Observability & Logging** | [observability-engineer](.agents/skills/observability-engineer/SKILL.md) |
| **Backend Testing & TDD** | [test-driven-development](.agents/skills/test-driven-development/SKILL.md) |
| **Security & Auth Defenses** | [.agents/rules/security.md](.agents/rules/security.md) |

---

## Phase 0: System Contract & Infrastructure Scope
> **Active Skill**: [prompt-enhancer-backend](.agents/skills/prompt-enhancer-backend/SKILL.md) & [architecture-patterns](.agents/skills/architecture-patterns/SKILL.md)

1. **System Scoping**:
   - Before coding, document connection topologies, P0–P3 API matrices, database schemas, and service boundaries.
2. **Environment & Secrets Hygiene**:
   - Keep production connection strings and secrets strictly inside `.env` (ensuring `.env` is in `.gitignore`).
   - Maintain non-sensitive template keys inside `.env.example`.
3. **Migration Integrity**:
   - Track all database schema updates in sequential, version-controlled migration files rather than ad-hoc SQL executions.

---

## Active Pipeline (Run on Data & Persistence Tasks)

### Stage 1: System Topology & Infrastructure Design
> **Active Skill**: [senior-architect](.agents/skills/senior-architect/SKILL.md) & [backend-dev-guidelines](.agents/skills/backend-dev-guidelines/SKILL.md)

1. **Architecture Boundaries**:
   - Define clean service layers, repository patterns, and ORM/query boundaries separating business logic from transport and storage.
2. **Connection Pooling**:
   - Mandate connection pooling (e.g. PgBouncer, HikariCP, generic pool); never open unpooled database connections per HTTP request.
3. **Lifecycle Cleanup**:
   - Enforce strict connection lifecycle management: idle connections must terminate cleanly and pooled connections must release upon function exit.
4. **Caching Strategy**:
   - For read-heavy endpoints, define an application-level caching layer (Redis, in-memory LRU, or HTTP cache headers with `Cache-Control` / `ETag`). Never cache user-specific data in shared caches without key isolation.

### Stage 2: Schema Integrity & Relational Design
> **Active Skill**: [database-architect](.agents/skills/database-architect/SKILL.md), [database-design](.agents/skills/database-design/SKILL.md) & [sql-pro](.agents/skills/sql-pro/SKILL.md) *(apply [postgres-best-practices](.agents/skills/postgres-best-practices/SKILL.md) for Postgres)*

1. **Constraint Discipline**:
   - Define column nullability, unique keys, and explicit foreign key constraints with safe deletion cascades (`ON DELETE RESTRICT` or `CASCADE`).
2. **Indexing Strategy**:
   - Add targeted or composite indexes for columns frequently evaluated in `WHERE`, `JOIN`, or `ORDER BY` clauses. Avoid over-indexing high-write tables.
3. **Foreign Key Enforcement**:
   - Disallow polymorphic relations that bypass database-level foreign key enforcement.

### Stage 3: Atomic Mutation & Transaction Boundaries
> **Active Skill**: [backend-dev-guidelines](.agents/skills/backend-dev-guidelines/SKILL.md) & [sql-pro](.agents/skills/sql-pro/SKILL.md)

1. **Explicit Transactions**:
   - Wrap all multi-step data mutations within explicit transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).
2. **Concurrency & Race Conditions**:
   - Guard against race conditions using row-level locking (`SELECT ... FOR UPDATE`) or optimistic concurrency tokens (version columns) where applicable.

### Stage 4: Resilience, Observability & Integration Testing
> **Active Skill**: [observability-engineer](.agents/skills/observability-engineer/SKILL.md) & [test-driven-development](.agents/skills/test-driven-development/SKILL.md)

1. **Health Checks & Recovery**:
   - Verify database health check endpoints (`/health`, `SELECT 1`).
   - Test connection recovery logic to ensure graceful reconnection after transient network drops.
2. **Graceful Pool Exhaustion**:
   - Log slow queries and verify that connection pool exhaustion thresholds fail gracefully (returning `503 Service Unavailable`) without crashing the server process.
3. **Structured Observability**:
   - Use structured JSON logging with request IDs for traceability.
   - Log query execution times; flag queries exceeding latency thresholds.
   - Ensure error responses in production suppress stack traces, system paths, and internal details as mandated by [security.md](.agents/rules/security.md).