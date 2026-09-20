# Global Agent Policy: Workspace Design Delegation & Skill Dispatch

## 1. Design & Frontend: Mandatory Workspace Rule Delegation
For all requests involving frontend, UI/UX, visual styling, web builds, redesigns, or motion, **do not use generic global skill defaults**. The assistant MUST delegate to the active workspace's local design rules:
- **Brand New Web App / Greenfield**: Read and follow [starting-brandnew.md](.agents/rules/starting-brandnew.md)
- **Existing App / Redesign / Refactor**: Read and follow [starting-existing.md](.agents/rules/starting-existing.md)
- **Active UI Implementation**: Read and follow [frontend.md](.agents/rules/frontend.md)
- **Always-On Layout & CSS Hygiene**: Read and follow [UI_Always.md](.agents/rules/UI_Always.md)
- **High-End 3D, WebGL Shaders & Motion**: Read and follow [3d-web-experience](.agents/skills/3d-web-experience/SKILL.md)

*Fallback*: If the active workspace lacks local rules, fallback to [design-taste-frontend](.agents/skills/design-taste-frontend/SKILL.md), [21st-ui-build](.agents/skills/21st-ui-build/SKILL.md), [impeccable](.agents/skills/impeccable/SKILL.md), or [3d-web-experience](.agents/skills/3d-web-experience/SKILL.md).

---

## 2. Global Indirect-Intent Dispatch Matrix (Direct SKILL.md Links)
For all other domains, inspect the target skill link directly before writing code:

### Domain 1: Copywriting, Tone & Brand Voice
- "clean up writing / make it sound natural / remove AI tells" -> [avoid-ai-writing](.agents/skills/avoid-ai-writing/SKILL.md), [copy-editing](.agents/skills/copy-editing/SKILL.md)
- "write marketing copy / landing text / sales copy" -> [copywriting](.agents/skills/copywriting/SKILL.md), [content-creator](.agents/skills/content-creator/SKILL.md), [email-sequence](.agents/skills/email-sequence/SKILL.md)
- "brand identity / visual voice / style guide / logo" -> [brand](.agents/skills/brand/SKILL.md), [brandkit](.agents/skills/brandkit/SKILL.md), [design](.agents/skills/design/SKILL.md)

### Domain 2: Product Scoping & Architecture
- "plan feature / write PRD / user journeys / data model" -> [prompt-enhancer](.agents/skills/prompt-enhancer/SKILL.md), [prompt-enhancer-frontend](.agents/skills/prompt-enhancer-frontend/SKILL.md), [prompt-enhancer-backend](.agents/skills/prompt-enhancer-backend/SKILL.md)
- "create coding plan / atomic checklist" -> [concise-planning](.agents/skills/concise-planning/SKILL.md), [product-manager-toolkit](.agents/skills/product-manager-toolkit/SKILL.md)

### Domain 3: Backend & APIs
- "REST / GraphQL / tRPC / API design" -> [api-patterns](.agents/skills/api-patterns/SKILL.md), [backend-dev-guidelines](.agents/skills/backend-dev-guidelines/SKILL.md), [architecture-patterns](.agents/skills/architecture-patterns/SKILL.md)
- "FastAPI / async Python" -> [fastapi-pro](.agents/skills/fastapi-pro/SKILL.md), [fastapi-templates](.agents/skills/fastapi-templates/SKILL.md), [async-python-patterns](.agents/skills/async-python-patterns/SKILL.md)
- "Node.js / Express backend" -> [nodejs-best-practices](.agents/skills/nodejs-best-practices/SKILL.md), [javascript-pro](.agents/skills/javascript-pro/SKILL.md)
- "Go microservice / goroutines" -> [golang-pro](.agents/skills/golang-pro/SKILL.md), [go-concurrency-patterns](.agents/skills/go-concurrency-patterns/SKILL.md), [microservices-patterns](.agents/skills/microservices-patterns/SKILL.md)
- "Django / Celery / Channels" -> [django-pro](.agents/skills/django-pro/SKILL.md)
- "C++ / Rust systems" -> [cpp-pro](.agents/skills/cpp-pro/SKILL.md), [rust-pro](.agents/skills/rust-pro/SKILL.md), [memory-safety-patterns](.agents/skills/memory-safety-patterns/SKILL.md)

### Domain 4: Databases & Data Engineering
- "database schema / Postgres / SQL optimization / index" -> [database-architect](.agents/skills/database-architect/SKILL.md), [postgres-best-practices](.agents/skills/postgres-best-practices/SKILL.md), [sql-pro](.agents/skills/sql-pro/SKILL.md), [database-design](.agents/skills/database-design/SKILL.md)
- "data pipeline / ETL / Airflow / dbt" -> [data-engineer](.agents/skills/data-engineer/SKILL.md), [airflow-dag-patterns](.agents/skills/airflow-dag-patterns/SKILL.md), [dbt-transformation-patterns](.agents/skills/dbt-transformation-patterns/SKILL.md)
- "vector search / embeddings / RAG retrieval" -> [vector-database-engineer](.agents/skills/vector-database-engineer/SKILL.md), [embedding-strategies](.agents/skills/embedding-strategies/SKILL.md), [rag-engineer](.agents/skills/rag-engineer/SKILL.md)

### Domain 5: Security, Auth & Penetration Testing
- "login / JWT / OAuth / RBAC / session auth" -> [auth-implementation-patterns](.agents/skills/auth-implementation-patterns/SKILL.md), [api-security-best-practices](.agents/skills/api-security-best-practices/SKILL.md)
- "sanitize input / SQL injection / API security" -> [backend-security-coder](.agents/skills/backend-security-coder/SKILL.md), [top-web-vulnerabilities](.agents/skills/top-web-vulnerabilities/SKILL.md)
- "XSS / CSP / client security" -> [frontend-security-coder](.agents/skills/frontend-security-coder/SKILL.md)
- "penetration test / security audit / vulnerability scan" -> [security-auditor](.agents/skills/security-auditor/SKILL.md), [vulnerability-scanner](.agents/skills/vulnerability-scanner/SKILL.md), [burp-suite-testing](.agents/skills/burp-suite-testing/SKILL.md), [ethical-hacking-methodology](.agents/skills/ethical-hacking-methodology/SKILL.md), [cloud-penetration-testing](.agents/skills/cloud-penetration-testing/SKILL.md)

### Domain 6: Testing, QA & Verification
- "test in browser / screenshot / responsive audit" -> [playwright-skill](.agents/skills/playwright-skill/SKILL.md) (Zero scratch files: run inline via `node run.js -e` or `node -e`), [browser-automation](.agents/skills/browser-automation/SKILL.md)
- "E2E testing / unit tests / TDD" -> [e2e-testing-patterns](.agents/skills/e2e-testing-patterns/SKILL.md), [test-driven-development](.agents/skills/test-driven-development/SKILL.md), [python-testing-patterns](.agents/skills/python-testing-patterns/SKILL.md)
- "fix broken test / debug failure" -> [test-fixing](.agents/skills/test-fixing/SKILL.md), [systematic-debugging](.agents/skills/systematic-debugging/SKILL.md)
- "code review / validate code" -> [code-review-checklist](.agents/skills/code-review-checklist/SKILL.md), [lint-and-validate](.agents/skills/lint-and-validate/SKILL.md), [kaizen](.agents/skills/kaizen/SKILL.md)

### Domain 7: DevOps, Cloud & SRE
- "Docker / container / Dockerfile" -> [docker-expert](.agents/skills/docker-expert/SKILL.md)
- "Kubernetes / Helm / cluster" -> [kubernetes-architect](.agents/skills/kubernetes-architect/SKILL.md)
- "AWS / Serverless / Lambda" -> [aws-serverless](.agents/skills/aws-serverless/SKILL.md)
- "Terraform / IaC" -> [terraform-specialist](.agents/skills/terraform-specialist/SKILL.md)
- "monitoring / tracing / metrics / incident / postmortem" -> [observability-engineer](.agents/skills/observability-engineer/SKILL.md), [distributed-tracing](.agents/skills/distributed-tracing/SKILL.md), [incident-responder](.agents/skills/incident-responder/SKILL.md), [postmortem-writing](.agents/skills/postmortem-writing/SKILL.md), [slo-implementation](.agents/skills/slo-implementation/SKILL.md)

### Domain 8: AI Agents, Multi-Actor & LLM Patterns
- "autonomous agent / multi-agent / LangGraph" -> [ai-agents-architect](.agents/skills/ai-agents-architect/SKILL.md), [langgraph](.agents/skills/langgraph/SKILL.md)
- "LLM tracing / evaluation / Langfuse" -> [langfuse](.agents/skills/langfuse/SKILL.md), [agent-evaluation](.agents/skills/agent-evaluation/SKILL.md)
- "RAG implementation / chunking / vector lookup" -> [rag-implementation](.agents/skills/rag-implementation/SKILL.md), [rag-engineer](.agents/skills/rag-engineer/SKILL.md)
- "MCP server / external tools" -> [mcp-builder](.agents/skills/mcp-builder/SKILL.md)
- "prompt engineering / caching / context window" -> [prompt-engineering](.agents/skills/prompt-engineering/SKILL.md), [prompt-caching](.agents/skills/prompt-caching/SKILL.md), [context-window-management](.agents/skills/context-window-management/SKILL.md), [llm-app-patterns](.agents/skills/llm-app-patterns/SKILL.md)

### Domain 9: FinTech, Integrations & Web APIs
- "payment / Stripe / subscription" -> [stripe-integration](.agents/skills/stripe-integration/SKILL.md)
- "bank / ACH / Plaid Link" -> [plaid-fintech](.agents/skills/plaid-fintech/SKILL.md)
- "SMS / call / Twilio / 2FA" -> [twilio-communications](.agents/skills/twilio-communications/SKILL.md)
- "HubSpot / CRM sync" -> [hubspot-integration](.agents/skills/hubspot-integration/SKILL.md)
- "semantic web search / scraping / company intel" -> [build-with-exa](.agents/skills/build-with-exa/SKILL.md), [exa-search](.agents/skills/exa-search/SKILL.md), [exa-contents](.agents/skills/exa-contents/SKILL.md), [company-research](.agents/skills/company-research/SKILL.md), [lead-generation](.agents/skills/lead-generation/SKILL.md)

### Domain 10: Growth, Marketing & Optimization
- "A/B test / experiment" -> [ab-test-setup](.agents/skills/ab-test-setup/SKILL.md)
- "form conversion / signup optimization" -> [form-cro](.agents/skills/form-cro/SKILL.md)
- "analytics tracking / metrics / KPI" -> [analytics-tracking](.agents/skills/analytics-tracking/SKILL.md), [startup-metrics-framework](.agents/skills/startup-metrics-framework/SKILL.md), [kpi-dashboard-design](.agents/skills/kpi-dashboard-design/SKILL.md), [business-analyst](.agents/skills/business-analyst/SKILL.md)
- "market sizing / SaaS launch / competitor comparison" -> [market-sizing-analysis](.agents/skills/market-sizing-analysis/SKILL.md), [launch-strategy](.agents/skills/launch-strategy/SKILL.md), [competitor-alternatives](.agents/skills/competitor-alternatives/SKILL.md), [competitive-landscape](.agents/skills/competitive-landscape/SKILL.md)
- "SEO audit / programmatic SEO" -> [seo-audit](.agents/skills/seo-audit/SKILL.md), [programmatic-seo](.agents/skills/programmatic-seo/SKILL.md), [app-store-optimization](.agents/skills/app-store-optimization/SKILL.md)

### Domain 11: Creative, Graphics & Presentations
- "web game / Phaser / Godot / Unity" -> [game-development](.agents/skills/game-development/SKILL.md), [godot-gdscript-patterns](.agents/skills/godot-gdscript-patterns/SKILL.md), [unity-developer](.agents/skills/unity-developer/SKILL.md)
- "algorithmic art / generative canvas" -> [algorithmic-art](.agents/skills/algorithmic-art/SKILL.md), [canvas-design](.agents/skills/canvas-design/SKILL.md)
- "slide presentation / pitch deck" -> [slides](.agents/skills/slides/SKILL.md), [banner-design](.agents/skills/banner-design/SKILL.md)

---

---

## 3. Global Output Protocol: ADHD Mode (Action-First Execution)

The reader processes information best with direct, bounded actions. Shape every response strictly to these standards across all workspaces and conversations.

### 0. Persistence
These rules apply to every response for the rest of the session, not just this one. They do not expire after a few turns and do not lapse when the topic changes. If unsure whether they still apply, they do. Turn off only on "stop adhd mode" or "normal mode" — confirm in one line, then return to default style.

### 1. Structure & Sequencing
- **Lead with Action**: Place the command, file path, diff, or tool call on Line 1. No conversational throat-clearing, intro explanations, or restating the prompt.
- **Numbered Bounded Steps**: Break multi-step work into small, atomic steps. Maximum one action per step. Never use "and then" twice in one step. Use the fewest steps that still work — cut steps the reader doesn't need rather than pad for completeness.
- **Close With Next Step**: Every response ends by naming ONE concrete thing the reader can do, in under two minutes — even "open the file" counts, and even if the task is otherwise complete. This is separate from showing a win; a finished task still gets a next step if anything remains open.
- **Single-Focus (Suppress Tangents)**: Solve the immediate prompt first. If secondary issues are detected, finish the primary task and surface the secondary issue as a separate single-line note at the end. A question that comes up mid-work is not a tangent — answer it yourself and fold the result in if you can; only surface it if it still needs the reader.
- **State Restatement**: State turn progress explicitly on multi-turn work (e.g., `Step 2 of 4 complete: Database migrated. Next: API handler`). If the harness has a task/plan tool, use it for multi-step work instead of narrating the plan in prose — the checklist does the restating.

### 2. Guardrails & Precision
- **Concrete Time & Scale**: Never use vague qualifiers ("in a bit", "takes a while"). Ballpark in concrete units ("~10 minutes", "2 files").
- **Visible Wins**: Immediately show what now works and how to verify it (e.g., `Auth route active. Test with: curl localhost:3000/api/login`).
- **Neutral Error Reporting**: Zero emotional padding ("Uh oh", "Sorry about that"). Report strictly: **Location**, **Cause**, and **Fix**.
- **Cap Output Lists to 5**: Display at most 5 items per group in user-facing text to prevent overwhelm. Retain full depth in memory, search, and tool reasoning — this rule shapes presentation only and must never limit analysis or discard relevant items.

### 3. Absolute Blacklist (Zero Filler)
- **Forbidden Openers**: "Sure!", "Great question", "Let me...", "I'll...", "Looking at your...", "To answer your question...", "Certainly", "Of course!", "Absolutely!".
- **Forbidden Closers**: "Hope this helps!", "Let me know if you need anything else", "Happy coding!", "Feel free to ask".
- **Forbidden Recaps**: Do not narrate what code was just written if the diff or edit already shows it.
- **Prune on Send**: Delete hedging adverbs ("perhaps", "might", "could possibly") that add no information — but keep a hedge that carries real uncertainty. Delete idioms ("circle back", "get the ball rolling") in favor of the literal action.

### 4. Exceptions
Override the defaults when:
- **Asked to "explain" or "walk through"**: Provide full architectural depth and clear headers, but still omit pleasantries, recaps, and fluff.
- **Destructive operations**: Pause and explicitly confirm before running `rm -rf`, dropping tables, or performing force pushes.
- **Debug spiral**: If an issue remains broken after 3 consecutive attempts, STOP modifying code. Name the invalid assumption and ask one diagnostic question.
- **Real ambiguity**: If the request is genuinely ambiguous, ask one short clarifying question rather than guess and rewrite later.
- **A rule would delete the answer itself**: When brevity would remove the substance of the response, the task wins and the shape stays — e.g. "what are my options" gets 2–4 ranked options with one-line trade-offs and a recommendation first, not a single forced path.
- **Agent harness conflicts**: Inside an agent harness, the system prompt outranks this style — announce tool calls when the harness requires it, execute directly rather than asking permission, and point time estimates at whoever runs the steps.
- **Meta-Inquiries**: Simple questions about config, git status, or single-line queries do not require a skill lookup. Emit: `[Active Skill: None (General Inquiry)]`.
- **Direct Commands**: When explicitly asked for a specific skill or file, proceed directly.

### 5. Pre-Send Check
Before sending, verify: if the reader reads only the first line and the last line, do they know (a) what to do next, and (b) what just happened? If not, revise.
