> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Backend Architecture & Data Layer Standards

Apply when designing, building, or refactoring server architecture, data access layers, DB connections, and APIs. Defer to [security.md](security.md) for `.env`/secrets, input validation, auth/authz, and production stack-trace suppression.

## Skill Dispatch Matrix
Inspect only the 1-2 skills matching the active task via `read_file`:

| Domain | Skills / Agents |
| :--- | :--- |
| **API & Architecture** | [prompt-enhancer-backend](../skills/prompt-enhancer-backend/SKILL.md) · [api-patterns](../skills/api-patterns/SKILL.md) · [backend-dev-guidelines](../skills/backend-dev-guidelines/SKILL.md) · [architecture-patterns](../skills/architecture-patterns/SKILL.md) |
| **Data & SQL** | [database-design](../skills/database-design/SKILL.md) · [postgres-best-practices](../skills/postgres-best-practices/SKILL.md) *(Postgres/SQL)* |
| **Runtimes** | [nodejs-best-practices](../skills/nodejs-best-practices/SKILL.md) · [typescript-expert](../skills/typescript-expert/SKILL.md) · [fastapi-templates](../skills/fastapi-templates/SKILL.md) · [django-pro](../skills/django-pro/SKILL.md) · [python-patterns](../skills/python-patterns/SKILL.md) · [async-python-patterns](../skills/async-python-patterns/SKILL.md) · [golang-pro](../skills/golang-pro/SKILL.md) · [go-concurrency-patterns](../skills/go-concurrency-patterns/SKILL.md) |
| **Infra & Tests** | [mcp-builder](../skills/mcp-builder/SKILL.md) · [docker-expert](../skills/docker-expert/SKILL.md) · [architecture-decision-records](../skills/architecture-decision-records/SKILL.md) · [observability-engineer](../skills/observability-engineer/SKILL.md) · [test-driven-development](../skills/test-driven-development/SKILL.md) · [python-testing-patterns](../skills/python-testing-patterns/SKILL.md) · [test-fixing](../skills/test-fixing/SKILL.md) |
| **Diagrams (On-Demand)** | [archify](../skills/archify/SKILL.md) *(explicit architecture/schema diagram requests only)* |
| **Subagents (`AGENTS.md` §4)** | [architect](../agents/architect.md) · [code-architect](../agents/code-architect.md) · [tdd-guide](../agents/tdd-guide.md) · [performance-optimizer](../agents/performance-optimizer.md) · [build-error-resolver](../agents/build-error-resolver.md) · [typescript-reviewer](../agents/typescript-reviewer.md) · [database-reviewer](../agents/database-reviewer.md) *(Postgres)* · [fastapi-reviewer](../agents/fastapi-reviewer.md) · [go-reviewer](../agents/go-reviewer.md) · [rust-reviewer](../agents/rust-reviewer.md) · [php-reviewer](../agents/php-reviewer.md) · [silent-failure-hunter](../agents/silent-failure-hunter.md) *(plus stack `*-build-resolver`s)* |

## Phase 0: Scope, Config & Migrations
1. **Scoping**: Define API contracts, schemas, and service boundaries before non-trivial builds. Render HTML `architecture`/`erd` diagrams via [archify](../skills/archify/SKILL.md) only when explicitly asked to visualize topology or schemas.
2. **Config & Migrations**: Keep non-sensitive template keys in `.env.example` (`.env` rules live in [security.md](security.md)). Version schema changes in sequential migrations, never ad-hoc DDL.

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
1. **Telemetry**: Emit structured JSON logs with request IDs and query latencies; flag slow queries. Suppress production stack traces per [security.md](security.md).
2. **Runnable Assertions**:
   - **Rollback Test**: Force an error mid-transaction and assert zero partial writes persist.
   - **Health Probe Test**: Assert `/health` returns `200 OK` on a passing store probe (`SELECT 1` for SQL; ping/metadata for non-relational) and `503 Service Unavailable` when unreachable or timed out.
