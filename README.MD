# Agent Skills & Workspace Configurations

A curated collection of production-grade AI agent skills, rules, and automated workflow hooks designed for modern AI coding assistants (such as Google Antigravity, Gemini, Claude Code, and Cursor).

---

## 📁 Repository Structure

```text
├── .agents/
│   ├── hooks.json         # Automated lifecycle hooks (e.g., UI checks & design deep passes)
│   ├── rules/             # Project and architectural guidelines (e.g., frontend design pipeline)
│   └── skills/            # 70+ specialized agent skills (UI/UX, Backend, Security, DevOps, etc.)
├── skills-lock.json       # Skill dependency manifest and integrity hash lockfile
└── .gitignore             # Git ignore configuration for development and agent environments
```

---

## 🚀 How to Install into Your Project

Follow these steps to bring these skills and automated agent workflows into any project:

### Step 1: Copy Files to Your Project Root

Copy the `.agents/` directory and `skills-lock.json` into the root directory of your target project:

```bash
# Example: Copying from this directory to your target project
cp -r .agents /path/to/your-project/
cp skills-lock.json /path/to/your-project/
```

On Windows (PowerShell):
```powershell
Copy-Item -Recurse -Path ".agents" -Destination "C:\path\to\your-project\"
Copy-Item -Path "skills-lock.json" -Destination "C:\path\to\your-project\"
```

---

### Step 2: Configure `.gitignore` (Tracking vs. Ignoring)

Depending on your team workflow, decide whether the agent configuration should be committed to your project's Git repository or kept local-only.

Refer to **lines 107 and 108** in [.gitignore](file:///c:/xampp/htdocs/YEAR%203/SE/Skills/.gitignore):

```gitignore
# .agents/                    #Uncomment this if the agent is installed and you don't want to push the .agents directory
# skills-lock.json           #Uncomment this if the agent is installed and you don't want to push the skills-lock.json file
```

#### Option A: Local-Only Installation (Recommended if you don't want agent files in your repo)
If you want to use the agent skills locally without polluting your repository's commit history or git remote:
1. Open your project's `.gitignore`.
2. Add or uncomment the following lines:
   ```gitignore
   .agents/
   skills-lock.json
   ```
This ensures your AI assistant can access the skills locally while keeping your Git repository clean.

#### Option B: Team-Wide Shared Skills (Tracked in Git)
If you want all team members and CI/CD agents to share the exact same skills, rules, and hook definitions:
- Leave both entries commented out (or do not add them to `.gitignore`).
- Stage and commit `.agents/` and `skills-lock.json` to your repository:
  ```bash
  git add .agents/ skills-lock.json
  git commit -m "chore: add agent skills, rules, and hooks"
  ```

---

## ⚙️ Automated Lifecycle Hooks

The included [.agents/hooks.json](file:///c:/xampp/htdocs/YEAR%203/SE/Skills/.agents/hooks.json) automatically triggers validation and deep passes during agent sessions:
- **`PostToolUse`**: Triggers after code editing tools (`Edit|Write|apply_patch`) to verify UI changes using the bundled `impeccable` CLI tool.
- **`Stop`**: Triggers when the agent finishes a turn to perform an automated design deep pass review.

---

## 🛠️ Included Skill Categories

- **Frontend & UI/UX**: `ui-ux-pro-max`, `frontend-design`, `impeccable`, `react-best-practices`, `tailwind-patterns`, `3d-web-experience`, `canvas-design`
- **Backend & APIs**: `fastapi-pro`, `django-pro`, `golang-pro`, `python-pro`, `rust-pro`, `api-patterns`, `microservices-patterns`, `event-sourcing-architect`
- **Database & Data Engineering**: `database-architect`, `postgres-best-practices`, `sql-pro`, `data-engineer`, `dbt-transformation-patterns`, `airflow-dag-patterns`
- **Security & Penetration Testing**: `backend-security-coder`, `frontend-security-coder`, `top-web-vulnerabilities`, `vulnerability-scanner`, `ethical-hacking-methodology`, `burp-suite-testing`
- **Testing & QA**: `playwright-skill`, `test-driven-development`, `e2e-testing-patterns`, `systematic-debugging`, `test-fixing`
- **AI & LLM Architecture**: `ai-agents-architect`, `langgraph`, `langfuse`, `rag-engineer`, `vector-database-engineer`, `prompt-engineering`
- **Cloud & DevOps**: `docker-expert`, `kubernetes-architect`, `terraform-specialist`, `aws-serverless`, `incident-responder`
