---
trigger: manual
description: End-to-end security penetration testing, Strix vulnerability validation, and functional web-flow verification.
---

# Penetrating and Testing: Security Validation & Functional Flow QA

Execute this rule when conducting authorized penetration testing, vulnerability validation, or full-surface functional quality assurance on web apps, APIs, and client flows. Ongoing defensive coding standards remain defined in [security.md](security.md).

> [!CAUTION]
> **Authorization & Non-Destructive Safeguards**: Only test environments and codebases you own or have explicit written authorization to test. Default to isolated staging or local dev environments. Never test against live customer data or execute destructive actions.

---

## 1. Prerequisites & Skill Discovery Gate
Before initiating any security or functional test:

1. **Skill Discovery Verification**:
   - Verify that target Strix skills exist in `[.agents/skills/](.agents/skills)`:
     - Core Pentesting: [`penetration-testing-with-strix`](.agents/skills/penetration-testing-with-strix/SKILL.md) · [`managed-pentesting-with-strix`](.agents/skills/managed-pentesting-with-strix/SKILL.md)
     - Surface Checkers: [`api-security-testing`](.agents/skills/api-security-testing/SKILL.md) · [`web-app-penetration-testing`](.agents/skills/web-app-penetration-testing/SKILL.md) · [`find-security-vulnerabilities-in-code`](.agents/skills/find-security-vulnerabilities-in-code/SKILL.md)
     - Compliance & Patching: [`owasp-top-10-testing`](.agents/skills/owasp-top-10-testing/SKILL.md) · [`fix-security-vulnerabilities-with-strix`](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md) · [`ci-security-scanning-with-strix`](.agents/skills/ci-security-scanning-with-strix/SKILL.md)
   - *Limitation Protocol*: If Strix skills are missing, report that Strix automation is unavailable and fall back to manual checklist verification. Never claim an automated exploit was validated if Strix did not execute.
2. **Safety & Data Protection**:
   - **Environment Isolation**: Test local containers (`localhost`, `host.docker.internal`) or dedicated staging domains.
   - **Synthetic Test Accounts**: Use seeded test identities (`tenant-a@example.com`, `tenant-b@example.com`). Zero access to real user data or PII.
   - **Out-of-Scope Exclusion**: Explicitly exclude destructive paths via `--instruction` (e.g. `/billing/*`, `/payments/*`, bulk user deletions).
   - **Spend & Turn Caps**: Always pass `--max-budget <USD>` (e.g. `$10–$20`) and `--non-interactive` (`-n`) to prevent runaway executions.

---

## 2. Area 1: Security & Penetration Testing Workflow

### Step 1.1: Attack Surface Mapping
Target the 8 critical web attack surfaces:
1. **Authentication**: Brute-force resistance, credential stuffing, password reset flows, MFA bypass, timing attacks.
2. **Authorization & Access Control**: Broken Object-Level Authorization (BOLA/IDOR) across tenant tokens, privilege escalation (`user` reaching `/admin/*`).
3. **Session Management**: Session fixation, token revocation on logout, cookie flags (`Secure`, `HttpOnly`, `SameSite`), token entropy.
4. **Input Boundaries & Injection**: SQLi in query params/bodies, command injection, NoSQLi, Server-Side Template Injection (SSTI).
5. **API Security**: Mass assignment on `PATCH`/`POST`, excessive data exposure in JSON, unconstrained resource consumption.
6. **File Intake & Webshells**: Magic byte verification, path traversal on upload filenames (`../../shell.php`), storage outside webroot.
7. **Sensitive Data Exposure**: Secrets in client bundles, debug mode leaks, stack traces in error responses, missing CORS restrictions.
8. **Security Configuration**: Missing security headers (CSP, HSTS, X-Frame-Options), exposed `.git` or `.env` files.

### Step 1.2: Strix Autonomous Pentest Execution
Select the operational mode matching the environment:
- **Local Source & API Fuzzing**:
  ```bash
  strix -n -t ./ -t https://staging.example.com --scan-mode standard --max-budget 15 \
    --instruction "Tenant A: userA@test.com (org 101). Tenant B: userB@test.com (org 202). Focus on cross-tenant IDOR and auth bypass. Exclude /billing."
  ```
- **API Spec Direct Test**:
  ```bash
  strix -n -t ./openapi.yaml -t https://api.staging.example.com --max-budget 20
  ```
- **Managed Cloud Run** (no local Docker required):
  ```bash
  strix cloud scans start -t https://staging.example.com --max-budget 20
  ```

### Step 1.3: Evidence Classification
- **Confirmed Vulnerability (Tier 1)**: Must have an executable Proof-of-Concept (curl request, script, or HTTP response log) proving unauthorized data access or code execution.
- **Suspected Vulnerability (Tier 2)**: Code patterns that appear risky (e.g. missing middleware) but could not be dynamically verified against a live target.

### Step 1.4: Output Artifact & Automated Remediation Loop
1. **Target Artifact**: Strix automatically outputs all proven findings to `strix_runs/<run-name>/vulnerabilities.json` (contains file paths, line numbers, CWE tags, and `fix_before` / `fix_after` diffs).
2. **Automated Fix Pipeline**: Feed `strix_runs/<run-name>/vulnerabilities.json` directly into [`fix-security-vulnerabilities-with-strix`](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md) to apply root-cause patches adhering to [security.md](security.md).
3. **Re-Test Verification**: Re-test the patched files using diff-scoped verification:
   ```bash
   strix -n -t ./ --scan-mode quick --scope-mode diff --diff-base origin/main --max-budget 5
   ```
4. A vulnerability is only marked **Resolved** when the re-scan verifies the exploit fails.

---

## 3. Area 2: Complete Functional & Web-Flow QA Testing

All web applications must undergo end-to-end user-flow validation to ensure flawless functionality alongside security.

### Step 2.1: Surface Inventory Establishment
Before executing functional tests, build an explicit inventory:
- **Pages & Routes**: Public landing, auth routes (`/login`, `/register`), authenticated dashboard views, settings, CRUD screens.
- **User Roles & Personas**: Anonymous visitor, regular user, organizational admin, system super-admin.
- **Critical End-to-End Journeys**: Registration → email verification → login → core workflow → settings update → logout.

### Step 2.2: Interactive Element & State Verification
Audit every interactive component across 5 mandatory operational states:
1. **Interactive Elements**:
   - Test every link, button, menu item, dropdown, modal trigger, and tab.
   - Verify clicking initiates expected action; flag dead buttons or interactions that do nothing.
   - Verify redirects (unauthenticated `/dashboard` access redirects to `/login` with `returnUrl`).
2. **Form & Data Validation**:
   - Verify client and server validation error messages on empty inputs, invalid formats, and boundary lengths.
3. **The 5 UI States**:
   - **Success State**: Valid submissions display affirmative feedback (toasts, success banners, updated tables).
   - **Failure State**: Inline field-level error messages display without breaking layout.
   - **Empty State**: Zero-data screens display helpful empty state illustrations and clear call-to-actions.
   - **Loading State**: Spinners or skeleton loaders display during in-flight requests; submit buttons disable.
   - **Permission-Denied State**: Graceful `403 Forbidden` screens or redirects when attempting unauthorized actions.

### Step 2.3: Error & Console Telemetry Audits
- **Zero Broken Routes (404s)**: Crawl all internal links to verify zero broken anchors (`href="#"` or broken URLs).
- **Zero Uncaught Exceptions**: Monitor browser console and server logs; flag uncaught exceptions and unhandled promise rejections.
- **Zero Unhandled Network Failures**: Ensure failed API calls (`500`, `502`) render user-facing retry states instead of infinite loaders.

### Step 2.4: Layout Integrity & Accessibility
- Follow [`UI_Always.md`](UI_Always.md) standard via inline Playwright audit across 375px (mobile), 768px (tablet), and 1280px (desktop):
  - Check zero horizontal overflow (`scrollWidth > innerWidth`).
  - Check minimum 44×44px touch targets on mobile.
  - Check keyboard navigation (Tab order, visible `:focus-visible` rings, Escape closes modals).

---

## 4. Standardized Reporting Format
Every execution must produce a structured Markdown audit report:

```markdown
# Penetrating & Functional Testing Report

## 1. Scope & Tooling
- **Target**: [URL or Local Path] | **Environment**: [Staging / Local Container]
- **Scope**: [In-Scope Routes & Personas] | Excluded: [Out-of-Scope Paths]
- **Tooling Used**: [Strix / Playwright / Manual Checks]

## 2. Functional & Web-Flow Matrix
| Route / Flow | Persona | Success State | Error State | Loading / Empty | Responsive (375-1280px) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `/login` | Anonymous | PASS | PASS | N/A | OK (Zero overflow) | PASS |
| `/dashboard` | User | PASS | PASS | PASS | OK | PASS |
| `/admin/users` | Regular User | PASS (403 redirected) | PASS | N/A | OK | PASS |

- **Untested / Blocked Routes**: [List any routes not tested due to missing credentials or unseeded data]

## 3. Security Findings & Proof-of-Concept Log
### [CONFIRMED] VULN-01: Cross-Tenant IDOR on GET /api/v1/orders/{id}
- **Severity**: High (CVSS 8.1) | **CWE**: CWE-639
- **Proof-of-Concept Request**: `curl -H "Authorization: Bearer <Tenant_B>" https://staging.example.com/api/v1/orders/101`
- **Impact**: Tenant B retrieved order details belonging exclusively to Tenant A.
- **Remediation**: Enforce `WHERE id = :id AND organization_id = :auth_org_id` in repository.
- **Re-Test Verification**: Verified fixed via diff-scan in run `strix_runs/run-102`.

### [SUSPECTED] SUSP-01: Potential Missing Rate Limit on Password Reset
- **Severity**: Medium | **Status**: Theoretical (unvalidated in quick mode).

## 4. Sign-Off & Completion Criteria
- [x] All high/critical confirmed vulnerabilities resolved and re-tested.
- [x] Zero console errors across all audited functional journeys.
- [x] Zero horizontal layout overflow across 375px, 768px, and 1280px viewports.
```

---

## 5. Completion Criteria
A testing cycle is complete only when:
1. **Evidence Recorded**: Every passed flow and confirmed vulnerability has recorded test evidence. No blanket claims without telemetry.
2. **Defensive Alignment**: Any discovered vulnerability is patched according to [security.md](security.md) and verified with an exploit re-test.
3. **Traceability**: Untested or blocked paths are explicitly cataloged in the report.
