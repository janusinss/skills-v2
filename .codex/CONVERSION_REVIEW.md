# Review of codex_gpt_conversion_plan.md

Checked on 1 October 2026 against the local directory and current official OpenAI documentation.

The plan is based on a real supported skills format, but it needs corrections before implementation. This repository is primarily a reusable instruction and tooling collection, rather than an application. Its Gemini policy layer is host-specific; most of its skill content already uses the shared `SKILL.md` format. The attached plan was treated as a proposal to evaluate, not as authorization to run its installation steps or adopt its policies.

## What this directory contains

| Location | Actual role |
| --- | --- |
| `.agents/skills/` | 173 top-level skill folders; 192 manifests when nested skills are counted |
| `.agents/rules/` | Eight workspace guidance documents with Antigravity trigger metadata |
| `.agents/hooks.json` | Impeccable lifecycle command definitions; this location is not Codex's documented project hook location |
| `.agents/resources/` | Checked-out creative libraries, integration examples, and type declarations |
| `GEMINI.MD` | Root output, frontend dispatch, and browser-tool policy for the existing edition |
| `skills-lock.json` | 29 updater-managed skill entries, rather than a complete inventory or runtime dependency lock |
| `README.MD` | Existing AGY-oriented setup, dispatch, and domain documentation |
| `scratch/` | Ignored working artifacts |

All 192 source manifests have valid required names and descriptions, and all 173 top-level names match their folders. There are 190 unique names: `avoid-ai-writing` appears three times. Eleven `agents/openai.yaml` files already exist. The measured description totals are 41,547 characters for the top-level collection and 45,045 including nested manifests.

Our strict portability checks identify 145 source manifests with extension fields or metadata values needing normalization. Most have fields such as `risk`, `source`, `date_added`, or `version` outside the portable field set. These findings do not prove Codex refuses to load the source skills. The edition preserves those values under metadata and serializes nested metadata without inventing information.

## Corrections to the proposed plan

| Proposed claim or change | Finding and adopted approach |
| --- | --- |
| `.agents/skills` is a Codex discovery location | Correct. The skill format itself already works across compatible hosts; most files need adaptation rather than a new format. |
| There are 173 skills in the complete audit | Correct for top-level folders, incomplete for nested manifests. Preserve the 17 additional distinct skills and retain the two duplicate entry points as references. |
| Descriptions total 36,334 characters | Stale for this checkout. The measured top-level total is 41,547. |
| Codex has a universal 8,000-character catalog ceiling | Overstated. OpenAI documents a budget of 2% of known model context, with 8,000 characters as the fallback when context size is unknown. Names and paths also contribute to the catalog. |
| Front-loading descriptions guarantees 100% routing accuracy | Unsupported. It helps when descriptions are shortened, but skills can still be omitted. The edition improves several long descriptions and offers selective exports without promising routing accuracy. |
| `AGENTS.md` is the default Codex instruction entry | Correct. Keep it concise and link the relevant rules rather than copying every rule into the root prompt. |
| `CODEX.md` is a direct native entry point | Not a documented default. It needs a configured fallback name or an actual `AGENTS.md` entry. No redundant mirror is added. |
| One instruction file guarantees support for Claude, Cursor, Gemini, and Codex | Not established by Codex documentation. Preserve the original edition and provide a separate Codex package. Each other host needs its own discovery and tool support verified. |
| Optional UI metadata can describe Strix as `type: command` | The bundled Skill Creator contract supports `mcp` dependencies, not the proposed command type. Keep CLI prerequisites in the skill's instructions and preserve supported metadata. |
| Root `.agents/rules` triggers and hooks transfer automatically | Rule trigger fields are not a Codex activation system. Codex instructions load relevant Markdown through links. Optional project hooks belong in `.codex/hooks.json` and require host review/trust. |
| Mirror Gemini output policies, globally install tools, and synchronize global agent files | These are behavioral and installation choices, not format requirements. The new edition uses scoped guidance, local export, and dependency setup only when needed. It does not change global files or delete its installation rule. |
| Edit `~/.codex/config.toml` automatically to toggle domain profiles | Local disable entries are documented, but automatic global mutation is unnecessary for a separate edition. Export selected skill folders using `profiles.json`. It is explicitly a tool-specific profile file, not a native Codex config schema. |
| A local folder guarantees seamless ChatGPT support everywhere | Supported local clients can use filesystem skills. Broader distribution requires the supported skills/plugin mechanism and client access. No web plugin or account installation is claimed. |
| Metadata scaffolding proves every workflow works | It proves only a part of conformance. Scripts can require Node, Python, browsers, accounts, API keys, or third-party CLIs. A host-model change does not replace the providers those scripts call. |

The discovery, catalog budgeting, invocation, and supported local disable behavior were verified against [OpenAI's skills guide](https://learn.chatgpt.com/docs/build-skills). Instruction discovery and fallback filenames were checked against [OpenAI's AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Hook location and review requirements were checked against [OpenAI's hook documentation](https://learn.chatgpt.com/docs/hooks). The dependency-type and prompt-format constraints were also checked in the installed Skill Creator's `references/openai_yaml.md`.

## Delivered version

`.codex/skills/`, `.codex/rules/`, and `.codex/resources/` hold the Codex edition. At the user's request, the former `codex/` distribution was renamed to `.codex/` and activated in the source repository. Root `AGENTS.md` loads the converted guidance and prefers converted manifests when names match. The original payload remains on disk for AGY / Gemini; both edition catalogs can appear in this source collection. Codex CLI 0.159.2 was verified to discover all 190 converted `.codex/skills/` manifests as enabled, without load errors. External exports now install `.codex/` directly, with `AGENTS.template.md` installed as root `AGENTS.md`.

The conversion keeps licenses and supporting files; normalizes frontmatter and all 190 metadata files; fixes Claude-specific script paths and the two rules using `view_file`; repairs local Markdown links; removes duplicate skill discovery; and updates the Playwright runner's machine-specific resolution and automatic-install behavior. Banner design uses the host's available image and browser capabilities instead of assuming three absent ClaudeKit skills. The frontend and setup rules were adapted explicitly rather than copied with unavailable tool mandates.

The optional hook example preserves the existing Impeccable commands and uses the documented destination only when requested during export. No fake MCP server, CLI dependency type, model setting, access token, or global toggle is generated. The original updater lock remains in the original edition; converted-file hashes are recorded separately.

During conversion, all source files included in the snapshot retained their hashes, including the original plan. Git reported no changes to previously tracked source files. The converted distribution has 173 top-level skills, 190 distinct discoverable manifests, and eight rules. Its validator reported zero errors and zero missing-link warnings. Seven tests passed, including full native export, selected export, deterministic rebuild, and refusal to overwrite an existing project. The conversion test suite was subsequently removed after successful verification.

These checks establish the package's structure and exporter behavior. They do not establish live skill selection quality, external-service availability, successful browser execution, or completion of every third-party workflow. Those checks depend on the actual target host and its installed tools. Follow [README.md](README.md) to export and try the relevant installed skill.

## Windows installation repair

A clean local clone with `core.autocrlf=true` reproduced 1,078 generated files differing from the original byte-level manifest. The original AGY `avoid-ai-writing` gitlink was empty, while every generated Codex file was present as a normal tracked file. Rebuilding was unnecessary for consuming that committed bundle.

The installer now uses only Node's built-in libraries and verifies the prebuilt release before copying it directly into `.codex/`. Manifest format 2 hashes UTF-8 text with LF endings and binary files exactly; `.gitattributes` pins release text to LF. Conversion dependencies and optional source-snapshot checks remain maintainer steps. Codex paths in root instructions, workflow examples, hooks, and installation records are generated consistently, so installers do not rename folders or rewrite hashes.

An isolated release snapshot was cloned with `core.autocrlf=true`, no installed tooling dependencies, and an empty AGY source gitlink. The full export wrote 2,003 files with 173 top-level skills and 190 manifests in 6.2 seconds on this machine; clone/download time is separate. Every installed file matched its installation hash, and full installed validation reported no errors or missing-link warnings. Inline regression checks accepted CRLF-only text changes, rejected altered content and missing files before writing a target, refused existing destinations, preserved binary bytes, and verified profile preview. Temporary verification files were removed afterward; no persistent test suite was added.
