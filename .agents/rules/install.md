---
trigger: manual
description: One-time workspace bootstrapper. Installs global Playwright, downloads Chromium, verifies zero-scratch execution, cleans setup scripts, and self-deletes upon completion.
---

# One-Time Workspace Setup & Self-Destruct Installation Rule

When this rule is referenced (`@install.md` or user asks to "install", "run setup", "configure workspace"), execute this sequence **immediately and autonomously**:

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
Navigate to `.agents/skills/playwright-skill` and ensure its local runner dependencies are installed:

**Windows (PowerShell):**
```powershell
Push-Location .agents\skills\playwright-skill; npm install --no-audit --prefer-offline; Pop-Location
```

**macOS / Linux (Bash):**
```bash
(cd .agents/skills/playwright-skill && npm install --no-audit --prefer-offline)
```

---

## Phase 2: Zero-Scratch Execution Verification

Execute the following inline Playwright test to verify that the runner operates in-memory with zero errors and zero disk scratch files:

```bash
node .agents/skills/playwright-skill/run.js -e "const browser = await chromium.launch({ headless: true }); const page = await browser.newPage(); console.log('PLAYWRIGHT_VERIFIED_OK'); await browser.close();"
```

Verify that the output contains `PLAYWRIGHT_VERIFIED_OK`.

---

## Phase 3: Global Policy Sync (Optional)

If `~/.gemini` exists on the user's system, sync `GEMINI.MD` to `~/.gemini/GEMINI.md` to ensure design delegation and the ADHD protocol apply globally:

**Windows (PowerShell):**
```powershell
if (Test-Path "$env:USERPROFILE\.gemini") { Copy-Item "GEMINI.MD" "$env:USERPROFILE\.gemini\GEMINI.md" -Force }
```

**macOS / Linux (Bash):**
```bash
[ -d "$HOME/.gemini" ] && cp GEMINI.MD "$HOME/.gemini/GEMINI.md"
```

---

## Phase 4: Self-Destruct & Ephemeral Cleanup

Once Phase 1, Phase 2, and Phase 3 are complete and verified, **immediately delete all temporary setup artifacts and this rule file itself** so the target workspace stays 100% clean:

### Files to delete:
1. `install.ps1` (if present in root)
2. `install.sh` (if present in root)
3. `install.md` (if present in root)
4. `.agents/rules/install.md` (this rule file itself)

**Windows (PowerShell):**
```powershell
@("install.ps1", "install.sh", "install.md", ".agents\rules\install.md") | ForEach-Object { if (Test-Path $_) { Remove-Item -Force $_ } }
```

**macOS / Linux (Bash):**
```bash
rm -f install.ps1 install.sh install.md .agents/rules/install.md
```

---

## Phase 5: Final Report to User
Report to the user:
1. Global Playwright and Chromium are verified and ready.
2. In-memory zero-scratch browser execution passed.
3. All temporary setup scripts and `.agents/rules/install.md` have self-deleted.
4. Target workspace is clean and fully configured.
