# Security Policy

## Reporting a vulnerability

Use GitHub private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**. Do not open a public issue for security problems.

## Supported versions

Only the latest commit on `main` is supported.

## Trust model

- Skills, rules and subagents are instructions that an AI agent follows. Review any skill before installing it into a project you care about.
- Install from a pinned tag or commit SHA, not the default branch.
- Hooks are opt-in in the source checkout (`.agents/hooks.example.json`, `.agents/hooks.impeccable.example.json`) and mode-selected at install time across AGY, Codex, and Claude Code: `--mode harness` (default in non-interactive runs; enables Harness + Impeccable + `design-taste-frontend` + `avoid-ai-writing` hooks plus `.git/hooks/pre-commit`), `--mode designer` (enables non-Harness design/prose hooks only and skips `.git/hooks/pre-commit`), or `--no-hooks` (disables all active hooks and git pre-commit). Enabling hooks lets the configured gates and Impeccable launcher run on edits/stops.
- The Impeccable engine binary is not committed. Its launcher downloads it on first use and refuses it unless the SHA-256 matches `engine-checksums.txt`.
- CI runs `tools/scan-skills.mjs` (remote-execution patterns), `tools/provenance.mjs --check` and `gitleaks`.
