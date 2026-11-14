---
trigger: manual
description: Ask edition (AGY, CODEX, or CLAUDE) and hook mode (HARNESS MODE or DESIGNER MODE) sequentially before installing this collection. The AGY branch bootstraps Playwright, activates mode-specific hooks, and verifies the installed runner.
---

# One-Time Workspace Setup & Self-Destruct Installation Rule

## Sequential Selection Before Setup

Referencing `@install.md` or asking to install this skills repository selects neither an edition nor a hook mode. Ask these two questions in order and wait for each answer before copying files or running setup (skipping either only if the user already specified it explicitly):

### Question 1: Select edition

> Which edition would you like to install: **AGY** (`AGY / GEMINI`), **CODEX** (`GPT / CODEX`), or **CLAUDE** (`ANTHROPIC / CLAUDE CODE`)?

Wait for the answer. Do not infer the edition from the current assistant.

### Question 2: Select hook mode

> Which hook mode would you like to install: **HARNESS MODE** (full Harness + Impeccable + `design-taste-frontend` + `avoid-ai-writing` hooks, `.git/hooks/pre-commit` receipt gate, and full Harness lifecycle in `AGENTS.md`/`CLAUDE.md`) or **DESIGNER MODE** (activates Impeccable, `design-taste-frontend`, and `avoid-ai-writing` hooks only, disables Harness hooks/git pre-commit, and installs Designer `AGENTS.md`/`CLAUDE.md`)?

Wait for the answer. Routine dependency setup in an existing installation does not require re-asking these questions. (`--mode normal` is accepted as an alias for `--mode designer`.)

## Edition & Mode Execution

Or run the unified interactive installer directly in a TTY from the source checkout: `node install.mjs`.

- **GPT / CODEX:** Read the source checkout's root `INSTALL.md`, then automatically read and execute its `.codex/rules/install.md` in the same request. Run from the source checkout:
  - Harness mode: `node install.mjs --edition codex --mode harness --target <absolute-project-path> --profile all` (or `node tools/codex/install.mjs --target <absolute-project-path> --profile all --mode harness`)
  - Designer mode: `node install.mjs --edition codex --mode designer --target <absolute-project-path> --profile all` (or `node tools/codex/install.mjs --target <absolute-project-path> --profile all --mode designer`)
  Pass `--no-hooks` to disable all active hooks. Non-TTY invocations default to `harness` when `--mode` is omitted; interactive TTY invocations prompt if `--mode` is omitted. Keep the source rule and do not run the AGY phases below.
- **AGY / GEMINI:** Preferred automated command from the source checkout:
  - Harness mode: `node install.mjs --edition agy --mode harness --target <absolute-project-path>`
  - Designer mode: `node install.mjs --edition agy --mode designer --target <absolute-project-path>`
  For a manual installation, follow the AGY branch in root `INSTALL.md`: copy `.agents/`, clean `AGENTS.md` (content before `<!-- source-repository-only -->`, omitting Section 5 Harness lifecycle in `designer` mode), and `skills-lock.json` into the target, merge `.gitignore` (`/.agents/*`, `!/.agents/rules/`, `!/.agents/agents/`, `/AGENTS.md`), and run the phases below from that target according to your selected mode.
- **ANTHROPIC / CLAUDE CODE:** Run from the source checkout:
  - Harness mode: `node install.mjs --edition claude --mode harness --target <absolute-project-path> --profile all` (or `node tools/claude/install.mjs --target <absolute-project-path> --profile all --mode harness`)
  - Designer mode: `node install.mjs --edition claude --mode designer --target <absolute-project-path> --profile all` (or `node tools/claude/install.mjs --target <absolute-project-path> --profile all --mode designer`)
  In `designer` mode (`normal` alias), `CLAUDE.designer.md` is installed as `CLAUDE.md`, `.claude/hooks.impeccable.example.json` is copied to `.claude/hooks.json`, **only** `hooks.impeccable.example.json` is merged into `.claude/settings.json`, and `.git/hooks/pre-commit` is skipped. Pass `--no-hooks` to opt out of all hooks.

Keep the source checkout and target paths distinct. Do not run self-cleanup in the source repository. Preserve existing user configuration and unrelated setup files.

---

> Note: Phases 1–3 below are the manual-copy fallback when running without `node install.mjs --edition agy`.

## Phase 1: Environment & Dependency Installation

Execute the following commands in order inside the AGY target workspace:

### 1. Global Playwright, `agent-browser` & Browser Installation
Install Playwright, `agent-browser`, and Chromium globally so that all workspaces on this machine can run headless browser audits and `@eN` accessibility flows without duplicating packages:

**Windows (PowerShell):**
```powershell
npm install -g playwright agent-browser; npx playwright install chromium; agent-browser install
```

**macOS / Linux (Bash):**
```bash
npm install -g playwright agent-browser && npx playwright install chromium && agent-browser install
```

### 2. Local Skill Dependencies
Navigate to `.agents/skills/playwright-skill` and ensure its local runner dependencies are installed:

**Windows (PowerShell):**
```powershell
Push-Location .agents\skills\playwright-skill; npm install --no-audit --prefer-offline; Pop-Location
```

**macOS / Linux (Bash):**
```bash
(cd .agents/skills/playwright-skill && npm install --no-audit --prefer-offline)
```

### 3. Hook Activation by Selected Mode

Run **only** the branch matching Question 2 (preserving any existing `.agents/hooks.json`):

#### HARNESS MODE (Harness + Impeccable + design-taste-frontend + avoid-ai-writing hooks + git pre-commit receipt gate)

**Windows (PowerShell):**
```powershell
if (-not (Test-Path -LiteralPath '.agents/hooks.json')) { Copy-Item -LiteralPath '.agents/hooks.example.json' -Destination '.agents/hooks.json' }
if (Test-Path -LiteralPath '.git') { node .agents/skills/continuous-agent-loop/scripts/harness.mjs install-git-hook }
```

**macOS / Linux (Bash):**
```bash
[ -f .agents/hooks.json ] || cp .agents/hooks.example.json .agents/hooks.json
[ ! -d .git ] || node .agents/skills/continuous-agent-loop/scripts/harness.mjs install-git-hook
```

#### DESIGNER MODE (Impeccable, design-taste-frontend, and avoid-ai-writing hooks only; Designer AGENTS.md without Harness lifecycle; disables all Harness hooks and skips git pre-commit)

**Windows (PowerShell):**
```powershell
if (-not (Test-Path -LiteralPath '.agents/hooks.json')) { Copy-Item -LiteralPath '.agents/hooks.impeccable.example.json' -Destination '.agents/hooks.json' }
```

**macOS / Linux (Bash):**
```bash
[ -f .agents/hooks.json ] || cp .agents/hooks.impeccable.example.json .agents/hooks.json
```

---

## Phase 2: Zero-Scratch Execution Verification

Execute the following inline Playwright test and `agent-browser` health check to verify that both runners operate with zero errors and zero disk scratch files:

```bash
node .agents/skills/playwright-skill/run.js -e "const browser = await chromium.launch({ headless: true }); const page = await browser.newPage(); console.log('PLAYWRIGHT_VERIFIED_OK'); await browser.close();"
agent-browser --version && agent-browser doctor --offline --quick --json
```

Verify that the output contains `PLAYWRIGHT_VERIFIED_OK` and `agent-browser doctor` passes cleanly.

---

## Phase 3: Self-Destruct & Ephemeral Cleanup

Once required setup is verified, delete only temporary setup artifacts created for this installation in the target. This installed rule may self-delete in the target; retain the source checkout's copy. Do not delete unrelated existing files merely because their names match the examples below.

### Eligible cleanup files:
1. `install.ps1`, `install.sh`, or root `install.md`, only if created as temporary setup artifacts for this installation
2. The `.agents/rules/install.md` copy installed into this target during this installation

Populate the cleanup list from the files actually created for this operation. The commands below remove only the installed rule; add other verified temporary paths individually if needed.

**Windows (PowerShell):**
```powershell
Remove-Item -LiteralPath '.agents/rules/install.md'
```

**macOS / Linux (Bash):**
```bash
rm -f .agents/rules/install.md
```

---

## Phase 4: Final Report to User
Report to the user:
1. Selected edition and hook mode (`HARNESS MODE` or `DESIGNER MODE`), with the absolute target path.
2. Playwright and Chromium setup, `.agents/hooks.json` (and `.git/hooks/pre-commit` when in `HARNESS MODE`) activation, and in-memory verification results that actually ran.
3. The setup files removed.
4. Any remaining dependency or host-discovery checks.
