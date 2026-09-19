---
trigger: model_decision
description: Overdrive creative engineering pipeline. Activate when the user requests "overdrive", "/impeccable overdrive", high-end motion, 3D WebGL shaders, 21st.dev components, or immersive scroll experiences.
---

# Overdrive Creative Engineering Pipeline

Push the web interface past conventional limits by synthesizing **Impeccable Overdrive**, **ThreeUI 3D Shaders**, **21st.dev Components**, and **GSAP + Lenis Scroll Physics** into a unified, high-craft digital experience.

> **Execution Mandate**: Standard rules (`starting-brandnew.md`, `starting-existing.md`, `frontend.md`) produce clean, high-performance, token-compliant baseline UI. Immersive 3D shaders, WebGL canvases, and scroll animations are **strictly quarantined to this Overdrive rule**.

---

## The Overdrive Sequence

Every Overdrive session executes these 6 bounded stages sequentially:

```text
──────────── ⚡ OVERDRIVE ─────────────
》》》 Entering overdrive mode...
```

---

### Stage 1: Impeccable Overdrive Direction (`/impeccable overdrive`)
1. **Determine What "Extraordinary" Means**:
   - *Visual & Creative Showcase*: Sensory depth, ambient GLSL shaders, cursor-reactive flow fields, cinematic transitions.
   - *Functional UI & Tooling*: View transitions, spring physics, zero-latency micro-interactions (≤120ms).
   - *Data-Heavy Platforms*: GPU-accelerated telemetry, live counter interpolations, fluid SVG milestone tracing.
2. **Direct Intake Bypass**:
   - If the user provides a specific component reference (direct URL, `@author/slug`, component name, or screenshot), skip generic brainstorming and immediately pull and theme that exact component.
3. **Interactive Selection Gate (`ask_question`)** (when no specific component is provided):
   - Present 6 curated **Page-wide Visual Motion Suite** options tailored to the product:
     1. **Ambient WebGL Background Shader Suite** (ThreeUI ambient canvas e.g. `WarpFieldBackground` / `RibbonField` + Lenis scroll).
     2. **Interactive 3D Spatial Canvas Suite** (ThreeUI 3D hero scene e.g. `TypographyVortex` / `Sylva` + spatial cards).
     3. **Pinned Horizontal Bento Showcase** (21st.dev bento cards + GSAP ScrollTrigger pinned horizontal scrub).
     4. **Glowing Border-Beam & Spotlight Suite** (21st.dev border-beam containers + interactive radar/spotlight cards).
     5. **Kinetic Editorial Typography Suite** (GSAP SplitText unmasking + asymmetric high-tension layout + progress bar milestones).
     6. **Minimalist Static Precision Suite** (Zero WebGL shaders/3D, pure token typography, flat bento dividers).

---

### Stage 2: ThreeUI 3D & Shader Sourcing (`@designcodeio/threeui`)
Source pre-built WebGL shaders and 3D scenes instead of writing uncalibrated raw boilerplate:
1. **Intake Channels**:
   - **(Recommended) Direct Component Name or URL**: Send name or link (e.g., `WarpFieldBackground` or `threeui.com/browse/...`). Imported directly from `@designcodeio/threeui`.
   - **Visual Screenshot**: Inspect image via `view_file`, identify scene structure, match export in `@designcodeio/threeui`, and mount canvas.
   - **Catalog Discovery**: Query `@designcodeio/threeui` for available exports:
     - *Background Shaders*: `WarpFieldBackground`, `StreamConvergenceBackground`, `RibbonFieldBackground`, `AtTheHorizon`.
     - *Interactive Canvases*: `TypographyVortexCanvas`, `SylvaLivingWorldScene`, `TempleNightScene`.
     - *Micro-3D Controls*: `ShaderButtons`, `GlassToggle`, `ModernToggle`, `SparkBadge`.
2. **Performance Floor & WebGL Lifecycle**: Clamped device pixel ratio (`Math.min(window.devicePixelRatio, 2)`), visibility pause via `IntersectionObserver`, and smooth lerped pointer coordinates. On route unmount or `webglcontextlost`, invoke `renderer.dispose()`, dispose geometries/materials, and provide a graceful CSS static gradient/bento fallback.

---

### Stage 3: 21st.dev Component Integration (`@21st-dev/cli` & `npx shadcn`)
Source modern design-engineer component blocks from the 21st.dev community:
1. **Intake Channels**:
   - **(Recommended) Direct URL or Slug**: Send URL (e.g., `https://21st.dev/r/magicui/border-beam`) or `@author/slug`. Pulled instantly via `21st add <author>/<slug> --print` or `npx shadcn add "<url>"`. For community preview links without a CLI slug, extract bundled demo iframes (`cdn.21st.dev/bundled/...`) or demo origins via `playwright-skill`.
   - **Visual Screenshot**: Inspect image, extract title/author or visual pattern, query `21st search "<query>"`, and pull matching code.
   - **CLI Discovery**: Run `npx @21st-dev/cli search "<keyword>" --limit 5` to find community-vetted components.
2. **Standard Component Blocks**:
   - **Bento Card Matrices**: Variable-span layouts (`col-span-2` / `col-span-1`) with interactive tilt and hover physics.
   - **Border-Beam Effects**: Animated CSS/SVG border trails running along container perimeters on hover.
   - **Spotlight Containers**: Radial gradient illumination following cursor coordinates (`radial-gradient(450px circle at var(--mouse-x) var(--mouse-y), ...)`).
   - **Interactive Badges & Buttons**: Magnetic buttons, shimmers, and accessible state feedback.

---

### Stage 4: Synchronized Scroll Animation (GSAP ScrollTrigger + Lenis)
Synchronize smooth scrolling with scroll-driven timelines:
1. **Lenis Smooth Scroll Engine**:
   ```javascript
   const lenis = new Lenis({
     duration: 1.2,
     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
     orientation: 'vertical',
     smoothWheel: true,
     touchMultiplier: 1.5,
   });
   ```
2. **ScrollTrigger Lock**:
   ```javascript
   gsap.registerPlugin(ScrollTrigger);
   lenis.on('scroll', ScrollTrigger.update);
   gsap.ticker.add((time) => lenis.raf(time * 1000));
   gsap.ticker.lagSmoothing(0);
   ```
3. **Structure-Driven Motion Profiling**:
   - **Bento Collections**: Pinned horizontal showcase scrub (`pin: true, scrub: 1`).
   - **Metrics & Stats**: Scrubbed counter interpolation (`gsap.to(counter, { val: target, scrollTrigger: ... })`).
   - **Headlines & Text**: GSAP SplitText character/line reveal on viewport enter.
4. **Reduced-Motion Fallback**: Strictly disable pinning and heavy transforms when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

### Stage 5: DESIGN.md Token Theming & Anti-AI Writing
Ensure all ThreeUI and 21st.dev components feel custom-crafted rather than generic:
1. **Token Theming & Contrast Floor**:
   - Map all component background, surface, and border colors directly to `DESIGN.md` CSS variables.
   - Inject project typography (display headings + body font pairings).
   - Enforce documented border radius steps (zero arbitrary `rounded-2xl` or uncalibrated curves).
   - **Hero Clearance**: Set hero 3D container top padding strictly to `calc(var(--header-height) + var(--space-lg))` (24px inset below fixed header) to eliminate dead vertical whitespace.
   - **Shader Contrast Scrims & Authentic Photography**: When layering text or cards over luminous WebGL particles, apply semi-transparent scrim overlays (e.g. `linear-gradient(to top, rgba(0,0,0,0.7), transparent)`) to guarantee WCAG AA contrast. All imagery must be authentic photography (Unsplash/Pexels/CDN, strictly no AI generation).
2. **Anti-AI Writing Floor (`avoid-ai-writing`)**:
   - Zero Tier 1A buzzwords (`delve`, `tapestry`, `seamless`, `robust`, `cutting-edge`, `leverage`, `game-changer`, `synergy`).
   - Zero em dashes (`—` or `--`) in headlines, hero taglines, or buttons.
   - Zero "It's not X — it's Y" constructions. Zero emoji in section titles.

---

### Stage 6: Automated Verification (`playwright-skill` + `impeccable`)
1. **Multi-Viewport Audit**: Inspect at 375px (Mobile), 768px (Tablet), and 1280px (Desktop) via `node .agents/skills/playwright-skill/run.js -e "<audit script>"`.
2. **Zero Leaks**: Verify 0 horizontal scroll leaks (`scrollWidth === clientWidth`) and 0 console errors.
3. **Impeccable Audit**: Run `.agents/skills/impeccable/scripts/impeccable.cmd detect .` confirming 0 anti-patterns in source code.
