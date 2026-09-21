---
trigger: model_decision
description: Application security standards, attack surface minimization, and exploit prevention.
---

# Application Security & Exploit Defense Standards

Execute this pipeline when designing, implementing, or auditing routing, server configs, auth, APIs, data boundaries, and file intake. For dynamic penetration testing and functional QA, see [penetrating-and-testing.md](penetrating-and-testing.md).

---

## 1. Security Skill Dispatch Matrix
Inspect target skills via `view_file` before generating security-sensitive code:

| Objective / Surface | Required Skill Link |
| :--- | :--- |
| **Code Vulnerabilities & Pentesting** | [find-security-vulnerabilities-in-code](.agents/skills/find-security-vulnerabilities-in-code/SKILL.md) · [penetration-testing-with-strix](.agents/skills/penetration-testing-with-strix/SKILL.md) |
| **APIs & OWASP API 2023** | [api-security-testing](.agents/skills/api-security-testing/SKILL.md) · [api-security-best-practices](.agents/skills/api-security-best-practices/SKILL.md) |
| **Web Apps & OWASP Top 10** | [web-app-penetration-testing](.agents/skills/web-app-penetration-testing/SKILL.md) · [owasp-top-10-testing](.agents/skills/owasp-top-10-testing/SKILL.md) · [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md) |
| **Auth, Sessions & IDOR** | [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md) · [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md) |
| **Remediation & CI/CD Gates** | [fix-security-vulnerabilities-with-strix](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md) · [ci-security-scanning-with-strix](.agents/skills/ci-security-scanning-with-strix/SKILL.md) |

---

## Phase 0: Attack Surface Minimization & Reconnaissance Defense
> **Skills**: [find-security-vulnerabilities-in-code](.agents/skills/find-security-vulnerabilities-in-code/SKILL.md) · [ethical-hacking-methodology](.agents/skills/ethical-hacking-methodology/SKILL.md)

1. **Routing & URL Masking**:
   - Zero script extensions in URLs (`.php`, `.asp`, `.jsp`, `.cgi`, `.py`). All dynamic endpoints use clean semantic paths (`/login`, `/api/v1/orders`).
   - Static asset folders (`/assets/`, `/public/`) serve static files (`.css`, `.js`, `.png`, `.svg`, `.webp`) with explicit cache headers.
   - Block direct access to physical script files in webroots (requests to `/index.php` return `404 Not Found`).
2. **Server Fingerprint Suppression**:
   - Strip runtime headers: Apache (`ServerTokens Prod`, `ServerSignature Off`, `Header unset Server`), PHP (`expose_php = Off`), Express (`app.disable('x-powered-by')`), Next.js (`poweredByHeader: false`), and version banners (`X-AspNet-Version`, `X-Runtime`).
3. **Directory Browsing & Sensitive Files**:
   - Enforce `Options -Indexes` (Apache) and `autoindex off` (Nginx).
   - Deny web access to `.git/`, `.env*`, `.gitignore`, `.htaccess`, `composer.*`, `package*.json`, `skills-lock.json`, `*.sql`, `*.sqlite`, `*.db`, `*.log`, `*.bak`, `*.conf`, `*.md`.
4. **Error & Enumeration Suppression**:
   - Suppress stack traces, SQL errors, and system paths (`C:\xampp\...`, `/var/www/...`) in user responses.
   - Return identical response codes, generic error messages ("Invalid credentials"), and constant-time delays across valid and invalid accounts.

---

## Phase 1: Input Boundary & Injection Defense
> **Skills**: [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md) · [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **Edge Schema Validation**:
   - Validate query params, route args, headers, and request bodies against strict schemas (Zod, Pydantic, Joi). Reject unrecognized keys (`extra: forbid`).
   - Defeat HTTP Parameter Pollution (HPP) by rejecting duplicate keys or enforcing explicit array handling in middleware.
2. **100% Prepared Statements (SQLi / NoSQLi)**:
   - Parameterize all database operations (PDO, Prisma, SQLAlchemy, Eloquent).
   - Zero string concatenation: Never interpolate variables or template literals into SQL queries, table names, or `ORDER BY` clauses. Use strict allowlists for dynamic identifiers.
3. **Command Injection Ban**:
   - Ban executing shell strings (`exec`, `system`, `shell_exec`, `child_process.exec`, `popen`) with user input.
   - Use language SDKs or strict argument vectors (`spawn(cmd, [args], { shell: false })`).
4. **XXE, SSTI & Deserialization Lockdown**:
   - Disable external entity expansion (`libxml_disable_entity_loader(true)`).
   - Never pass user input to template engine compilation methods (Twig, Jinja2, Blade).
   - Ban native deserialization (`unserialize()`, `pickle.loads()`, `yaml.load()`) on untrusted data; use `JSON.parse` or safe schema decoders.

---

## Phase 2: Authentication, Session Security & Anti-Automation
> **Skills**: [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md) · [owasp-top-10-testing](.agents/skills/owasp-top-10-testing/SKILL.md)

1. **Rate Limiting & Lockout**:
   - Auth routes (`/login`, `/register`, `/forgot-password`, `/verify-2fa`): max 5 failed attempts per 15 min per IP/account.
   - Public mutation and search endpoints: max 60 requests per minute per IP.
2. **Password Storage & Timing Defense**:
   - Hash passwords with Argon2id (`memory_cost=65536`, `time_cost=4`, `threads=1`) or bcrypt (work factor >= 12).
   - Use constant-time comparison (`hash_equals()`, `crypto.timingSafeEqual()`) for all token and signature checks.
3. **Cookie & Session Hardening**:
   - Generate session tokens using high-entropy CSPRNG (>=128 bits).
   - Flags: `Set-Cookie: session_id=<token>; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400` (`SameSite=Strict` for admin areas).
   - Regenerate session IDs on login, privilege change, and logout (`session_regenerate_id(true)`).
4. **CSRF Protection**:
   - Enforce cryptographic anti-CSRF tokens (Synchronizer Token or Double-Submit Cookie) on all state-changing methods (`POST`, `PUT`, `PATCH`, `DELETE`).

---

## Phase 3: Authorization & Access Control (BOLA / IDOR / RBAC)
> **Skills**: [api-security-testing](.agents/skills/api-security-testing/SKILL.md) · [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md)

1. **Object-Level Authorization (IDOR / BOLA)**:
   - On every record lookup, update, or deletion, verify tenant ownership against authenticated session identity:
     `SELECT * FROM items WHERE id = :item_id AND organization_id = :auth_org_id;`
   - Never trust client-supplied `user_id`, `org_id`, or `role` parameters in bodies or query strings.
2. **Direct Reference Masking**:
   - Replace sequential auto-incrementing integers (`/order/1042`) with non-enumerable UUIDv4 or NanoID strings (`/order/7b6f2e84-1d3a-4c91-9e20-5c742f8b0e51`).
3. **Function-Level RBAC**:
   - Enforce role and permission checks server-side on every route and controller. UI element hiding is never a security control.

---

## Phase 4: File Intake & Webshell Upload Defense
> **Skills**: [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md) · [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **Binary Magic Byte Verification**:
   - Verify file payloads via binary signature inspection (`mime_content_type()`, `file-type`), never trusting client `Content-Type` headers or file extensions.
2. **Extension Whitelisting & Randomization**:
   - Restrict extensions to an explicit allowlist (`jpg`, `jpeg`, `png`, `webp`, `pdf`).
   - Rename uploaded files to randomized UUIDs on save (`c8f13b2d.webp`). Never retain client-provided filenames on disk.
3. **Execution Lockdown & Storage Isolation**:
   - Store uploads outside webroot or in dedicated object storage (S3, Cloud Storage).
   - If stored locally, disable script execution (Apache: `php_flag engine off`, `RemoveHandler .php .phtml .phar`). Serve non-media with `Content-Disposition: attachment`.

---

## Phase 5: Transport, Communication & SSRF Lockdown
> **Skills**: [api-security-best-practices](.agents/skills/api-security-best-practices/SKILL.md) · [api-security-testing](.agents/skills/api-security-testing/SKILL.md)

1. **SSRF Defense**:
   - Block user-supplied URLs from targeting loopback (`127.0.0.1`, `localhost`), RFC 1918 CIDRs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`).
   - Enforce protocol allowlists (`https://` only) and pre-resolve DNS before establishing TCP connections.
2. **TLS & CORS Enforcement**:
   - Enforce TLS 1.2+ across all environments. Issue `301 Moved Permanently` redirects from HTTP to HTTPS.
   - Explicitly declare allowed origins in CORS headers. Never pair `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`.

---

## Phase 6: Browser Hardening & Security Headers
> **Skills**: [frontend-security-coder](.agents/skills/frontend-security-coder/SKILL.md) · [web-app-penetration-testing](.agents/skills/web-app-penetration-testing/SKILL.md)

1. **Mandatory Security Headers**:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=(), geolocation=()
   ```
2. **Context-Aware Output Encoding (XSS Defense)**:
   - Apply context-specific encoding (HTML body, attribute, JavaScript context, URI component).
   - In frontend frameworks (React, Vue, Svelte), ban raw DOM insertion (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`). Sanitize rich text using DOMPurify with an explicit tag allowlist.

---

## Phase 7: Defensive Verification & TDD Gates
> **Skills**: [ci-security-scanning-with-strix](.agents/skills/ci-security-scanning-with-strix/SKILL.md) · [fix-security-vulnerabilities-with-strix](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md)

1. **Automated Dependency Audits**:
   - Run dependency audits (`npm audit`, `composer audit`, `pip audit`) before builds. Critical or High vulnerabilities block releases.
2. **Negative Security Unit Tests**:
   - Unauthenticated requests to protected endpoints return `401 Unauthorized`.
   - Cross-tenant object ID queries return `403 Forbidden` or `404 Not Found`.
   - Probing SQL inputs with `' OR 1=1 --` returns clean validation errors with zero SQL leakage.
   - Rapid authentication failures trigger HTTP `429 Too Many Requests`.
3. **Remediation Standard (Ingesting `vulnerabilities.json`)**:
   - Ingest findings from `strix_runs/<run-name>/vulnerabilities.json` via [`fix-security-vulnerabilities-with-strix`](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md).
   - Patch architectural root causes (parameterization, centralized tenant filters) rather than string filtering. For live penetration testing workflows, see [penetrating-and-testing.md](penetrating-and-testing.md).