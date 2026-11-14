# One-time Codex installation and cleanup

Use this guidance after the GPT / CODEX edition has been selected (or when asked to install this skills repository into another workspace). For a generic request without explicit choices, ask these two sequential questions in order and wait for each answer before proceeding:

1. **Question 1 — Edition**: "Which edition would you like to install: **AGY** (`AGY / GEMINI`), **CODEX** (`GPT / CODEX`), or **CLAUDE** (`ANTHROPIC / CLAUDE CODE`)?"
2. **Question 2 — Hook Mode**: "Which hook mode would you like to install: **HARNESS MODE** (full Harness + Impeccable + `design-taste-frontend` + `avoid-ai-writing` hooks, `.git/hooks/pre-commit` receipt gate, and full Harness lifecycle in `AGENTS.md`/`CLAUDE.md`) or **DESIGNER MODE** (activates Impeccable, `design-taste-frontend`, and `avoid-ai-writing` hooks only, disables Harness hooks/git pre-commit, and installs Designer `AGENTS.md`/`CLAUDE.md`)?"

Reuse explicit choices already given for this installation. If **AGY** or **CLAUDE** is selected, follow the corresponding branch in the source checkout's `INSTALL.md` (or run `node install.mjs --edition <agy|claude> --mode <harness|designer> --target "<absolute-project-path>"`) instead of the Codex-only steps below. Routine dependency setup in an existing Codex installation does not require re-asking these questions.

After **CODEX** and the mode are selected, read and execute this rule automatically as part of the same installation request. The selected edition and mode authorize the local setup below; do not ask the user to invoke `install.md` separately. Host permissions and network approvals still apply. Keep the source checkout separate from the recorded absolute target project.

## Run the one-time installer

From the source checkout, run the command matching the selected mode with the actual target path (or run `node install.mjs` interactively in a TTY):

```powershell
# Harness mode (full Harness + Impeccable + design-taste-frontend + avoid-ai-writing hooks + .git/hooks/pre-commit receipt gate + full AGENTS.md; default in non-TTY/CI)
node install.mjs --edition codex --mode harness --target "C:/Projects/my-project" --profile all
# or directly:
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all --mode harness

# Designer mode (Impeccable, design-taste-frontend, and avoid-ai-writing hooks only; Designer AGENTS.md; disables all Harness hooks and skips .git/hooks/pre-commit)
node install.mjs --edition codex --mode designer --target "C:/Projects/my-project" --profile all
# or directly:
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all --mode designer
```

Running `node tools/codex/install.mjs` directly in an interactive TTY without `--mode` prompts for HARNESS MODE vs DESIGNER MODE; non-TTY/CI invocations default to `harness` without blocking (`--mode normal` is accepted as an alias for `designer`).

Node.js 20 or newer and npm are required. The installer carries out these phases in order:

1. Verify and copy the committed, prebuilt bundle directly into the target's `.codex/`, with mode-specific root `AGENTS.md` (`AGENTS.md` in `harness` mode or `AGENTS.designer.md` without Harness lifecycle in `designer` mode), `.codex/hooks.example.json`, `.codex/hooks.impeccable.example.json`, active `.codex/hooks.json` (`hooks.example.json` in `harness` mode or `hooks.impeccable.example.json` in `designer` mode; pass `--no-hooks` to opt out of active hook installation), and `.codex/codex-install.json` (recording `mode` and `hookSet`). Create a root `.gitignore` if missing, or merge the source bundle's `project.gitignore` (`/.codex/*`, `!/.codex/rules/`, `!/.codex/agents/`, `/AGENTS.md`, `/scratch/`, `/.impeccable/`, `/.harness/`, `/.agent_worktrees/`, plus OS, secrets, editor, dependency, test, cache, agent-runtime, and audit rules), keeping exception ordering intact. Existing payload files and symlink destinations are refused. Use a smaller named profile only when requested. `--dry-run` previews without copying, modifying `.gitignore`, installing dependencies, or deleting files.
2. In **HARNESS MODE** (when hooks are enabled and `.git` is present), automatically install or safely chain the non-destructive `.git/hooks/pre-commit` receipt gate from `.codex/skills/continuous-agent-loop/scripts/harness.mjs`. In **DESIGNER MODE** (or when `--no-hooks` is specified), skip `.git/hooks/pre-commit`.
3. From the target's `.codex/skills/playwright-skill`, run `npm ci --no-audit --no-fund --prefer-offline`, then `node node_modules/playwright/cli.js install chromium` if no working browser is already available. This installs the local Playwright version pinned by the included lockfile and Chromium, reusing cached packages and browsers when available. When the profile includes `playwright-skill` or `agent-browser`, also check `agent-browser --version` and `agent-browser doctor --offline --quick --json` (installing `agent-browser` and its browser runtime non-fatally if missing). A profile without `playwright-skill` and `agent-browser` skips this phase and records that fact.
4. Run the installed Playwright runner inline. Launch headless Chromium, create a page, verify its title, and require `PLAYWRIGHT_VERIFIED_OK` before completing setup, recording both `playwright` and `agentBrowser` status in `.codex/codex-install.json`. No permanent test files are created.
5. After successful setup, delete only the target's `.codex/rules/install.md` copy created by this installation. Remove that path from `.codex/codex-install.json` and record setup completion (including `mode` and `hooks` state) there. Keep the source checkout's rule and other project files. Installed `AGENTS.md` handles the rule's absence and retains the ongoing workspace rules.

If setup or verification fails, retain the target's installation rule and report the failure. Retry the existing installation from the source checkout without copying over its files (mode/profile consistency is enforced if passed on `--resume`). This command also creates or repairs `.gitignore` in an already completed installation without reinstalling dependencies or rerunning browser setup:

```powershell
node tools/codex/install.mjs --target "C:/Projects/my-project" --resume
```

If a bundle integrity check fails before copying, use a fresh complete checkout. Do not run `npm ci` for conversion tooling, the converter, source validation, submodule initialization, or the AGY bootstrapper during standard installation. Do not rename installed folders or change hashes to bypass failures. The copy-only `export.mjs` is for staging; it does not perform these setup and cleanup phases.

## Finish the installation request

Report the selected edition, selected hook mode (`HARNESS MODE` or `DESIGNER MODE`), absolute target, hook activation (`.codex/hooks.json` and `.git/hooks/pre-commit` status), dependency and browser verification results, and the installed rule removed. When the target Codex client is available, confirm that it reads `AGENTS.md` and lists the expected skills. Otherwise report that discovery remains to be checked in that client; the CLI/IDE support `/skills`. AGY / Gemini may run this installer for a Codex target.

Lifecycle hooks (`.codex/hooks.json` and, in Harness mode, `.git/hooks/pre-commit`) are installed and activated by default (`includeHooks = true`; pass `--mode designer` for Impeccable, `design-taste-frontend`, and `avoid-ai-writing` hooks without Harness hooks, or `--no-hooks` to disable all hooks). Set up other external services when their workflows need them. Preserve existing user configuration and global policy; this local installer does not create global Codex instructions or configure external accounts.

Local filesystem discovery covers the supported Codex/local desktop workflow. ChatGPT on the web needs a supported skill or plugin installation mechanism; merely uploading these files is not an installation procedure. See the distribution README for verified sources and client-specific invocation.
