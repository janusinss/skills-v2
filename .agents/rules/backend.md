---
trigger: manual
---

# Backend Connection & Data Layer Standards
# Bundle Reference: Architecture & Data Engine (docs/BUNDLES.md)

## Phase 0: System Contract & Infrastructure Scope
- Before coding, invoke `@c4-context` and `@concise-planning` to document connection topologies and service boundaries.
- Keep all database credentials and connection strings strictly isolated within `.env.example`.
- Track all schema updates in sequential migration files rather than ad-hoc SQL executions.

---

## Active Pipeline (Run on Data & Persistence Tasks)

### Stage 1: System Topology & Infrastructure Design
- Apply `@architecture` and `@senior-architect` guidelines to define service layers, repository patterns, and ORM/query boundaries.
- Mandate connection pooling; never open raw, unpooled connections per HTTP request.
- Enforce strict lifecycle cleanup: idle connections must terminate cleanly and pooled connections must release upon function exit.

### Stage 2: Schema Integrity & Relational Design
- Follow `@supabase` (Postgres / Relational Best Practices):
  - Define column nullability, unique keys, and explicit foreign key constraints with safe deletion cascades (`ON DELETE RESTRICT` or `CASCADE`).
  - Add targeted or composite indexes for columns frequently evaluated in `WHERE`, `JOIN`, or `ORDER BY` clauses.
  - Disallow polymorphic relations that bypass database-level foreign key enforcement.

### Stage 3: Atomic Mutation & Transaction Boundaries
- Wrap all multi-step data mutations within explicit transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).
- Guard against race conditions using row-level locking (`SELECT ... FOR UPDATE`) or optimistic concurrency tokens where applicable.

### Stage 4: Resilience & Integration Testing
- Apply `@testing-patterns` to verify database health checks.
- Test connection recovery logic to ensure graceful reconnection after transient network drops.
- Log slow queries and verify that connection pool exhaustion thresholds fail gracefully without crashing the server process.