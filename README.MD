# Agent Skills & Workspace Configurations

A collection of **118 curated top-level AI agent skills**, architectural rules, specialized subagents, and workflow resources, with dedicated editions for **AGY / Gemini**, **GPT / Codex**, and **Anthropic / Claude Code**.

---

## 📁 Repository Structure

```text
├── .agents/               # Antigravity / Gemini edition
│   ├── agents/            # Specialized subagents: planner, tdd-guide, security-auditor, build resolvers
│   ├── hooks.json         # Automated lifecycle hooks (UI checks & design deep passes)
│   ├── rules/             # 9 architectural guidelines & proactive rules (UI, motion, backend, security, testing, install)
│   ├── skills/            # 118 curated agent skills across 10 engineering domains
│   └── resources/         # Creative libraries, shader utilities, and ambient types
├── .codex/                # OpenAI / Codex edition (skills, rules, resources, agents)
├── .claude/               # Anthropic / Claude Code edition (skills, agents, commands, rules)
├── tools/
│   ├── codex/             # Codex conversion, validation, export, and install tools
│   └── claude/            # Claude Code conversion, validation, export, and install tools
├── AGENTS.md              # Universal agent policy: ADHD Mode, local rules, browser checks & installation
├── CLAUDE.md              # Claude Code project instructions & memory (synchronized from AGENTS.md)
├── INSTALL.md             # Shared installer: ask GPT / CODEX, AGY / GEMINI, or ANTHROPIC / CLAUDE CODE
├── skills-lock.json       # Skill dependency manifest and integrity lockfile
└── .gitignore             # Environment and ephemeral file ignore rules
```

---

## 🚀 Quick Install & Setup

### AI Agent Mode

Inside your coding assistant, say:

> "Install this skills repo here: https://github.com/janusinss/skills-v2. Read its INSTALL.md first."

The agent follows [INSTALL.md](INSTALL.md) and asks:

> **Which version would you like to install: GPT / CODEX, AGY / GEMINI, or ANTHROPIC / CLAUDE CODE?**

It waits for your choice, then installs that edition into the current target project.

| Choice | Payload | Target instruction file |
| --- | --- | --- |
| **GPT / CODEX** | Prebuilt converted `.codex/` edition, installed directly as `.codex/` | `AGENTS.md` (configured with `.codex/` paths) |
| **AGY / GEMINI** | Original `.agents/` tree and `skills-lock.json` | `AGENTS.md` (configured with `.agents/` paths) |
| **ANTHROPIC / CLAUDE CODE** | Prebuilt converted `.claude/` edition (`skills/`, `agents/`, `commands/`, `rules/`) | `CLAUDE.md` (configured with `.claude/` paths) |

---

### Manual Setup

Clone this repository separately from the target project, then follow the selected branch in [INSTALL.md](INSTALL.md).

#### 1. GPT / CODEX
```powershell
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all
```
This installs the committed bundle directly into `.codex/` with root `AGENTS.md`, sets up and verifies Playwright, and configures `.gitignore`.

#### 2. ANTHROPIC / CLAUDE CODE
```powershell
node tools/claude/install.mjs --target "C:/Projects/my-project" --profile all
```
This installs the committed bundle directly into `.claude/` with root `CLAUDE.md`, sets up custom slash commands (`/plan`, `/tdd`, `/audit`, `/review`, `/eval`), sets up and verifies Playwright, and configures `.gitignore`.

#### 3. AGY / GEMINI
Copy `.agents/`, root `AGENTS.md`, and `skills-lock.json` into the target workspace, then execute target `.agents/rules/install.md`.

---

### Active Editions in This Repository

1. **Antigravity / Gemini**: Direct native access to 118 skills under `.agents/skills/`, 30 subagents under `.agents/agents/`, and root `AGENTS.md`.
2. **OpenAI / Codex**: Discovers 124 converted and reference skills under `.codex/skills/`, subagents under `.codex/agents/`, and root `AGENTS.md`.
3. **Anthropic / Claude Code**: Discovers 124 converted skills under `.claude/skills/`, 30 subagents under `.claude/agents/` (with native `Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob` permissions), 5 custom workflow commands under `.claude/commands/`, and root `CLAUDE.md`.

### Global Instructions
- **Codex**: `~/.codex/AGENTS.md` (or `%USERPROFILE%\.codex\AGENTS.md` on Windows).
- **Claude Code**: `CLAUDE.md` in repository root is loaded into memory on every session.
- **Antigravity**: Workspace `AGENTS.md` and user customization rules.

---

## 🔄 Updating & Rebuilding Editions

- **Original AGY / Gemini (`.agents/`)**: Update upstream skills using `npx skills update -y` (`playwright-skill` is decoupled from `skills-lock.json` to protect `lib/helpers.js` and local dependencies from being overwritten).
- **GPT / Codex (`.codex/`)**: Rebuild and validate bundle releases using:
  ```powershell
  node tools/codex/build.mjs
  node tools/codex/validate.mjs --source
  ```
- **Anthropic / Claude Code (`.claude/`)**: Rebuild and validate native Claude Code releases using:
  ```powershell
  node tools/claude/build.mjs
  node tools/claude/validate.mjs --source
  ```

---

## 🌐 Universal Agent Policy (`AGENTS.md` & `CLAUDE.md`)

Standardized at workspace root across all supported agent environments:
- **Workspace Rule Delegation**: Automatically delegates frontend, UI/UX, motion, backend architecture, security hardening, and QA requests to local workspace rules (`starting-brandnew.md`, `starting-existing.md`, `frontend.md`, `UI_Always.md`, `MOTION.md`, `backend.md`, `security.md`, `penetrating-and-testing.md`).
- **Selective Skill Dispatch Matrices**: Maps domain tasks directly to target skills while inspecting only the 1–2 skills matching the active surface.
- **Global ADHD Mode**: Enforces action-first formatting (Line 1 action, bounded numbered steps, max 5-item lists, zero conversational filler, and sub-2-minute next steps).

---

## 🤖 Specialized Subagents (`.agents/agents/`, `.codex/agents/`, & `.claude/agents/`)

Domain-specific agent personas configured for isolated background delegation and native tool permissions (`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob` in Claude Code):

| Subagent | Role & Capabilities | Activation / Lifecycle Phase |
| :--- | :--- | :--- |
| **`planner`** | Implementation planning specialist. Deconstructs features into atomic, numbered, verb-first checklists with zero compound steps. | Phase 1 (Planning & Scope) or prompt: *"Plan with planner"* |
| **`code-architect`** | Domain and system architecture specialist. Establishes modular service boundaries, repository patterns, and data flow. | Phase 1 (Architecture) or prompt: *"Design with code-architect"* |
| **`tdd-guide`** | Test-Driven Development lead. Authors failing unit and integration test specifications before feature code is written. | Phase 2 (Test Specification) or prompt: *"Spec with tdd-guide"* |
| **`build-error-resolver`** | Closed-loop TypeScript, bundler, and build failure repair. Emits minimal, surgical micro-patches without architectural refactoring. | Phase 3 (Repair) on build/compiler failure |
| **`silent-failure-hunter`** | Quality gate auditor. Detects swallowed exceptions, empty catch blocks, bad fallbacks, and missing telemetry. | Phase 4 (Defensive Audit) or prompt: *"Audit with silent-failure-hunter"* |
| **`security-auditor`** | Adversarial pre-commit code reviewer. Enforces the 7 defensive phases from `security.md` (injection defense, auth boundaries, IDOR, SSRF, and security header hardening). | Phase 4 (Security Audit) or prompt: *"Audit with security-auditor"* |
| **`penetration-tester`** | Dynamic penetration tester and functional QA. Runs Strix autonomous exploit scans and 5-state UI tests from `penetrating-and-testing.md` in private context. | Phase 4 / QA gate or prompt: *"Test with penetration-tester"* |
| **`typescript-reviewer`** | Expert TypeScript/JavaScript code reviewer specializing in type safety, async correctness, and API edge validation. | Code review gate or prompt: *"Review with typescript-reviewer"* |
| **`agent-evaluator`** | 5-axis quality rubric gatekeeper (accuracy, completeness, clarity, actionability, conciseness). Outputs structured 1–5 scorecards. | Phase 5 (Verification Gate) or prompt: *"Evaluate with agent-evaluator"* |

---

## 📋 Workspace Rules (`.agents/rules/` & `.codex/rules/`)

Foundational architectural guidelines, proactive quality floors, and execution pipelines:

| Rule | Trigger | Activation Criteria | Core Guardrails & Skills Integrated |
| :--- | :---: | :--- | :--- |
| [`UI_Always.md`](.agents/rules/UI_Always.md) | `model_decision` | Always-on when inspecting, writing, or refactoring UI | Proactive CSS floor: fixed-header clearance (`calc(var(--header-height, 4rem) + var(--space-lg, 1.5rem))`), zero horizontal overflow (`min-width: 0`), authentic photography (strict no AI slop), 44px touch targets, canonical structural/copy anti-slop floor, and inline Node Playwright audits. |
| [`MOTION.md`](.agents/rules/MOTION.md) | `model_decision` | Designing, authoring, reviewing, or implementing UI motion & animations | 4-point Quick-Execution Contract + 12-archetype animation toolbox: spring physics (`stiffness`/`damping`), composite-only `transform`/`opacity`, state machine rest invariant (`[Rest] -> [Action] -> [Rest]`), and `@media (prefers-reduced-motion: reduce)`. |
| [`frontend.md`](.agents/rules/frontend.md) | `model_decision` | Designing, building, or refactoring UI components | 4-stage delivery pipeline: modern stack default (Next.js App Router / React 19 + TypeScript + Tailwind CSS + shadcn/ui + `@bsmnt/scrollytelling`), `prompt-enhancer-frontend` scoping, 21st.dev/ThreeUI instant bundle extraction via inline Node, `DESIGN.md` token adherence, `impeccable` Stage 2 visual craft & Stage 3 audit, `MOTION.md` delegation, and multi-viewport responsive QA. |
| [`starting-brandnew.md`](.agents/rules/starting-brandnew.md) | `model_decision` | Greenfield project or building web app from scratch | 6-phase scaffolding: pre-flight conflict check, batched discovery prompt with modern tech stack default (never vanilla HTML/CSS/JS), 74 curated brand systems in `awesome-design-md`, scoped 21st.dev landing blueprints, `impeccable` Stage 2 responsive layout implementation, and Playwright verification. |
| [`starting-existing.md`](.agents/rules/starting-existing.md) | `model_decision` | Auditing, refactoring, or redesigning an existing app | 7-phase redesign: baseline design token extraction, selective visual overhauls (up to 5 curated `DESIGN.md` choices), `impeccable` Stage 2 scoped non-breaking refactors, and browser verification against legacy regression. |
| [`backend.md`](.agents/rules/backend.md) | `model_decision` | Database schemas, ORMs, API routes, or data layers | Production persistence standards: service/repository separation, connection pooling, schema integrity, atomic transaction boundaries, and selective 1–2 backend skill dispatching. |
| [`security.md`](.agents/rules/security.md) | `model_decision` | Server routing, configs, auth, APIs, or data intake | Zero-trust DevSecOps: 7 defensive hardening phases, selective 1–2 security skill dispatching, Argon2id/bcrypt auth, anti-CSRF architecture, strict CORS, error suppression, and negative TDD. |
| [`penetrating-and-testing.md`](.agents/rules/penetrating-and-testing.md) | `model_decision` | Dynamic pentesting, exploit auditing, or full-surface QA | Dual-surface validation: Strix autonomous exploit validation with working PoCs, machine-readable `vulnerabilities.json` generation, and Playwright functional QA across 5 UI states. |
| [`install.md`](.agents/rules/install.md) | `manual` | Initial workspace setup or onboarding (`@install.md`) | Checks GPT / CODEX or AGY / GEMINI first; the AGY branch runs the legacy Playwright bootstrapper and target-only setup cleanup. |

### Rule Lifecycle & Interaction Map

```text
  [ Greenfield ] ──► starting-brandnew.md ┐
                                          ├──► frontend.md ◄──► UI_Always.md & MOTION.md (CSS & Motion Floor)
  [ Existing ]   ──► starting-existing.md ┘        ▲
                                                   │
  [ Data Layer ] ──► backend.md ───────────────────┼──► security.md (Defensive Hardening)
                                                   │          ▲
  [ Pentest/QA ] ──► penetrating-and-testing.md ───┴──────────┘ (Fixes via vulnerabilities.json)
```

---

## 🛡️ Penetration Testing & Security Workflow (`penetrating-and-testing.md`)

The workspace includes a dual-engine security pipeline linking offensive adversarial penetration testing with defensive root-cause remediation:

### The 3-Step Security Cycle

```text
┌────────────────────────────────────────┐
│ 1. OFFENSIVE PENTEST                   │  Run: "Run penetrating-and-testing on <path>"
│    (penetrating-and-testing.md)        │  Outputs: strix_runs/<run>/vulnerabilities.json
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 2. DEFENSIVE REMEDIATION               │  Run: "Apply fixes from vulnerabilities.json using security.md"
│    (security.md + Strix fix skill)     │  Applies root-cause patches (CSRF, SQL params, headers, etc.)
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 3. REGRESSION RE-TEST                  │  Run: "Re-test the fixes from vulnerabilities.json"
│    (PoC & Negative TDD test suite)     │  Executes automated test scripts to prove attack vectors closed
└────────────────────────────────────────┘
```

### Common Prompts to Trigger the Workflow

- **Adversarial Pentest & QA**:
  > *"Run penetrating-and-testing on `<path_or_url>`"*
  > 
  > Probes live endpoints and source code for OWASP Top 10 vulnerabilities, validates exploitability with working PoCs, audits functional web-flow states via Playwright, and writes structured findings to `strix_runs/<run-name>/vulnerabilities.json`.

- **Defensive Remediation**:
  > *"Apply fixes from vulnerabilities.json according to security.md"*
  > 
  > Invokes [`fix-security-vulnerabilities-with-strix`](.agents/skills/fix-security-vulnerabilities-with-strix/SKILL.md) and [`security.md`](.agents/rules/security.md) to patch root causes by severity order (Critical → High → Medium → Low).

- **Regression Verification**:
  > *"Verify and re-test the applied security patches"*
  > 
  > Runs negative TDD test scripts and replays the original PoCs to verify that the vulnerabilities are completely closed without breaking application functionality.

> [!TIP]
> **Proactive Rule of Thumb**: Reference [`security.md`](.agents/rules/security.md) while writing new features so code is hardened from day one. Run [`penetrating-and-testing.md`](.agents/rules/penetrating-and-testing.md) before merges or deployments as the adversarial QA gate.

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

## ⚙️ Target Project `.gitignore` Configuration

The GPT / CODEX installer automatically creates the target's root `.gitignore`, or merges missing entries while preserving existing project rules. [.codex/project.gitignore](.codex/project.gitignore) includes the full supplied OS, secrets, editor, dependency, test, cache, agent-runtime, and audit rules, plus these local Codex entries:

```gitignore
/.codex/*
!/.codex/rules/
/AGENTS.md
/scratch/
/.impeccable/
```

For an already completed Codex installation, run `node tools/codex/install.mjs --target <absolute-project-path> --resume` from the source checkout to create or update this file. This adds the current defaults without reinstalling dependencies or rerunning browser setup. Environment example/template and VS Code exceptions are retained after their exclusions.

For the original AGY / GEMINI edition, if you want agent skills to remain local to your machine without being committed to your application's remote repository, ensure your target project's `.gitignore` includes:

```gitignore
.agents/*
!.agents/rules/
skills-lock.json
AGENTS.md
```

> [!TIP]
> **Why `.agents/*` + `!.agents/rules/`?**
> A blanket `.agents/` ignore causes IDE file indexers (VS Code / Cursor / Antigravity) to hide the directory from chat `@` autocomplete. Un-ignoring `!.agents/rules/` allows `@UI_Always.md` and `@backend.md` to autocomplete in chat while keeping heavy skills, dependencies, and caches safely ignored.
