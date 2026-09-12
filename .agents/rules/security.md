---
trigger: manual
---

# Application Security & Vulnerability Standards

Execute this pipeline when designing, implementing, or auditing authentication, authorization, APIs, and data boundaries:

## Phase 0: Threat Posture & Zero-Trust Verification
- Apply `security-auditor` or `cc-skill-security-review` during planning to identify trust boundaries and entry vectors.
- **Trust Boundary Visualization (via Archify):**
  - Map untrusted edge boundaries and protected internal zones using `archify architecture`. For auth handshakes (OAuth, JWT, 2FA), generate an `archify sequence` diagram.
- Assume all client headers, query parameters, bodies, and webhook signatures are untrusted.
- Verify that no secrets, service tokens, `.env` files, or private keys are committed to Git.

---

## Active Pipeline (Run on Auth, API, & Endpoint Reviews)

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
- Run `vulnerability-scanner` on modified files:
  - Audit against OWASP Top 10 vectors (Broken Access Control, SSRF, Injection, Security Misconfiguration).
  - Verify error handlers suppress stack traces, system paths, and internal database details in production responses.
  - Enforce secure headers (strict CORS restrictions, CSP, `X-Content-Type-Options: nosniff`, HSTS).

### Stage 4: Security Verification & Negative TDD
- Apply `test-driven-development` to write automated negative security tests:
  - Missing or forged tokens must strictly return `401 Unauthorized`.
  - Attempts to access other users' resource IDs must return `403 Forbidden` or `404 Not Found`.
  - Boundary fuzzing payloads (e.g., `' OR '1'='1`, `<script>`, oversized payloads) must return `400 Bad Request` or `422 Unprocessable Entity`.