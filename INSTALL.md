# Install this skills repository

This is the shared installation entry point for both editions. It applies to requests such as "INSTALL THIS SKILLS REPO HERE", "install this repo here", or "set up these skills".

## Ask which edition

If the user has not specified the edition for this installation, ask exactly:

> Which version would you like to install: GPT / CODEX or AGY / GEMINI?

Offer those two choices and wait for the answer before copying skills, installing dependencies, enabling hooks, or changing global instructions. Do not choose a default based on the assistant being used. If the user already said "for Codex", "for GPT", "for Antigravity", "for AGY", or "for Gemini", use that choice without asking again. An `@install.md` reference alone does not select an edition.

The GPT / CODEX choice installs local skills for a supported Codex client. A model name alone does not give web ChatGPT a filesystem installation mechanism; see the [Codex edition guide](.codex/README.md#use-the-installed-edition) for client requirements.

## Identify the source and target

Record the absolute target project path when the user says "here", before changing directories or fetching the source. Keep the source checkout separate from the target project. Read this guide from the source checkout; run installed workflow setup from the target.

Inspect existing `.agents/`, `AGENTS.md`, and `GEMINI.MD` files before writing. Preserve existing user instructions and skills. If destinations conflict, stage the selected edition separately and review the merge. Do not install both editions over the same skill paths or delete the source repository as cleanup.

## GPT / CODEX

After GPT / CODEX is selected, automatically read and execute the source checkout's [.codex/rules/install.md](.codex/rules/install.md) within the same request. Do not wait for a separate `@install.md` prompt. Node.js 20 or newer and npm are required. Use the recorded absolute target path instead of this example:

```powershell
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all
```

The installer verifies and copies the committed bundle, creating `.codex/skills/`, `.codex/rules/`, `.codex/resources/`, and root `AGENTS.md`. It creates or merges the root `.gitignore`, preserving existing rules and adding only missing entries for `/.codex/`, `/AGENTS.md`, `/scratch/`, and `/.impeccable/`. These keep local skills, instructions, and runtime artifacts out of application commits. Its entries are recorded separately from immutable payload hashes so later project `.gitignore` edits remain valid. It then runs local Playwright and Chromium setup and verifies the installed runner with a real headless browser. On success, it deletes only the target's `.codex/rules/install.md` and updates `.codex/codex-install.json` to describe the remaining files and completed setup. The source rule stays in the repository. Profiles without `playwright-skill` skip browser setup and record that fact. The final target keeps seven ongoing rules.

Paths are already correct; do not rename folders or rewrite files or hashes afterward. Existing payload files and symlink destinations are refused; an existing `.gitignore` is merged. Add `--dry-run` only when a preview is needed; it performs no setup, ignore-file changes, or deletion. Use a smaller named profile only when requested. Keep the source checkout available for later updates. If dependency setup or verification fails, retain the target's rule and retry with `node tools/codex/install.mjs --target <absolute-project-path> --resume`; this checks the existing installation and resumes setup without overwriting its files. For a completed installation that lacks `.gitignore`, the same `--resume` command repairs the ignore file and its record without reinstalling dependencies or running the browser again.

Normal installation does not need conversion-tool dependencies (`npm ci` in `tools/codex`), `build.mjs`, source auditing, source-snapshot validation, submodule initialization, or the AGY bootstrapper. Playwright setup installs dependencies inside the target skill and can download Chromium into its standard browser cache. The converted `avoid-ai-writing` files are committed directly in `.codex/`; an empty AGY source submodule does not block their export. If bundle integrity fails, report the error and use a fresh complete checkout rather than rebuilding or changing the manifest to bypass it. `tools/codex/export.mjs` remains available for copy-only staging; use `install.mjs` to complete an installation request.

AGY / Gemini can perform this installation for a Codex target. The selected edition determines the payload; the assistant running the install does not change it. Open Codex afterward to check discovery. Do not try to activate Codex skills in the AGY host as part of the copy operation.

Open the target in Codex and confirm the installed skills are available in that client; the CLI and IDE support `/skills`. Report an unavailable target client as a remaining discovery check. Install other workflow dependencies when needed. Add `--include-hooks` only when the user wants the optional Impeccable hooks and the host's review requirements have been satisfied. See [.codex/README.md](.codex/README.md) for profiles, dependencies, and hooks.

## AGY / GEMINI

Copy the original source `.agents/` tree, root `GEMINI.MD`, and `skills-lock.json` into the target, after checking for conflicts. Use the original payload rather than `.codex/skills/`. Do not copy this source repository's root `AGENTS.md` into the target.

From the target project, follow its installed `.agents/rules/install.md` after the AGY / GEMINI choice is confirmed. That legacy bootstrapper sets up Playwright and Chromium and verifies its runner. Its self-cleanup applies only to setup artifacts installed for this operation in the target; preserve the source checkout and unrelated project files. Global Gemini policy synchronization is optional and requires a user request.

Confirm the selected host sees the installed skills and workspace policy. Report the edition, target path, and checks that actually ran.

## Codex instruction files

Codex's default global custom instructions file is `~/.codex/AGENTS.md`, or `%USERPROFILE%\.codex\AGENTS.md` on Windows. If `CODEX_HOME` is configured, use `AGENTS.md` inside that directory instead. A nonempty `AGENTS.override.md` in the same directory takes precedence over `AGENTS.md`.

Project instructions use `AGENTS.md` in the project root, with more specific instructions in subdirectories. Keep global preferences general; this installer writes project instructions and does not create or overwrite global policy. See [OpenAI's AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
