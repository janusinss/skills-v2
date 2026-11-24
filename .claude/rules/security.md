# Application Security & Exploit Defense Standards

Apply when building or auditing routing, server configs, auth, APIs, data boundaries, uploads, or headers. For dynamic pentesting and Strix runs, see [penetrating-and-testing.md](penetrating-and-testing.md).

## 1. Security Skill Dispatch Matrix
Inspect only the 1-2 skills matching the active surface using the Read tool:

| Surface | Skill / Agent |
| :--- | :--- |
| **Static Audit & Methodology** | [security-audit](../skills/security-audit/SKILL.md) · [ethical-hacking-methodology](../skills/ethical-hacking-methodology/SKILL.md) |
| **APIs & OWASP Top 10** | [api-security-best-practices](../skills/api-security-best-practices/SKILL.md) · [top-web-vulnerabilities](../skills/top-web-vulnerabilities/SKILL.md) |
| **Auth & Browser Security** | [auth-implementation-patterns](../skills/auth-implementation-patterns/SKILL.md) · [frontend-security-coder](../skills/frontend-security-coder/SKILL.md) |
| **Subagents** | [security-auditor](../agents/security-auditor.md) · [penetration-tester](../agents/penetration-tester.md) · [silent-failure-hunter](../agents/silent-failure-hunter.md) · [skeptic](../agents/skeptic.md) |

## Phase 0: Attack Surface & Recon Defense
1. **Routing & File Exposure**: Use clean paths without raw script extensions; serve static assets from dedicated public folders. Disable directory listing (`Options -Indexes` / `autoindex off`) and deny web access to `.git/`, `.env*`, `.htaccess`, manifests/lockfiles, `*.sql`/`*.sqlite`/`*.db`, logs, backups, and configs.
2. **Fingerprint Suppression**: Strip server/runtime banners where supported (Apache `ServerTokens Prod` + `ServerSignature Off`, PHP `expose_php = Off`, Express `app.disable('x-powered-by')`, Next.js `poweredByHeader: false`, `X-AspNet-Version`/`X-Runtime`).
3. **Error & Enumeration Defense**: Suppress stack traces, raw SQL errors, and filesystem paths in production. Return uniform status codes and generic auth errors ("Invalid credentials") without account-existence timing or message leaks.

## Phase 1: Input Boundary & Injection Defense
1. **Schema Validation**: Validate query, path, header, and body inputs with strict schemas (Zod, Pydantic, Joi, Valibot); forbid unknown keys (`strict()`/`extra: forbid`) and reject/normalize duplicate params (HPP).
2. **Parameterized Queries**: Parameterize 100% of DB operations (PDO, Prisma, SQLAlchemy, Eloquent). Never interpolate variables into SQL, table names, or `ORDER BY`; map dynamic identifiers via a server allowlist.
3. **Command Injection Ban**: Never pass user input to shell strings (`exec`, `system`, `shell_exec`, `child_process.exec`, `popen`). Use native SDKs or argument vectors with `shell: false`.
4. **XXE, SSTI & Deserialization**: Disable XML external entities/DTDs: on PHP 8+ rely on modern libxml defaults and disallow `LIBXML_NOENT`/`LIBXML_DTDLOAD`; use `defusedxml` in Python; disable DTDs in Java/Node parsers. Never compile user input as a template. Ban unsafe deserialization (`unserialize()`, `pickle.loads()`, `yaml.load()`); use JSON or `yaml.safe_load()`.

## Phase 2: Auth, Sessions & Anti-Automation
1. **Tiered Rate Limits**: Calibrate rate limits and progressive backoff to endpoint risk (strict per-IP/account budgets on auth, recovery, MFA; bounded quotas on public mutations/search).
2. **Passwords & Timing**: Hash passwords with Argon2id (OWASP params) or bcrypt (cost >= 12). Compare tokens and HMACs in constant time (`crypto.timingSafeEqual()`, `hmac.compare_digest()`, `hash_equals()`).
3. **Sessions & CSRF**: Issue CSPRNG tokens (>=128 bits), rotate IDs on login/privilege change/logout, and set `Secure; HttpOnly; SameSite=Lax; Path=/` (`SameSite=Strict` for admin; omit `Secure` only on plain HTTP localhost). Enforce anti-CSRF tokens or `Origin`/Fetch-Metadata checks on cookie-auth mutations.
4. **Client-Side Passkeys (WebAuthn)**: Query [modern-web-guidance](../skills/modern-web-guidance/SKILL.md) (`search`->`retrieve`) for Baseline browser support and fallbacks when implementing Passkeys.

## Phase 3: Authorization (BOLA / IDOR / RBAC)
1. **Object-Level Authz**: Scope every lookup, update, and delete to the server-verified principal/tenant (`WHERE id = :item_id AND organization_id = :auth_org_id`). Never trust client-supplied `user_id`, `org_id`, or `role`.
2. **Opaque IDs & RBAC**: Prefer non-enumerable IDs (UUIDv7 for B-tree locality, UUIDv4, NanoID) on external URLs as defense-in-depth, never as a substitute for server-side RBAC on every route/resolver.

## Phase 4: File Intake & Upload Defense
1. **Validation & Naming**: Check binary magic bytes (`file-type`, `python-magic`, `finfo`), enforce a per-feature MIME/extension allowlist + size cap, and save under randomized server filenames.
2. **Isolation & Non-Execution**: Store uploads outside webroot or in separate-origin object storage (S3/GCS/R2). If local, block script execution safely for PHP-FPM/Nginx/Apache (Nginx: `location ~* \.(php|phtml|phar)$ { return 403; }`; Apache: `<FilesMatch "\.(php|phtml|phar)$"> Require all denied </FilesMatch>` or `SetHandler none`), and serve downloads with `Content-Disposition: attachment` + `X-Content-Type-Options: nosniff`.

## Phase 5: Transport, CORS & SSRF
1. **SSRF Defense**: Block user URLs targeting loopback (`127.0.0.0/8`, `::1`), RFC 1918, cloud metadata (`169.254.169.254`, `fe80::/10`), and non-HTTP(S) schemes; pre-resolve DNS and re-validate IPs on redirects.
2. **TLS & CORS**: Enforce TLS 1.2+ with HTTP->HTTPS `301` in production. Use explicit CORS allowlists; never combine `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`.

## Phase 6: Browser Hardening & Headers
1. **Environment-Aware Headers**: Emit `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and framing defense (`frame-ancestors 'none'` + `X-Frame-Options: DENY`).
   - **CSP**: Use per-request nonces/hashes with `'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'` over blanket `'unsafe-inline'`; adapt `script-src`/`connect-src` for framework dev HMR while keeping production strict.
   - **HSTS Guard**: Emit `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` only on verified production HTTPS origins with full subdomain HTTPS; omit on HTTP local dev and omit `preload` until confirmed.
2. **XSS Defense**: Rely on framework auto-escaping; avoid raw DOM sinks (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`) or sanitize rich HTML via DOMPurify with an explicit allowlist. Query [modern-web-guidance](../skills/modern-web-guidance/SKILL.md) when adopting the native HTML Sanitizer API.

## Phase 7: Verification & Optional Pentest Handoff
1. **Dependency Audits (With Fallback)**: Check installed binaries first (`npm audit`, `pip-audit`, `composer audit`, `cargo audit`, `govulncheck`); High/Critical findings block release unless accepted. When `pip-audit`, `composer`, or `strix` is absent, report the gap and fall back to lockfile inspection + static review.
2. **Negative Security Tests**: Assert `401` unauthenticated, `403`/`404` cross-tenant IDs, clean validation errors on `' OR 1=1 --`, and `429` on auth bursts.
3. **Optional Pentest Handoff**: For dynamic Strix scans or patching `strix_runs/<run>/vulnerabilities.json` via [fix-security-vulnerabilities-with-strix](../skills/fix-security-vulnerabilities-with-strix/SKILL.md), hand off to [penetrating-and-testing.md](penetrating-and-testing.md).
