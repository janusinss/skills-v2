---
trigger: model_decision
description: Application security standards, attack surface minimization, and exploit prevention. Activate for auth, APIs, routing, input validation, file intake, server configs, security headers, and penetration test defense.
---

# Application Security & Exploit Defense Standards

Execute this pipeline when designing, implementing, or auditing web routing, server configurations, authentication, authorization, APIs, data boundaries, and file intake.

---

## Mandatory Security Skill Dispatch Matrix
Before generating security-sensitive code, server configs, or performing audits, inspect the corresponding skill instructions via `view_file`:

| Domain / Attack Vector | Required Skill & Direct Specification Link |
| :--- | :--- |
| **Reconnaissance & Web Proxy** | [ethical-hacking-methodology](.agents/skills/ethical-hacking-methodology/SKILL.md) · [burp-suite-testing](.agents/skills/burp-suite-testing/SKILL.md) |
| **Top 100 Vulns & Injection** | [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md) · [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md) |
| **Auth, Sessions & APIs** | [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md) · [api-security-best-practices](.agents/skills/api-security-best-practices/SKILL.md) |
| **Client XSS & Sanitization** | [frontend-security-coder](.agents/skills/frontend-security-coder/SKILL.md) |
| **Audit, Scanners & TDD** | [security-auditor](.agents/skills/security-auditor/SKILL.md) · [vulnerability-scanner](.agents/skills/vulnerability-scanner/SKILL.md) · [cc-skill-security-review](.agents/skills/cc-skill-security-review/SKILL.md) · [test-driven-development](.agents/skills/test-driven-development/SKILL.md) |

---

## Phase 0: Attack Surface Minimization & Reconnaissance Defense
> **Active Skill**: [ethical-hacking-methodology](.agents/skills/ethical-hacking-methodology/SKILL.md) & [burp-suite-testing](.agents/skills/burp-suite-testing/SKILL.md)

1. **URL Masking & Clean Front-Controller Routing**:
   - **Zero Extension Exposure**: Never expose implementation extensions (`.php`, `.html`, `.htm`, `.asp`, `.jsp`, `.cgi`) or physical paths in URLs.
   - **Front-Controller Architecture**: Route all requests through clean semantic URLs (e.g., `/login`, `/dashboard`, `/api/users/profile`) via `.htaccess` (Apache), `nginx.conf`, or framework routers.
   - **Direct Access Lockdown**: Deny direct public access to physical script files (`/index.php` or `/auth/login.php` must return `404 Not Found` or clean rewrite).
2. **Server Fingerprinting & Header Suppression**:
   - Strip server and runtime headers: Apache (`ServerTokens Prod`, `ServerSignature Off`, `Header unset Server`), PHP (`expose_php = Off`, `header_remove("X-Powered-By")`), Express (`app.disable('x-powered-by')`), Next.js (`poweredByHeader: false`), and custom headers (`X-AspNet-Version`, `X-Generator`, `X-Runtime`).
3. **Directory Browsing & Sensitive File Lockdown**:
   - **Disable Directory Indexing**: Enforce `Options -Indexes` (Apache) and `autoindex off` (Nginx).
   - **Block Dotfiles & Metadata**: Deny web access to `.git/`, `.env*`, `.gitignore`, `.htaccess`, `composer.*`, `package*.json`, `pnpm-lock.yaml`, `*.sql`, `*.sqlite`, `*.db`, `*.log`, `*.bak`, `*.old`, `*.conf`, `*.md`.
4. **Error Suppression & Uniform Auth Responses**:
   - Suppress stack traces, database errors, and internal paths (`C:\xampp\...`, `/var/www/...`) in production responses.
   - Return identical response codes, timings, and error messages (e.g., "Invalid credentials", never "User does not exist") to defeat account enumeration.

---

## Phase 1: Input Boundary & Injection Defense
> **Active Skill**: [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md) & [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **Strict Edge Schema Validation**:
   - Validate all query params, route params, headers, and request bodies against strict schemas (Zod, Pydantic, Joi). Reject unexpected fields.
   - Defeat HTTP Parameter Pollution (HPP) by rejecting duplicate keys or enforcing explicit array handling.
2. **100% Prepared Statements (SQLi & NoSQLi)**:
   - Parameterize all database operations (PDO prepared statements, Prisma, SQLAlchemy, Eloquent).
   - **Zero String Concatenation**: Never interpolate untrusted variables or template literals into SQL strings, table names, or `ORDER BY` clauses.
3. **Command Injection & Shell Ban**:
   - Ban executing system shells (`exec`, `system`, `shell_exec`, `child_process.exec`, `popen`) with user input. Use high-level language SDKs or strict argument arrays.
4. **XML, Template & Deserialization Lockdown**:
   - **Disable XXE**: Disable DTD processing and external entity expansion (`libxml_disable_entity_loader(true)`).
   - **SSTI Defense**: Never evaluate user input directly inside template engines (Twig, Jinja2, Blade).
   - **No Native Deserialization**: Ban `unserialize()`, `pickle.loads()`, `yaml.load()` on untrusted data. Use `JSON.parse` or `json_decode`.

---

## Phase 2: Authentication, Session Security & Anti-Automation
> **Active Skill**: [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md) & [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **Rate Limiting & Lockout**:
   - Enforce sliding-window rate limiting: max 5 failed attempts per 15 minutes per IP/account on auth routes (`/login`, `/register`, `/forgot-password`, `/verify-2fa`). Throttle public search endpoints.
2. **Cryptographic Password Storage**:
   - Hash passwords with Argon2id or bcrypt (cost factor >= 12).
   - Use constant-time comparison (`hash_equals()` in PHP, `crypto.timingSafeEqual()` in Node) for all token/secret checks.
3. **Cookie & Session Hardening**:
   - Session tokens must be high-entropy cryptographically random strings (>=128 bits).
   - Mandatory flags: `HttpOnly; Secure; SameSite=Lax` (or `SameSite=Strict` for sensitive actions); `Path=/`.
   - **Session Fixation Defense**: Regenerate session IDs (`session_regenerate_id(true)`) immediately on login, privilege change, and logout.
4. **CSRF Protection**:
   - Enforce cryptographic anti-CSRF tokens (Synchronizer Token or Double Submit Cookie) on all state-changing methods (`POST`, `PUT`, `PATCH`, `DELETE`).

---

## Phase 3: Authorization & Access Control (BOLA / IDOR / Privilege Escalation)
> **Active Skill**: [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md) & [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **Object-Level Authorization (IDOR / BOLA)**:
   - On every record lookup, update, or deletion, verify tenant ownership against authenticated session state:
     `SELECT * FROM items WHERE id = :item_id AND account_id = :auth_account_id;`
   - Never trust client-supplied `user_id` or `role` parameters in request bodies or query strings.
2. **Direct Reference Masking**:
   - Avoid exposing sequential auto-incrementing integers (`/order/1`). Use UUIDv4 or NanoID strings (`/order/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`).
3. **Function-Level RBAC**:
   - Enforce role and permission checks server-side on every route and controller. UI element hiding is never a security control.

---

## Phase 4: File Intake & Webshell Upload Defense
> **Active Skill**: [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md) & [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **Magic Byte Verification**:
   - Verify file content via binary magic bytes (`mime_content_type()`, `file-type`), never trusting client `Content-Type` headers or file extensions.
2. **Extension Whitelisting & Randomization**:
   - Validate extensions against a strict whitelist (`jpg`, `jpeg`, `png`, `webp`, `pdf`).
   - Immediately rename uploaded files to randomized UUIDs (e.g., `c8f13b2d.webp`). Never retain client filenames on disk.
3. **Execution Lockdown & Storage Isolation**:
   - Store uploads outside the webroot or on an object store (S3, Cloud Storage).
   - If stored locally, disable script execution inside upload directory (`php_flag engine off` and `RemoveHandler .php .phtml .phar` in `.htaccess`). Serve non-media with `Content-Disposition: attachment`.

---

## Phase 5: Transport, Communication & SSRF Lockdown
> **Active Skill**: [api-security-best-practices](.agents/skills/api-security-best-practices/SKILL.md) & [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **SSRF Defense**:
   - Block user-supplied URLs from targeting loopback (`127.0.0.1`, `localhost`), RFC 1918 private CIDRs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`).
   - Enforce an explicit domain allowlist and resolve DNS to verify destination IP before connecting.
2. **TLS & HTTPS Enforcement**:
   - Enforce TLS 1.2+ across all environments. Redirect HTTP to HTTPS via `301 Moved Permanently`.
3. **CORS Restrictions**:
   - Explicitly define allowed origins. Never pair `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`.

---

## Phase 6: Browser-Side & Security Headers Floor
> **Active Skill**: [frontend-security-coder](.agents/skills/frontend-security-coder/SKILL.md) & [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)

1. **Mandatory Security Headers**:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self';
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=(), geolocation=()
   ```
2. **Context-Aware Output Encoding (XSS Defense)**:
   - Automatically encode untrusted data based on context (HTML body, attribute, script, URL).
   - In frontend frameworks, ban raw DOM injection (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`). Sanitize rich HTML using DOMPurify with an explicit tag allowlist.

---

## Phase 7: Automated Auditing & Negative TDD Verification
> **Active Skill**: [security-auditor](.agents/skills/security-auditor/SKILL.md), [vulnerability-scanner](.agents/skills/vulnerability-scanner/SKILL.md), [cc-skill-security-review](.agents/skills/cc-skill-security-review/SKILL.md), [test-driven-development](.agents/skills/test-driven-development/SKILL.md)

1. **Automated Package Audits**:
   - Run `npm audit`, `composer audit`, `pip audit`, or `cargo audit` before deployment. Critical or high vulnerabilities block release.
2. **Negative Security TDD Matrix**:
   - Verify defenses via automated tests:
     - **Reconnaissance**: Direct GET to `/index.php` or `/.env` returns `404 Not Found` or clean rewrite.
     - **Auth Barrier**: Unauthenticated requests to protected endpoints return `401 Unauthorized`.
     - **IDOR**: Accessing another tenant's resource ID returns `403 Forbidden` or `404 Not Found`.
     - **Injection**: Probing SQL parameters with `' OR 1=1 --` returns `400 Bad Request` or empty set (zero SQL leaks).
     - **Brute Force**: Rapid authentication attempts trigger `429 Too Many Requests`.