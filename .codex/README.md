# GPT / Codex edition

This is the active Codex edition of the skills collection, stored in `.codex/`. The original AGY / Gemini skill payload remains in `.agents/`. The shared [INSTALL.md](../INSTALL.md) asks which edition to install when the user has not specified one.

Codex CLI 0.159.2 was verified to discover all 190 converted manifests in this repository's `.codex/skills/`. Root [AGENTS.md](../AGENTS.md) contains the Codex policy: ADHD Mode, local rule selection, inline Playwright verification, and installation routing. Both edition catalogs are visible in this source collection; root instructions prefer the converted manifest when names match. The original `.agents/` files remain available for AGY / Gemini. Restart Codex to reload project instructions.

For other projects, the exporter installs this edition directly as `.codex/` and copies the bundled [AGENTS.md](AGENTS.md) to the target's root `AGENTS.md`. The builder generates that copy from the source repository's root policy; there is no separate instruction template. Only the selected converted edition is copied. The local `.codex/skills/` layout was verified with Codex CLI 0.159.2; OpenAI's current guide also documents `.agents/skills/` for shared skill discovery. Check the installed catalog in the actual target client. See [OpenAI's skills guide](https://learn.chatgpt.com/docs/build-skills).

## What is included

- 173 top-level skills and 17 distinct nested skills: 190 discoverable manifests with valid YAML and optional `agents/openai.yaml` metadata.
- Seven ongoing workspace rules adapted for Codex and one installation rule removed from the target after setup succeeds, plus the Codex `AGENTS.md` policy that selects relevant guidance.
- Original scripts, references, assets, licenses, and checked-out creative libraries. Two additional manifests sharing the name `avoid-ai-writing` are preserved as `REFERENCE.md` files, with their local callers updated.
- Optional Impeccable hooks, profile selection, and file hashes for the generated edition.

See [CONVERSION_REVIEW.md](CONVERSION_REVIEW.md) for the findings against the proposed conversion plan. Run `node tools/codex/audit.mjs` to inspect the source inventory in the terminal.

## Install into a separate project

For a prompt such as "install this skills repo here", follow the repository's [installation guide](../INSTALL.md) and ask GPT / CODEX or AGY / GEMINI before installation. The commands below apply after the GPT / CODEX choice.

Automatically read and execute [rules/install.md](rules/install.md) after that choice. Run the one-time installer from the source checkout with Node.js 20 or newer and npm. Replace the example target with your actual project path:

```powershell
node tools/codex/install.mjs --target "C:/Projects/my-codex-project" --profile all
```

The installer copies `AGENTS.md`, `.codex/skills/`, `.codex/rules/`, and `.codex/resources/` directly into that target. It checks every generated file against the prebuilt manifest, with LF/CRLF equivalence for UTF-8 text and exact hashes for binary files. `.gitattributes` also pins release text to LF. Installed hashes describe the bytes actually written.

When the selected profile includes `playwright-skill`, it installs local dependencies with `npm ci --no-audit --no-fund --prefer-offline`, installs Chromium with the local Playwright CLI, then verifies the installed runner with a real headless browser. The included lockfile pins Playwright, and cached packages and browsers are reused when available. After successful setup, it deletes only the target's `.codex/rules/install.md` and records the remaining files and setup completion in `.codex/codex-install.json`. The source rule remains available. Profiles without that skill skip browser setup. Add `--dry-run` for a preview with no copying, dependency installation, or deletion.

Failed setup keeps the installed rule. Retry from the source checkout with `node tools/codex/install.mjs --target <absolute-project-path> --resume`; the installer verifies the existing files and resumes setup. The installed `AGENTS.md` handles the one-time rule's absence; later dependency repairs use the relevant skill's setup instructions.

The exporter refuses existing destination files, symlink destinations, and installation over this collection. Merge existing instructions manually or export into an empty staging directory first. Do not rename or rewrite the installed payload afterward.

No global configuration, global npm packages, model settings, API accounts, or hooks are installed by default. Chromium uses Playwright's normal browser cache. Keep `tools/codex/` alongside this edition when using the automated installer. `export.mjs` remains a copy-only staging command and does not run dependency setup or remove the installation rule.

Do not run the converter, conversion-tool dependency setup, source auditing, or AGY submodule initialization during normal installation. `.codex/` contains the complete committed release even when the original AGY source submodule is empty in a clone. Integrity failures should be reported and resolved with a fresh complete release rather than changing hashes or rebuilding at install time.

## Choose a profile

Profiles select which top-level folders are copied. Their nested resources come with them. These are exporter profiles, rather than settings in Codex's `config.toml`.

| Profile | Purpose |
| --- | --- |
| `all` | Entire collection; 173 top-level folders and 190 distinct manifests |
| `minimal` | Eight general implementation and verification skills |
| `frontend` | UI, design, React, Next.js, and browser verification |
| `backend` | APIs, persistence, languages, architecture, and backend checks |
| `security` | Security review, Strix, authentication, and relevant verification |
| `fullstack` | Union of frontend and backend |

The initial skill catalog has a context-dependent size budget. Large profiles can still have descriptions shortened or skills omitted; selecting a profile does not guarantee that every skill appears in every host's initial prompt. Other installed user or plugin skills also contribute. Use `minimal` to begin with a small collection, or choose the domain relevant to your work. Rules may link to skills outside a selected profile; the root instructions explain how to handle a missing dependency. See [OpenAI's skills guide](https://learn.chatgpt.com/docs/build-skills).

## Use the installed edition

Open the target project in Codex, or launch the Codex CLI from that project root. Check `/skills` in the CLI/IDE and try an explicit request such as:

```text
Use $playwright-skill to verify the main user journey of this local application.
```

For a client that supports local skills and `@` selection, choose the installed skill through its skill menu. The current OpenAI guide describes standalone skills for the desktop app and Codex CLI/IDE, and plugins for broader distribution. A GPT model name alone does not provide local filesystem or shell access. This folder is not an automatically installed custom GPT or web ChatGPT plugin. See [OpenAI's skills guide](https://learn.chatgpt.com/docs/build-skills).

The one-time installer sets up Playwright for profiles that include it. Set up Strix, Impeccable, connectors, and hosted providers when their workflows require them. Existing scripts that call Gemini still use their real Gemini API configuration. The changed `playwright-skill` runner resolves its installed location, avoids this author's hardcoded machine path, and reports a missing dependency instead of silently running npm installation during normal workflow execution.

## Optional hooks

Add `--include-hooks` to an export whose profile includes `impeccable`, such as `all` or `frontend`. This places the example at `.codex/hooks.json`. Review the exact hook definitions in Codex and verify the Impeccable dependency before enabling them; its launcher may download an engine on first use. Hook configuration requires host trust and review. See [OpenAI's hook documentation](https://learn.chatgpt.com/docs/hooks).

## Validate and maintain

```powershell
npm ci --prefix tools/codex --ignore-scripts --no-audit --no-fund
node tools/codex/audit.mjs
node tools/codex/build.mjs
node tools/codex/validate.mjs --source
```

These are maintainer commands and require the full original source, including its checked-out nested repository, plus the pinned `yaml` package. `validate.mjs` checks the bundle by default; `--source` additionally checks the original source snapshot. Source validation is deliberately separate from installation, so missing original submodules do not block a prebuilt export.

Edit root `AGENTS.md` for the Codex policy; edit conversion logic or rule templates in `tools/codex/` for other converted guidance, then rebuild. The builder refuses to overwrite a manually edited generated file. The reviewed replacement of the old instruction template is the sole automatic stale-file removal; other stale files still require review. `profiles.json`, this README, and the review are maintained directly. The original updater lockfile is not copied to targets: its hashes describe upstream skills and do not represent these converted files.

Validation covers parsed frontmatter, naming, metadata, unique skill names, local instruction/reference links, generated-file hashes, and preservation of the original source. Parsing, metadata normalization, deterministic generation, overwrite protection, profile selection, and full native exports were tested during conversion. Live model routing and the 190 individual tool workflows have not been exercised; verify the relevant workflow in its target host after installation.
