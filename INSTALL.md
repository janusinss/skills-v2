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

From the source checkout, with Node.js 20 or newer, install the exporter dependency if needed:

```powershell
npm ci --prefix tools/codex --ignore-scripts --no-audit --no-fund
```

Use the recorded absolute target path instead of this example:

```powershell
node tools/codex/export.mjs --target "C:/Projects/my-project" --profile all --dry-run
node tools/codex/export.mjs --target "C:/Projects/my-project" --profile all
```

The exporter installs the converted payload as `.agents/skills/`, `.agents/rules/`, `.agents/resources/`, and root `AGENTS.md`, with an installation manifest at `.agents/codex-install.json`. It refuses existing destination files and symlink destinations. Use a smaller named profile only when requested. Keep the source checkout available for later updates.

Open the target in Codex and confirm the installed skills are available in that client; the CLI and IDE support `/skills`. Install workflow dependencies when needed. Add `--include-hooks` only when the user wants the optional Impeccable hooks and the host's review requirements have been satisfied. See [.codex/README.md](.codex/README.md) for profiles, dependencies, and hooks.

## AGY / GEMINI

Copy the original source `.agents/` tree, root `GEMINI.MD`, and `skills-lock.json` into the target, after checking for conflicts. Use the original payload rather than `.codex/skills/`. Do not copy this source repository's root `AGENTS.md` into the target.

From the target project, follow its installed `.agents/rules/install.md` after the AGY / GEMINI choice is confirmed. That legacy bootstrapper sets up Playwright and Chromium and verifies its runner. Its self-cleanup applies only to setup artifacts installed for this operation in the target; preserve the source checkout and unrelated project files. Global Gemini policy synchronization is optional and requires a user request.

Confirm the selected host sees the installed skills and workspace policy. Report the edition, target path, and checks that actually ran.

## Codex instruction files

Codex's default global custom instructions file is `~/.codex/AGENTS.md`, or `%USERPROFILE%\.codex\AGENTS.md` on Windows. If `CODEX_HOME` is configured, use `AGENTS.md` inside that directory instead. A nonempty `AGENTS.override.md` in the same directory takes precedence over `AGENTS.md`.

Project instructions use `AGENTS.md` in the project root, with more specific instructions in subdirectories. Keep global preferences general; this installer writes project instructions and does not create or overwrite global policy. See [OpenAI's AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
