---
trigger: manual
description: Install this skills repository (AGY, CODEX, or CLAUDE; HARNESS or DESIGNER mode) via node install.mjs, or run the AGY manual fallback and target cleanup.
---

# One-Time Workspace Setup & Self-Destruct Installation Rule

## 1. Edition & Hook Mode Selection

Follow `INSTALL.md` to ask Question 1 (**AGY**, **CODEX**, or **CLAUDE**) and Question 2 (**HARNESS MODE** or **DESIGNER MODE**; `--mode normal` aliases `designer`) sequentially before setup.
Skip either only if already specified. Never infer the edition from the active assistant, and keep source and target paths distinct.

## 2. Canonical Automated Install (`install.mjs`)

Run from the source checkout (or `node install.mjs` interactively in a TTY):

- **AGY / GEMINI:** `node install.mjs --edition agy --mode <harness|designer> --target <absolute-project-path>`
- **GPT / CODEX:** Read `.codex/rules/install.md`; run `node install.mjs --edition codex --mode <harness|designer> --target <absolute-project-path> --profile all`
- **ANTHROPIC / CLAUDE CODE:** `node install.mjs --edition claude --mode <harness|designer> --target <absolute-project-path> --profile all`

Flags: `--no-hooks` disables hooks; `--resume` finishes an interrupted run.
For AGY, `install.mjs` writes `.agents/agy-install.json` (for `--resume`), merges `.gitignore`, sets up Playwright and `agent-browser`, chains `.git/hooks/pre-commit` in Harness mode, and deletes only the target's `.agents/rules/install.md`.

## 3. AGY Manual-Copy Fallback

Use only without `node install.mjs`. Manual copies skip `.agents/agy-install.json`, so `--resume` is unavailable.

### Step 1: Copy Files & Merge `.gitignore`
- Copy `.agents/`, `skills-lock.json`, and `AGENTS.md` (before `<!-- source-repository-only -->`) into the target.
- In **DESIGNER MODE**, also omit Section 5 and `.harness/PROGRESS.md` / Strike-2 Harness references (matching `formatAgyPolicy(..., 'designer')`).
- Merge root `.gitignore` plus all 8 AGY entries:
  `/.agents/*`, `!/.agents/rules/`, `!/.agents/agents/`, `/AGENTS.md`, `/scratch/`, `/.impeccable/`, `/.harness/`, `/.agent_worktrees/`.

### Step 2: Local Playwright & Browser Precheck
Install local packages via `npm ci` (never global `npm install -g playwright`). Run Step 4 first to reuse an existing browser; download Chromium only if that fails:
- **PowerShell:** `Push-Location .agents\skills\playwright-skill; npm ci --no-audit --no-fund --prefer-offline; Pop-Location`
- **Bash:** `(cd .agents/skills/playwright-skill && npm ci --no-audit --no-fund --prefer-offline)`
- **Chromium fallback:** `node .agents/skills/playwright-skill/node_modules/playwright/cli.js install chromium`

### Step 3: Mode-Specific Hooks
Copy only if `.agents/hooks.json` is absent:
- **HARNESS MODE:** Copy `.agents/hooks.example.json` to `.agents/hooks.json`.
  - If `.git` exists, chain `.git/hooks/pre-commit` non-destructively: append `harness.mjs pre-commit-check` when a hook exists (`harness.mjs install-git-hook` overwrites existing hooks, so run it only when absent).
- **DESIGNER MODE:** Copy `.agents/hooks.impeccable.example.json` to `.agents/hooks.json` (keeps Impeccable, `design-taste-frontend`, `avoid-ai-writing`, and `swarm-stop-guard.cjs`; skips Harness hooks and `.git/hooks/pre-commit`).

### Step 4: Zero-Scratch Verification
Run inline Playwright (`try/finally` around `browser.close()`) and non-fatal `agent-browser` checks:
- **PowerShell:**
  ```powershell
  node .agents/skills/playwright-skill/run.js -e "const browser = await helpers.launchBrowser('chromium', { headless: true }); try { const page = await browser.newPage(); console.log('PLAYWRIGHT_VERIFIED_OK'); } finally { await browser.close(); }"
  agent-browser --version; agent-browser doctor --offline --quick --json
  ```
- **Bash:**
  ```bash
  node .agents/skills/playwright-skill/run.js -e "const browser = await helpers.launchBrowser('chromium', { headless: true }); try { const page = await browser.newPage(); console.log('PLAYWRIGHT_VERIFIED_OK'); } finally { await browser.close(); }"
  agent-browser --version && agent-browser doctor --offline --quick --json
  ```

### Step 5: Target-Only Cleanup & Report
- Once `PLAYWRIGHT_VERIFIED_OK` prints, delete only `.agents/rules/install.md` (and temporary setup files created here) in the target:
  - **PowerShell:** `Remove-Item -LiteralPath '.agents/rules/install.md'` | **Bash:** `rm -f .agents/rules/install.md`
  - Never delete files in the source checkout.
- Report edition, mode (`HARNESS MODE` or `DESIGNER MODE`), target path, browser/hook results, and removed files.
