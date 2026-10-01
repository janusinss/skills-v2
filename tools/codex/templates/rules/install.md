# One-time Codex installation and cleanup

Use this guidance after the GPT / CODEX edition has been selected. For a generic request to install this skills repository without an explicit edition choice, first ask: "Which version would you like to install: GPT / CODEX or AGY / GEMINI?" Wait for the answer before installation. Reuse an explicit choice already given for this installation. If AGY / GEMINI is selected, follow the original payload branch in the source checkout's `INSTALL.md` instead of this rule. Routine dependency setup in an existing Codex installation does not require selecting the edition again.

After GPT / CODEX is selected, read and execute this rule automatically as part of the same installation request. The selected edition authorizes the local setup below; do not ask the user to invoke `install.md` separately. Host permissions and network approvals still apply. Keep the source checkout separate from the recorded absolute target project.

## Run the one-time installer

From the source checkout, run the following command with the actual target path:

```powershell
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all
```

Node.js 20 or newer and npm are required. The installer carries out these phases in order:

1. Verify and copy the committed, prebuilt bundle directly into the target's `.codex/`, with root `AGENTS.md` and `.codex/codex-install.json`. Create a root `.gitignore` if missing, or append only missing entries for `/.codex/`, `/AGENTS.md`, `/scratch/`, and `/.impeccable/`. Preserve existing project ignore rules and record these shared-file entries separately from payload hashes. Existing payload files and symlink destinations are refused. Use a smaller named profile only when requested. `--dry-run` previews without copying, modifying `.gitignore`, installing dependencies, or deleting files.
2. From the target's `.codex/skills/playwright-skill`, run `npm ci --no-audit --no-fund --prefer-offline`, then `node node_modules/playwright/cli.js install chromium`. This installs the local Playwright version pinned by the included lockfile and Chromium, reusing cached packages and browsers when available. Browser downloads use Playwright's normal cache. A profile without `playwright-skill` skips this phase and records that fact. Do not install global npm packages.
3. Run the installed Playwright runner inline. Launch headless Chromium, create a page, verify its title, and require `PLAYWRIGHT_VERIFIED_OK` before completing setup. No permanent test files are created.
4. After successful setup, delete only the target's `.codex/rules/install.md` copy created by this installation. Remove that path from `.codex/codex-install.json` and record setup completion there. Keep the source checkout's rule and other project files. Installed `AGENTS.md` handles the rule's absence and retains the seven ongoing workspace rules.

If setup or verification fails, retain the target's installation rule and report the failure. Retry the existing installation from the source checkout without copying over its files. This command also creates or repairs `.gitignore` in an already completed installation without reinstalling dependencies or rerunning browser setup:

```powershell
node tools/codex/install.mjs --target "C:/Projects/my-project" --resume
```

If a bundle integrity check fails before copying, use a fresh complete checkout. Do not run `npm ci` for conversion tooling, the converter, source validation, submodule initialization, or the AGY bootstrapper during normal installation. Do not rename installed folders or change hashes to bypass failures. The copy-only `export.mjs` is for staging; it does not perform these setup and cleanup phases.

## Finish the installation request

Report the selected edition, absolute target, dependency and browser verification results, and the installed rule removed. When the target Codex client is available, confirm that it reads `AGENTS.md` and lists the expected skills. Otherwise report that discovery remains to be checked in that client; the CLI/IDE support `/skills`. AGY / Gemini may run this installer for a Codex target.

Optional Impeccable lifecycle hooks are installed only with `--include-hooks` when requested and reviewed in the target host. Set up other external services when their workflows need them. Preserve existing user configuration and global policy; this local installer does not create global Codex instructions, configure accounts, or enable hooks by default.

Local filesystem discovery covers the supported Codex/local desktop workflow. ChatGPT on the web needs a supported skill or plugin installation mechanism; merely uploading these files is not an installation procedure. See the distribution README for verified sources and client-specific invocation.
