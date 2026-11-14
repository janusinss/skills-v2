# Install this skills repository

This is the shared installation entry point for all editions. It applies to requests such as "INSTALL THIS SKILLS REPO HERE", "install this repo here", or "set up these skills".

## Ask two sequential questions before setup

When installing into another workspace, ask these two questions in order and wait for each answer before copying files, installing dependencies, enabling hooks, or changing instructions. Do not choose a default based on the assistant being used. An `@install.md` reference alone selects neither an edition nor a hook mode.

### Question 1: Select edition

If the user has not already specified the edition for this installation, ask:

> Which edition would you like to install: **AGY** (`AGY / GEMINI`), **CODEX** (`GPT / CODEX`), or **CLAUDE** (`ANTHROPIC / CLAUDE CODE`)?

Wait for the answer. If the user already specified "for AGY", "for Antigravity", "for Gemini", "for Codex", "for GPT", "for Claude", or "for Claude Code", reuse that choice without asking Question 1 again.

- **AGY (`AGY / GEMINI`)** installs `.agents/`, clean `AGENTS.md`, and `skills-lock.json` for Antigravity / Gemini.
- **CODEX (`GPT / CODEX`)** installs `.codex/` and clean `AGENTS.md` for a supported local Codex client (CLI/IDE/desktop; a model name alone does not give web ChatGPT filesystem installation — see [Codex edition guide](.codex/README.md#use-the-installed-edition)).
- **CLAUDE (`ANTHROPIC / CLAUDE CODE`)** installs `.claude/` (`skills/`, `agents/`, `commands/`, `rules/`) and clean `CLAUDE.md` for Anthropic Claude Code (`claude`).

### Question 2: Select hook mode

After the edition is resolved, if the user has not already specified the hook mode, ask:

> Which hook mode would you like to install: **HARNESS MODE** (full Harness + Impeccable + `design-taste-frontend` + `avoid-ai-writing` hooks, `.git/hooks/pre-commit` receipt gate, and full Harness lifecycle in `AGENTS.md`/`CLAUDE.md`) or **DESIGNER MODE** (activates Impeccable, `design-taste-frontend`, and `avoid-ai-writing` hooks only, disables Harness hooks/git pre-commit, and installs Designer `AGENTS.md`/`CLAUDE.md`)?

Wait for the answer before running installation. Skills and rules stay intact in both modes, while hooks and root policy instructions differ by mode (`--mode normal` is accepted as a backward-compatible alias for `--mode designer`):

- **HARNESS MODE (`--mode harness`)**: Activates Harness (`harness.mjs`), Impeccable (`impeccable hook`), `design-taste-frontend` (`gate.mjs`), and `avoid-ai-writing` (`avoid-ai-writing-gate.js`) lifecycle hooks in `hooks.json` (and `.claude/settings.json` for Claude), installs/chains the `.git/hooks/pre-commit` receipt gate when `.git` is present, and installs full `AGENTS.md`/`CLAUDE.md` including the 6-Stage Self-Improving Harness Lifecycle. This is the default for non-interactive CI flags when `--mode` is omitted.
- **DESIGNER MODE (`--mode designer`, alias `--mode normal`)**: Activates **all non-harness hooks** — Impeccable (`impeccable hook`), `design-taste-frontend` (`gate.mjs`), and `avoid-ai-writing` (`avoid-ai-writing-gate.js`) from `hooks.impeccable.example.json` — in `hooks.json` (and `.claude/settings.json` for Claude), omits all `harness.mjs` hooks, skips `.git/hooks/pre-commit`, and installs Designer `AGENTS.md`/`CLAUDE.md` (`AGENTS.designer.md` / `CLAUDE.designer.md`) without the 6-Stage Harness Lifecycle section or `.harness/PROGRESS.md` ledger instructions.
- **No Hooks Opt-Out (`--no-hooks`)**: Skips active `hooks.json` / `.claude/settings.json` hook installation and disables `.git/hooks/pre-commit`.

## Identify the source and target

Record the absolute target project path when the user says "here", before changing directories or fetching the source. Keep the source checkout separate from the target project. Read this guide from the source checkout; run installed workflow setup from the target.

Inspect existing `.agents/`, `.codex/`, `.claude/`, `AGENTS.md`, and `CLAUDE.md` files before writing. Preserve existing user instructions and skills. If destinations conflict, stage the selected edition separately and review the merge. Do not install multiple editions over the same paths or delete the source repository as cleanup.

## Unified root installer (`install.mjs`)

From the source checkout, run the unified entrypoint interactively in a TTY (prompts sequentially for Question 1, Question 2, and target directory) or pass explicit flags (Node.js 20+ and npm required):

```powershell
# Interactive TTY (asks Edition -> Mode -> Target)
node install.mjs

# Non-interactive flags across editions and modes
node install.mjs --edition agy --mode harness --target "C:/Projects/my-project"
node install.mjs --edition agy --mode designer --target "C:/Projects/my-project"
node install.mjs --edition codex --mode harness --target "C:/Projects/my-project" --profile all
node install.mjs --edition codex --mode designer --target "C:/Projects/my-project" --profile all
node install.mjs --edition claude --mode harness --target "C:/Projects/my-project" --profile all
node install.mjs --edition claude --mode designer --target "C:/Projects/my-project" --profile all
```

Supported flags: `--edition agy|codex|claude`, `--mode harness|designer` (`normal` alias supported), `--target <absolute-dir>`, `--profile <name>` (Codex/Claude), `--no-hooks`, `--dry-run`, `--resume`.

## GPT / CODEX

After **CODEX** and the mode are selected, automatically read and execute the source checkout's [.codex/rules/install.md](.codex/rules/install.md) within the same request. Do not wait for a separate `@install.md` prompt. Run from the source checkout with the recorded absolute target path:

```powershell
# Harness mode (default when --mode is omitted in non-TTY/CI)
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all --mode harness

# Designer mode (Impeccable, design-taste-frontend, and avoid-ai-writing hooks only; Designer AGENTS.md; skips Harness hooks and git pre-commit gate)
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all --mode designer
```

Running `node tools/codex/install.mjs` directly in an interactive TTY without `--mode` prompts for HARNESS MODE vs DESIGNER MODE (non-TTY/CI invocations default to `harness` without blocking).

The installer verifies and copies the committed bundle, creating `.codex/skills/`, `.codex/rules/`, `.codex/agents/`, `.codex/resources/`, `.codex/hooks.example.json`, `.codex/hooks.impeccable.example.json`, active `.codex/hooks.json` (from `hooks.example.json` in `harness` mode or `hooks.impeccable.example.json` in `designer` mode, unless `--no-hooks` is passed), and root `AGENTS.md` (`AGENTS.md` in `harness` mode or `AGENTS.designer.md` without Harness lifecycle in `designer` mode). It records `mode` (`harness` or `designer`) and `hookSet` in `.codex/codex-install.json`. It creates or merges the root `.gitignore` using [.codex/project.gitignore](.codex/project.gitignore) (preserving existing rules and keeping exception ordering). In `harness` mode (with hooks enabled), it installs or chains `.git/hooks/pre-commit` via `harness.mjs install-git-hook` when `.git` exists; in `designer` mode, it skips `.git/hooks/pre-commit`. It then runs local Playwright and Chromium setup, verifies the runner headlessly, checks or installs the `agent-browser` CLI and its browser runtime non-fatally, and deletes only the target's `.codex/rules/install.md`.

Paths are already correct; do not rename folders or rewrite files or hashes afterward. Existing payload files and symlink destinations are refused; an existing `.gitignore` is merged. Add `--dry-run` only when a preview is needed. Use a smaller named profile only when requested. If setup or verification fails, retry with `node tools/codex/install.mjs --target <absolute-project-path> --resume` (mode/profile consistency is enforced if `--mode` or `--profile` is passed on `--resume`).

Standard installation does not need conversion-tool dependencies (`npm ci` in `tools/codex`), `build.mjs`, source auditing, source-snapshot validation, submodule initialization, or the AGY bootstrapper. `tools/codex/export.mjs` remains available for copy-only staging; use `install.mjs` or `tools/codex/install.mjs` to complete an installation request.

AGY / Gemini can perform this installation for a Codex target. Open the target in Codex and confirm `/skills` discovery afterward. See [.codex/README.md](.codex/README.md) for profiles, dependencies, and hooks.

## AGY / GEMINI

After **AGY** and the mode are selected, run the unified installer from the source checkout:

```powershell
# Harness mode
node install.mjs --edition agy --mode harness --target "C:/Projects/my-project"

# Designer mode (Impeccable, design-taste-frontend, and avoid-ai-writing hooks only; Designer AGENTS.md; skips Harness hooks and git pre-commit gate)
node install.mjs --edition agy --mode designer --target "C:/Projects/my-project"
```

This copies `.agents/`, mode-specific root `AGENTS.md` (full policy before `<!-- source-repository-only -->` in `harness` mode, or without Harness lifecycle sections in `designer` mode), and `skills-lock.json`, activates `.agents/hooks.json` (from `.agents/hooks.example.json` in `harness` mode or `.agents/hooks.impeccable.example.json` in `designer` mode), creates/merges `.gitignore` (`/.agents/*`, `!/.agents/rules/`, `!/.agents/agents/`, `/AGENTS.md`, `/scratch/`, `/.impeccable/`, `/.harness/`, `/.agent_worktrees/`), installs `.git/hooks/pre-commit` **only** in `harness` mode when `.git` is present, sets up `playwright-skill` dependencies and Chromium, verifies Playwright headlessly, checks or installs `agent-browser` CLI and its browser runtime non-fatally, and removes only the target's `.agents/rules/install.md` on completion.

If performing a manual copy instead, copy `.agents/`, clean `AGENTS.md` (before `<!-- source-repository-only -->`, omitting Section 5 in `designer` mode), and `skills-lock.json` into the target after checking for conflicts, then follow the target's `.agents/rules/install.md` for your chosen mode.

Confirm the selected host sees the installed skills and workspace policy. Report the edition, selected mode, target path, and checks that actually ran.

## ANTHROPIC / CLAUDE CODE

After **CLAUDE** and the mode are selected, run the automated installer from the source checkout:

```powershell
# Harness mode (default when --mode is omitted in non-TTY/CI)
node tools/claude/install.mjs --target "C:/Projects/my-project" --profile all --mode harness

# Designer mode (Impeccable, design-taste-frontend, and avoid-ai-writing hooks only; Designer CLAUDE.md; skips Harness hooks and git pre-commit gate)
node tools/claude/install.mjs --target "C:/Projects/my-project" --profile all --mode designer
```

Running `node tools/claude/install.mjs` directly in an interactive TTY without `--mode` prompts for HARNESS MODE vs DESIGNER MODE (non-TTY/CI invocations default to `harness` without blocking).

The installer verifies and copies the committed bundle into the target workspace:
- `.claude/skills/`: Skills automatically discoverable via `/skill-name` inside Claude Code.
- `.claude/agents/`: Subagents with native Claude tools (`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`) and tiered models (`haiku`, `sonnet`, `opus`) for isolated tasks.
- `.claude/commands/`: Custom workflow commands (`/plan`, `/tdd`, `/audit`, `/review`, `/eval`, `/contract`, `/verify`, `/flywheel`).
- `.claude/rules/`: Workspace development rules and architecture policies.
- `.claude/hooks.json` & `.claude/settings.json`:
  - In **HARNESS MODE**: copies `.claude/hooks.example.json` to `.claude/hooks.json`, merges all hooks into `.claude/settings.json` (preserving existing settings), and installs/chains `.git/hooks/pre-commit` when `.git` is present.
  - In **DESIGNER MODE**: copies `.claude/hooks.impeccable.example.json` to `.claude/hooks.json`, merges **only** `hooks.impeccable.example.json` into `.claude/settings.json`, and skips `.git/hooks/pre-commit`.
  - Pass `--no-hooks` to skip all hook activation.
- `CLAUDE.md`: Root configuration and memory loaded on every Claude Code session (`CLAUDE.md` in `harness` mode; `CLAUDE.designer.md` without Harness lifecycle in `designer` mode).

It creates or merges the root `.gitignore` using `.claude/project.gitignore`, protecting `.claude/*` while preserving rules, agents, commands, and `CLAUDE.md`. Mode (`harness` or `designer`) and `hookSet` are recorded in `.claude/claude-install.json`. When the profile includes `playwright-skill` or `agent-browser`, it installs local Playwright and Chromium dependencies, verifies headless browser execution, and checks or installs the `agent-browser` CLI and its browser runtime non-fatally. On failure, retry with `--resume` to complete setup without re-copying existing files.

Open Claude Code (`claude`) in the target project to verify skill and command discovery.

## Codex instruction files

Codex's default global custom instructions file is `~/.codex/AGENTS.md`, or `%USERPROFILE%\.codex\AGENTS.md` on Windows. If `CODEX_HOME` is configured, use `AGENTS.md` inside that directory instead. A nonempty `AGENTS.override.md` in the same directory takes precedence over `AGENTS.md`.

Project instructions use `AGENTS.md` in the project root, with more specific instructions in subdirectories. Keep global preferences general; this installer writes project instructions and does not create or overwrite global policy. See [OpenAI's AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
