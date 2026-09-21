# Agent Skills & Workspace Configurations

A curated collection of **173 production-grade AI agent skills**, architectural rules, and automated workflow hooks for modern AI coding assistants (Google Antigravity, Claude Code, Cursor, and Gemini).

---

## 📁 Repository Structure

```text
├── .agents/
│   ├── hooks.json         # Automated lifecycle hooks (UI checks & design deep passes)
│   ├── rules/             # 8 architectural guidelines & proactive rules (UI, backend, security, testing, install)
│   ├── skills/            # 173 specialized agent skills across 12 engineering domains
│   └── resources/         # Creative libraries, shader utilities, and ambient types
├── GEMINI.MD              # Universal agent policy: design delegation, dispatch matrix & ADHD protocol
├── skills-lock.json       # Skill dependency manifest and integrity lockfile
└── .gitignore             # Environment and ephemeral file ignore rules
```

---

## 🚀 Quick Install & Setup

### Option 1: AI Agent Mode (Prompt-Based & Self-Cleaning)
Inside your AI coding assistant (Google Antigravity, Claude Code, Cursor), tell the agent:
> *"Install the skills from https://github.com/janusinss/skills-v2 and run `@.agents/rules/install.md` to configure the workspace."*

The agent copies `.agents/` and `GEMINI.MD`, runs global Playwright/Chromium setup, verifies in-memory execution, and deletes `install.md` upon completion.

### Option 2: Clone & Setup (Manual)

**Windows (PowerShell):**
```powershell
git clone https://github.com/janusinss/skills-v2.git temp-skills
Copy-Item -Recurse -Path "temp-skills\.agents" -Destination ".\.agents"
Copy-Item -Path "temp-skills\GEMINI.MD", "temp-skills\skills-lock.json" -Destination ".\"
Remove-Item -Recurse -Force "temp-skills"
npm install -g playwright; npx playwright install chromium
```

**macOS / Linux (Bash):**
```bash
git clone https://github.com/janusinss/skills-v2.git temp-skills
cp -r temp-skills/.agents ./
cp temp-skills/GEMINI.MD temp-skills/skills-lock.json ./
rm -rf temp-skills
npm install -g playwright && npx playwright install chromium
```

---

## 🔄 Updating Skills

To update all installed upstream skills to their latest versions while cleaning any CLI-generated symlinks (`playwright-skill` is decoupled from `skills-lock.json` to permanently protect `lib/helpers.js` and local dependencies from being overwritten):

**Windows (PowerShell):**
```powershell
npx skills update -y; if (Test-Path .claude) { Remove-Item -Recurse -Force .claude }
```

**macOS / Linux (Bash):**
```bash
npx skills update -y && rm -rf .claude
```

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
| [`install.md`](.agents/rules/install.md) | `manual` | Initial workspace setup or onboarding (`@install.md`) | One-time bootstrapper: installs global Playwright, downloads Chromium, verifies zero-scratch browser execution, cleans symlinks, and self-deletes upon completion. |

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

If you want agent skills to remain local to your machine without being committed to your application's remote repository, ensure your target project's `.gitignore` includes:

```gitignore
.agents/
skills-lock.json
GEMINI.MD
```
