# Security Policy

## Reporting a vulnerability

Use GitHub private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**. Do not open a public issue for security problems.

## Supported versions

Only the latest commit on `main` is supported.

## Trust model

- Skills, rules and subagents are instructions that an AI agent follows. Review any skill before installing it into a project you care about.
- Install from a pinned tag or commit SHA, not the default branch.
- Hooks are opt-in in every edition (`.agents/hooks.example.json`, Codex `--include-hooks`). Enabling them lets the Impeccable launcher run on every edit.
- The Impeccable engine binary is not committed. Its launcher downloads it on first use and refuses it unless the SHA-256 matches `engine-checksums.txt`.
- CI runs `tools/scan-skills.mjs` (remote-execution patterns), `tools/provenance.mjs --check` and `gitleaks`.
