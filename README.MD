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

## 🚀 How to Install & Use in Your Project

### 1. Clone the Repository

To clone this repository directly:

```bash
git clone https://github.com/janusinss/skills-v2.git
```

---

### 2. Add to an Existing Project

Choose one of the following methods to integrate these skills into your project:

#### Method A: Clone & Copy (Recommended)
Clone the repository temporarily, copy the `.agents/` directory and `skills-lock.json` into your project's root, and clean up:

**Linux / macOS (Bash):**
```bash
# 1. Clone to a temporary folder
git clone https://github.com/janusinss/skills-v2.git temp-skills

# 2. Copy the .agents folder and skills lockfile to your project root
cp -r temp-skills/.agents /path/to/your-project/
cp temp-skills/skills-lock.json /path/to/your-project/

# 3. Clean up the temporary clone
rm -rf temp-skills
```

**Windows (PowerShell):**
```powershell
# 1. Clone to a temporary folder
git clone https://github.com/janusinss/skills-v2.git temp-skills

# 2. Copy into your project root
Copy-Item -Recurse -Path "temp-skills\.agents" -Destination "C:\path\to\your-project\"
Copy-Item -Path "temp-skills\skills-lock.json" -Destination "C:\path\to\your-project\"

# 3. Clean up the temporary folder
Remove-Item -Recurse -Force "temp-skills"
```

#### Method B: Git Submodule (Keep Up-to-Date)
If your project is a Git repository and you want to pull updates in the future, add this repo as a submodule:

```bash
git submodule add https://github.com/janusinss/skills-v2.git .skills-v2
```

---

### 3. Configure `.gitignore` (Tracking vs. Ignoring)

Depending on your team workflow, decide whether the agent configuration should be committed to your project's Git repository or kept local-only.

Refer to **lines 107 and 108** in [.gitignore](file:///c:/xampp/htdocs/YEAR%203/SE/Skills/.gitignore):

```gitignore
# .agents/                    #Uncomment this if the agent is installed and you don't want to push the .agents directory
# skills-lock.json           #Uncomment this if the agent is installed and you don't want to push the skills-lock.json file
```

#### Option A: Local-Only Installation (Recommended if you don't want agent files in your project repo)
If you want to use the agent skills locally without polluting your repository's commit history or git remote:
1. Open your project's `.gitignore`.
2. Add or uncomment the following lines:
   ```gitignore
   .agents/
   skills-lock.json
   ```
This ensures your AI assistant has access to the skills locally while keeping your Git repository clean.

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
