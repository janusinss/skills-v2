# Contributing

## Source of truth

- `.agents/` is the source tree. Edit skills, subagents and rules there.
- `.codex/` and `.claude/` are **generated** and committed so a clone can install without a build step. Never edit them by hand.
- Skills have a per-skill record in [provenance.json](provenance.json). Vendored skills keep their upstream license (see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).

## Setup

```bash
cd tools/codex && npm install   # provides the yaml dependency used by all tools
```

## Change workflow

1. Edit under `.agents/` (or `tools/`).
2. Rebuild and regenerate:
   ```bash
   node tools/codex/build.mjs
   node tools/claude/build.mjs
   node tools/provenance.mjs --write
   node tools/readme-sync.mjs --write
   ```
3. Run the checks CI runs:
   ```bash
   node tools/codex/validate.mjs --source
   node tools/claude/validate.mjs --source
   node tools/provenance.mjs --check
   node tools/readme-sync.mjs --check
   node tools/scan-skills.mjs
   node tools/lint-skills.mjs
   ```
4. Commit the source change **and** the regenerated bundles together. CI rebuilds and fails on any difference.

## Skill rules (enforced by `tools/lint-skills.mjs`)

- `description`: 80 to 300 characters and say when to use the skill ("Use when ...").
- `SKILL.md`: 500 lines or fewer; move detail into `references/` files.
- Existing violations are listed in `tools/lint-baseline.json`. New or worse violations fail CI. After fixing a skill, refresh with `node tools/lint-skills.mjs --write-baseline`.
- No remote-execution patterns (`curl ... | bash`, `npx -y` without a version). Reviewed exceptions go in `tools/scan-allowlist.json`.

## Commit messages

Conventional commits: `type(scope)?: summary`. Types: `feat fix docs chore refactor test ci perf style build revert`. CI checks only new commits (`node tools/check-commits.mjs <base>..<head>`).

## Releases

Tag with semver (`v0.1.0`) and add a section to [CHANGELOG.md](CHANGELOG.md). Install from a tag or commit SHA rather than the default branch.

## Security

See [SECURITY.md](SECURITY.md). Do not open public issues for vulnerabilities.
