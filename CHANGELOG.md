# Changelog

All notable changes are recorded here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-11-06

### Fixed
- Claude Code installer failed on a fresh clone: generic `dist/` and `build/` ignore rules dropped 77 `.claude` and 76 `.agents` bundle files. Rules are now anchored (`/dist/`, `/build/`) and all 153 files are committed.
- `.agents/skills/avoid-ai-writing` was an empty submodule gitlink; its 584 files are now vendored directly.
- `tools/claude` now declares its `"yaml": "2.9.0"` dependency in `tools/claude/package.json`.
- `playwright-skill` no longer runs `npm install` at runtime; it exits with explicit setup instructions instead.
- Removed a stray `.codex/hooks.json` that pointed at `.agents/` paths.
- Fixed circular `snapshotSource()` hash drift when running `tools/readme-sync.mjs --write`.
- Circuit Breaker rule in `AGENTS.md` and `CLAUDE.md` now instructs agents to stop and ask before reverting, and never discard uncommitted work.

### Added
- Root `LICENSE` (MIT, original material only), `THIRD_PARTY_NOTICES.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `docs/EVALUATION.md`.
- `provenance.json`: upstream source, license, modification status, and SHA-256 content hash for all 118 top-level skills (`tools/provenance.mjs`, `unknownSource: 0`).
- CI workflow (`.github/workflows/ci.yml`) with 40-char SHA-pinned actions, validators, provenance check, skill scanner, skill linter, README sync check, conventional commit check, `gitleaks` (`.gitleaks.toml`), 6-profile Ubuntu + Windows install matrix, and rebuild-and-diff drift gate.
- Weekly/manual upstream drift workflow (`.github/workflows/upstream-drift.yml`).
- `tools/scan-skills.mjs` (remote-execution pattern scanner) and `tools/lint-skills.mjs` (description length, trigger wording, and `<=500`-line `SKILL.md` enforcement with `0` baseline exceptions).
- `tools/readme-sync.mjs`: README counts, profile table, and 30-agent table are generated deterministically.
- Repository-wide `.gitattributes` (`* text=auto eol=lf`).

### Changed
- Hooks are opt-in across all editions: `.agents/hooks.json` renamed to `.agents/hooks.example.json`.
- All 118 top-level skill descriptions rewritten to 80–300 chars with explicit trigger wording (`noTrigger: 0`) and scope boundaries across overlapping clusters; total description budget reduced from `27,250` to `18,788` chars in `.agents` (`<20,000` in all three editions).
- All 18 skills previously exceeding 500 lines split verbatim into `<445`-line `SKILL.md` entry points plus linked `references/*.md` files (`tooLong: 0`).
- Generated bundles (`.codex/` and `.claude/`) exclude `evals/` directories and `*.test.js` files. Codex exports `resources/` subdirectories only when referenced by selected skills or on `--profile all` (reducing `minimal` install size from 27 MB to 0.7 MB).

### Removed
- Committed 20 MB `impeccable.exe` binaries (all 3 copies removed and `**/impeccable/scripts/bin/` gitignored).
