# Agent Skills & Workspace Configurations

A collection of **173 top-level AI agent skills**, architectural rules, and workflow resources, with separate **AGY / Gemini** and **GPT / Codex** editions.

---

## 📁 Repository Structure

```text
├── .agents/
│   ├── hooks.json         # Automated lifecycle hooks (UI checks & design deep passes)
│   ├── rules/             # 8 architectural guidelines & proactive rules (UI, backend, security, testing, install)
│   ├── skills/            # 173 specialized agent skills across 12 engineering domains
│   └── resources/         # Creative libraries, shader utilities, and ambient types
├── .codex/                # Active GPT / Codex skills, rules, and resources
├── tools/codex/           # Conversion, validation, and Codex export tools
├── AGENTS.md              # Codex policy: ADHD Mode, local rules, browser checks & installation
├── INSTALL.md             # Shared installer: ask GPT / CODEX or AGY / GEMINI
├── GEMINI.MD              # Original AGY / Gemini workspace policy and installer routing
├── skills-lock.json       # Skill dependency manifest and integrity lockfile
└── .gitignore             # Environment and ephemeral file ignore rules
```

---

## 🚀 Quick Install & Setup

### AI Agent Mode

Inside your coding assistant, say:

> "Install this skills repo here: https://github.com/janusinss/skills-v2. Read its INSTALL.md first."

The agent follows [INSTALL.md](INSTALL.md) and asks:

> **Which version would you like to install: GPT / CODEX or AGY / GEMINI?**

It waits for your choice, then installs that edition into the current target project. Choosing GPT / CODEX automatically executes the converted `install.md`: copy the bundle, install local Playwright and Chromium, verify the runner, and delete the target's one-time rule after success. The source copy stays available. You can still use "INSTALL THIS SKILLS REPO HERE" when the agent already has this checkout. To skip the choice, specify the edition in your request, such as "Install the Codex edition here."

| Choice | Payload | Target instruction file |
| --- | --- | --- |
| GPT / CODEX | Prebuilt converted `.codex/` edition, installed directly as `.codex/` | `AGENTS.md` |
| AGY / GEMINI | Original `.agents/` tree and `skills-lock.json` | `GEMINI.MD` |

The root `AGENTS.md` and `GEMINI.MD` route installation requests through the same choice. The original `@.agents/rules/install.md` entry point also checks the edition before setup.

### Manual Setup

Clone this repository separately from the target project, then follow the selected branch in [INSTALL.md](INSTALL.md). Codex export commands, profiles, and optional hooks are documented in [.codex/README.md](.codex/README.md).

For GPT / CODEX, use Node.js 20 or newer and npm:

```powershell
node tools/codex/install.mjs --target "C:/Projects/my-project" --profile all
```

This installs the committed bundle directly into `.codex/` with root `AGENTS.md`, sets up and verifies Playwright, then removes only the installed `.codex/rules/install.md`. Failed setup keeps the rule; retry with the same target and `--resume`. No conversion build, conversion-tool npm dependencies, AGY submodule download, or path rewriting is needed. An AGY / Gemini assistant can run the same command when the selected target is Codex. `export.mjs` remains available for copy-only staging.

### Active Codex Edition in This Repository

The local Codex loader discovers all 190 converted skills under `.codex/skills/`. Root `AGENTS.md` contains the user's three-section policy with ADHD Mode, local rule selection, and inline browser checks. The builder generates `.codex/AGENTS.md` from those sections for installation as the target project's root instructions. Source-only routing and maintenance notes below `<!-- source-repository-only -->` stay in this collection. Both editions can appear in this collection's skill catalog; root instructions prefer the converted copy when names match. The `.agents/` payload remains available to AGY / Gemini. Restart Codex to reload project instructions. Exported Codex targets use the same `.codex/` structure and contain only the selected edition.

### Codex Global Instructions

Use `~/.codex/AGENTS.md` for general instructions across projects. On Windows, this is `%USERPROFILE%\.codex\AGENTS.md`. `CODEX_HOME` can change that directory, and a nonempty `AGENTS.override.md` takes precedence. Each target project can also have its own root `AGENTS.md`. See [OpenAI's instruction guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

---

## 🔄 Updating Skills

For the original AGY / Gemini edition, update upstream skills while cleaning CLI-generated symlinks (`playwright-skill` is decoupled from `skills-lock.json` to protect `lib/helpers.js` and local dependencies from being overwritten):

**Windows (PowerShell):**
```powershell
npx skills update -y; if (Test-Path .claude) { Remove-Item -Recurse -Force .claude }
```

**macOS / Linux (Bash):**
```bash
npx skills update -y && rm -rf .claude
```

For the Codex edition, maintain the source collection and publish a rebuilt, validated bundle. Installers consume that prebuilt release; they do not rebuild during setup. Review and merge converted updates into an existing target, since the exporter refuses existing files. The original updater lockfile does not describe converted skill hashes.

---

## 🌐 Universal Agent Policy (`GEMINI.MD`)

Loadable at workspace root or globally at `~/.gemini/GEMINI.md`:
- **Workspace Design Delegation**: Automatically delegates all frontend, UI/UX, and motion requests to local workspace rules (`starting-brandnew.md`, `starting-existing.md`, `frontend.md`, `UI_Always.md`).
- **Indirect-Intent Dispatch Matrix**: Maps fuzzy user intents across 11 non-design domains directly to target skills (Backend, Security, DevOps, Testing, AI Agents, Growth, etc.).
- **Global ADHD Mode**: Enforces action-first formatting (Line 1 action, bounded numbered steps, max 5-item lists, zero conversational filler, and sub-2-minute next steps).

---

## 📋 Workspace Rules (`.agents/rules/`)

Foundational architectural guidelines, proactive quality floors, and execution pipelines:

| Rule | Trigger | Activation Criteria | Core Guardrails & Skills Integrated |
| :--- | :---: | :--- | :--- |
| [`UI_Always.md`](.agents/rules/UI_Always.md) | `model_decision` | Always-on when inspecting, writing, or refactoring UI | Proactive CSS floor: fixed-header clearance (`calc(var(--header-height) + 24px)`), zero horizontal overflow (`min-width: 0`), authentic photography (strict no AI slop), 48px touch targets, and inline Node Playwright audits. |
| [`frontend.md`](.agents/rules/frontend.md) | `model_decision` | Designing, building, or refactoring UI components | 4-stage delivery pipeline: `prompt-enhancer-frontend` scoping, 21st.dev/ThreeUI instant bundle extraction via inline Node, design token adherence from `DESIGN.md`, and multi-viewport responsive QA. |
| [`starting-brandnew.md`](.agents/rules/starting-brandnew.md) | `manual` | Greenfield project or building web app from scratch | 6-phase scaffolding: pre-flight conflict check, 74 curated brand systems in `awesome-design-md`, component blueprints, responsive layout implementation, and Playwright verification. |
| [`starting-existing.md`](.agents/rules/starting-existing.md) | `manual` | Auditing, refactoring, or redesigning an existing app | 7-phase redesign: baseline design token extraction, selective visual overhauls, scoped non-breaking refactors, and browser verification against legacy regression. |
| [`backend.md`](.agents/rules/backend.md) | `model_decision` | Database schemas, ORMs, API routes, or data layers | Production persistence standards: service/repository separation, connection pooling, schema integrity, atomic transaction boundaries, and backend skill dispatching. |
| [`security.md`](.agents/rules/security.md) | `model_decision` | Server routing, configs, auth, APIs, or data intake | Zero-trust DevSecOps: 7 defensive hardening phases, plaintext secret eradication, Argon2id/bcrypt auth, anti-CSRF architecture, strict CORS, error suppression, and negative TDD. |
| [`penetrating-and-testing.md`](.agents/rules/penetrating-and-testing.md) | `manual` | Dynamic pentesting, exploit auditing, or full-surface QA | Dual-surface validation: Strix autonomous exploit validation with working PoCs, machine-readable `vulnerabilities.json` generation, and Playwright functional QA across 5 UI states (Empty, Loading, Error, Partial, Ideal). |
| [`install.md`](.agents/rules/install.md) | `manual` | Initial workspace setup or onboarding (`@install.md`) | Checks GPT / CODEX or AGY / GEMINI first; the AGY branch runs the legacy Playwright bootstrapper and target-only setup cleanup. |

### Rule Lifecycle & Interaction Map

```text
  [ Greenfield ] ──► starting-brandnew.md ┐
                                          ├──► frontend.md ◄──► UI_Always.md (Always-On CSS Floor)
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

## 🛠️ Included Skill Domains (173 Skills)

| Domain | Count | Key Skills |
| :--- | :---: | :--- |
| **🎨 Frontend & UI/UX** | 35 | `ui-ux-pro-max`, `impeccable`, `21st-ui-build`, `tailwind-patterns`, `react-best-practices`, `design-taste-frontend`, `awesome-design-md`, `minimalist-ui` |
| **📱 Mobile Development** | 7 | `flutter-expert`, `ios-developer`, `react-native-architecture`, `mobile-design`, `app-store-optimization` |
| **⚙️ Backend & APIs** | 23 | `fastapi-pro`, `database-architect`, `backend-dev-guidelines`, `postgres-best-practices`, `api-patterns`, `golang-pro`, `django-pro`, `sql-pro` |
| **🔒 Security & Auth** | 23 | `penetration-testing-with-strix`, `backend-security-coder`, `top-web-vulnerabilities`, `security-auditor`, `auth-implementation-patterns`, `fix-security-vulnerabilities-with-strix` |
| **🧪 Testing & QA** | 8 | `playwright-skill`, `e2e-testing-patterns`, `systematic-debugging`, `test-driven-development`, `test-fixing` |
| **☁️ DevOps, Cloud & SRE** | 12 | `docker-expert`, `kubernetes-architect`, `aws-serverless`, `terraform-specialist`, `observability-engineer`, `incident-responder` |
| **🤖 AI & LLM Systems** | 11 | `ai-agents-architect`, `langgraph`, `rag-engineer`, `langfuse`, `prompt-engineering`, `context-window-management` |
| **💳 FinTech & Integrations** | 6 | `stripe-integration`, `plaid-fintech`, `twilio-communications`, `hubspot-integration` |
| **🔍 Data & Search** | 11 | `data-engineer`, `dbt-transformation-patterns`, `airflow-dag-patterns`, `algolia-search`, `vector-database-engineer` |
| **🎮 Creative, 3D & Games** | 5 | `3d-web-experience`, `game-development`, `godot-gdscript-patterns`, `unity-developer`, `algorithmic-art` |
| **📈 Product & Growth** | 26 | `prompt-enhancer`, `copywriting`, `avoid-ai-writing`, `seo-audit`, `analytics-tracking`, `launch-strategy`, `competitor-alternatives` |
| **🛠️ Engineering Workflow** | 6 | `architecture-decision-records`, `concise-planning`, `full-output-enforcement`, `git-pushing`, `kaizen` |

---

## ⚙️ Target Project `.gitignore` Configuration

The GPT / CODEX installer automatically creates the target's root `.gitignore`, or merges missing entries while preserving existing project rules. [.codex/project.gitignore](.codex/project.gitignore) includes the full supplied OS, secrets, editor, dependency, test, cache, agent-runtime, and audit rules, plus these local Codex entries:

```gitignore
/.codex/
/AGENTS.md
/scratch/
/.impeccable/
```

For an already completed Codex installation, run `node tools/codex/install.mjs --target <absolute-project-path> --resume` from the source checkout to create or update this file. This adds the current defaults without reinstalling dependencies or rerunning browser setup. Environment example/template and VS Code exceptions are retained after their exclusions.

For the original AGY / GEMINI edition, if you want agent skills to remain local to your machine without being committed to your application's remote repository, ensure your target project's `.gitignore` includes:

```gitignore
.agents/
skills-lock.json
GEMINI.MD
```
