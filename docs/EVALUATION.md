# skills-v2 Evaluation & Audit Remediation Benchmark

Reproducible before-and-after metrics across all 6 remediation phases for `janusinss/skills-v2`.

---

## 1. Target Metrics (Before vs. After)

| Metric | Baseline (Pre-Remediation) | Target | Current (`v2.0.0`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| Fresh-clone installs (`2 automated editions x 6 profiles`) | Claude: `0 / 6` (failed on missing GSAP `dist/`); Codex: `minimal` only | `12 / 12` in CI (+ AGY source verified) | `12 / 12` verified on Ubuntu + Windows in CI | **PASS** |
| Skills with recorded provenance (`provenance.json`) | `24 / 118` (`103` unknown) | `118 / 118` | `118 / 118` (`0` unknown) | **PASS** |
| Root `LICENSE` + `THIRD_PARTY_NOTICES.md` | Missing | Present & scoped | `LICENSE` (MIT) + `THIRD_PARTY_NOTICES.md` | **PASS** |
| Tracked binaries (`impeccable.exe`) | `3` copies (~59 MB total) | `0` | `0` (`**/impeccable/scripts/bin/` gitignored) | **PASS** |
| CI status on `main` | No CI workflows | Green multi-OS CI | Green (`verify` x4, `commits`, `secrets`, `drift`) | **PASS** |
| Description characters (`all` profile) | `24,896` (`.agents`: `27,250`) | `< 20,000` | `.agents`: `18,788` · `.codex`: `19,771` · `.claude`: `19,867` | **PASS** |
| Descriptions with explicit trigger language | `29 / 118` | `118 / 118` | `118 / 118` (`noTrigger: 0`) | **PASS** |
| Skills over 500 lines (`SKILL.md`) | `18 / 118` (up to 1,401 lines) | `0` | `0 / 118` (`tooLong: 0`; 18 skills split into `references/`) | **PASS** |
| Minimal profile installed size (Codex) | `27.0 MB` (312 files) | `< 2.0 MB` | `0.7 MB` (39 files) | **PASS** |
| Generated bundle file count (`.codex` / `.claude`) | `2,013` / `1,902` | Exclude `evals/` & `*.test.js` | `1,584` / `1,473` | **PASS** |

---

## 2. Remediation Summary by Finding (`F-01` – `F-23`)

| ID | Severity | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| **F-01** | Blocker | Unanchored `dist/` and `build/` in `.gitignore` dropped 77 `.claude` and 76 `.agents` files | Anchored `/dist/` and `/build/` in `.gitignore`; committed all 153 files |
| **F-02** | High | `tools/claude/validate.mjs --source` failed on `README.MD` snapshot circularity | Removed `README.MD` from `snapshotSource()` in `tools/codex/lib.mjs` and `tools/claude/lib.mjs` |
| **F-03** | High | No root `LICENSE` file | Added MIT `LICENSE` (original repo code) and `THIRD_PARTY_NOTICES.md` |
| **F-04** | High | No GitHub Actions CI | Added `.github/workflows/ci.yml` (SHA-pinned actions, Ubuntu + Windows, 6 profiles, drift, commits, secrets) |
| **F-05** | High | Broken `.agents/skills/avoid-ai-writing` gitlink | Removed orphan submodule gitlink and vendored all 584 files directly |
| **F-06** | High | `skills-lock.json` covered only 24 skills | Added `provenance.json` + `tools/provenance.mjs` covering all 118 top-level skills (`unknownSource: 0`) |
| **F-07** | High | 3 copies of 20 MB `impeccable.exe` tracked in git | Removed all 3 binaries (`git rm`) and ignored `**/impeccable/scripts/bin/` |
| **F-08** | Medium | `yaml` dependency missing from `tools/claude/package.json` | Declared `"yaml": "2.9.0"` in `tools/claude/package.json` |
| **F-09** | Medium | `.agents/hooks.json` active by default; broken `.codex/hooks.json` | Renamed to `.agents/hooks.example.json` and removed `.codex/hooks.json` |
| **F-10** | Medium | Catalog description budget >24,896 chars; 69 skills lacked triggers | Rewrote all 118 descriptions (`18,788` chars in `.agents`, `118/118` with trigger wording, `0` outside `80..300` chars) |
| **F-11** | Medium | Triplicated `evals/` and `*.test.js` across `.codex` and `.claude` | Excluded `evals/` and `*.test.js` from bundle builders (`isBundleExcluded`) |
| **F-12** | Medium | Overlapping skill clusters had ambiguous triggers | Added explicit scope-boundary routing (`"Use for X; for Y use Z"`) across all 5 overlapping clusters |
| **F-13** | Medium | 18 `SKILL.md` files exceeded 500 lines | Split all 18 skills verbatim into `<445`-line `SKILL.md` + linked `references/*.md` files |
| **F-14** | Medium | Circuit breaker rule implied discarding uncommitted work | Updated `AGENTS.md` and `CLAUDE.md` to `"STOP modifying code. Ask before reverting anything; never discard uncommitted work."` |
| **F-15** | Low | `minimal` profile copied 27 MB of `resources/creative-libraries` | Updated `tools/codex/export.mjs` to copy `resources/` subdirectories only when referenced or on `--profile all` |
| **F-16** | Low | Stale counts and missing 19 agents in `README.MD` | Added `tools/readme-sync.mjs` to generate counts, profile table, and 30-agent table from manifests |
| **F-17** | Low | `THIRD_PARTY_NOTICES.md` missing | Created `THIRD_PARTY_NOTICES.md` documenting all 18 upstream sources and vendored licenses |
| **F-18** | Low | `playwright-skill/run.js` ran `npm install` implicitly at runtime | Removed runtime `npm install`; fails fast with explicit setup instructions |
| **F-19** | Low | No `.gitattributes` line-ending policy | Added `.gitattributes` enforcing `* text=auto eol=lf` (`*.bat`/`*.cmd` as `crlf`) |
| **F-20** | Low | `tools/codex` dependency install step undocumented | Documented in `CONTRIBUTING.md` and automated in `.github/workflows/ci.yml` |
| **F-21** | Low | Missing `CONTRIBUTING.md`, `CHANGELOG.md`, `SECURITY.md` | Added `CONTRIBUTING.md`, `CHANGELOG.md`, and `SECURITY.md` |
| **F-22** | Low | Inconsistent commit history | Added `tools/check-commits.mjs` enforcing Conventional Commits on new pushes and PRs |
| **F-23** | Low | No static scanner for remote-execution patterns in skills | Added `tools/scan-skills.mjs` + `tools/scan-allowlist.json` enforced in CI |

---

## 3. Reproducible Verification Commands

Run from a fresh clone of `https://github.com/janusinss/skills-v2.git`:

```bash
npm --prefix tools/codex install --no-audit --no-fund
node tools/codex/validate.mjs --source
node tools/claude/validate.mjs --source
node tools/provenance.mjs --check
node tools/lint-skills.mjs
node tools/scan-skills.mjs
node tools/readme-sync.mjs --check
```
