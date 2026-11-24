# One-time Claude Code installation and cleanup

Use this guidance after the ANTHROPIC / CLAUDE CODE edition has been selected (or when asked to install this skills repository into another workspace). For a generic request without explicit choices, ask these two sequential questions in order and wait for each answer before proceeding:

1. **Question 1 — Edition**: "Which edition would you like to install: **AGY** (`AGY / GEMINI`), **CODEX** (`GPT / CODEX`), or **CLAUDE** (`ANTHROPIC / CLAUDE CODE`)?"
2. **Question 2 — Hook Mode**: "Which hook mode would you like to install: **HARNESS MODE** (full Harness + Impeccable + `design-taste-frontend` + `avoid-ai-writing` hooks, `.git/hooks/pre-commit` receipt gate, and full Harness lifecycle in `CLAUDE.md`) or **DESIGNER MODE** (Impeccable, `design-taste-frontend`, and `avoid-ai-writing` hooks only, no Harness hooks or git pre-commit, and Designer `CLAUDE.md`)?"

Reuse explicit choices already given for this installation. If **AGY** or **CODEX** is selected instead, follow its branch in the source checkout's `INSTALL.md` (or run `node install.mjs` interactively in a TTY) rather than the Claude-only steps below. Routine dependency setup in an existing Claude Code installation does not require re-asking these questions.

After **CLAUDE** and the mode are selected, read and execute this rule automatically as part of the same installation request. The selected edition and mode authorize the local setup below; do not ask the user to invoke `install.md` separately. Host permissions and network approvals still apply. Keep the source checkout separate from the recorded absolute target project.

## Run the one-time installer

From the source checkout, run the command matching the selected mode with the actual target path (or run `node install.mjs` interactively in a TTY):

```powershell
# Harness mode (full Harness + Impeccable + design-taste-frontend + avoid-ai-writing hooks + .claude/settings.json merge + .git/hooks/pre-commit receipt gate + full CLAUDE.md; default in non-TTY/CI)
node install.mjs --edition claude --mode harness --target "C:/Projects/my-project" --profile all
# or directly:
node tools/claude/install.mjs --target "C:/Projects/my-project" --profile all --mode harness

# Designer mode (Impeccable, design-taste-frontend, and avoid-ai-writing hooks only; merged into .claude/settings.json; Designer CLAUDE.md; disables all Harness hooks and skips .git/hooks/pre-commit)
node install.mjs --edition claude --mode designer --target "C:/Projects/my-project" --profile all
# or directly:
node tools/claude/install.mjs --target "C:/Projects/my-project" --profile all --mode designer
```

Running `node tools/claude/install.mjs` directly in an interactive TTY without `--mode` prompts for HARNESS MODE vs DESIGNER MODE; non-TTY/CI invocations default to `harness` without blocking (`--mode normal` is accepted as an alias for `designer`).

Node.js 20 or newer and npm are required. The installer carries out these phases in order:

1. Verify and copy the committed, prebuilt bundle into the target's `.claude/` (`skills/`, `agents/`, `commands/`, `rules/`, `resources/`), with mode-specific root `CLAUDE.md` (`CLAUDE.md` in `harness` mode or `CLAUDE.designer.md` without Harness lifecycle in `designer` mode), `.claude/hooks.example.json`, `.claude/hooks.impeccable.example.json`, active `.claude/hooks.json` (`hooks.example.json` in `harness` mode or `hooks.impeccable.example.json` in `designer` mode; pass `--no-hooks` to opt out of active hook installation), and `.claude/claude-install.json` (recording `mode` and `hookSet`). When hooks are enabled (`--no-hooks` not passed), this phase automatically merges the selected hook set into `.claude/settings.json` while preserving existing user settings (and re-applies that merge on `--resume`). Create a root `.gitignore` if missing, or merge the source bundle's `project.gitignore` (`/.claude/*`, `!/.claude/rules/`, `!/.claude/agents/`, `!/.claude/commands/`, `/CLAUDE.md`, `/scratch/`, `/.impeccable/`, `/.harness/`, `/.agent_worktrees/`, plus OS, secrets, editor, dependency, test, cache, agent-runtime, and audit rules), keeping exception ordering intact. Existing payload files and symlink destinations are refused. Use a smaller named profile only when requested. `--dry-run` previews without copying, modifying `.gitignore`, installing dependencies, or deleting files.
2. From the target's `.claude/skills/playwright-skill`, run `npm ci --no-audit --no-fund --prefer-offline`, precheck for a working browser, and run `node node_modules/playwright/cli.js install chromium` only if no working browser is already available. When the profile includes `playwright-skill` or `agent-browser`, also check `agent-browser --version` and `agent-browser doctor --offline --quick --json` (installing `agent-browser` and its browser runtime non-fatally if missing). Verify the installed Playwright runner inline for `PLAYWRIGHT_VERIFIED_OK` without creating permanent test files, recording `playwright` and `agentBrowser` status in `.claude/claude-install.json`. A profile without `playwright-skill` and `agent-browser` skips this phase and records that fact.
3. In **HARNESS MODE** (when hooks are enabled and `.git` is present), install or non-destructively chain the `.git/hooks/pre-commit` receipt gate from `.claude/skills/continuous-agent-loop/scripts/harness.mjs`. In **DESIGNER MODE** (or when `--no-hooks` is specified), skip `.git/hooks/pre-commit`.
4. After successful setup, delete only the target's `.claude/rules/install.md` copy created by this installation. Remove that path from `.claude/claude-install.json` and record setup completion (including `mode`, `hooks`, `gitHook`, `playwright`, and `agentBrowser` state) there. Keep the source checkout's rule and other project files. Installed `CLAUDE.md` handles the rule's absence and retains the ongoing workspace rules.

If setup or verification fails, retain the target's installation rule and report the failure. Retry the existing installation from the source checkout without copying over its files (mode/profile consistency is enforced if passed on `--resume`). This command also creates or repairs `.gitignore` in an already completed installation without reinstalling dependencies or rerunning browser setup:

```powershell
node tools/claude/install.mjs --target "C:/Projects/my-project" --resume
```

If a bundle integrity check fails before copying, use a fresh complete checkout. Do not run `npm ci` for conversion tooling, the converter, source validation, or submodule initialization during standard installation. Do not rename installed folders or change hashes to bypass failures. The copy-only `export.mjs` is for staging; it does not perform these setup and cleanup phases.

## Finish the installation request

Report the selected edition, selected hook mode (`HARNESS MODE` or `DESIGNER MODE`), absolute target, hook activation (`.claude/hooks.json`, `.claude/settings.json`, and `.git/hooks/pre-commit` status), dependency and browser verification results, and the installed rule removed. In Claude Code, skills are discoverable via `/skill-name`, agents via `@agent-name`, and custom commands via `/plan`, `/tdd`, `/audit`, `/review`, `/eval`, `/contract`, `/verify`, and `/flywheel`.

Lifecycle hooks (`.claude/hooks.json`, `.claude/settings.json`, and in Harness mode `.git/hooks/pre-commit`) are installed and activated by default (`includeHooks = true`; pass `--mode designer` for Impeccable, `design-taste-frontend`, and `avoid-ai-writing` hooks without Harness hooks, or `--no-hooks` to disable all hooks). Set up other external services when their workflows need them. Preserve existing user configuration and global policy; this local installer does not create global Claude Code instructions or configure external accounts.
