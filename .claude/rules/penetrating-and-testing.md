---
trigger: model_decision
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
   - Verify that target security and QA skills exist in `.claude/skills/` (inspect only the 1–2 skills matching the active target surface):
     - Core Pentesting & AppSec: [`penetration-testing-with-strix`](../skills/penetration-testing-with-strix/SKILL.md) · [`application-security-testing`](../skills/application-security-testing/SKILL.md) · [`ethical-hacking-methodology`](../skills/ethical-hacking-methodology/SKILL.md)
     - Compliance & Patching: [`fix-security-vulnerabilities-with-strix`](../skills/fix-security-vulnerabilities-with-strix/SKILL.md) · [`ci-security-scanning-with-strix`](../skills/ci-security-scanning-with-strix/SKILL.md)
     - E2E & Browser QA: [`e2e-testing-patterns`](../skills/e2e-testing-patterns/SKILL.md) · [`playwright-skill`](../skills/playwright-skill/SKILL.md) · [`agent-browser`](../skills/agent-browser/SKILL.md)
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
2. **Automated Fix Pipeline**: Feed `strix_runs/<run-name>/vulnerabilities.json` directly into [`fix-security-vulnerabilities-with-strix`](../skills/fix-security-vulnerabilities-with-strix/SKILL.md) to apply root-cause patches adhering to [security.md](security.md).
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
Audit every interactive component across all 8 interactive primitive states and key screen states per [UI_Always.md](UI_Always.md):
1. **Interactive Elements**:
   - Test every link, button, menu item, dropdown, modal trigger, and tab using isolated `@eN` sessions in [`agent-browser`](../skills/agent-browser/SKILL.md).
   - Verify clicking initiates expected action; flag dead buttons or interactions that do nothing.
   - Verify redirects (unauthenticated `/dashboard` access redirects to `/login` with `returnUrl`).
2. **Form & Data Validation**:
   - Verify client and server validation error messages on empty inputs, invalid formats, and boundary lengths.
3. **8 Interactive States + Screen States**:
   - **8 Interactive Primitive States**: Verify `Default`, `Hover`, `Focus-Visible`, `Active`, `Loading` (spinners/locked width, disabled submit), `Error` (inline errors + `aria-invalid="true"` without breaking layout), `Success` (affirmative toasts/banners/updated tables), and `Disabled` (`disabled` + `not-allowed`).
   - **Empty (Zero-Data) State**: Screens with no records display helpful empty-state guidance and clear call-to-actions.
   - **Permission-Denied (403) State**: Graceful `403 Forbidden` screens or redirects when attempting unauthorized actions.

### Step 2.3: Error & Console Telemetry Audits
- **Zero Broken Routes (404s)**: Crawl all internal links to verify zero broken anchors (`href="#"` or broken URLs).
- **Zero Uncaught Exceptions**: Monitor browser console and server logs; flag uncaught exceptions and unhandled promise rejections.
- **Zero Unhandled Network Failures**: Ensure failed API calls (`500`, `502`) render user-facing retry states instead of infinite loaders.

### Step 2.4: Layout Integrity & Accessibility
- Pair [`playwright-skill`](../skills/playwright-skill/SKILL.md) (`node .claude/skills/playwright-skill/run.js --audit --screenshots scratch --touch-targets`) with [`agent-browser`](../skills/agent-browser/SKILL.md) isolated `@eN` multi-step flow testing per [UI_Always.md](UI_Always.md#7-browser-verification-policy) across 375px (mobile), 768px (tablet), and 1280px (desktop):
  - Check zero horizontal overflow (`scrollWidth > innerWidth`).
  - Check minimum 44×44px touch targets on mobile.
  - Check keyboard navigation (Tab order, visible `:focus-visible` rings, Escape closes modals).

---

## 4. Sign-Off & Completion Criteria
Produce a structured Markdown audit report; a cycle is complete only when evidence is recorded for every passed flow and confirmed finding, vulnerabilities are patched per [security.md](security.md) and re-tested, and untested or blocked paths are cataloged:

```markdown
# Penetrating & Functional Testing Report
## 1. Scope & Tooling
- **Target / Env**: [URL or Path] ([Staging / Local]) | **Tooling**: [Strix / Playwright / agent-browser]
- **Scope**: [In-Scope Routes & Personas] | **Excluded / Untested**: [Out-of-Scope or Blocked Paths]
## 2. Functional & Web-Flow Matrix
| Route / Flow | Persona | States (8 + Empty/403) | Responsive (375–1280px) | Status |
| :--- | :--- | :---: | :---: | :--- |
| `/login` · `/dashboard` · `/admin/*` | Anon / User / Admin | PASS | OK (Zero overflow) | PASS |
## 3. Security Findings & Proof-of-Concept Log
- **[CONFIRMED] VULN-01 (High, CWE-639)**: `GET /api/v1/orders/{id}` IDOR — PoC: `curl -H "Authorization: Bearer <Tenant_B>" .../101` | Fix: tenant filter | Re-test: PASS (`strix_runs/run-102`).
- **[SUSPECTED] SUSP-01 (Medium)**: Potential missing rate limit on password reset (theoretical).
## 4. Sign-Off & Completion Criteria
- [x] **Evidence & Defensive Alignment**: Confirmed high/critical vulnerabilities patched per `security.md` and re-tested; flow telemetry recorded.
- [x] **Browser & Traceability**: Zero console errors or 375–1280px overflow; blocked/untested routes cataloged above.
```
