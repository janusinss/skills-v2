# Third-Party Notices

This repository bundles third-party skills and libraries. They keep their own licenses and are **not** covered by the root [LICENSE](LICENSE) (MIT, material authored here only).

Per-skill provenance lives in [provenance.json](provenance.json) (`source`, `sourceType`, `license`, `modified`, `contentHash`). Regenerate with `node tools/provenance.mjs --write`; CI enforces `node tools/provenance.mjs --check`.

> [!IMPORTANT]
> License values below come from each skill's `license:` frontmatter, bundled `LICENSE` file, or recorded upstream catalog metadata. Entries marked **unverified** have no explicit license file in this repo and require upstream verification before standalone redistribution.

## Upstream Skill Families (`provenance.json`)

| Upstream Source | Skill Count | License | Representative Skills |
| :--- | ---: | :--- | :--- |
| `sickn33/antigravity-awesome-skills` | 75 | MIT | `ab-test-setup`, `api-patterns`, `architecture-patterns`, `database-design`, `docker-expert`, `ethical-hacking-methodology`, `kaizen`, `python-patterns`, `react-patterns`, `tailwind-patterns`, `top-web-vulnerabilities` |
| `vibeforge1111/vibeship-spawner-skills` | 12 | Apache-2.0 | `3d-web-experience`, `agent-evaluation`, `ai-agents-architect`, `aws-serverless`, `browser-automation`, `context-window-management`, `interactive-portfolio`, `langfuse`, `langgraph`, `prompt-caching`, `rag-engineer`, `scroll-experience` |
| `affaan-m/everything-claude-code` | 5 | MIT | `agent-security-hardening`, `agent-self-evaluation`, `agentic-engineering`, `ai-regression-testing`, `continuous-agent-loop` |
| `Leonxlnx/imagegen-skills` | 4 | MIT | `brandkit`, `image-to-code`, `imagegen-frontend-mobile`, `imagegen-frontend-web` |
| `mrgoonie/claudekit-skills` | 4 | MIT | `brand`, `design`, `design-system`, `ui-styling` |
| `usestrix/strix` | 4 | Apache-2.0 | `application-security-testing`, `ci-security-scanning-with-strix`, `fix-security-vulnerabilities-with-strix`, `penetration-testing-with-strix` |
| `original` (`janusinss/skills-v2`) | 3 | MIT | `prompt-enhancer`, `prompt-enhancer-backend`, `prompt-enhancer-frontend` |
| `Leonxlnx/taste-skill` | 1 | MIT | `design-taste-frontend` |
| `anthropics/skills` | 1 | Apache-2.0 | `mcp-builder` |
| `basementstudio/scrollytelling` | 1 | MIT | `scrollytelling` |
| `conorbronsdon/avoid-ai-writing` | 1 | MIT | `avoid-ai-writing` |
| `cloudflare/security-audit-skill` | 1 | **unverified** | `security-audit` |
| `lackeyjb/playwright-skill` | 1 | MIT | `playwright-skill` |
| `nextlevelbuilder/ui-ux-pro-max-skill` | 1 | MIT | `ui-ux-pro-max` |
| `pbakaus/impeccable` | 1 | Apache-2.0 | `impeccable` |
| `supabase/agent-skills` | 1 | MIT | `postgres-best-practices` |
| `tt-a1i/archify` | 1 | Apache-2.0 | `archify` |
| `vercel-labs/agent-skills` | 1 | MIT | `react-best-practices` |
| `VoltAgent/awesome-design-md` | 1 | MIT | `awesome-design-md` |

## Vendored Directories with Dedicated License Files

| Path | License File |
| :--- | :--- |
| `.agents/skills/archify/` | `LICENSE` (Apache-2.0), `LICENSE-MIT` |
| `.agents/skills/archify/explainer/vendor/pele/` | `LICENSE` |
| `.agents/skills/avoid-ai-writing/` | `LICENSE` (MIT) |
| `.agents/skills/awesome-design-md/` | `LICENSE` (MIT) |
| `.agents/skills/mcp-builder/` | `LICENSE.txt` (Apache-2.0) |
| `.agents/skills/ui-styling/` | `LICENSE.txt` (MIT) |
| `.agents/resources/creative-libraries/lenis/` | `LICENSE` (MIT) |

The same files exist in converted bundles where exported (`.codex/` and `.claude/`).

## Vendored Libraries Without a Bundled License File

| Path | Note |
| :--- | :--- |
| `.agents/resources/creative-libraries/gsap/` | No `LICENSE` file beside the vendored `dist/`, `esm/`, `src/`, and `types/` directories; refer to GSAP's standard terms and `package.json` before standalone redistribution. |
