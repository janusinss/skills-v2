---
trigger: model_decision
description: Application security standards for authentication, authorization, APIs, input validation, and data boundaries. Activate when implementing auth flows, API endpoints, data access layers, or reviewing code for security concerns.
---

# Application Security & Vulnerability Standards

Execute this pipeline when designing, implementing, or auditing authentication, authorization, APIs, and data boundaries.

## Phase 0: Threat Posture & Zero-Trust Verification
- Apply `security-auditor` or `cc-skill-security-review` during planning to identify trust boundaries and entry vectors.
- **Trust Boundary Visualization (via Archify):**
  - Map untrusted edge boundaries and protected internal zones using `archify architecture`. For auth handshakes (OAuth, JWT, 2FA), generate an `archify sequence` diagram.
- Assume all client headers, query parameters, bodies, and webhook signatures are untrusted.
- **Secrets Hygiene:**
  - Verify that no secrets, service tokens, `.env` files, or private keys are committed to Git.
  - Confirm `.env.example` exists with placeholder keys (no real values) for onboarding. If absent, create it.

---

## Active Pipeline (Run on Auth, API, & Endpoint Reviews)

> **Scope Note:** Skip backend-specific checks (SQL injection, BOLA, rate limiting) when the project has no server-side code. Skip frontend-specific checks (XSS output encoding) when the project has no client-rendered UI.

### Stage 1: Input Boundary & Injection Defense
- Validate all incoming request payloads at the edge using strict schema parsers (e.g., Zod, Joi, Pydantic).
- Apply `backend-security-coder` and `top-web-vulnerabilities`:
  - Enforce 100% prepared statements or parameterized queries.
  - Ban dynamic SQL string interpolation, raw query concatenations, and unescaped table/column names.
- Apply `frontend-security-coder` to enforce context-aware output encoding to prevent DOM and Reflected XSS.

### Stage 2: Identity & Access Control (AuthN / AuthZ)
- Apply `api-security-best-practices` and `auth-implementation-patterns`:
  - Enforce authentication on all protected endpoints.
  - **BOLA / IDOR Prevention:** Confirm the authenticated session identity matches the record owner before mutating or returning data.
  - Implement IP and user-based rate limiting on sensitive routes (login, registration, password reset, search, webhooks).

### Stage 3: Automated Vulnerability Audit
- Apply `vulnerability-scanner` analysis patterns to review modified files against OWASP Top 10 vectors:
  - Broken Access Control, SSRF, Injection, Security Misconfiguration.
  - Verify error handlers suppress stack traces, system paths, and internal database details in production responses.
  - Enforce secure headers (strict CORS restrictions, CSP, `X-Content-Type-Options: nosniff`, HSTS).
- **Dependency & Supply-Chain Security:**
  - Run `npm audit` (or language-equivalent: `pip audit`, `cargo audit`) to check dependencies for known CVEs.
  - Flag any critical or high severity findings. Do not proceed to Stage 4 with unresolved critical CVEs.

### Stage 4: Security Verification & Negative TDD
- Apply `test-driven-development` to write automated negative security tests:
  - Missing or forged tokens must strictly return `401 Unauthorized`.
  - Attempts to access other users' resource IDs must return `403 Forbidden` or `404 Not Found`.
  - Boundary fuzzing payloads (e.g., `' OR '1'='1`, `<script>`, oversized payloads) must return `400 Bad Request` or `422 Unprocessable Entity`.