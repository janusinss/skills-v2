> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Greenfield Design & Development Pipeline (`starting-brandnew.md`)

Build a validated web application from an empty workspace across these 7 bounded phases (Phases 0-6).

---

## Phase 0: Pre-Flight Guard & Workspace Check
1. **Artifact Check:** Check whether `./DESIGN.md` or `./PRODUCT.md` already exists in the project root.
2. **Conflict Resolution (when the existing user instructions leave a material choice unresolved):** If either exists, ask whether to reuse, overwrite, or abort before editing files.
3. **Skip Logic:** Reuse `DESIGN.md` -> skip Phase 1. Reuse `PRODUCT.md` -> skip Phase 2.

---

## Phase 1: Visual Foundation & `DESIGN.md`
1. **Choose Visual Source:** Establish `./DESIGN.md` via one of two paths:
   - **Brand Preset ([awesome-design-md](../skills/awesome-design-md/SKILL.md)):** Match the prompt against the 84 systems in `.codex/skills/awesome-design-md/design-md/` and offer up to 5 fits (e.g., `linear.app`, `stripe`, `apple`, `vercel`, `supabase`).
   - **Trade-Matched Deal ([design-taste-frontend](../skills/design-taste-frontend/SKILL.md)):** Run `start.mjs deal` + `start.mjs css` (or `start.mjs brand` for client colors) for a trade-matched palette and type pairing, then write those tokens to `./DESIGN.md`.
2. **Batched Discovery (when the existing user instructions leave a material choice unresolved):** Combine unresolved Phase 1-2 choices (visual path/system, product intent, landing layout, stack) into one prompt.
3. **Install Preset Ground Truth (if Brand Preset chosen):** Copy the chosen file to `./DESIGN.md`:
   ```bash
   # Unix / PowerShell
   cp .codex/skills/awesome-design-md/design-md/<brand>/DESIGN.md ./DESIGN.md
   # Windows CMD
   copy ".codex\skills\awesome-design-md\design-md\<brand>\DESIGN.md" .\DESIGN.md
   ```

---

## Phase 2: Product Truth & Architecture ([prompt-enhancer](../skills/prompt-enhancer/SKILL.md))
1. **Capture Scope & Stack (when the existing user instructions leave a material choice unresolved):** Collect product concept, audience, core problem, and stack per [frontend.md](frontend.md) Stage 1 (plus Next.js Route Handlers/Server Actions, FastAPI + SQLAlchemy 2.0, or Go + PostgreSQL/Prisma/Drizzle when persistence is needed).
2. **Landing / Marketing Layout Gate:** For landing pages, marketing sites, or storefronts without a custom brief (skip for dashboards/internal tools), offer two structures:
   - **Standard Landing Page:** sticky header, interactive hero preview, telemetry bar, asymmetric bento grid, demo sandbox, conversion CTA, and multi-column footer.
   - **Hero-First Showcase / Storefront:** prominent hero banner, primary search/filter bar, item grid, platform stats bar, and directory footer.
3. **Write `PRODUCT.md`:** Run [prompt-enhancer-frontend](../skills/prompt-enhancer-frontend/SKILL.md), [prompt-enhancer-backend](../skills/prompt-enhancer-backend/SKILL.md), or [prompt-enhancer](../skills/prompt-enhancer/SKILL.md).
   - Write Sections 1-5 to `./PRODUCT.md` and keep Section 6 as the execution contract.
4. **Architecture & Diagrams:** Run [explorer](../agents/explorer.md) if files exist, plan with [planner](../agents/planner.md) + [code-architect](../agents/code-architect.md), and use [archify](../skills/archify/SKILL.md) when mapping boundaries or schemas.

---

## Phase 3: Direction & Visitor-Mode Synthesis
Follow [frontend.md](frontend.md) Stage 2 to align Visitor Mode, Page Type, Audience, Visual World, and Constraints directly from `PRODUCT.md` and `DESIGN.md` without a preamble.

---

## Phase 4: Component Structure & Token Theming
1. **Layout & Tokens:** Build with [ui-styling](../skills/ui-styling/SKILL.md) and [frontend.md](frontend.md) Stage 1 intake. Bind surfaces, typography, radii, and spacing to `:root` variables from `DESIGN.md`.
2. **Visual & Layout Hierarchy:** Use [design-taste-frontend](../skills/design-taste-frontend/SKILL.md) for visual identity, palette, typography, and copy voice, paired with [impeccable](../skills/impeccable/SKILL.md) (`layout.md`, `craft-floor.md`) for spatial rhythm and ergonomics.
3. **Hygiene & Motion:** Enforce [UI_Always.md](UI_Always.md), [a11y-architect](../agents/a11y-architect.md), and [anti-ai-slop](../skills/anti-ai-slop/SKILL.md).
   - Pair [MOTION.md](MOTION.md) + [interaction-catalog.md](../resources/creative-libraries/interaction-catalog.md) for mode-matched interactive feel.
4. **Native Web Primitives:** Query [modern-web-guidance](../skills/modern-web-guidance/SKILL.md) (`search`->`retrieve`) for Baseline HTML/CSS primitives (`<dialog>`, `popover`, forms, View Transitions) before adding custom JS or polyfills; degrade gracefully offline.

---

## Phase 5: P0 Implementation
1. **Build per [frontend.md](frontend.md) Stages 1-2:** Combine `design-taste-frontend` (visual, typography, palette, copy) with `impeccable` (`layout.md`, `craft-floor.md`, `operate.md`) and `MOTION.md` + `interaction-catalog.md`.
   - Enforce `anti-ai-slop` and [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md) across all copy.
2. **Scope to P0:** Implement only the **P0 roadmap** from `PRODUCT.md`; defer P1-P3 to follow-up cycles.

---

## Phase 6: Cleanup, Audit & Browser Verification
1. **Cleanup:** Run [refactor-cleaner](../agents/refactor-cleaner.md) to remove dead code and unused imports.
2. **Static & Copy Gates:** Run `.codex/skills/impeccable/scripts/impeccable detect .` (Windows: `impeccable.cmd`) plus [frontend.md](frontend.md) Stage 3 gates. Fix findings in one bounded pass and re-verify.
3. **Real-Browser Verification:** Run Chromium checks (`375x667`, `768x1024`, `1280x800`) directly per [frontend.md](frontend.md) Stage 4 and [UI_Always.md](UI_Always.md#7-browser-verification-policy). Reserve `e2e-runner` for persistent CI E2E suites only.
4. **Git Hygiene:** Confirm `.gitignore` covers `node_modules/`, `scratch/`, `test-results/`, `tests/screenshots/`, `.impeccable/*.png`, `.impeccable/live/`, and `.impeccable/config.local.json`. Never run `git commit` unless requested.
