---
trigger: model_decision
description: Authorized security penetration testing, Strix vulnerability scans, and pre-release security plus critical-journey QA. Activate for dynamic pentesting, exploit validation, Strix runs, or pre-release security audits (for routine UI checks, use UI_Always.md).
---

# Penetrating and Testing: Security Validation & Pre-Release QA

Apply for authorized pentesting, Strix runs, exploit validation, or pre-release security + critical-journey QA. Defensive coding rules live in [security.md](.agents/rules/security.md); routine UI/responsive checks live in [UI_Always.md](.agents/rules/UI_Always.md).

> [!CAUTION]
> **Authorization & Safety**: Test only targets you own or have written authorization to test. Use local dev or isolated staging with synthetic accounts (`tenant-a@example.com`, `tenant-b@example.com`). Exclude destructive endpoints (`/billing/*`, `/payments/*`, bulk delete).

## 1. Role Ownership & Runtime Gate

- **[penetration-tester](.agents/agents/penetration-tester.md)**: owns dynamic security/exploit validation, Strix runs, and automated security test suites.
- **Main agent**: owns ad-hoc UI browser verification (`playwright-skill` + `agent-browser`). Never delegate ad-hoc UI browser checks to subagents (`AGENTS.md` §3).
- **[e2e-runner](.agents/agents/e2e-runner.md)**: reserved for persistent CI E2E suites. **[security-auditor](.agents/agents/security-auditor.md)**: read-only static security review.

Inspect only the 1-2 needed skills via `read_file`:
- **Security**: [penetration-testing-with-strix](.agents/skills/penetration-testing-with-strix/SKILL.md) · [ethical-hacking-methodology](.agents/skills/ethical-hacking-methodology/SKILL.md) · [security-audit](.agents/skills/security-audit/SKILL.md) · [fix-security-vulnerabilities-with-strix](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md) · [ci-security-scanning-with-strix](.agents/skills/ci-security-scanning-with-strix/SKILL.md)
- **Browser / E2E**: [playwright-skill](.agents/skills/playwright-skill/SKILL.md) · [agent-browser](.agents/skills/agent-browser/SKILL.md) · [e2e-testing-patterns](.agents/skills/e2e-testing-patterns/SKILL.md)

**Runtime Prerequisite Gate (Before Strix)**: check `strix --version` plus `docker info` (OSS CLI) or `strix cloud` auth (Cloud).
- **Fallback When `strix` or `docker` Is Absent**: report the missing binary and run manual validation: static review ([security-audit](.agents/skills/security-audit/SKILL.md)), live `curl`/`Invoke-WebRequest` probes (unauth `401`, cross-tenant `403`/`404`, header audit, injection payloads), and the repo's security/integration tests. Never claim Strix executed if absent.

## 2. Area 1: Security & Penetration Testing

1. **Attack Surfaces**: Probe auth/lockout, BOLA/IDOR/RBAC, sessions/CSRF, injection (SQLi/NoSQLi/CMDi/SSTI), mass assignment/rate limits, uploads, SSRF, data leaks, and headers per [security.md](.agents/rules/security.md).
2. **Strix Execution (PowerShell-Safe)**: Always pass `-n` and `--max-budget <USD>` on OSS CLI runs.
   ```powershell
   # OSS CLI (source + staging, or OpenAPI spec + target)
   strix -n -t ./ -t https://staging.example.com --scan-mode standard --max-budget 15 --instruction "Tenant A: userA@test.com. Tenant B: userB@test.com. Focus on IDOR and auth bypass. Exclude /billing."
   strix -n -t ./openapi.yaml -t https://api.staging.example.com --max-budget 20
   # Managed Cloud (no local Docker)
   strix cloud login
   strix cloud domains add --domain staging.example.com --asset-type web_app
   strix cloud domains verify <domain-id>
   strix cloud scans start --engagement-type live_test --domain-ids <domain-id> --wait
   strix cloud scans start --source .
   ```
3. **Fail-Closed Verification & Evidence**:
   - **Never trust exit `0` blindly**: check `strix_runs/<run>/run.json` for `status === "completed"` AND compare `llm_usage.cost` vs `--max-budget` (plus report coverage). Truncated runs can exit `0`; mark incomplete scans unverified.
   - **Tier 1 (Confirmed)**: reproducible PoC (`curl`, script, or HTTP trace). **Tier 2 (Suspected)**: static risk without live proof.
4. **Remediation & Diff-Scoped Re-Test**:
   - Patch `strix_runs/<run>/vulnerabilities.json` (or `strix cloud vulns list`) via [fix-security-vulnerabilities-with-strix](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md).
   - Detect the repo's default branch (never hardcode `origin/main`):
     ```powershell
     $diffBase = (git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>$null)
     if (-not $diffBase) { throw "Set $diffBase to the base branch or re-test via --instruction." }
     strix -n -t ./ --scan-mode quick --scope-mode diff --diff-base $diffBase --max-budget 5
     ```
   - Mark **Resolved** only when the original PoC and re-scan both confirm the exploit fails.

## 3. Area 2: Pre-Release Critical-Journey QA (Main Agent Only)

Run from the **main agent** (never a subagent; delegate persistent CI suites to `@e2e-runner`):
1. **Bounded Scope**: Test critical journeys (auth/redirects, role/`403` gates, primary mutations, empty/error recovery), not every link on every page.
2. **States & Viewport Floor**: Follow [UI_Always.md](.agents/rules/UI_Always.md) (§5 8-state primitive standard and §7 browser verification policy).
3. **Shared-Browser CDP Handoff**:
   ```powershell
   $sid = (agent-browser session id --scope worktree --prefix ui).Trim()
   agent-browser --session $sid open <url>
   agent-browser --session $sid snapshot -i
   agent-browser --session $sid fill @e1 "value"
   agent-browser --session $sid click @e2
   node .agents/skills/playwright-skill/run.js --audit --session $sid --screenshots scratch --touch-targets --a11y
   agent-browser --session $sid errors
   agent-browser --session $sid console
   agent-browser --session $sid close
   ```

## 4. Audit Report Template

Check boxes only after recording evidence; list blocked or unverified paths explicitly:

```markdown
# Penetrating & Pre-Release QA Report
- **Target / Env**: [URL/Path] ([Local/Staging]) | **Tooling**: [Strix OSS / Cloud / Manual curl / Playwright+agent-browser]
- **Strix Run Check**: [run.json status + cost vs --max-budget, or N/A] | **Excluded / Blocked**: [Paths]
| Journey / Route | Persona | Auth/403 & States | Audit (375-1280px, --a11y) | Status |
| :--- | :--- | :---: | :---: | :--- |
| `/login` -> core flow | Anon/User/Admin | PASS/FAIL | PASS/FAIL | PASS/FAIL |
- **[CONFIRMED] VULN-01 (Sev, CWE)**: `<endpoint>` | PoC: `<curl>` | Fix: `<root cause>` | Re-test: `<PASS/FAIL>`
- [ ] High/Critical findings patched per `security.md` and re-tested (`run.json` completed; PoC fails).
- [ ] Critical journeys clean: zero console/HTTP>=400 errors and clean 375-1280px + `--a11y` audit.
- [ ] Blocked or unverified routes documented above.
```
