---
trigger: model_decision
description: Backend architecture, data layer, and persistence standards. Activate when implementing database schemas, ORM queries, API routes, connection management, or data access patterns.
---

# Backend Architecture & Data Layer Standards

Apply when designing, building, or refactoring server architecture, data access layers, DB connections, and APIs. Defer to [security.md](.agents/rules/security.md) for `.env`/secrets, input validation, auth/authz, and production stack-trace suppression.

## Skill Dispatch Matrix
Inspect only the 1-2 skills matching the active task via `read_file`:

| Domain | Skills / Agents |
| :--- | :--- |
| **API & Architecture** | [prompt-enhancer-backend](.agents/skills/prompt-enhancer-backend/SKILL.md) · [api-patterns](.agents/skills/api-patterns/SKILL.md) · [backend-dev-guidelines](.agents/skills/backend-dev-guidelines/SKILL.md) · [architecture-patterns](.agents/skills/architecture-patterns/SKILL.md) |
| **Data & SQL** | [database-design](.agents/skills/database-design/SKILL.md) · [postgres-best-practices](.agents/skills/postgres-best-practices/SKILL.md) *(Postgres/SQL)* |
| **Runtimes** | [nodejs-best-practices](.agents/skills/nodejs-best-practices/SKILL.md) · [typescript-expert](.agents/skills/typescript-expert/SKILL.md) · [fastapi-templates](.agents/skills/fastapi-templates/SKILL.md) · [django-pro](.agents/skills/django-pro/SKILL.md) · [python-patterns](.agents/skills/python-patterns/SKILL.md) · [async-python-patterns](.agents/skills/async-python-patterns/SKILL.md) · [golang-pro](.agents/skills/golang-pro/SKILL.md) · [go-concurrency-patterns](.agents/skills/go-concurrency-patterns/SKILL.md) |
| **Infra & Tests** | [mcp-builder](.agents/skills/mcp-builder/SKILL.md) · [docker-expert](.agents/skills/docker-expert/SKILL.md) · [architecture-decision-records](.agents/skills/architecture-decision-records/SKILL.md) · [observability-engineer](.agents/skills/observability-engineer/SKILL.md) · [test-driven-development](.agents/skills/test-driven-development/SKILL.md) · [python-testing-patterns](.agents/skills/python-testing-patterns/SKILL.md) · [test-fixing](.agents/skills/test-fixing/SKILL.md) |
| **Diagrams (On-Demand)** | [archify](.agents/skills/archify/SKILL.md) *(explicit architecture/schema diagram requests only)* |
| **Subagents (`AGENTS.md` §4)** | [architect](.agents/agents/architect.md) · [code-architect](.agents/agents/code-architect.md) · [tdd-guide](.agents/agents/tdd-guide.md) · [performance-optimizer](.agents/agents/performance-optimizer.md) · [build-error-resolver](.agents/agents/build-error-resolver.md) · [typescript-reviewer](.agents/agents/typescript-reviewer.md) · [database-reviewer](.agents/agents/database-reviewer.md) *(Postgres)* · [fastapi-reviewer](.agents/agents/fastapi-reviewer.md) · [go-reviewer](.agents/agents/go-reviewer.md) · [rust-reviewer](.agents/agents/rust-reviewer.md) · [php-reviewer](.agents/agents/php-reviewer.md) · [silent-failure-hunter](.agents/agents/silent-failure-hunter.md) *(plus stack `*-build-resolver`s)* |

## Phase 0: Scope, Config & Migrations
1. **Scoping**: Define API contracts, schemas, and service boundaries before non-trivial builds. Render HTML `architecture`/`erd` diagrams via [archify](.agents/skills/archify/SKILL.md) only when explicitly asked to visualize topology or schemas.
2. **Config & Migrations**: Keep non-sensitive template keys in `.env.example` (`.env` rules live in [security.md](.agents/rules/security.md)). Version schema changes in sequential migrations, never ad-hoc DDL.

## Pipeline Stages

### Stage 1: Boundaries, Connections & Caching
1. **Layering**: Separate transport handlers, domain services, and persistence repositories.
2. **Pooling (Relational/TCP Only)**: For networked SQL/TCP stores (PostgreSQL, MySQL, MSSQL, Redis), use a shared pool with acquire/idle timeouts and scope-exit release; never open unpooled TCP connections per request. **Exempt**: SQLite, serverless HTTP DBs (Neon/Turso HTTP), and HTTP-API stores (DynamoDB, Firestore) reuse SDK/HTTP clients instead.
3. **Caching**: Cache read-heavy routes (Redis, LRU, `Cache-Control`/`ETag`) with tenant/user key isolation.

### Stage 2: Schema Integrity & Indexing
1. **Relational SQL**: Declare nullability, unique keys, and FKs with explicit `ON DELETE` rules (`RESTRICT`/`CASCADE`); avoid untyped polymorphic FKs. Validate non-relational schemas at the service boundary.
2. **Indexes**: Index frequent `WHERE`, `JOIN`, and `ORDER BY` predicates (or NoSQL access keys); avoid over-indexing write-heavy tables.

### Stage 3: Transactions & Concurrency
1. **Transactions**: Wrap multi-step writes in explicit transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) or atomic store batches.
2. **Concurrency**: Prevent lost updates via row locks (`SELECT ... FOR UPDATE` in SQL) or optimistic concurrency tokens (version columns, ETags, conditional writes).

### Stage 4: Observability & Verifiable Assertions
1. **Telemetry**: Emit structured JSON logs with request IDs and query latencies; flag slow queries. Suppress production stack traces per [security.md](.agents/rules/security.md).
2. **Runnable Assertions**:
   - **Rollback Test**: Force an error mid-transaction and assert zero partial writes persist.
   - **Health Probe Test**: Assert `/health` returns `200 OK` on a passing store probe (`SELECT 1` for SQL; ping/metadata for non-relational) and `503 Service Unavailable` when unreachable or timed out.
