---
trigger: model_decision
description: Backend architecture, data layer, and persistence standards. Activate when implementing database schemas, ORM queries, API routes, connection management, or data access patterns.
---

# Backend Architecture & Data Layer Standards

Execute this pipeline when designing, implementing, or refactoring server-side architecture, data access layers, and database connections. Defer to `security.md` for input validation, authentication, authorization, and API endpoint hardening.

## Phase 0: System Contract & Infrastructure Scope
- Before coding, invoke `architecture-patterns`, `backend-dev-guidelines`, and `concise-planning` to document connection topologies and service boundaries.
- **Environment & Secrets:** Keep real connection strings and secrets strictly inside `.env` (ensuring `.env` is in `.gitignore`). Maintain non-sensitive template keys inside `.env.example`.
- Track all schema updates in sequential migration files rather than ad-hoc SQL executions.

---

## Active Pipeline (Run on Data & Persistence Tasks)

### Stage 1: System Topology & Infrastructure Design
- Apply `senior-architect` and `backend-dev-guidelines` to define service layers, repository patterns, and ORM/query boundaries.
- **Connection Pooling:** Mandate connection pooling; never open raw, unpooled connections per HTTP request.
- **Lifecycle Cleanup:** Enforce strict lifecycle cleanup: idle connections must terminate cleanly and pooled connections must release upon function exit.
- **Caching Strategy:** For read-heavy endpoints, define an application-level caching layer (Redis, in-memory LRU, or HTTP cache headers with `Cache-Control` / `ETag`). Never cache authenticated user-specific data in shared caches without key isolation.

### Stage 2: Schema Integrity & Relational Design
- Follow `database-architect` and `database-design` (apply `postgres-best-practices` for Postgres; substitute database-specific best practices for MySQL, SQLite, MongoDB, or other systems):
  - Define column nullability, unique keys, and explicit foreign key constraints with safe deletion cascades (`ON DELETE RESTRICT` or `CASCADE`).
  - Add targeted or composite indexes for columns frequently evaluated in `WHERE`, `JOIN`, or `ORDER BY` clauses.
  - Disallow polymorphic relations that bypass database-level foreign key enforcement.

### Stage 3: Atomic Mutation & Transaction Boundaries
- Wrap all multi-step data mutations within explicit transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).
- Guard against race conditions using row-level locking (`SELECT ... FOR UPDATE`) or optimistic concurrency tokens where applicable.

### Stage 4: Resilience, Observability & Integration Testing
- Apply `test-driven-development` and `backend-dev-guidelines`:
  - Verify database health check endpoints (`/health`, `SELECT 1`).
  - Test connection recovery logic to ensure graceful reconnection after transient network drops.
  - Log slow queries and verify that connection pool exhaustion thresholds fail gracefully (returning `503 Service Unavailable`) without crashing the server process.
- **Structured Observability:** Apply `observability-engineer` patterns:
  - Use structured JSON logging (not raw `console.log`) with request IDs for traceability.
  - Log query execution times; flag queries exceeding latency thresholds.
  - Ensure error responses in production suppress stack traces, system paths, and internal details.