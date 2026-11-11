---
trigger: manual
description: Ask GPT / CODEX or AGY / GEMINI before installing this collection. The AGY branch bootstraps Playwright and verifies the installed runner.
---

# One-Time Workspace Setup & Self-Destruct Installation Rule

## Edition Selection Before Setup

This is the original AGY / GEMINI bootstrapper. Referencing `@install.md` or asking to install this skills repository does not select an edition. If the user has not already made an explicit choice for this installation, ask:

> Which version would you like to install: GPT / CODEX, AGY / GEMINI, or ANTHROPIC / CLAUDE CODE?

Wait for the answer before copying files or running setup. Do not infer the edition from the current assistant. If the user already specified the edition, reuse their choice. Routine dependency setup in an existing installation does not require selecting the edition again.

- **GPT / CODEX:** Read the source checkout's root `INSTALL.md`, then automatically read and execute its `.claude/rules/install.md` in the same request. Run `node tools/codex/install.mjs --target <absolute-project-path> --profile all` from that checkout. This installs the converted payload, root `AGENTS.md`, and active `.codex/hooks.json` (plus `.git/hooks/pre-commit` when `.git` exists; pass `--no-hooks` to opt out), sets up local Playwright and Chromium, verifies the runner, and removes only the target's one-time Codex installation rule after success. Keep the source rule and do not run the AGY phases below.
- **AGY / GEMINI:** Follow the original payload branch in the source checkout's `INSTALL.md`. When copying `AGENTS.md` into the target, write only the content before `<!-- source-repository-only -->` to cleanly remove source-only instructions. After copying the original `.agents/`, clean `AGENTS.md`, and `skills-lock.json` into the intended target, run the phases below from that target to install Playwright, activate `.agents/hooks.json`, and install the git pre-commit receipt gate. If maintaining a target `.gitignore`, ignore skills while un-ignoring rules (`.agents/*` and `!.agents/rules/`) so rules autocomplete with `@`.
- **ANTHROPIC / CLAUDE CODE:** Run `node tools/claude/install.mjs --target <absolute-project-path> --profile all` from the source checkout. This installs `.claude/`, root `CLAUDE.md`, `.claude/hooks.json`, merges active `hooks` into `.claude/settings.json` (preserving existing user settings; pass `--no-hooks` to opt out), installs the `.git/hooks/pre-commit` receipt gate when `.git` exists, and verifies Playwright.

Keep the source checkout and target paths distinct. Do not run self-cleanup in the source repository. Preserve existing user configuration and unrelated setup files.

---

## Phase 1: Environment & Dependency Installation

Execute the following commands in order:

### 1. Global Playwright & Browser Installation
Install Playwright and Chromium globally so that all workspaces on this machine can run headless browser automation without duplicating packages:

**Windows (PowerShell):**
```powershell
npm install -g playwright; npx playwright install chromium
```

**macOS / Linux (Bash):**
```bash
npm install -g playwright && npx playwright install chromium
```

### 2. Local Skill Dependencies
Navigate to `.claude/skills/playwright-skill` and ensure its local runner dependencies are installed:

**Windows (PowerShell):**
```powershell
Push-Location .claude\skills\playwright-skill; npm install --no-audit --prefer-offline; Pop-Location
```

**macOS / Linux (Bash):**
```bash
(cd .claude/skills/playwright-skill && npm install --no-audit --prefer-offline)
```

### 3. Automatic Harness & UI Hook Activation
Activate `.agents/hooks.json` from `.agents/hooks.example.json` (preserving any existing `.agents/hooks.json`) and install the non-destructive `.git/hooks/pre-commit` receipt gate when `.git` is present:

**Windows (PowerShell):**
```powershell
if (-not (Test-Path -LiteralPath '.agents/hooks.json')) { Copy-Item -LiteralPath '.agents/hooks.example.json' -Destination '.agents/hooks.json' }
if (Test-Path -LiteralPath '.git') { node .claude/skills/continuous-agent-loop/scripts/harness.mjs install-git-hook }
```

**macOS / Linux (Bash):**
```bash
[ -f .agents/hooks.json ] || cp .agents/hooks.example.json .agents/hooks.json
[ ! -d .git ] || node .claude/skills/continuous-agent-loop/scripts/harness.mjs install-git-hook
```

---

## Phase 2: Zero-Scratch Execution Verification

Execute the following inline Playwright test to verify that the runner operates in-memory with zero errors and zero disk scratch files:

```bash
node .claude/skills/playwright-skill/run.js -e "const browser = await chromium.launch({ headless: true }); const page = await browser.newPage(); console.log('PLAYWRIGHT_VERIFIED_OK'); await browser.close();"
```

Verify that the output contains `PLAYWRIGHT_VERIFIED_OK`.

---

## Phase 3: Global Policy Sync (Optional)

Only if the user requests global Gemini instructions, sync `GEMINI.MD` to `~/.gemini/GEMINI.md` to apply this policy across projects. Preserve an existing global policy and review any merge rather than overwriting it automatically. The existence of `~/.gemini` alone does not authorize global synchronization.

For a requested sync where the destination file is absent:

**Windows (PowerShell):**
```powershell
$globalGeminiPolicy = Join-Path $env:USERPROFILE '.gemini/GEMINI.md'
if ((Test-Path -LiteralPath (Split-Path -Parent $globalGeminiPolicy)) -and -not (Test-Path -LiteralPath $globalGeminiPolicy)) { Copy-Item -LiteralPath 'GEMINI.MD' -Destination $globalGeminiPolicy }
```

**macOS / Linux (Bash):**
```bash
if [ -d "$HOME/.gemini" ] && [ ! -e "$HOME/.gemini/GEMINI.md" ]; then cp -n GEMINI.MD "$HOME/.gemini/GEMINI.md"; fi
```

---

## Phase 4: Self-Destruct & Ephemeral Cleanup

Once required setup is verified, delete only temporary setup artifacts created for this installation in the target. This installed rule may self-delete in the target; retain the source checkout's copy. Skip Phase 3 unless requested. Do not delete unrelated existing files merely because their names match the examples below.

### Eligible cleanup files:
1. `install.ps1`, `install.sh`, or root `install.md`, only if created as temporary setup artifacts for this installation
2. The `.claude/rules/install.md` copy installed into this target during this installation

Populate the cleanup list from the files actually created for this operation. The commands below remove only the installed rule; add other verified temporary paths individually if needed.

**Windows (PowerShell):**
```powershell
Remove-Item -LiteralPath '.claude/rules/install.md'
```

**macOS / Linux (Bash):**
```bash
rm -f .claude/rules/install.md
```

---

## Phase 5: Final Report to User
Report to the user:
1. AGY / GEMINI was selected, with the absolute target path.
2. Playwright and Chromium setup, `.agents/hooks.json` and `.git/hooks/pre-commit` activation, and in-memory verification results that actually ran.
3. The setup files removed, and whether optional global policy sync was requested.
4. Any remaining dependency or host-discovery checks.
