# Motion & Interactive Animation Standards (`MOTION.md`)

Animations must communicate state, confirm direct manipulation, or guide spatial continuity. Never add decorative friction.

## 1. Core Execution Rules
1. **Physics Over Linear:** Use springs or exponential ease-out (`cubic-bezier(0.25, 1, 0.5, 1)`); ban flat `linear` for interactive UI. Settle standard transitions within `300ms`.
2. **GPU-Composited Properties:** Default to `transform` (`translate3d`, `scale`, `rotate`) and `opacity`. Composited `filter` (`blur`), `backdrop-filter`, `clip-path`, and `mask` are allowed when smooth without layout thrash ([craft-floor.md](../skills/impeccable/reference/craft-floor.md)).
3. **Layout-Property Ban:** Never animate `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding`, and ban `transition: all`. Use FLIP (`transform` deltas) or View Transitions for layout shifts.
4. **Unified Active Press:** Press feedback uses `scale(0.97)` on `:active` (`60ms` ease-out or snappy spring), matching [UI_Always.md](UI_Always.md).
5. **Deterministic Rest & Interruption:** Follow `[Rest] -> [Active] -> [Rest]`. Mid-flight triggers must blend smoothly into the new target without snapping or freezing.

## 2. Curves, Springs & Technique Selection

### Spring & Easing Presets
- **Gentle** (`120 / 14`): Modals, sheets, drawers, large reveals (`stiffness / damping`).
- **Snappy** (`280 / 20`): Button presses, tab toggles, compact state changes.
- **Bouncy** (`400 / 12`): Milestone/success rewards only (`3%`-`8%` overshoot, `<=300ms`).
- **Standard Ease-Out** (`cubic-bezier(0.25, 1, 0.5, 1)`): Entrances and expands.
- **Smooth S-Curve** (`cubic-bezier(0.65, 0, 0.35, 1)`): Coordinated layout shifts.

### Technique Routing
- **Always-Available:** CSS transitions, keyframes, springs, drag/swipe gestures with velocity fling, FLIP/View Transitions, SVG path/stroke morphs.
- **Gated (`Experience`/`Persuade` only):** Rive/Lottie state machines (`ViewModel`/`ActionState`), particles, WebGL/GLSL shaders, skeletal rigs, flipbooks, desktop magnetic pull (`<=4px`). Never add to `Operate`/`Read` unrequested.
- **Scroll & 3D:** Delegate scrubbed/pinned stages to [scrollytelling](../skills/scrollytelling/SKILL.md) or [scroll-experience](../skills/scroll-experience/SKILL.md); WebGL/R3F scenes to [3d-web-experience](../skills/3d-web-experience/SKILL.md).

## 3. Creative Feel & Signature Choreography

Load [interaction-catalog.md](../resources/creative-libraries/interaction-catalog.md) on demand for exact mechanics across all 103 patterns.

### Mode-Matched Signature Budget
- **`Experience` (Portfolios, Agencies, Showcases):** 1 Hero signature + 1 Loader or Page Transition + 2-3 Scroll/Gallery moments + unified Hover/Cursor/Menu/Text/Footer feel.
- **`Persuade` (Marketing, Launches, Storefronts):** 1 Hero signature + 1-2 Scroll/Section moments + unified Button/Hover/Text feel + optional Footer Reveal.
- **`Operate` / `Read` (SaaS, Dashboards, Docs):** Restrained tactile feel only: Shared-Layout sliding tab pills, `GSAP Flip` filter/list reflows, tactile spring drawers/sheets, subtle hover cues, `scale(0.97)` press. Zero preloaders, custom cursors, scroll-jacking, or text repel/scramble.

### 15-Category Engine Quick Map
Modes: `Exp` = Experience, `Per` = Persuade, `Op` = Operate/Read. Catalog: [interaction-catalog.md](../resources/creative-libraries/interaction-catalog.md).

| # | Category | Engine | Fit |
| --- | --- | --- | --- |
| 1 | Scroll (23) | `ScrollTrigger` + Lenis (`LenisGsapBridge`), Canvas | `Exp`, `Per` |
| 2 | Heroes (14) | GSAP Timeline + `SplitText`, `Draggable`, ThreeUI/GLSL | `Exp`, `Per` |
| 3 | Hover (12) | CSS `transform`/`clip-path`, `quickTo()`, `Flip` | `Exp`, `Per`, light `Op` |
| 4 | Loaders (7) | GSAP Timeline (`<=1.4s`, once/session) | `Exp` |
| 5 | Menus (7) | GSAP Timeline, `Flip`, `ScrambleText`, `<dialog>` | `Exp`, `Per`, select `Op` |
| 6 | Text (7) | `SplitText`, `ScrambleText`, `Observer`, var `wght` | `Exp`, `Per` |
| 7 | Carousels (6) | GSAP Timeline, `Observer`/`Draggable`, SVG/`filter` | `Exp`, `Per`, manual `Op` |
| 8 | Sections (4) | Canvas/SVG, 3D `rotateY`, `<details>`/`Flip` | `Exp`, `Per`, select `Op` |
| 9 | Buttons (3) | CSS `transform`, `clip-path`, `:active` `scale(0.97)` | `Exp`, `Per`, light `Op` |
| 10 | Cursors (3) | `quickTo()` (`hover: hover` + `pointer: fine`) | `Exp` |
| 11 | Footers (3) | `ScrollTrigger`, Canvas, fluid SVG/CSS wordmark | `Exp`, `Per` |
| 12 | Page Transitions (2) | App Router GSAP Timeline or View Transitions (`<=500ms`) | `Exp`, `Per` |
| 13 | Galleries (1) | `Draggable` + `InertiaPlugin` / `Observer` wrap | `Exp`, `Per` |
| 14 | Marquees (1) | CSS `translate3d(-50%)` or `horizontalLoop` | `Exp`, `Per` (requested) |
| 15 | Modern Native & Tactile (10) | Scroll-Driven CSS, View Transitions, `Flip`/`layoutId`, Springs, ThreeUI | All (tactile fits `Op`) |

- **Native Web Motion Baseline:** Query [modern-web-guidance](../skills/modern-web-guidance/SKILL.md) (`search`/`retrieve`) for Baseline support and fallbacks before using CSS Scroll-Driven Animations (`animation-timeline: view()`/`scroll()`) or View Transitions.

### Tasteskill `gate.mjs` vs Custom Showcase Boundary
- **Gated Static Sites (`.taste-skill/build.json`):** Honor [design-taste-frontend](../skills/design-taste-frontend/SKILL.md) `consistency.mjs` (dealt moments in own sections; skip card tilt and scroll-linked cards).
- **Custom Showcases (React/Next.js/GSAP/Lenis):** For `Experience` or custom `Persuade` builds without `.taste-skill/build.json`, enable the full [interaction-catalog.md](../resources/creative-libraries/interaction-catalog.md) via `.claude/resources/creative-libraries/`.

### Cohesion Law
Never mix conflicting motion dialects on one page. Pick 1 primary physics curve, 1 reveal idiom, and 1 hover grammar across all components.

## 4. Responsive Bounds & GPU Lifecycle Hygiene
- **Mobile (`375px`-`430px`):** Keep micro-drift within `16px`-`32px` (or viewport units) to prevent clipping; keep `:active` press instant (`scale(0.97)`).
- **Desktop (`1280px+`):** Clamp travel inside centered containers so ultrawides (`2560px+`) avoid oversized motion.
- **Frame Budget & LOD:** Hold `60 FPS` (`120 FPS` ProMotion only on `Experience`/`Persuade` showcases). Cap mobile particles at `<=30`-`40`; fall back to static SVG/CSS on frame drops.
- **Anti-Slop & Cleanup:** Follow [anti-ai-slop](../skills/anti-ai-slop/SKILL.md) for scroll fade-up and marquee bans. Render primary text visible immediately. Clear `will-change` after settling and pause off-screen RAF/canvas loops via `IntersectionObserver`.

## 5. Accessibility & Reduced Motion Protocol
Respect `@media (prefers-reduced-motion: reduce)` without contradicting opt-in opacity fades:

```css
@media (prefers-reduced-motion: reduce) {
  *:not(.motion-fade-only),
  *:not(.motion-fade-only)::before,
  *:not(.motion-fade-only)::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .motion-fade-only {
    animation: none !important;
    transition: opacity 150ms ease-out !important;
  }
}
```

- **Default:** Spatial motion, springs, bounces, parallax, particles, and continuous loops resolve immediately.
- **Opt-In Opacity Fallback:** Apply `.motion-fade-only` on modals, toasts, and popovers for a `150ms` fade. `:not(.motion-fade-only)` beats component specificity via `!important` without clashing with `.motion-fade-only`.
- **Functional Feedback:** Preserve instant color, border, focus-ring, and active-tab state changes.

## 6. Verification
Verify animations and interrupted transitions in a real browser per [UI_Always.md](UI_Always.md#7-browser-verification-policy) for zero clipping, zero layout thrash, and clean `prefers-reduced-motion` behavior.
