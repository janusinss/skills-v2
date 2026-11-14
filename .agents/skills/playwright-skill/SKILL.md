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

## Path resolution

This skill can be installed in several locations, so resolve its directory
first. Set `SKILL_DIR` to the directory containing this SKILL.md file, then run
the commands below as written:

```bash
export SKILL_DIR=<absolute path of the directory containing this SKILL.md>
export TMP_DIR="$(node -p 'require("node:os").tmpdir()')"
```

If shell state does not persist between commands, substitute the literal paths
for `$SKILL_DIR` and `$TMP_DIR` in each command instead.

Common installation paths:

- Plugin system: `~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill`
- Manual global: `~/.claude/skills/playwright-skill`
- Project-specific: `<project>/.claude/skills/playwright-skill`

## Workflow

1. **Responsive Layout & Console Audit (`--audit`)**: Run built-in multi-viewport checks (375x667, 768x1024, 1280x800) with zero inline quoting overhead:
   ```bash
   node "$SKILL_DIR/run.js" --audit --screenshots scratch --touch-targets
   node "$SKILL_DIR/run.js" --audit http://localhost:3000
   ```
   Checks horizontal overflow (`scrollWidth > innerWidth`), `pageerror` / `console.error`, optional mobile `< 44x44px` interactive targets (`--touch-targets`), and optional viewport screenshots (`--screenshots <dir>`), exiting non-zero on failure.
2. **Inline Playwright Execution (`-e`)**: Execute custom DOM/network assertions inline in-memory via Node (never write scratch `.js` files):
   ```bash
   node "$SKILL_DIR/run.js" -e "const browser = await chromium.launch({ headless: true }); try { const page = await browser.newPage(); await page.goto('http://localhost:3000'); console.log(await page.title()); } finally { await browser.close(); }"
   ```
   `run.js -e` pre-injects `chromium`, `firefox`, `webkit`, `devices`, and `helpers` with top-level `await` and safe stdout/stderr flushing.
3. **Localhost Server & Target Detection (`--detect-url`)**: Probe `localhost` and `127.0.0.1` across common dev/Apache ports (`3000-3002`, `4321`, `5173`, `5174`, `8080`, `8000`, `8787`, `4200`, `5000`, `9000`, `1234`, `80`):
   ```bash
   node "$SKILL_DIR/run.js" --detect-url
   ```
4. **Interactive Flow Testing with `agent-browser`**: Pair Playwright `--audit` (visual/layout/console metrics) with `agent-browser` (`open`, `snapshot -i`, `click @e1`, `fill @e2`, `close`) for token-efficient `@eN` accessibility-tree navigation and multi-step interactive flows (see the `agent-browser` skill).
5. **Artifacts Policy**: Save screenshots strictly to `./scratch/*.png` or artifacts directory. Never write temporary `.js` scripts.

## Setup

Run once:

```bash
cd "$SKILL_DIR" && npm run setup
```

This installs Playwright and Chromium. Use `cd "$SKILL_DIR" && npm run
install-all-browsers` when Firefox or WebKit is required.

## Minimal example

```javascript
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'http://localhost:3000';
const artifactDir = process.env.PW_ARTIFACT_DIR || os.tmpdir();

(async () => {
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await page.goto(targetUrl);
    console.log('Page loaded:', await page.title());
    await page.screenshot({ path: path.join(artifactDir, 'page.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
```

Run it:

```bash
node "$SKILL_DIR/run.js" "$TMP_DIR/playwright-test-page.js"
```

For short one-off tasks, use inline execution:

```bash
node "$SKILL_DIR/run.js" -e "const browser = await chromium.launch({headless: false}); try { const page = await browser.newPage(); await page.goto('https://example.com'); console.log(await page.title()); } finally { await browser.close(); }"
```

The `-e` process exits as soon as the snippet settles, so close the browser
inside the snippet.

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

### Save scripts and artifacts

```bash
PW_SCRIPT_DIR=./playwright-tests node "$SKILL_DIR/run.js" "$TMP_DIR/playwright-test-login.js"
PW_ARTIFACT_DIR=./playwright-artifacts node "$SKILL_DIR/run.js" "$TMP_DIR/playwright-test-page.js"
```

`PW_SCRIPT_DIR` copies file-based scripts before execution and adds a timestamp
when a filename already exists. `PW_ARTIFACT_DIR` controls helper screenshot
output; the default is the operating system temporary directory.

### Connect to an existing Chrome session

Start Chrome with remote debugging enabled, then connect with Playwright:

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
const report = await helpers.auditLayout({ url, screenshotDir: 'scratch', checkTouchTargets: true });

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
- `auditLayout(options)`: resolves `url`, launches headless Chromium across `viewports` (default 375x667, 768x1024, 1280x800), detects horizontal overflow and console/page errors, optionally checks `<44x44px` mobile touch targets (`checkTouchTargets: true`) and saves screenshots (`screenshotDir`), sets `process.exitCode = 1` on failure, and returns `{ url, passed, viewports, consoleErrors, pageErrors }`.
- `agentBrowser(args, options)`: invokes the `agent-browser` CLI synchronously without Windows stdio pipe hangs, auto-scoping `--session` via `agent-browser session id --scope worktree --prefix task` unless `options.session` is provided or `false`, returning `{ status, stdout, stderr }`.

Use Playwright locators and assertions for DOM/network/viewport audits, and `agent-browser` for `@eN` accessibility-tree interactions and multi-step flows.

## Configuration

- `PW_BROWSER`: `chromium`, `firefox`, or `webkit` for `launchBrowser()`.
- `PW_CHANNEL`: installed browser channel such as `chrome` or `msedge`.
- `PW_EXECUTABLE_PATH`: explicit browser executable path.
- `PW_HEADLESS`: `true` or `false`; visible mode is the default.
- `SLOW_MO`: action delay in milliseconds.
- `PW_HEADER_NAME` and `PW_HEADER_VALUE`: one extra HTTP header.
- `PW_EXTRA_HEADERS`: JSON object of extra HTTP headers.
- `PW_SCRIPT_DIR`: directory for preserving file-based scripts.
- `PW_ARTIFACT_DIR`: directory for helper-generated screenshots.

See [API_REFERENCE.md](API_REFERENCE.md) for network interception, API mocking,
authentication state, video, visual checks, device emulation, and CI patterns.
