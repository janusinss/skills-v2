# Agent Skills & Workspace Configurations

A curated collection of production-grade AI agent skills, rules, and automated workflow hooks designed for modern AI coding assistants (such as Google Antigravity, Gemini, Claude Code, and Cursor).

---

## 📁 Repository Structure

```text
├── .agents/
│   ├── hooks.json         # Automated lifecycle hooks (e.g., UI checks & design deep passes)
│   ├── rules/             # 5 architectural guidelines (frontend, backend, security, project setup)
│   └── skills/            # 150+ specialized agent skills (UI/UX, Backend, Security, DevOps, etc.)
├── skills-lock.json       # Skill dependency manifest and integrity hash lockfile
└── .gitignore             # Git ignore configuration for development and agent environments
```

---

### 1. Add to an Existing Project

Choose one of the following methods to integrate these skills into your project:

#### Method A: Clone & Copy (Recommended)
Clone the repository temporarily, copy the `.agents/` directory and `skills-lock.json` into your project's root, and clean up:

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

---

## 🚀 How to Install & Use in Your Project

### 2. Clone the Repository

To clone this repository directly:

```bash
git clone https://github.com/janusinss/skills-v2.git
```

---

### 3. Configure `.gitignore` (Tracking vs. Ignoring)

Depending on your team workflow, decide whether the agent configuration should be committed to your project's Git repository or kept local-only.

Refer to **lines 107 and 108** in .gitignore:

```gitignore
# .agents/                    # Uncomment this if the agent is installed and you don't want to push the .agents directory
# skills-lock.json           # Uncomment this if the agent is installed and you don't want to push the skills-lock.json file
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

---

## 🧠 How to Use Rules and Skills

### Understanding Rules vs. Skills

| Concept | Location | Activation | Purpose |
| :--- | :--- | :--- | :--- |
| **Rules** | `.agents/rules/*.md` | **Persistent & Ambient** | Architectural guidelines, coding standards, and safety guardrails enforced across all interactions. |
| **Skills** | `.agents/skills/*/SKILL.md` | **On-Demand & Modular** | Deep, domain-specific instruction sets, battle-tested workflows, CLI tooling, and component patterns. |

---

### 📋 Using Workspace Rules (`.agents/rules/`)

Rules provide foundational instructions that modern AI assistants (like Google Antigravity, Cursor, and Claude Code) load automatically when planning and writing code.

The repository includes 5 core rules:

1. **`frontend.md`** — **Active UI Development Pipeline**
   - Enforces a 4-stage UI delivery workflow: Token & System Alignment, Composition & Asset Standards (anti-pattern checks), Two-Phase Quality Review (Impeccable critique & audit), and Real Browser Verification.
2. **`backend.md`** — **Production-Grade Backend Architecture**
   - Defines strict service boundaries, controller/service/repository layer separation, error-handling conventions, and reliability standards.
3. **`security.md`** — **Security & Defenses**
   - Enforces input validation, authentication/authorization requirements, parameterized queries, secret protection, and OWASP mitigation.
4. **`starting-brandnew.md`** — **Greenfield Project Scaffolding**
   - Step-by-step guidance for bootstrapping a brand new project, setting up design systems, project structure, and dependencies.
5. **`starting-existing.md`** — **Refactoring & Modernizing Existing Projects**
   - Best practices for safely auditing and upgrading an existing codebase without regressions or breaking changes.

#### How to Trigger Rules:
- **Automatic:** Coding assistants automatically inspect `.agents/rules/` within your workspace and adhere to them during code generation.
- **Explicit in Prompt:** You can direct the agent to follow a specific rule:
  > *"Refactor the user profile page following the standards in `.agents/rules/frontend.md`."*

---

### ⚡ Using Agent Skills (`.agents/skills/`)

Skills are specialized runbooks that give your AI assistant expert capabilities in specific domains, frameworks, or tools.

#### How Skills Are Activated:

1. **Automatic Detection (Context-Aware):**
   Modern coding assistants automatically read the matching `SKILL.md` when your prompt or task calls for it (e.g., asking to write Playwright tests automatically activates `playwright-skill`).

2. **Explicit Invocation (Recommended for Best Results):**
   Explicitly reference one or more skills in your prompt to enforce specific design systems, architectural patterns, or security audits:

   - **Frontend & UI/UX:**
     > *"Build a responsive pricing section using `ui-ux-pro-max`, `impeccable`, and `tailwind-patterns`."*
   - **Fullstack & Backend:**
     > *"Create a REST API with FastAPI and PostgreSQL using `fastapi-pro`, `database-architect`, and `api-patterns`."*
   - **Security Review:**
     > *"Review our authentication routes for vulnerabilities using `backend-security-coder` and `top-web-vulnerabilities`."*
   - **Testing & QA:**
     > *"Write automated end-to-end browser tests for the checkout flow using `playwright-skill` and `e2e-testing-patterns`."*
   - **DevOps & Cloud:**
     > *"Write production-ready multi-stage Dockerfiles and compose setups following `docker-expert`."*
   - **AI & Agent Architecture:**
     > *"Design a multi-agent retrieval system using `ai-agents-architect`, `rag-engineer`, and `langgraph`."*

---

### 🔄 Updating Skills via CLI

To update all installed upstream skills to their latest versions while keeping your workspace clean (updating `.agents/` and automatically removing any `.claude` symlinks generated by the CLI):

```powershell
npx skills update -y; if (Test-Path .claude) { Remove-Item -Recurse -Force .claude }
```

---

## 🛠️ Included Skill Categories (150+ Skills)

All 151 skills are organized into 12 domain categories:

### 1. 🎨 Frontend, UI/UX & Visual Design (27 Skills)
- `3d-web-experience` — Three.js, React Three Fiber, Spline, WebGL, and interactive 3D web scenes
- `banner-design` — Multi-platform banners, social ads, and hero visual generation
- `canvas-design` — Visual design philosophy, canvas generation, and vector aesthetics
- `claude-d3js-skill` — Sophisticated, interactive data visualizations with D3.js
- `design` — Comprehensive brand identity, design tokens, and UI design systems
- `design-system` — Token architecture (primitive → semantic → component) and CSS variable specs
- `design-taste-frontend` — Anti-generic, opinionated design direction for web applications and landing pages
- `design-taste-frontend-v1` — Backward-compatible v1 frontend taste skill
- `frontend-design` — Thoughtful frontend design and component aesthetics
- `frontend-developer` — React 19, Next.js 15, responsive layouts, and modern frontend architecture
- `gpt-taste` — Elite UX/UI with advanced GSAP motion, bento grids, and editorial typography
- `high-end-visual-design` — High-end agency visual standards, bespoke typography, and luxury aesthetics
- `image-to-code` — High-fidelity website implementation matching generated visual concepts
- `imagegen-frontend-web` — Conversion-aware website and landing page visual reference generation
- `impeccable` — Comprehensive UI critique, accessibility audit, visual polish, and layout refinement
- `industrial-brutalist-ui` — Swiss typography, mechanical grids, and utilitarian industrial aesthetics
- `interactive-portfolio` — High-converting developer and designer portfolio experiences
- `minimalist-ui` — Warm monochrome editorial layouts, typographic contrast, and minimalist interfaces
- `react-best-practices` — Vercel-curated React and Next.js performance and code optimization patterns
- `react-patterns` — Modern React hooks, state patterns, composition, and TypeScript standards
- `redesign-existing-projects` — Upgrades existing websites to premium quality without breaking functionality
- `scroll-experience` — Immersive scroll-driven storytelling, parallax effects, and interactive narratives
- `slides` — Strategic HTML presentations with Chart.js, design tokens, and contextual slides
- `stitch-design-taste` — Semantic design systems, strict typography, and micro-interactions
- `tailwind-patterns` — Tailwind CSS v4 principles, container queries, and token architecture
- `ui-styling` — Accessible UI development with shadcn/ui, Radix, and Tailwind CSS
- `ui-ux-pro-max` — UI/UX design intelligence with 79 styles, 192 palettes, and 74 font pairings

### 2. 📱 Mobile App Development (7 Skills)
- `app-store-optimization` — App Store Optimization (ASO) for Apple App Store and Google Play Store
- `flutter-expert` — Cross-platform mobile development with Dart 3 and advanced widgets
- `imagegen-frontend-mobile` — Premium, app-native mobile UI screen concepts and mockups
- `ios-developer` — Native iOS development with Swift, SwiftUI, UIKit, and Core Data
- `mobile-design` — Mobile-first, touch-friendly, platform-respectful interface design
- `mobile-developer` — Cross-platform mobile apps with React Native, Flutter, and native integrations
- `react-native-architecture` — Production-ready React Native patterns with Expo, offline sync, and navigation

### 3. ⚙️ Backend, Microservices & API Architecture (22 Skills)
- `api-patterns` — REST vs GraphQL vs tRPC decision-making, API versioning, and pagination
- `architecture-patterns` — Clean Architecture, Hexagonal Architecture, and Domain-Driven Design (DDD)
- `async-python-patterns` — High-performance concurrent Python with `asyncio` and async/await
- `backend-dev-guidelines` — Production-grade backend engineering under strict reliability constraints
- `cpp-pro` — Modern idiomatic C++ (RAII, smart pointers, move semantics, and templates)
- `django-pro` — Scalable Django 5.x with async views, DRF, Celery, and Django Channels
- `event-sourcing-architect` — Event sourcing, CQRS, projection building, and saga orchestration
- `fastapi-pro` — High-performance async APIs with FastAPI, SQLAlchemy 2.0, and Pydantic V2
- `fastapi-templates` — Production-ready FastAPI blueprints with dependency injection
- `go-concurrency-patterns` — Goroutines, channels, sync primitives, worker pools, and race-free Go
- `golang-pro` — Idiomatic Go 1.21+ patterns, microservices, and performance optimization
- `javascript-pro` — Modern ES6+, async patterns, promises, event loop, and Node.js APIs
- `microservices-patterns` — Distributed systems, service boundaries, event-driven communications, and resilience
- `nextjs-app-router-patterns` — Next.js 14+ App Router, Server Components, and full-stack React
- `nextjs-best-practices` — Server Components, data fetching, caching, and routing best practices
- `nodejs-best-practices` — Production Node.js architecture, error handling, and security patterns
- `python-patterns` — Python architecture, type hints, async patterns, and package structure
- `python-pro` — Master Python 3.12+, `uv`, `ruff`, `pydantic`, and modern async frameworks
- `rust-pro` — Systems programming with Rust 1.75+, advanced type system, and concurrency
- `senior-architect` — Senior technical architecture toolkit and decision-making frameworks
- `senior-fullstack` — Full-stack system design, frontend-backend coordination, and modern tooling
- `typescript-expert` — Type-level programming, monorepo management, performance, and tooling

### 4. 🛡️ Security, Penetration Testing & Compliance (13 Skills)
- `api-security-best-practices` — API authentication, authorization, rate limiting, and vulnerability defense
- `backend-security-coder` — Secure backend implementation, input sanitization, and auth hardening
- `burp-suite-testing` — Web application security testing, traffic interception, and vulnerability scanning
- `cc-skill-security-review` — Proactive security review for auth flows, file uploads, and endpoints
- `cloud-penetration-testing` — Infrastructure security assessments across AWS, Azure, and GCP
- `ethical-hacking-methodology` — 5-stage penetration testing lifecycle from reconnaissance to reporting
- `frontend-security-coder` — Client-side security, XSS prevention, and output sanitization
- `linux-privilege-escalation` — Systematic Linux security assessments and privilege escalation checks
- `memory-safety-patterns` — Cross-language memory safety, RAII, ownership, and resource cleanup
- `pci-compliance` — PCI DSS compliance guidelines for secure payment processing
- `security-auditor` — Comprehensive cybersecurity, DevSecOps, and compliance audits
- `top-web-vulnerabilities` — Structured reference for the 100 most critical web vulnerabilities
- `vulnerability-scanner` — OWASP 2025 analysis, supply chain security, and attack surface mapping

### 5. 🔌 Third-Party Integrations, Auth & FinTech (9 Skills)
- `algolia-search` — Algolia search implementation, indexing strategies, and React InstantSearch
- `auth-implementation-patterns` — OAuth2, JWT, sessions, multi-tenant RBAC, and modern authentication
- `build-with-exa` — Exa API integration for semantic search, web extraction, and agent monitors
- `exa-contents` — Raw HTTP crawling, text extraction, highlights, and web content retrieval
- `exa-search` — Semantic web retrieval, ranked results, domain filtering, and real-time search
- `hubspot-integration` — HubSpot CRM objects, associations, webhooks, and SDK integration
- `plaid-fintech` — Plaid API integration (Link tokens, transactions sync, ACH auth, and balance checks)
- `stripe-integration` — PCI-compliant checkout flows, subscriptions, webhooks, and refunds
- `twilio-communications` — SMS messaging, voice calls, WhatsApp Business API, and 2FA verification

### 6. 🗄️ Databases, Data Engineering & Pipelines (8 Skills)
- `airflow-dag-patterns` — Production Apache Airflow DAGs, custom operators, sensors, and batch workflows
- `data-engineer` — Scalable data pipelines, data warehouses, streaming, and Spark/dbt architectures
- `database-architect` — Database schema modeling, engine selection, and scalable data layers
- `database-design` — Schema design, indexing strategies, ORM selection, and query optimization
- `dbt-transformation-patterns` — dbt model organization, testing strategies, documentation, and incremental models
- `postgres-best-practices` — Supabase-backed Postgres performance tuning, indexing, and schema design
- `sql-pro` — Advanced SQL query techniques, OLTP/OLAP optimization, and performance tuning
- `vector-database-engineer` — Pinecone, Weaviate, Qdrant, Milvus, and pgvector for semantic search & RAG

### 7. 🤖 AI Agents, LLMs & Vector Search (12 Skills)
- `agent-evaluation` — Testing, capability assessment, and reliability benchmarking for LLM agents
- `ai-agents-architect` — Multi-agent orchestration, tool use, memory systems, and planning strategies
- `context-window-management` — Context window optimization, summarization, routing, and avoiding context rot
- `embedding-strategies` — Model selection and dimensionality optimization for vector search
- `langfuse` — LLM observability platform: tracing, prompt management, and production datasets
- `langgraph` — Stateful multi-actor AI graph construction, checkpointers, and ReAct loops
- `llm-app-patterns` — Production-grade patterns for building robust LLM-powered applications
- `mcp-builder` — Model Context Protocol (MCP) server creation for exposing external tools to LLMs
- `prompt-caching` — Anthropic prompt caching, response caching, and Cache Augmented Generation (CAG)
- `prompt-engineering` — Advanced prompt engineering patterns, few-shot techniques, and optimization
- `rag-engineer` — End-to-end Retrieval-Augmented Generation: chunking, retrieval, and reranking
- `rag-implementation` — Practical RAG implementation workflow covering vector databases and embeddings

### 8. ☁️ DevOps, Cloud Infrastructure & SRE (12 Skills)
- `aws-serverless` — AWS Lambda, API Gateway, DynamoDB, SQS/SNS event patterns, and SAM/CDK
- `bash-linux` — Advanced Linux terminal commands, piping, scripting, and automation
- `deployment-procedures` — Zero-downtime deployment workflows, rollback strategies, and verification
- `distributed-tracing` — Jaeger and Tempo distributed tracing across microservices
- `docker-expert` — Multi-stage container builds, security hardening, and production containerization
- `incident-responder` — SRE incident response, root cause triage, and post-incident restoration
- `kubernetes-architect` — Kubernetes cluster architecture, GitOps workflows (ArgoCD/Flux), and Helm
- `observability-engineer` — Monitoring, structured logging, distributed tracing, and Prometheus/Grafana
- `performance-engineer` — Web and backend performance profiling, flame graphs, and latency reduction
- `postmortem-writing` — Blameless postmortem authoring to prevent incident recurrence
- `slo-implementation` — Framework for SLIs, SLOs, and error budget implementation
- `terraform-specialist` — Infrastructure as Code (IaC) automation, state management, and Terraform modules

### 9. 🧪 Testing, QA & Debugging (9 Skills)
- `browser-automation` — Resilient browser automation, selectors, waiting strategies, and anti-detection
- `code-review-checklist` — Rigorous code review for functionality, security, performance, and style
- `e2e-testing-patterns` — Flake-free end-to-end test suites for fast and confident releases
- `lint-and-validate` — Validation and lint enforcement after code changes
- `playwright-skill` — Complete browser testing with Playwright, responsive checks, and screenshots
- `python-testing-patterns` — Comprehensive testing with pytest, fixtures, and mocking
- `systematic-debugging` — Root-cause debugging methodologies before attempting fixes
- `test-driven-development` — Strict TDD (Red-Green-Refactor) implementation workflows
- `test-fixing` — Systematic identification and resolution of failing test suites

### 10. 🎮 Game & Creative Development (4 Skills)
- `algorithmic-art` — Computational art generation producing interactive viewers and algorithmic JS
- `game-development` — Game development routing across 2D/3D engines (Phaser, Godot, Three.js, Unity)
- `godot-gdscript-patterns` — Godot 4 GDScript patterns, scene architecture, and state machines
- `unity-developer` — Unity 6 LTS C# scripting, URP/HDRP pipelines, and cross-platform game builds

### 11. 📈 Product Management, Growth & Marketing (22 Skills)
- `ab-test-setup` — Hypothesis formulation, statistical gating, and experiment execution
- `analytics-tracking` — Tracking plans, event taxonomies, and analytics data integrity
- `brand` — Brand voice, visual identity consistency, and messaging frameworks
- `brandkit` — Visual identity boards, logo systems, and art-directed brand deck generation
- `business-analyst` — Business analytics, KPI dashboards, and data-driven strategic models
- `company-research` — In-depth company, competitor, financial, and market intelligence via Exa
- `competitive-landscape` — Competitive positioning, moat analysis, and differentiation strategy
- `competitor-alternatives` — SEO-ranking competitor comparison and alternatives landing pages
- `content-creator` — Brand-aligned content frameworks, multi-platform publishing, and SEO
- `copy-editing` — Conversion-focused editing passes to sharpen clarity and tone
- `copywriting` — High-converting marketing copy for landing pages, emails, and ads
- `email-sequence` — Multi-stage email marketing sequences for onboarding and conversion
- `form-cro` — Conversion rate optimization for lead, contact, demo, and checkout forms
- `kpi-dashboard-design` — Executive and operational KPI dashboard design principles
- `launch-strategy` — SaaS product launch playbooks, feature announcements, and momentum building
- `lead-generation` — ICP company discovery, enrichment, and prospect list generation
- `market-sizing-analysis` — TAM, SAM, and SOM calculation methodologies for startups
- `product-manager-toolkit` — Discovery, PRDs, prioritization, and roadmapping frameworks
- `programmatic-seo` — Programmatic SEO strategy, template design, and structured data
- `seo-audit` — Crawlability, indexation, speed, and technical SEO diagnostic audits
- `startup-financial-modeling` — 3-5 year startup financial models, cash runway, and scenario forecasting
- `startup-metrics-framework` — SaaS metric tracking (CAC, LTV, churn, NDR) from seed through Series A

### 12. 🛠️ Engineering Workflow & Codebase Governance (6 Skills)
- `architecture-decision-records` — ADR patterns to document context and rationale for architectural decisions
- `concise-planning` — Actionable, atomic checklists and plans for complex coding tasks
- `environment-setup-guide` — Step-by-step developer machine and workspace onboarding
- `full-output-enforcement` — Overrides LLM truncation to ensure complete, unabridged code generation
- `git-pushing` — Safe git staging, conventional commits, and clean push procedures
- `kaizen` — Continuous code quality improvement, refactoring, and error-proofing
