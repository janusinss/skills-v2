# Agent Skills & Workspace Configurations

<!-- generated:counts -->
A curated collection of **71 top-level AI agent skills**, 32 specialized subagents, 10 architectural rules and 8 Claude Code slash commands, with multi-profile installers across three editions: **AGY / Gemini**, **GPT / Codex** and **Anthropic / Claude Code**.
<!-- /generated:counts -->

---

## 📁 Repository Structure

```text
├── .agents/               # Antigravity / Gemini edition (skills, agents, rules, hooks, resources)
├── .codex/                # OpenAI / Codex edition (skills, rules, resources, agents)
├── .claude/               # Anthropic / Claude Code edition (skills, agents, commands, rules)
├── tools/
│   ├── codex/             # Codex build, validation, export, and installation tools
│   └── claude/            # Claude Code build, validation, export, and installation tools
├── AGENTS.md              # Universal agent policy: ADHD Mode, local rules, and browser verification
├── CLAUDE.md              # Claude Code workspace memory (synchronized from AGENTS.md)
├── INSTALL.md             # Shared installer router for all three editions
├── skills-lock.json       # Upstream dependency lockfile (managed by `npx skills`)
├── provenance.json        # Per-skill source, license, modified note and content hash
├── LICENSE                # MIT (original material only); see THIRD_PARTY_NOTICES.md
├── CONTRIBUTING.md        # Workflow: edit .agents/, rebuild, run the CI checks
└── .gitignore             # Root ignore rules
```

---

## 🚀 Quick Install & Setup

### Automated (AI Agent)

Ask your coding assistant:
> "Install this skills repo here: https://github.com/janusinss/skills-v2. Read its INSTALL.md first."

The agent reads [INSTALL.md](INSTALL.md), asks **Question 1** (edition: **AGY** / **CODEX** / **CLAUDE**) and **Question 2** (hook mode: **HARNESS MODE** vs **DESIGNER MODE**, or `--no-hooks` opt-out), and installs the matching bundle with its 32 specialized subagents:

| Edition | Payload | Target Instructions |
| :--- | :--- | :--- |
| **GPT / CODEX** | Prebuilt `.codex/` bundle + verified Playwright & `agent-browser` | `AGENTS.md` (or `AGENTS.designer.md` in Designer mode, configured with `.codex/` paths) |
| **AGY / GEMINI** | Original `.agents/` tree + `skills-lock.json` | `AGENTS.md` (full or Designer mode without Section 5 Harness, configured with `.agents/` paths) |
| **ANTHROPIC / CLAUDE CODE** | Prebuilt `.claude/` bundle (`skills/`, `agents/`, `commands/`) | `CLAUDE.md` (or `CLAUDE.designer.md` in Designer mode, configured with `.claude/` paths) |

---

### Manual Setup

From a cloned checkout of this repository, use the unified `node install.mjs` entrypoint (interactive prompts in a TTY, or explicit flags) or run an edition installer directly:

```powershell
# Interactive unified installer (prompts for Edition, Hook Mode, and Target)
node install.mjs

# Unified non-interactive installs across all three editions (--mode harness|designer)
node install.mjs --edition agy --mode harness --target "C:/Projects/my-project"
node install.mjs --edition codex --mode designer --target "C:/Projects/my-project" --profile all
node install.mjs --edition claude --mode harness --target "C:/Projects/my-project" --profile all

# Direct edition installers (--mode defaults to harness in non-TTY/CI; pass --no-hooks to disable hooks)
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all --mode harness
node tools/claude/install.mjs --target "C:/Projects/my-project" --profile all --mode designer
```

### Installation Profiles

Both the Codex and Claude Code installers accept `--profile <name>` to install targeted subsets:

<!-- generated:profiles -->
| Profile | Skills | Contents |
| :--- | :---: | :--- |
| **`all`** | 71 | Every skill, rule and subagent. |
| **`minimal`** | 14 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `ui-styling`, +9 more |
| **`frontend`** | 38 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `prompt-enhancer`, +33 more |
| **`backend`** | 34 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `prompt-enhancer`, +29 more |
| **`security`** | 16 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `security-audit`, +11 more |
| **`fullstack`** | 61 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `prompt-enhancer`, +56 more |
<!-- /generated:profiles -->

---

## 🤖 Specialized Subagents (`.agents/agents/`, `.codex/agents/`, `.claude/agents/`)

Domain-specific subagents configured for background task delegation:

<!-- generated:agents -->
| Subagent | Role |
| :--- | :--- |
| **`a11y-architect`** | Accessibility Architect specializing in WCAG 2.2 compliance for Web and Native platforms. |
| **`agent-evaluator`** | Evaluates agent output against 5-axis quality rubric (accuracy, completeness, clarity, actionability, conciseness). |
| **`architect`** | Software architecture specialist for system design, scalability, and technical decision-making. |
| **`build-error-resolver`** | Build and TypeScript error resolution specialist. |
| **`code-architect`** | Designs feature architectures by analyzing existing codebase patterns and conventions, then providing implementation blueprints with concrete files, interfaces, data flow, and build order. |
| **`code-reviewer`** | Expert code review specialist. |
| **`code-simplifier`** | Simplifies and refines code for clarity, consistency, and maintainability while preserving behavior. |
| **`cpp-build-resolver`** | C++ build, CMake, and compilation error resolution specialist. |
| **`database-reviewer`** | PostgreSQL database specialist for query optimization, schema design, security, and performance. |
| **`django-build-resolver`** | Django/Python build, migration, and dependency error resolution specialist. |
| **`e2e-runner`** | End-to-end testing specialist using Vercel Agent Browser (preferred) with Playwright fallback. |
| **`explorer`** | Fast Reflex-tier reconnaissance subagent for rapid file discovery, symbol localization, and call-site mapping. |
| **`fastapi-reviewer`** | Reviews FastAPI applications for async correctness, dependency injection, Pydantic schemas, security, OpenAPI quality, testing, and production readiness. |
| **`go-build-resolver`** | Go build, vet, and compilation error resolution specialist. |
| **`go-reviewer`** | Expert Go code reviewer specializing in idiomatic Go, concurrency patterns, error handling, and performance. |
| **`penetration-tester`** | Specialist subagent for executing penetration testing, vulnerability validation, security test suites, and functional web-flow verification based on penetrating-and-testing.md. |
| **`performance-optimizer`** | Performance analysis and optimization specialist. |
| **`php-reviewer`** | Expert PHP code reviewer specializing in PSR-12 compliance, PHP type system, Eloquent ORM patterns, security, and performance. |
| **`planner`** | Expert planning specialist for complex features and refactoring. |
| **`pytorch-build-resolver`** | PyTorch runtime, CUDA, and training error resolution specialist. |
| **`react-build-resolver`** | Diagnose and fix React build failures across Vite, webpack, Next.js, CRA, Parcel, esbuild, and Bun. |
| **`react-reviewer`** | Expert React/JSX code reviewer specializing in hook correctness, render performance, server/client component boundaries, accessibility, and React-specific security. |
| **`refactor-cleaner`** | Dead code cleanup and consolidation specialist. |
| **`rust-build-resolver`** | Rust build, compilation, and dependency error resolution specialist. |
| **`rust-reviewer`** | Expert Rust code reviewer specializing in ownership, lifetimes, error handling, unsafe usage, and idiomatic patterns. |
| **`security-auditor`** | Specialist subagent for conducting adversarial pre-commit security audits, vulnerability detection, and exploit defense reviews based on security.md. |
| **`silent-failure-hunter`** | Review code for silent failures, swallowed errors, bad fallbacks, and missing error propagation. |
| **`skeptic`** | Cold-Context Adversarial Skeptic for independent pre-merge verification. |
| **`spec-miner`** | Extracts behavioral specs from existing codebases for OpenSpec. |
| **`tdd-guide`** | Test-Driven Development specialist enforcing write-tests-first methodology. |
| **`typescript-reviewer`** | Expert TypeScript/JavaScript code reviewer specializing in type safety, async correctness, Node/web security, and idiomatic patterns. |
| **`vue-reviewer`** | Expert Vue.js code reviewer specializing in Composition API correctness, reactivity pitfalls, component architecture, template security, and Vue-specific performance. |
<!-- /generated:agents -->

### Claude Code Slash Commands (`.claude/commands/`)

In Claude Code, engineering phases are triggered directly via native slash commands:
- `/plan <task>`: Invoke `@planner` for atomic implementation planning.
- `/tdd <task>`: Invoke `@tdd-guide` to author failing tests before writing code.
- `/audit`: Invoke `@security-auditor` and `@silent-failure-hunter` for defense-in-depth audits.
- `/review`: Invoke `@typescript-reviewer` or `@code-reviewer` for code quality checks.
- `/eval`: Invoke `@agent-evaluator` to grade delivery quality on a 1–5 scale.
- `/contract <task>`: Initialize a pre-flight task contract and adaptive worktree via `harness.mjs`.
- `/verify <task>`: Run deterministic receipt verification (`harness.mjs`) and cold-context `@skeptic` evaluation.
- `/flywheel <task>`: Record a root-cause invariant into the Calibrated Dual-Store Memory Flywheel and checkpoint progress.

---

## 📋 Workspace Rules (`.agents/rules/`, `.codex/rules/`, `.claude/rules/`)

Foundational architectural guidelines enforced automatically across all editions:

| Rule | Trigger | Scope & Key Guardrails |
| :--- | :---: | :--- |
| [`UI_Always.md`](.agents/rules/UI_Always.md) | Always-on UI | Header clearance, zero horizontal overflow, 44px tap targets, 8-state interactive primitives, Playwright + agent-browser audits. |
| [`MOTION.md`](.agents/rules/MOTION.md) | UI Motion | Spring physics, composite-only (`transform`/`opacity`), rest invariant, reduced-motion fallback. |
| [`frontend.md`](.agents/rules/frontend.md) | UI Components | Frontend Skill Dispatch Matrix, Next.js App Router default, Design Read contract, Archetypes A/B, anti-slop gates. |
| [`starting-brandnew.md`](.agents/rules/starting-brandnew.md) | Greenfield | Conflict pre-check, 84+ brand systems from awesome-design-md, archify diagrams, component scaffolding. |
| [`starting-existing.md`](.agents/rules/starting-existing.md) | Redesign | Design token extraction, archify & untangle-codebase structural audit, non-breaking redesign. |
| [`backend.md`](.agents/rules/backend.md) | Data Layer | Backend Skill Dispatch Matrix, service/repository layers, connection pooling, archify ERDs, transactions. |
| [`security.md`](.agents/rules/security.md) | Auth & APIs | 8 defensive hardening phases (Phases 0–7), Argon2id/bcrypt, CSRF tokens, strict CORS, error suppression. |
| [`penetrating-and-testing.md`](.agents/rules/penetrating-and-testing.md) | Pentest & QA | Strix autonomous exploit verification with PoCs, vulnerabilities.json remediation, 8-state UI + Empty/403 & agent-browser flows. |
| [`learned-invariants.md`](.agents/rules/learned-invariants.md) | Memory Flywheel | Calibrated dual-store promoted root-cause invariants and anti-regression guardrails. |
| [`install.md`](.agents/rules/install.md) | Onboarding | Interactive setup router (AGY / Codex / Claude + HARNESS MODE / DESIGNER MODE). |

---

## 🛠️ Included Skill Domains (71 Skills)

| Domain | Count | Key Skills |
| :--- | :---: | :--- |
| **🎨 Frontend & UI/UX** | 19 | `anti-ai-slop`, `awesome-design-md`, `brandkit`, `design`, `design-system`, `design-taste-frontend`, `frontend-developer`, `image-to-code`, `imagegen-frontend-web`, `impeccable`, `javascript-pro`, `nextjs-app-router-patterns`, `nextjs-best-practices`, `react-best-practices`, `react-patterns`, `tailwind-patterns`, `typescript-expert`, `ui-styling`, `ui-ux-pro-max` |
| **⚙️ Backend, APIs & Persistence** | 13 | `api-patterns`, `architecture-patterns`, `async-python-patterns`, `backend-dev-guidelines`, `database-design`, `django-pro`, `fastapi-templates`, `go-concurrency-patterns`, `golang-pro`, `mcp-builder`, `nodejs-best-practices`, `postgres-best-practices`, `python-patterns` |
| **🔒 Security & Pentesting** | 10 | `api-security-best-practices`, `application-security-testing`, `auth-implementation-patterns`, `ci-security-scanning-with-strix`, `ethical-hacking-methodology`, `fix-security-vulnerabilities-with-strix`, `frontend-security-coder`, `penetration-testing-with-strix`, `security-audit`, `top-web-vulnerabilities` |
| **🧪 Testing, Browser & QA** | 8 | `agent-browser`, `e2e-testing-patterns`, `lint-and-validate`, `playwright-skill`, `python-testing-patterns`, `systematic-debugging`, `test-driven-development`, `test-fixing` |
| **📈 SEO, Content & Product Specs** | 8 | `seo-audit`, `programmatic-seo`, `competitor-alternatives`, `content-creator`, `avoid-ai-writing`, `prompt-enhancer`, `prompt-enhancer-backend`, `prompt-enhancer-frontend` |
| **🎮 Creative, Motion, 3D & Diagrams** | 4 | `archify`, `3d-web-experience`, `scroll-experience`, `scrollytelling` |
| **🛠️ Core Engineering, Ops & Harness** | 9 | `untangle-codebase`, `concise-planning`, `code-review-checklist`, `architecture-decision-records`, `continuous-agent-loop`, `agent-self-evaluation`, `git-pushing`, `docker-expert`, `observability-engineer` |

---

## 🔄 Maintenance & Rebuilding

```powershell
# Rebuild & validate Codex edition
node tools/codex/build.mjs
node tools/codex/validate.mjs --source

# Rebuild & validate Claude Code edition
node tools/claude/build.mjs
node tools/claude/validate.mjs --source

# Update target workspace .gitignore or re-verify installation
node tools/codex/install.mjs --target "C:/Projects/my-project" --resume
node tools/claude/install.mjs --target "C:/Projects/my-project" --resume

# Repository checks (also run in CI)
node tools/lint-skills.mjs        # description length/trigger wording, SKILL.md <= 500 lines (baseline-gated)
node tools/scan-skills.mjs        # remote-execution patterns
node tools/provenance.mjs --check # per-skill source/license/hash record
```

Skills with a non-null `modified` in [provenance.json](provenance.json) diverge from upstream. Do not run `npx skills update` on them without reviewing the diff.

---

## ⚙️ Target Project `.gitignore`

The automated installers merge project rules into the target's `.gitignore` while un-ignoring executable rules, subagents, and commands:

- **Codex**: Ignores `/.codex/*` while preserving `!/.codex/rules/` and `!/.codex/agents/`.
- **Claude Code**: Ignores `/.claude/*` while preserving `!/.claude/rules/`, `!/.claude/agents/`, and `!/.claude/commands/`.
- **Antigravity**: Ignores `/.agents/*` while preserving `!/.agents/rules/` and `!/.agents/agents/`.

---

## ⚖️ License & Provenance

Original material is MIT-licensed ([LICENSE](LICENSE)). Vendored third-party skills keep their own licenses: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [provenance.json](provenance.json). Run `node tools/provenance.mjs --check` to verify.

