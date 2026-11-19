---
name: playwright-skill
description: "Automate browser checks with Playwright and Agent Browser CLI: layout audits, responsive screenshots, console monitoring, and flow verification. Use when verifying live web pages in a browser."
license: MIT
compatibility: Requires Node.js 20+, npm, and network access on first setup to install Playwright and Chromium.
metadata:
  author: lackeyjb
  version: "5.0.0"
allowed-tools: Bash(node:*) Bash(npm:*) Read Write
---

# Playwright Browser Automation

Write and execute focused Playwright scripts for the user's request. Prefer the
skill's executor and helpers, but use the full Playwright API when needed.

## Runner Path

Run the skill directly from the workspace path:

```bash
node .agents/skills/playwright-skill/run.js --audit
```

If installed in a different directory, substitute that path for `.agents/skills/playwright-skill`.

## Workflow

1. **Responsive Layout, Network & Accessibility Audit (`--audit`)**: Run built-in multi-viewport checks (`375x667`, `768x1024`, `1280x800`) with zero inline quoting overhead:
   ```bash
   node .agents/skills/playwright-skill/run.js --audit --screenshots scratch --touch-targets --a11y
   node .agents/skills/playwright-skill/run.js --audit http://localhost:3000
   node .agents/skills/playwright-skill/run.js --audit --session "$SID" --touch-targets --a11y
   ```
   Always checks horizontal overflow (`scrollWidth > innerWidth`), `pageerror`, `console.error`, and HTTP `>=400` / `requestfailed` network failures, exiting non-zero on failure. Optional flags:
   - `--session <sid>`: connects over CDP to an active `agent-browser` session to audit authenticated routes in the same browser without launching Chromium twice (leaves the daemon running).
   - `--cdp <url>`: connects to an explicit CDP endpoint URL.
   - `--storage-state <file>`: loads a saved Playwright storage-state JSON file for authenticated routes.
   - `--a11y`: runs accessibility checks alongside layout checks.
   - `--touch-targets`: flags mobile interactive targets `< 44x44px` (applies the WCAG 2.5.8 exemption for inline prose links).
   - `--screenshots <dir>`: saves per-viewport PNGs (e.g. `scratch`).
2. **Inline Execution (`-e`, `--stdin`, `-b` / `--base64`)**: Run custom DOM/network assertions in-memory without writing scratch `.js` files. Pre-injects `chromium`, `firefox`, `webkit`, `devices`, and `helpers` with top-level `await`:
   ```bash
   # Short one-liner (Bash)
   node .agents/skills/playwright-skill/run.js -e "const browser = await chromium.launch({ headless: true }); try { const page = await browser.newPage(); await page.goto('http://localhost:3000'); console.log(await page.title()); } finally { await browser.close(); }"

   # Multi-line or PowerShell-safe execution via --stdin
   @'
   const browser = await chromium.launch({ headless: true });
   try {
     const page = await browser.newPage();
     await page.goto(await helpers.resolveTargetUrl());
     console.log(await page.title());
   } finally {
     await browser.close();
   }
   '@ | node .agents/skills/playwright-skill/run.js --stdin
   ```
   For PowerShell commands where piping is awkward, pass base64-encoded JS via `-b <base64>` or `--base64 <base64>`. Close the browser inside the snippet before exit.
3. **Fast Target Detection (`--detect-url`)**: Probe `localhost` and `127.0.0.1` across common dev/Apache ports (`3000-3002`, `4321`, `5173`, `5174`, `8080`, `8000`, `8787`, `4200`, `5000`, `9000`, `1234`, `80`) in-process without loading Playwright:
   ```bash
   node .agents/skills/playwright-skill/run.js --detect-url
   ```
4. **Interactive Flow Testing with `agent-browser`**: Drive login and multi-step flows with `agent-browser` (`open`, `snapshot -i`, `click @e1`, `fill @e2`, `errors`, `console`), then hand off `--session "$SID"` to `run.js --audit` before closing the session.
5. **Artifacts Policy**: Save screenshots strictly to `./scratch/*.png` or the artifacts directory. Never write temporary `.js` scripts.

## Setup

Run once:

```bash
cd .agents/skills/playwright-skill && npm run setup
```

This installs Playwright and Chromium. Run `cd .agents/skills/playwright-skill && npm run install-all-browsers` when Firefox or WebKit is required.

## Current Playwright patterns

Prefer locators that describe what a user sees, in this order:

1. `page.getByRole()` with an accessible name
2. `page.getByLabel()` for form controls
3. `page.getByText()` for visible content
4. `page.getByTestId()` when the application provides a test contract

Actions auto-wait for actionability. Use web-first assertions or a locator's
`waitFor()` instead of `waitForSelector()`, fixed sleeps, or `networkidle`.

```javascript
await page.getByLabel('Email').fill('test@example.com');
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/dashboard');
await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
```

## Common tasks

### Responsive checks

```javascript
{
  const os = require('node:os');
  const path = require('node:path');

  const artifactDir = process.env.PW_ARTIFACT_DIR || os.tmpdir();
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(targetUrl);
    await page.screenshot({ path: path.join(artifactDir, `${viewport.name}.png`), fullPage: true });
  }
}
```

### Login flow

Use test credentials supplied by the user. Never invent or expose real
credentials. Verify both the navigation and a post-login element.

```javascript
await page.goto(`${targetUrl}/login`);
await page.getByLabel('Email').fill(process.env.TEST_EMAIL);
await page.getByLabel('Password').fill(process.env.TEST_PASSWORD);
await page.getByRole('button', { name: /sign in|log in/i }).click();
await page.waitForURL('**/dashboard');
await page.getByRole('heading', { name: /dashboard/i }).waitFor();
```

### Connect to an existing Chrome or `agent-browser` session

For authenticated `--audit` runs without launching a second Chromium instance, pass `--session <sid>` (reuses the active `agent-browser` daemon via CDP) or `--cdp <url>`. In custom inline scripts, connect directly over CDP:

```javascript
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const page = browser.contexts()[0].pages()[0];
```

This reuses cookies and extensions in that session. Do not use it for secrets
unless the user explicitly asks; a connected browser has the user's access.

## Helpers

```javascript
const helpers = require(`${process.env.PW_SKILL_DIR}/lib/helpers`);

const url = await helpers.resolveTargetUrl();
const report = await helpers.auditLayout({
  url,
  screenshotDir: 'scratch',
  checkTouchTargets: true,
  checkA11y: true,
});

if (helpers.hasAgentBrowser()) {
  const res = helpers.agentBrowser(['open', url]);
  console.log(res.stdout);
  helpers.agentBrowser(['close']);
}

const servers = await helpers.detectDevServers();
const browser = await helpers.launchBrowser('chromium');
const context = await helpers.createContext(browser);
const page = await context.newPage();
await helpers.handleCookieBanner(page);
await helpers.takeScreenshot(page, 'result');
```

Available helpers are `auditLayout`, `agentBrowser`, `hasAgentBrowser`,
`resolveAgentBrowserBinary`, `detectDevServers`, `resolveTargetUrl`,
`getExtraHeadersFromEnv`, `launchBrowser`, `createContext`,
`handleCookieBanner`, and `takeScreenshot`.
- `auditLayout(options)`: resolves `url`, runs across `viewports` (default `375x667`, `768x1024`, `1280x800`) via headless Chromium, `--session`/`--cdp` CDP handoff, or `--storage-state`, checks horizontal overflow, `console.error`, `pageerror`, and HTTP `>=400`/`requestfailed` network failures, optionally checks `<44x44px` mobile touch targets with WCAG 2.5.8 inline link exemption (`checkTouchTargets: true`), accessibility (`checkA11y: true`), and screenshots (`screenshotDir`), sets `process.exitCode = 1` on failure, and returns the structured report.
- `agentBrowser(args, options)`: invokes the `agent-browser` CLI synchronously without Windows stdio pipe hangs, auto-scoping `--session` via `agent-browser session id --scope worktree --prefix ui` unless `options.session` is provided or `false`, returning `{ status, stdout, stderr }`.

Use Playwright locators and assertions for DOM/network/viewport audits, and `agent-browser` for `@eN` accessibility-tree interactions and multi-step flows.

## Configuration

- `PW_BROWSER`: `chromium`, `firefox`, or `webkit` for `launchBrowser()`.
- `PW_CHANNEL`: installed browser channel such as `chrome` or `msedge`.
- `PW_EXECUTABLE_PATH`: explicit browser executable path.
- `PW_HEADLESS`: `true` or `false` (`--audit` always runs headless unless connected via CDP).
- `SLOW_MO`: action delay in milliseconds.
- `PW_HEADER_NAME` and `PW_HEADER_VALUE`: one extra HTTP header.
- `PW_EXTRA_HEADERS`: JSON object of extra HTTP headers.
- `PW_ARTIFACT_DIR`: directory for helper-generated screenshots (defaults to `scratch` or OS temp dir).

See [API_REFERENCE.md](API_REFERENCE.md) for network interception, API mocking,
authentication state, video, visual checks, device emulation, and CI patterns.
