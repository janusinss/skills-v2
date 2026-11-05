# Third-Party Notices

This repository bundles third-party skills and libraries. They keep their own licenses and are **not** covered by the root [LICENSE](LICENSE) (MIT, material authored here only).

Per-skill data lives in [provenance.json](provenance.json) (source, license, content hash). Regenerate with `node tools/provenance.mjs --write`; CI runs `node tools/provenance.mjs --check`.

> [!IMPORTANT]
> License values below are taken from each skill's own `license:` frontmatter or bundled LICENSE file. They have **not** been checked against the upstream repositories. Entries marked **unverified** have no license information in this repo and need a manual upstream check before redistribution.

## Skills with a recorded upstream (`skills-lock.json`)

| Skill(s) | Upstream | License as found in repo |
| :--- | :--- | :--- |
| `application-security-testing`, `ci-security-scanning-with-strix`, `fix-security-vulnerabilities-with-strix`, `penetration-testing-with-strix` | usestrix/strix | Apache-2.0 |
| `archify` | tt-a1i/archify | Apache-2.0 (LICENSE, LICENSE-MIT also present) |
| `awesome-design-md` | VoltAgent/awesome-design-md | MIT |
| `scrollytelling` | basementstudio/scrollytelling | MIT |
| `brandkit`, `design-taste-frontend`, `full-output-enforcement`, `image-to-code`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `redesign-existing-projects` | Leonxlnx/taste-skill | **unverified** |
| `security-audit` | cloudflare/security-audit-skill | **unverified** |

## Vendored files with their own license file

| Path | License file |
| :--- | :--- |
| `.agents/skills/archify/` | LICENSE, LICENSE-MIT |
| `.agents/skills/archify/explainer/vendor/pele/` | LICENSE |
| `.agents/skills/avoid-ai-writing/` | LICENSE (MIT) |
| `.agents/skills/awesome-design-md/` | LICENSE |
| `.agents/skills/mcp-builder/` | LICENSE.txt (Apache-2.0) |
| `.agents/skills/ui-styling/` | LICENSE.txt (MIT) |
| `.agents/resources/creative-libraries/lenis/` | LICENSE |

The same files exist under `.codex/` and `.claude/`.

## Vendored libraries without a license file in this repo

| Path | Note |
| :--- | :--- |
| `.agents/resources/creative-libraries/gsap/` | No LICENSE file found beside the vendored dist/esm/src/types files; check GSAP's package.json and terms before redistributing. |

## Skills with unknown origin

103 of 118 top-level skills have `source: unknown` in `provenance.json`. Their origin and license are not established. Replace `unknown` with the real upstream (or `original`) as each is confirmed.
