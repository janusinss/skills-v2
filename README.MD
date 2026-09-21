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

Foundational architectural guidelines and proactive guardrails:

| Rule | Trigger | Purpose & Core Guardrails |
| :--- | :--- | :--- |
| [`UI_Always.md`](.agents/rules/UI_Always.md) | `model_decision` | Proactive UI defect self-correction: fixed-header clearance (`calc(var(--header-height) + 24px)`), authentic photography sourcing (strict no AI images), `overflow-x` defense, and touch targets. |
| [`frontend.md`](.agents/rules/frontend.md) | `auto` | 4-stage UI delivery workflow: token alignment, anti-slop dials, batched visual audits, and real browser verification across viewports. |
| [`starting-brandnew.md`](.agents/rules/starting-brandnew.md) | `manual` | Greenfield scaffolding: pre-flight checks, 74 curated brand systems in `awesome-design-md`, component blueprints, and Playwright verification. |
| [`starting-existing.md`](.agents/rules/starting-existing.md) | `manual` | Legacy codebase redesign: baseline token extraction, visual overhaul paths, and scoped incremental refactoring. |
| [`backend.md`](.agents/rules/backend.md) | `manual` | Production data layer: service/repository boundaries, connection pooling, schema integrity, and atomic transaction guarantees. |
| [`security.md`](.agents/rules/security.md) | `manual` | Zero-trust DevSecOps: threat modeling, 100% parameterized SQL, context-aware output encoding, BOLA/IDOR defense, and OWASP audits. |
| [`penetrating-and-testing.md`](.agents/rules/penetrating-and-testing.md) | `manual` | Dual-surface validation: Strix autonomous pentesting with verified PoCs and end-to-end functional web-flow QA across 5 UI states. |
| [`install.md`](.agents/rules/install.md) | `manual` | One-time workspace bootstrapper: installs global Playwright, downloads Chromium, verifies zero-scratch execution, and self-deletes upon completion. |

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
