# Changelog

All notable changes are recorded here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed
- Claude Code installer failed on a fresh clone: the generic `dist/` and `build/` ignore rules dropped 77 bundle files. Rules are now anchored (`/dist/`, `/build/`) and the files are committed.
- `.agents/skills/avoid-ai-writing` was an empty submodule gitlink; its contents are now vendored.
- `tools/claude` now declares its `yaml` dependency.
- `playwright-skill` no longer runs `npm install` at run time; it exits with setup instructions instead.
- Removed a stray `.codex/hooks.json` that pointed at `.agents/` paths.
- Snapshot fingerprint now tracks `AGENTS.md` and `README.MD` by their real file names.
- Circuit Breaker rule now says to stop and ask before reverting, and never discard uncommitted work.

### Added
- Root `LICENSE` (MIT, original material only), `THIRD_PARTY_NOTICES.md`, `SECURITY.md`, `CONTRIBUTING.md`.
- `provenance.json`: source, license and content hash for all 118 skills (`tools/provenance.mjs`).
- CI (`.github/workflows/ci.yml`): validators, provenance check, skill scanner, skill linter, README sync, commit check, `gitleaks`, install matrix (Ubuntu and Windows, `minimal` and `all`) and a rebuild-and-diff drift check.
- `tools/scan-skills.mjs` (remote-execution patterns) and `tools/lint-skills.mjs` (description and length rules, baseline-gated).
- `tools/readme-sync.mjs`: README counts, profile table and subagent table are generated.
- Repository-wide `.gitattributes` (`eol=lf`).

### Changed
- Hooks are opt-in in every edition: `.agents/hooks.json` is now `.agents/hooks.example.json`.
- 29 skill descriptions rewritten (shorter, with trigger wording and "not for" pointers); description characters 27,250 to about 21,700.
- `imagegen-frontend-mobile`, `image-to-code`, `browser-automation`, `agent-evaluation` and `aws-serverless` split into a short `SKILL.md` plus `references/` files (content moved verbatim).
- Generated bundles exclude `evals/` directories and `*.test.js` files. Codex installs `resources/` libraries only when a selected skill references them.

### Removed
- The committed 20 MB `impeccable.exe` (three copies). The launcher downloads the engine on first use and verifies it against `engine-checksums.txt`.
