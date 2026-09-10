---
trigger: manual
---

# Backend Connection & Data Layer Standards

Execute this pipeline when designing, implementing, or refactoring data access layers and database connections:

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

### Stage 2: Schema Integrity & Relational Design
- Follow `database-architect`, `postgres-best-practices`, and `database-design`:
  - Define column nullability, unique keys, and explicit foreign key constraints with safe deletion cascades (`ON DELETE RESTRICT` or `CASCADE`).
  - Add targeted or composite indexes for columns frequently evaluated in `WHERE`, `JOIN`, or `ORDER BY` clauses.
  - Disallow polymorphic relations that bypass database-level foreign key enforcement.

### Stage 3: Atomic Mutation & Transaction Boundaries
- Wrap all multi-step data mutations within explicit transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).
- Guard against race conditions using row-level locking (`SELECT ... FOR UPDATE`) or optimistic concurrency tokens where applicable.

### Stage 4: Resilience & Integration Testing
- Apply `test-driven-development` and `backend-dev-guidelines`:
  - Verify database health check endpoints (`/health`, `SELECT 1`).
  - Test connection recovery logic to ensure graceful reconnection after transient network drops.
  - Log slow queries and verify that connection pool exhaustion thresholds fail gracefully (returning `503 Service Unavailable`) without crashing the server process.
