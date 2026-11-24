# Creative Interaction & Choreography Catalog

Implementation reference for 103 web interaction patterns across 15 categories.
Pair with [MOTION.md](../../rules/MOTION.md) for curve presets, mode budgets, GPU hygiene, and reduced-motion rules, plus [LenisGsapBridge.tsx](components/LenisGsapBridge.tsx) for synchronized Lenis + GSAP `ScrollTrigger` loops.

> **Surface Modes:** `Experience` (portfolios, studios, editorial showcases) · `Persuade` (marketing, product launches, storefronts) · `Operate`/`Read` (SaaS apps, dashboards, docs).

---

## 1. Scroll (23)

- **Engine:** GSAP `ScrollTrigger` (`pin`, `scrub`, `snap`) + Lenis (`LenisGsapBridge`); `Canvas 2D` for frame sequences; CSS `animation-timeline: view()` for simple transforms.
- **Surface Mode Fit:** `Experience` (all 23) · `Persuade` (selective 1-2 moments: Footer Reveal, Sticky Process Steps, Scroll Stats, Showreel Expand) · `Operate`/`Read` (avoid).
- **Reduced-Motion:** Disable `pin` and `scrub` transforms; render sections in stacked static flow with final state visible.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Stacking Work Cards | Sticky or pinned stack; incoming card slides up over previous card while previous scales to `0.94`-`0.97`. | `Experience`, `Persuade` |
| Footer Reveal | Fixed or sticky footer (`z-index: 0`) revealed beneath main content wrapper (`z-index: 1`) as scroll ends. | `Experience`, `Persuade` |
| Swing-Stack Panels | Pinned panels enter with slight Z-rotation (`rotateZ` +/-4deg) and settle to `0deg` along scroll progress. | `Experience` |
| Scroll Stats | `ScrollTrigger` triggers tabular-nums counter tween (`snap: { innerText: 1 }`) or scrub-linked metric bars. | `Experience`, `Persuade` |
| Card Deal Flip | Scrubbed card fan deals from deck center with `rotateY` 180deg flip (`backface-visibility: hidden`). | `Experience` |
| Mask Grow Spotlight | Scrubbed `clip-path` (`inset()` or `circle()`) expands a media frame from centered aperture to full bleed. | `Experience`, `Persuade` |
| Fly-Through Titles | Pinned Z-axis zoom (`scale` `0.6` -> `3.5` + `opacity` fade) moving oversized display headings toward camera. | `Experience` |
| Card Parade | Horizontal pinned track (`xPercent` scrub) gliding work cards past viewport with slight velocity lag. | `Experience` |
| Showreel Expand | Centered inline video preview scales and expands `clip-path` into full-viewport playback stage on scroll. | `Experience`, `Persuade` |
| Sticky Process Steps | Two-column layout: sticky index/media column paired with scrolling numbered steps activating active state. | `Experience`, `Persuade` |
| Tilt-Back Project Stack | Outgoing stacked cards pitch backward (`rotateX` + subtle `scale` down + dim overlay) as next card rises. | `Experience` |
| Arc Spotlight | Cards travel along a curved arc (`translate3d` + `rotateZ` derived from normalized viewport offset). | `Experience` |
| Shrink & Tilt Card Stack | Active card shrinks (`scale(0.9)`) and tilts (`rotateZ`) away as the successor covers it. | `Experience` |
| Circle Reveal Strip | Scrubbed `clip-path: circle(r at 50% 50%)` opens a horizontal strip into full-height visual band. | `Experience` |
| Tag Drift Outro | Floating pill tags drift horizontally in opposing directions (`x` scrub) across the closing section. | `Experience`, `Persuade` |
| Tab Stack Cards | Folder-tabbed sticky cards remain visible by their top tab headers while stacking down the viewport. | `Experience`, `Persuade` |
| Fly-in Work Grid | Staggered grid columns translate from opposing depth/vertical offsets (`y`, `scale`) into aligned grid. | `Experience` |
| Slant Wipe Slides | Pinned full-bleed slides transition via angled `clip-path: polygon(...)` diagonal wipe on scroll. | `Experience` |
| Scroll Frame Sequence | Pinned `<canvas>` draws preloaded WebP/AVIF image sequence indexed by `ScrollTrigger.progress`. | `Experience`, `Persuade` |
| Parallax Edit | Multi-plane editorial media with bounded `yPercent` speed deltas (`-12%` to `+12%`) inside `overflow: hidden`. | `Experience`, `Persuade` |
| Rolling Stats | Vertical digit columns translate along `translateY` per digit slot as stat enters viewport. | `Experience`, `Persuade` |
| Flight Wall | Perspective-tilted multi-column media wall translating continuously along scroll velocity axis. | `Experience` |
| Tilted Review Stack | Stacked testimonial cards alternate subtle +/-2deg to +/-4deg tilt angles and unstack on scroll. | `Experience`, `Persuade` |

---

## 2. Heroes (14)

- **Engine:** GSAP Timeline + `SplitText` + `Draggable`/`Observer`; `Canvas 2D` or ThreeUI/GLSL (`@designcodeio/threeui`) for fluid/cloth/particle heroes; SVG `<feTurbulence>`/`<feGaussianBlur>` for gooey/ripple masks.
- **Surface Mode Fit:** `Experience` (all 14) · `Persuade` (Luxury Hero Reveal, Swatch Switch Hero, Drift & Shrink Hero, Fan Card Carousel, Flipbook Hero Card) · `Operate`/`Read` (none).
- **Reduced-Motion:** Render hero headline, CTA, and key visual at full opacity immediately; freeze shader/particle loops on frame 0 or show static poster image.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Ink Trail Hero | Pointer-driven `<canvas>` or WebGL ping-pong FBO stamps fading ink strokes behind crisp foreground typography. | `Experience` |
| Navigate Cinematic Hero | Full-bleed video/WebGL canvas with synchronized scene switcher, chapter progress bar, and masked title swaps. | `Experience` |
| Woven Cloth Poster | Three.js/GLSL vertex-displaced plane with pointer-reactive cloth waves and specular fabric lighting. | `Experience` |
| Ripple Painting Hero | Fragment shader or displacement canvas reveals an underlying painted canvas via expanding pointer ripples. | `Experience` |
| Luxury Hero Reveal | Staggered `clip-path` image wipe + `SplitText` masked line rise on `power4.out` ease. | `Experience`, `Persuade` |
| Twinkle Hero | Subtle ambient star/sparkle canvas (`<=40` particles on mobile) with twinkling opacity cycles behind headline. | `Experience` |
| Grid Drag Hero | Infinite or bounded pan-able media grid driven by GSAP `Draggable`/`Observer` with inertia momentum. | `Experience` |
| Flipbook Hero Card | Pointer X-position or interval scrubs a rapid frame stack inside a central hero card frame. | `Experience`, `Persuade` |
| Gooey Reveal Hero | SVG `<feGaussianBlur>` + `<feColorMatrix>` gooey metaball mask merges blobs to reveal hero artwork. | `Experience` |
| Particle Logo | Canvas/WebGL particle cloud samples brand logo alpha points, repels on pointer move, and springs home. | `Experience` |
| Ripple Water Text | GLSL displacement map warps hero display text texture with damped pointer-triggered water rings. | `Experience` |
| Swatch Switch Hero | Clicking color/variant swatches triggers radial `clip-path` or crossfade theme + product media swap. | `Experience`, `Persuade` |
| Drift & Shrink Hero | Hero media drifts subtly at rest and smoothly scales down into framed container as initial scroll begins. | `Experience`, `Persuade` |
| Fan Card Carousel | Spread hand of hero cards fans out on load and rotates focal card on click, drag, or arrow keys. | `Experience`, `Persuade` |

---

## 3. Hover (12)

- **Engine:** CSS `transform`/`clip-path` + `gsap.quickTo()` for pointer-tracked 3D tilt, floating previews, and gliding highlight bars. Always gate pointer-follow logic behind `@media (hover: hover) and (pointer: fine)`.
- **Surface Mode Fit:** `Experience` (all 12) · `Persuade` (Parallax Product Card, Hover Reveal Rows, Let's Talk, Highlight Client Grid, Service List Reveal, Sliver Accordion Gallery) · `Operate`/`Read` (subtle Highlight Client Grid or Gliding Window List only; no 3D tilt).
- **Reduced-Motion:** Swap tilt, floating preview chase, and rolling text for instant border/background highlight and static preview fade (`.motion-fade-only`).

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Parallax Product Card | Pointer offset inside card shifts background and foreground product layers at different `translate3d` depths. | `Experience`, `Persuade` |
| Tilt Product Cards | `perspective` + `rotateX`/`rotateY` clamped to +/-8deg with optional radial specular highlight layer. | `Experience` |
| Tilt Stamp Card | Hover tilts card and stamps an angled badge/seal into place with snappy spring scale (`1.15` -> `1`). | `Experience` |
| Hover Reveal Rows | Full-width list rows expand background sweep and reveal thumbnail or metadata clip on pointer enter. | `Experience`, `Persuade` |
| Let's Talk | Oversized contact CTA row shifts fill color, rolls duplicate label vertically, and slides directional arrow. | `Experience`, `Persuade` |
| Rolling Award Rows | Each row holds stacked normal/active text lines that roll vertically (`translateY(-100%)`) on hover. | `Experience` |
| Highlight Client Grid | Grid dims sibling logos (`opacity: 0.35`) or moves a shared backdrop tile (`Flip`/`quickTo`) under active cell. | `Experience`, `Persuade`, `Operate` |
| Name List Preview | Hovering a text-only name list updates a fixed or pointer-following preview card with masked image crossfade. | `Experience` |
| Service List Reveal | Hovering service rows reveals an inline description strip or side preview panel via `clip-path` wipe. | `Experience`, `Persuade` |
| Archive Pop Preview | Dense index rows pop a bounded thumbnail near cursor via `gsap.quickTo()` with velocity-clamped rotation. | `Experience` |
| Gliding Window List | Single floating highlight frame (`GSAP Flip` or `quickTo`) glides smoothly vertically between hovered rows. | `Experience`, `Persuade`, `Operate` |
| Sliver Accordion Gallery | Row of narrow vertical media slivers expands hovered sliver (`flex-grow` or `Flip`) while compressing peers. | `Experience`, `Persuade` |

---

## 4. Loaders (7)

- **Engine:** GSAP Timeline (`gsap.timeline`) with `sessionStorage` once-per-session gating and max duration `<=1.4s`. Never block SSR text crawlability or trap focus.
- **Surface Mode Fit:** `Experience` (pick max 1) · `Persuade` (optional lightweight Logo Mask Reveal only if brand-critical) · `Operate`/`Read` (strictly forbidden).
- **Reduced-Motion:** Skip loader timeline completely; unmount overlay immediately so first paint is instant.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Curtain Loader | Full-viewport veil lifts via `translateY(-100%)` or `clip-path: inset(0 0 100% 0)` on `power4.inOut`. | `Experience` |
| Counter Curtain | Tabular `00`->`100` progress counter drives bar/fill, then slides curtain upward to expose hero. | `Experience` |
| Credits Grid Preloader | Multi-column typographic credits grid blinks/staggers in, then clears cells out in staggered sequence. | `Experience` |
| Image Stack Preloader | Stacked portfolio stills cycle rapidly at center, then expand final frame (`Flip`) into hero media slot. | `Experience` |
| Rolling Count Loader | Oversized vertical digit drums roll `0`-`9` per place value to `100`, then split open. | `Experience` |
| Split Logo Intro | Wordmark/emblem halves converge or slide apart horizontally while masking veil retracts. | `Experience` |
| Logo Mask Reveal | Brand SVG mask scales up from center (`scale` `1` -> `25`) to punch through overlay into page content. | `Experience`, `Persuade` |

---

## 5. Menus (7)

- **Engine:** GSAP Timeline + `GSAP Flip` + `ScrambleText` + CSS `clip-path` + Focus trap (`inert` / `<dialog>` / Popover API).
- **Surface Mode Fit:** `Experience` (all 7) · `Persuade` (Drop Menu, Pill Dropdown Menu, Search Drawer) · `Operate`/`Read` (Pill Dropdown Menu, Search Drawer).
- **Reduced-Motion:** Open/close overlay with `.motion-fade-only` (`150ms` opacity fade); disable panning and glyph scramble.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Drop Menu | Full-width top panel drops down (`translateY` / `clip-path`) with staggered link lines and dimmed backdrop. | `Experience`, `Persuade` |
| Panning Link Menu | Oversized navigation list shifts smoothly along opposite pointer axis (`quickTo`) to scan wide link rows. | `Experience` |
| Scramble Menu | Full-screen or drawer nav links decode with brief `ScrambleText` glyph sweep on open and hover. | `Experience` |
| Pill Dropdown Menu | Floating pill navbar morphs (`Flip` or spring scale) to reveal compact grouped submenu items below trigger. | `Experience`, `Persuade`, `Operate` |
| Chip Stack Menu | Compact floating chips stack vertically out of menu button with staggered spring offsets. | `Experience` |
| Circle Open Menu | Menu backdrop expands from toggle button coordinates using `clip-path: circle(0% at x y)` -> `circle(150%)`. | `Experience` |
| Search Drawer | Command/search panel slides down or opens centered `<dialog>` with instant filter reflow and keyboard nav. | `Experience`, `Persuade`, `Operate` |

---

## 6. Text (7)

- **Engine:** GSAP `SplitText` (`lines`, `words`, `chars`) + `ScrambleText` + `Draggable`/`Observer` + Variable Font `font-variation-settings` (`wght`). Keep primary `<h1>` readable on initial load (avoid hiding above-the-fold text behind scroll).
- **Surface Mode Fit:** `Experience` (all 7) · `Persuade` (Block Line Reveal, Pill Word Reveal, Split Word Converge) · `Operate`/`Read` (none; keep copy static).
- **Reduced-Motion:** Render all text immediately in final weight, position, and glyph string with zero splitting motion.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Block Line Reveal | Each `SplitText` line sits inside `overflow: hidden` mask and rises from `yPercent: 105` to `0`. | `Experience`, `Persuade` |
| Pill Word Reveal | Highlighted keywords sit inside rounded pill containers that pop/slide in alongside line stagger. | `Experience`, `Persuade` |
| Scramble Text | Monospace/display text cycles through bounded glyph charset (`ScrambleText`) for `250ms`-`450ms` before locking. | `Experience` |
| Cursor Repel Text | Per-character spans compute pointer distance and offset via `quickTo` spring repulsion within radius `R`. | `Experience` |
| Grid Drag Text | Typographic poster grid pans freely under pointer drag (`Draggable`/`Observer`) with velocity decay. | `Experience` |
| Split Word Converge | Two halves of a display phrase slide inward from left/right bounds (`xPercent`) to lock at center. | `Experience`, `Persuade` |
| Weight Sweep Marquee | Continuous or pointer-swept variable font headline waves `wght` axis across characters (`300` -> `800`). | `Experience` |

---

## 7. Carousels (6)

- **Engine:** GSAP Timeline + `Observer`/`Draggable` + SVG turbulence/displacement filter (Ink Splash) + CSS `filter: blur()` + `aria-live="polite"` + keyboard Left/Right support.
- **Surface Mode Fit:** `Experience` (all 6) · `Persuade` (Blur Set Carousel, Layered Carousel, Story Slides, Auto-Advance Tabs, Avatar Tab Reviews) · `Operate`/`Read` (Auto-Advance Tabs / Avatar Tab Reviews without autoplay).
- **Reduced-Motion:** Pause auto-advance timers; replace blur, ink splash, and 3D stack slides with instant crossfade (`.motion-fade-only`).

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Ink Splash Carousel | Slide change animates SVG/WebGL organic ink mask expanding across outgoing frame to reveal next slide. | `Experience` |
| Blur Set Carousel | Outgoing slide blurs + scales (`blur(12px)`, `scale(0.96)`, `opacity: 0`) while incoming sharpens in. | `Experience`, `Persuade` |
| Layered Carousel | Depth-stacked cards offset along `scale` and `translateX/Y`; advancing peels front card to back of deck. | `Experience`, `Persuade` |
| Story Slides | Full-bleed vertical/square frames with segmented top progress bars, tap zones, and pause-on-hold. | `Experience`, `Persuade` |
| Auto-Advance Tabs | Tab list with progress-fill indicator automatically cycles feature panels; pauses on hover, focus, or click. | `Experience`, `Persuade`, `Operate` |
| Avatar Tab Reviews | Row of clickable author avatars highlights active reviewer (`scale`/ring) and crossfades quote panel. | `Experience`, `Persuade`, `Operate` |

---

## 8. Sections (4)

- **Engine:** Canvas/SVG/Three.js (`Dot World Map`), 3D CSS `rotateY` + `transform-style: preserve-3d` (`Page-Flip Book`), native `<details>`/`<summary>` or `GSAP Flip` (`FAQ Accordion`), accessible form micro-feedback (`Contact Page`).
- **Surface Mode Fit:** `Experience` (all 4) · `Persuade` (all 4) · `Operate`/`Read` (FAQ Accordion, Contact Page).
- **Reduced-Motion:** Disable pulse pings and 3D page turns; snap accordion height and show flat page tabs cleanly.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Dot World Map | Precomputed lat/lon dot matrix on `<canvas>` or inline SVG with highlighted hub pins and hover tooltips. | `Experience`, `Persuade` |
| Page-Flip Book | Two-page spread pivots along center spine (`transform-origin: left center`, `rotateY(-180deg)`) on click/drag. | `Experience`, `Persuade` |
| FAQ Accordion | Single or multi-open disclosure rows with `grid-template-rows` or `Flip` reveal and rotating `+`/`-` icon. | `Experience`, `Persuade`, `Operate` |
| Contact Page | Split editorial intake layout with floating focus states, copy-email feedback toast, and inline validation. | `Experience`, `Persuade`, `Operate` |

---

## 9. Buttons (3)

- **Engine:** CSS `transform`, `clip-path`, pseudo-element fill layers, and `:active { transform: scale(0.97); }`. Keep touch targets `>=44x44px`.
- **Surface Mode Fit:** `Experience` (all 3) · `Persuade` (all 3) · `Operate`/`Read` (restrained Pill CTA Hover only).
- **Reduced-Motion:** Replace sliding fill sweeps and dual-label rolls with instant color/border swap; keep `:active` press clear.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Pill CTA Hover | Rounded pill shifts icon horizontally and rolls label text upward (`translateY`) inside clipped inner span. | `Experience`, `Persuade`, `Operate` |
| Circle Fill Button | Hover expands a circular pseudo-element from pointer entry point (`scale(0)` -> `scale(2.5)`) to invert fill. | `Experience`, `Persuade` |
| Sweep Pill CTA | Diagonal or horizontal `clip-path` wipe sweeps contrasting background across pill with crisp text invert. | `Experience`, `Persuade` |

---

## 10. Cursors (3)

- **Engine:** `gsap.quickTo()` on fixed `pointer-events: none` layer; strictly gated behind `@media (hover: hover) and (pointer: fine)`. Never hide the native cursor over form inputs or degrade click precision.
- **Surface Mode Fit:** `Experience` (pick max 1) · `Persuade` (rare; only editorial launches) · `Operate`/`Read` (strictly forbidden).
- **Reduced-Motion:** Unmount custom cursor DOM/RAF listener completely and use default OS cursor.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Morphing Cursor | Dot cursor morphs into labeled pill ("View", "Drag") or magnetic ring snapped to hovered interactive bounds. | `Experience` |
| Sliced Image Trail | Pointer travel above distance threshold spawns short-lived sliced media cards along path with fade/scale out. | `Experience` |
| Stretch Blob Cursor | Pointer follower computes velocity vector angle and stretches scaleX/scaleY along movement direction. | `Experience` |

---

## 11. Footers (3)

- **Engine:** GSAP `ScrollTrigger`, `Canvas 2D`/WebGL, and `ResizeObserver`-scaled SVG/CSS display typography.
- **Surface Mode Fit:** `Experience` (all 3) · `Persuade` (Wordmark Footer, restrained Ink Footer) · `Operate`/`Read` (static compact footer only).
- **Reduced-Motion:** Render static footer links and full wordmark immediately; disable ink canvas and photo burst emitters.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Ink Footer | Dark editorial footer with subtle pointer-reactive ink/gradient sheen canvas behind structured sitemap links. | `Experience`, `Persuade` |
| Photo Burst Footer | Hovering footer links or clicking CTA bursts bounded thumbnail cards outward with gravity/spring settle. | `Experience` |
| Wordmark Footer | Edge-to-edge full-width brand wordmark (`viewBox` SVG or fluid `clamp()`) rises from bottom clip on entry. | `Experience`, `Persuade` |

---

## 12. Page Transitions (2)

- **Engine:** Next.js App Router transition provider + GSAP Timeline or native View Transitions API (`document.startViewTransition`). Keep total handoff `<=500ms`.
- **Surface Mode Fit:** `Experience` (pick max 1) · `Persuade` (optional fast Curtain Page Transition) · `Operate`/`Read` (instant route swap or native View Transitions crossfade only).
- **Reduced-Motion:** Bypass curtain/slide timelines; navigate immediately with standard browser render.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Curtain Page Transition | Opaque veil wipes in on route leave (`220ms`), swaps route content, and wipes out (`260ms`) on mount. | `Experience`, `Persuade` |
| Slide Stack Transition | Outgoing page scales down (`0.95`) and dims while incoming route slides upward over top edge. | `Experience` |

---

## 13. Galleries (1)

- **Engine:** GSAP `Draggable` + `InertiaPlugin` (or `Observer` + virtualized wrap bounds on `translate3d`). Include keyboard/button pan fallback.
- **Surface Mode Fit:** `Experience` · `Persuade` (visual lookbooks only) · `Operate`/`Read` (avoid).
- **Reduced-Motion:** Disable inertia momentum and auto-drift; expose standard scrollable CSS Grid layout.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Infinite Drag Gallery | 2D toroidal canvas wraps media tiles seamlessly across X/Y axes under drag/wheel with momentum fling. | `Experience`, `Persuade` |

---

## 14. Marquees (1)

- **Engine:** CSS `@keyframes` `translate3d(-50%, 0, 0)` on duplicated track (`aria-hidden="true"` on clone) or GSAP `horizontalLoop` helper. Pause on hover and keyboard focus. Honor [anti-ai-slop](../../skills/anti-ai-slop/SKILL.md) unrequested-marquee bans.
- **Surface Mode Fit:** `Experience`, `Persuade` (only when user requests partner/client logo band) · `Operate`/`Read` (forbidden).
- **Reduced-Motion:** Stop marquee translation and render a clean static wrapped logo grid.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| Logo Marquee | Seamless single-row monochrome partner logo strip scrolling continuously with edge fade mask and hover pause. | `Experience`, `Persuade` |

---

## 15. Modern Native & Tactile Web Feel (10)

- **Engine:** Native CSS Scroll-Driven Animations, View Transitions API, GSAP `Flip` / Motion `layoutId`, Spring physics (`stiffness`/`damping`), Lenis velocity hooks, and ThreeUI/GLSL shaders.
- **Surface Mode Fit:** Core tactile patterns (3, 4, 7, 8, 10) fit ALL modes including `Operate`/`Read`; visual/scroll patterns (1, 2, 5, 6, 9) fit `Experience` and `Persuade`.
- **Reduced-Motion:** Preserve instant state updates, focus rings, and `.motion-fade-only` fades; zero skew, shader motion, or radial wipes.

| Pattern | Mechanics & Primitives | Mode Fit |
| --- | --- | --- |
| CSS Scroll-Driven Reveals (`animation-timeline: view()`/`scroll()`) | Zero-JS compositor-thread reveals using `animation-timeline: view()` and `animation-range: entry 0% cover 30%`. | `Experience`, `Persuade` |
| View Transitions Shared-Element Morphs (`view-transition-name`) | Native `document.startViewTransition()` morphs thumbnails, titles, and cards across views without layout shift. | `Experience`, `Persuade`, `Operate` |
| Shared-Layout Sliding Tab/Pill Indicator (`FLIP`/`layoutId`) | Active tab pill glides cleanly to target bounds via `GSAP Flip` or Motion `layoutId` using Snappy spring. | `Experience`, `Persuade`, `Operate` |
| Tactile Spring Drawers & Gesture-Dismissible Sheets (velocity snap + rubber-band) | Drag-to-dismiss sheet tracks pointer delta, applies rubber-band resistance past detent, and snaps via release velocity. | `Experience`, `Persuade`, `Operate` |
| Lenis Scroll-Velocity Skew Clamp | Maps `lenis.velocity` through `gsap.utils.clamp(-4, 4)` onto card/image `skewY` and returns smoothly to `0deg`. | `Experience`, `Persuade` |
| Magnetic Dock / Focus-Lens Navigation | Pointer distance along horizontal dock scales adjacent icons along a Gaussian bell curve with spring settle. | `Experience`, `Persuade` |
| Odometer / Tabular-Nums Spring Ticker | `font-variant-numeric: tabular-nums` digit slots spring vertically on value change with zero horizontal jitter. | `Experience`, `Persuade`, `Operate` |
| Zero-Jump Filter/Bento Reflow (`GSAP Flip`) | Captures `Flip.getState()` before filter/sort DOM updates and animates items smoothly into new grid positions. | `Experience`, `Persuade`, `Operate` |
| ThreeUI/GLSL Liquid & Displacement Surface Shaders | Imports `@designcodeio/threeui` backgrounds/canvases with off-screen `IntersectionObserver` pause and mobile LOD. | `Experience` |
| Radial Clip-Path Theme Wipe | Theme toggle invokes `document.startViewTransition()` animating `::view-transition-new(root)` `clip-path: circle()` from click point. | `Experience`, `Persuade`, `Operate` |
