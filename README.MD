# Agent Skills & Workspace Configurations

A curated collection of **118 top-level AI agent skills**, 30 specialized subagents, 9 architectural rules, and multi-profile installers across three dedicated editions: **AGY / Gemini**, **GPT / Codex**, and **Anthropic / Claude Code**.

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
├── skills-lock.json       # Upstream dependency lockfile
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

| Profile | Skills | Scope & Description |
| :--- | :---: | :--- |
| **`all`** *(default)* | 118 | Complete toolkit across all 10 engineering domains, subagents, and tools. |
| **`minimal`** | 8 | Core essentials for rapid onboarding (planning, debugging, TDD, linting). |
| **`frontend`** | 31 | UI/UX, design tokens, components, responsive layout, motion physics, and Playwright QA. |
| **`backend`** | 29 | Persistence standards, schema design, database optimization, FastAPI, Go, and Rust. |
| **`security`** | 15 | Strix penetration testing, exploit remediation, auth patterns, and API security. |
| **`fullstack`** | 52 | Combined frontend and backend profiles for end-to-end product development. |

---

## 🤖 Specialized Subagents (`.agents/agents/`, `.codex/agents/`, `.claude/agents/`)

Domain-specific subagents configured for background task delegation:

| Subagent | Role & Capabilities | Lifecycle Phase |
| :--- | :--- | :--- |
| **`planner`** | Deconstructs features into atomic, numbered, verb-first checklists. | Phase 1: Planning & Scope |
| **`code-architect`** | Establishes modular service boundaries, repository patterns, and data flow. | Phase 1: Architecture |
| **`tdd-guide`** | Authors failing unit and integration test specifications before implementation. | Phase 2: Test Specification |
| **`build-error-resolver`** | Surgical TypeScript, bundler, and build failure repairs with minimal diffs. | Phase 3: Repair |
| **`silent-failure-hunter`** | Detects swallowed exceptions, empty catch blocks, bad fallbacks, and missing telemetry. | Phase 4: Defensive Audit |
| **`security-auditor`** | Pre-commit security audits (SSRF, injection, auth boundaries, IDOR, ReDoS). | Phase 4: Security Audit |
| **`penetration-tester`** | Autonomous exploit scanning (Strix) and 5-state functional UI testing. | Phase 4: Pentest & QA |
| **`typescript-reviewer`** | Reviews TypeScript/JavaScript for type safety, async correctness, and edge checks. | Code Review Gate |
| **`agent-evaluator`** | Grades delivery against 5-axis quality rubric (accuracy, completeness, clarity, actionability, conciseness). | Phase 5: Verification Gate |

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
```

---

## ⚙️ Target Project `.gitignore`

The automated installers merge project rules into the target's `.gitignore` while un-ignoring executable rules, subagents, and commands:

- **Codex**: Ignores `/.codex/*` while preserving `!/.codex/rules/` and `!/.codex/agents/`.
- **Claude Code**: Ignores `/.claude/*` while preserving `!/.claude/rules/`, `!/.claude/agents/`, and `!/.claude/commands/`.
- **Antigravity**: Ignores `.agents/*` while preserving `!.agents/rules/`.
