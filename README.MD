# Agent Skills & Workspace Configurations

<!-- generated:counts -->
A curated collection of **118 top-level AI agent skills**, 30 specialized subagents, 9 architectural rules and 5 Claude Code slash commands, with multi-profile installers across three editions: **AGY / Gemini**, **GPT / Codex** and **Anthropic / Claude Code**.
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

The agent reads [INSTALL.md](INSTALL.md), asks for your target edition, and installs it:

| Edition | Payload | Target Instructions |
| :--- | :--- | :--- |
| **GPT / CODEX** | Prebuilt `.codex/` bundle + verified Playwright | `AGENTS.md` (configured with `.codex/` paths) |
| **AGY / GEMINI** | Original `.agents/` tree + `skills-lock.json` | `AGENTS.md` (configured with `.agents/` paths) |
| **ANTHROPIC / CLAUDE CODE** | Prebuilt `.claude/` bundle (`skills/`, `agents/`, `commands/`) | `CLAUDE.md` (configured with `.claude/` paths) |

---

### Manual Setup

From a cloned checkout of this repository:

```powershell
# 1. GPT / Codex (Installs .codex/ + AGENTS.md + Playwright + .gitignore)
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all

# 2. Anthropic / Claude Code (Installs .claude/ + CLAUDE.md + custom commands + .gitignore)
node tools/claude/install.mjs --target "C:/Projects/my-project" --profile all

# 3. Antigravity / Gemini
# Copy .agents/, root AGENTS.md, and skills-lock.json into the target workspace.
```

### Installation Profiles

Both the Codex and Claude Code installers accept `--profile <name>` to install targeted subsets:

<!-- generated:profiles -->
| Profile | Skills | Contents |
| :--- | :---: | :--- |
| **`all`** | 118 | Every skill, rule and subagent. |
| **`minimal`** | 8 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `ui-styling`, +3 more |
| **`frontend`** | 31 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `prompt-enhancer`, +26 more |
| **`backend`** | 29 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `prompt-enhancer`, +24 more |
| **`security`** | 15 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `security-audit`, +10 more |
| **`fullstack`** | 52 | `concise-planning`, `systematic-debugging`, `code-review-checklist`, `lint-and-validate`, `prompt-enhancer`, +47 more |
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

---

## 📋 Workspace Rules (`.agents/rules/`, `.codex/rules/`, `.claude/rules/`)

Foundational architectural guidelines enforced automatically across all editions:

| Rule | Trigger | Scope & Key Guardrails |
| :--- | :---: | :--- |
| [`UI_Always.md`](.agents/rules/UI_Always.md) | Always-on UI | Header clearance, zero horizontal overflow, 44px tap targets, anti-slop visual floor, Playwright audits. |
| [`MOTION.md`](.agents/rules/MOTION.md) | UI Motion | Spring physics, composite-only (`transform`/`opacity`), rest invariant, reduced-motion fallback. |
| [`frontend.md`](.agents/rules/frontend.md) | UI Components | Next.js App Router default, design token adherence, responsive multi-viewport QA. |
| [`starting-brandnew.md`](.agents/rules/starting-brandnew.md) | Greenfield | Conflict pre-check, curated brand system from `awesome-design-md`, component scaffolding. |
| [`starting-existing.md`](.agents/rules/starting-existing.md) | Redesign | Design token extraction, scoped non-breaking refactoring, regression prevention. |
| [`backend.md`](.agents/rules/backend.md) | Data Layer | Service/repository separation, connection pooling, schema integrity, atomic transaction boundaries. |
| [`security.md`](.agents/rules/security.md) | Auth & APIs | 7 defensive hardening phases, Argon2id/bcrypt, CSRF tokens, strict CORS, error suppression. |
| [`penetrating-and-testing.md`](.agents/rules/penetrating-and-testing.md) | Pentest & QA | Strix autonomous exploit verification with PoCs, `vulnerabilities.json` reporting, 5-state UI tests. |
| [`install.md`](.agents/rules/install.md) | Onboarding | Interactive setup router supporting GPT / Codex, AGY / Gemini, and Claude Code. |

---

## 🛠️ Included Skill Domains (118 Skills)

| Domain | Count | Key Skills |
| :--- | :---: | :--- |
| **🎨 Frontend & UI/UX** | 21 | `ui-ux-pro-max`, `impeccable`, `design-taste-frontend`, `awesome-design-md`, `ui-styling`, `react-best-practices`, `nextjs-best-practices`, `tailwind-patterns` |
| **📱 Mobile Development** | 5 | `flutter-expert`, `ios-developer`, `react-native-architecture`, `mobile-design`, `imagegen-frontend-mobile` |
| **⚙️ Backend & Persistence** | 18 | `backend-dev-guidelines`, `database-design`, `postgres-best-practices`, `fastapi-templates`, `api-patterns`, `django-pro`, `golang-pro`, `rust-pro` |
| **🔒 Security & Pentesting** | 10 | `penetration-testing-with-strix`, `security-audit`, `api-security-best-practices`, `auth-implementation-patterns`, `top-web-vulnerabilities`, `fix-security-vulnerabilities-with-strix` |
| **🧪 Testing & Quality** | 8 | `playwright-skill`, `browser-automation`, `test-driven-development`, `test-fixing`, `systematic-debugging`, `ai-regression-testing` |
| **☁️ DevOps, Cloud & SRE** | 9 | `docker-expert`, `kubernetes-architect`, `aws-serverless`, `terraform-specialist`, `observability-engineer`, `distributed-tracing` |
| **🤖 AI & Autonomous Agents** | 15 | `ai-agents-architect`, `agentic-engineering`, `agent-evaluation`, `agent-self-evaluation`, `rag-engineer`, `langgraph`, `langfuse`, `llm-app-patterns` |
| **📈 Product & Growth** | 18 | `prompt-enhancer`, `copywriting`, `copy-editing`, `avoid-ai-writing`, `content-creator`, `brandkit`, `product-manager-toolkit`, `launch-strategy` |
| **🎮 Creative, Motion & 3D** | 5 | `scrollytelling`, `scroll-experience`, `3d-web-experience`, `claude-d3js-skill`, `archify` |
| **🛠️ Core Engineering** | 9 | `concise-planning`, `code-review-checklist`, `architecture-decision-records`, `full-output-enforcement`, `git-pushing`, `stripe-integration` |

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
- **Antigravity**: Ignores `.agents/*` while preserving `!.agents/rules/`.

---

## ?? License & Provenance

Original material is MIT-licensed ([LICENSE](LICENSE)). Vendored third-party skills keep their own licenses: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [provenance.json](provenance.json). Run `node tools/provenance.mjs --check` to verify.

