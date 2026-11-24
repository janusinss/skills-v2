# Existing Codebase Design & Remediation Pipeline (`starting-existing.md`)

Bring an existing frontend codebase to validated token and browser-quality compliance across these 7 bounded phases (Phases 0-6).

---

## Phase 0: Pre-Flight & Environment Setup
1. **Stack & Manifest Check:** Inspect the stack first. Run `npm init -y` only in JS/TS repos missing `package.json`; never run it in PHP, Python, Go, Rust, or other non-Node repos. Preserve existing scripts.
2. **Browser Verification:** Follow [UI_Always.md](UI_Always.md#7-browser-verification-policy) for all browser audits.
3. **Git Hygiene:** Verify `.gitignore` exists (create if absent) and ignores `node_modules/`, `scratch/`, `test-results/`, `tests/screenshots/`, `.impeccable/*.png`, `.impeccable/live/`, and `.impeccable/config.local.json`.

---

## Phase 1: Codebase Audit & Baseline Extraction
1. **Reconnaissance & Detection:** Run [explorer](../agents/explorer.md) across templates, styles, and components, and run `.claude/skills/impeccable/scripts/impeccable detect .` (Windows: `impeccable.cmd`).
2. **Extract Existing System:** Follow [impeccable/reference/document.md](../skills/impeccable/reference/document.md) (Scan mode) to extract colors, typography, spacing, radii, elevation, and components.
3. **Write Canonical `DESIGN.md`:** If `./DESIGN.md` exists, show it first and ask whether to refresh, overwrite, or merge; never overwrite silently.
   - Use Stitch YAML frontmatter (`name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`) and canonical headings (`Overview`, `Colors`, `Typography`, `Layout`, `Elevation & Depth`, `Shapes`, `Components`, `Do's and Don'ts`).
   - Store schema extensions (shadows, motion, breakpoints, snippets) in `.impeccable/design.json`.
4. **Architecture & Scoped Legacy Checks:**
   - Map coupled boundaries with [code-architect](../agents/code-architect.md) and [archify](../skills/archify/SKILL.md) (`architecture`/`dataflow`).
   - Run [modern-web-guidance](../skills/modern-web-guidance/SKILL.md) (`legacy-scan`) **only** for broad full-codebase modernization requests; never on targeted audits or scoped edits.
   - `untangle-codebase` is manual/user-invoked only (`disable-model-invocation: true`); never auto-invoke it.

---

## Phase 2: Target Aesthetic Direction
Choose one path with the user (`AskUserQuestion` when unspecified):
1. **Path A (Full Overhaul):** Establish a replacement visual world via [awesome-design-md](../skills/awesome-design-md/SKILL.md) (up to 5 presets) or [design-taste-frontend](../skills/design-taste-frontend/SKILL.md) (`start.mjs deal`/`css`/`brand`, `layout-v4.md`, `copy-voice.md`).
   - Confirm before replacing `./DESIGN.md` and keep canonical Stitch headings.
2. **Path B (Incremental Polish):** Keep extracted `DESIGN.md` and refine palette, typography, and copy in place via [design-taste-frontend](../skills/design-taste-frontend/SKILL.md) (`start.mjs`, `layout-v4.md`, `copy-voice.md`).
   - Let [impeccable](../skills/impeccable/SKILL.md) (`document.md`, `layout.md`, `craft-floor.md`, `detect`) own baseline extraction, layout structure, and polish, regenerating `.impeccable/design.json` alongside it.
   - For vibecoded screens, live URLs (`snapshot.mjs`), dashboard/chart cleanup, or RTL layouts (`rtl.md`), apply [unslop](../skills/unslop/SKILL.md)'s 9 ordered redline passes.

---

## Phase 3: Product Truth & Scope ([prompt-enhancer](../skills/prompt-enhancer/SKILL.md))
1. **Existing `PRODUCT.md`:** Confirm reuse or refine via [prompt-enhancer-frontend](../skills/prompt-enhancer-frontend/SKILL.md), [prompt-enhancer-backend](../skills/prompt-enhancer-backend/SKILL.md), or [prompt-enhancer](../skills/prompt-enhancer/SKILL.md).
2. **Absent `PRODUCT.md`:** Extract intent, audience, and workflows from the codebase, run the matching enhancer, and write Sections 1-5 to `./PRODUCT.md`.
3. **Execution Plan:** Use Section 6 (Master Prompt) as the contract and sequence phased remediation tasks with [planner](../agents/planner.md).

---

## Phase 4: Direction & Visitor-Mode Synthesis
Follow [frontend.md](frontend.md) Stage 2 to align Visitor Mode, Page Type, Audience, Visual World, and Constraints directly from `PRODUCT.md` and `DESIGN.md` without a preamble.

---

## Phase 5: Scoped Redesign & Remediation
1. **Preserve Stack & Follow [frontend.md](frontend.md) Stages 1-2:** Keep the existing framework unless a migration is requested (use Stage 1 for migrations or new modules).
   - Pair `design-taste-frontend` (visual identity, typography, palette, copy) with `impeccable` (`layout.md`, `craft-floor.md`, `operate.md`) for layout structure and ergonomics.
   - Apply `DESIGN.md`, [UI_Always.md](UI_Always.md), and [MOTION.md](MOTION.md) + [interaction-catalog.md](../resources/creative-libraries/interaction-catalog.md).
   - Enforce [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) and [avoid-ai-writing](../skills/avoid-ai-writing/SKILL.md) across UI copy, pairing [unslop](../skills/unslop/SKILL.md) when redlining vibecoded screens, live URLs, or RTL layouts.
2. **Accessibility & Scope:** Audit WCAG 2.2 semantics and keyboard flows with [a11y-architect](../agents/a11y-architect.md). Deliver **P0** remediation first; defer P1-P3 to later cycles.
3. **Cleanup:** Use [refactor-cleaner](../agents/refactor-cleaner.md) and [code-architect](../agents/code-architect.md) to remove dead code, duplicate stylesheets, and wrapper debt.

---

## Phase 6: Audit & Real-Browser Verification
1. **Static & Copy Gates:** Run `.claude/skills/impeccable/scripts/impeccable detect .` (Windows: `impeccable.cmd`) plus [frontend.md](frontend.md) Stage 3 gates. Fix findings in one bounded pass and re-verify.
2. **Real-Browser Verification:** Run Chromium checks (`375x667`, `768x1024`, `1280x800`) directly per [frontend.md](frontend.md) Stage 4 and [UI_Always.md](UI_Always.md#7-browser-verification-policy). Reserve `@e2e-runner` for persistent CI E2E suites only.
3. **Git Hygiene:** Confirm `.gitignore` matches Phase 0 (keeping `.impeccable/design.json` trackable if desired while ignoring ephemeral `.impeccable/` files). Never run `git commit` unless requested.
