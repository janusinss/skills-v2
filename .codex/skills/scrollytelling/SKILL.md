---
name: "scrollytelling"
description: "Build declarative scroll-driven animations, pinned sections, parallax, waypoints, canvas sequences, and R3F 3D scroll scenes with @bsmnt/scrollytelling and GSAP."
license: "MIT"
metadata:
  source: "basementstudio/scrollytelling"
---

# BSMNT Scrollytelling (`@bsmnt/scrollytelling`)

Build choreographed, 60fps scroll-driven narratives in React and Next.js using [`@bsmnt/scrollytelling`](https://github.com/basementstudio/scrollytelling) by [basement.studio](https://basement.studio/) — a free, open-source component abstraction over **GSAP ScrollTrigger** with zero paid external API calls.

## Why `@bsmnt/scrollytelling`?

1. **Normalized `0–100` Progress Timeline**: Instead of guessing time-based `duration` values, every animation inside `<Scrollytelling.Root>` is positioned using deterministic `start` (`0–100`) and `end` (`0–100`) scroll percentages.
2. **Automatic React Lifecycle Cleanup**: Handles GSAP `timeline.revert()`, `ScrollTrigger` registration, and React 18/19 strict-mode mount/unmount cleanup automatically without manual `useEffect` boilerplate.
3. **React Server Components (RSC) Friendly**: Only the scrollytelling wrapper components require `"use client"`, allowing Server Components to be passed as `children` without forcing the entire route into client rendering.
4. **Composable Context Architecture**: Nest `<Animation>`, `<Pin>`, `<Parallax>`, `<Stagger>`, `<Waypoint>`, `<ImageSequenceCanvas>`, and `useScrollytelling()` anywhere inside `<Scrollytelling.Root>`.
5. **Built-in Visual Debugger**: Pass `debug={{ label: "Section Name" }}` to `<Scrollytelling.Root>` to inspect timeline tracks in a draggable overlay visualizer.

---

## Step 1 — Installation & Client Boundary Setup

Install `@bsmnt/scrollytelling` alongside its required peer dependency `gsap`:

```bash
npm install @bsmnt/scrollytelling gsap
# or: pnpm add @bsmnt/scrollytelling gsap
# or: yarn add @bsmnt/scrollytelling gsap
```

### Next.js App Router Client Wrapper (`scrollytelling-client.tsx`)

In Next.js App Router (`app/`), create a dedicated `"use client"` barrel file so Server Components can import or compose scrollytelling primitives cleanly:

```tsx
// src/lib/scrollytelling-client.tsx
"use client";

export * from "@bsmnt/scrollytelling";
```

---

## Step 2 — Core Primitives & Mental Model

Every scrollytelling section follows a 3-layer hierarchy:

1. **`<Scrollytelling.Root>`**: Defines the scroll trigger boundaries (`start="top top"`, `end="bottom bottom"`, `scrub={true | number}`) and initializes a normalized `0–100` GSAP timeline.
2. **`<Scrollytelling.Pin>`** *(when pinning a viewport stage)*: Reserves scroll distance via `pinSpacerHeight` (e.g., `"300vh"`) while keeping the inner stage sticky at `childHeight` (e.g., `"100dvh"`).
3. **Declarative Timeline Children** (`0 <= start <= end <= 100`):
   - **`<Scrollytelling.Animation>`**: Animates a single child (via Radix `<Slot>`) or an explicit `target` selector/ref/object using `to`, `from`, or `fromTo` across `[start, end]`. Also accepts an array of tweens (`tween={[...]}`) for multi-phase sequences.
   - **`<Scrollytelling.Parallax>`**: Moves children smoothly along X/Y axes (`movementY: { value: 40, unit: "px" }`) across `[start, end]`.
   - **`<Scrollytelling.Stagger>`**: Distributes `[start, end]` across an array of `children` or `tween.target` items with configurable `overlap` (`0` to `1`).
   - **`<Scrollytelling.Waypoint>`**: Fires `onCall` / `onReverseCall`, registers a timeline `label` (for `useScrollToLabel`), or triggers a time-based `tween` (`duration` in seconds) at a specific scroll percentage `at={0..100}`.
   - **`<Scrollytelling.ImageSequenceCanvas>`**: Scrubs frame-by-frame WebP/AVIF/JPG canvas sequences with built-in preloading and frame caching.
   - **`useScrollytelling()`**: Hook returning `{ timeline, rootRef, events }` to drive React Three Fiber (`useFrame`) 3D cameras, custom shaders, or external state from `timeline.scrollTrigger.progress`.

Read [references/api-reference.md](references/api-reference.md) for the complete prop tables and TypeScript signatures, and [references/patterns.md](references/patterns.md) for full production code recipes.

---

## Step 3 — Choosing the Right Architecture Pattern

| Use Case | Recommended `@bsmnt/scrollytelling` Pattern |
| :--- | :--- |
| **Apple-style Pinned Product Tour** | `<Root>` + `<Pin childHeight="100dvh" pinSpacerHeight="350vh">` + multi-step `<Animation tween={[...]}>` cards (`autoAlpha`) |
| **Horizontal Scroll Gallery** | `<Root>` + `<Pin childHeight="100dvh" pinSpacerHeight="350vh">` + horizontal track `<Animation tween={{ start: 0, end: 100, to: { xPercent: -75, ease: "none" } }}>` |
| **3D World / Camera Fly-Through** | `<Root>` + `<Pin>` + React Three Fiber `<Canvas>` reading `timeline.scrollTrigger.progress` inside `useFrame` (or `<Stagger target={meshes}>`) |
| **Frame-Locked Sequence Scrub** | `<Root>` + `<Pin>` + `<ImageSequenceCanvas controllerRef={...}>` driven by `<Animation target={playhead}>` |
| **Editorial Depth & Story Sections** | `<Root start="top bottom" end="bottom top">` + `<Parallax>` layers + `<Waypoint>` theme/state transitions |
| **Choreographed Text / Grid Reveal** | `<Root>` + `<Stagger overlap={0.35} tween={{ start: 0, end: 80, fromTo: [...] }}>` |
| **Chapter Navigation Rail** | `<Waypoint at={25} label="step-1" />` paired with `useScrollToLabel("step-1", { behavior: "smooth" })` |

---

## Step 4 — Performance, Layout & Accessibility Guardrails

Always enforce workspace rules ([UI_Always.md](../../rules/UI_Always.md) and [MOTION.md](../../rules/MOTION.md)) when authoring scrollytelling experiences:

1. **Composite-Only GPU Animations (`transform` & `autoAlpha` / `opacity`)**:
   - In `<Scrollytelling.Animation>`, animate only `x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation`, `autoAlpha`, or `opacity`. Prefer `autoAlpha` over `opacity` when layering stacked `absolute inset-0` cards inside a `<Pin>` stage so hidden cards automatically receive `visibility: hidden` and never block pointer events on active cards.
   - Never scrub layout-thrashing CSS properties (`top`, `left`, `width`, `height`, `margin`, `padding`).
2. **Prevent Zero-Duration Scroll Traps**:
   - By default, `<Scrollytelling.Root>` uses `start="top top"` and `end="bottom bottom"`. If the wrapped element is only `100vh` tall, the scroll distance is `0px` and the animation will not scrub.
   - **Fix**: Either wrap content inside `<Scrollytelling.Pin childHeight="100dvh" pinSpacerHeight="300vh">`, set an explicit taller container height, or set `start="top bottom" end="bottom top"` for unpinned viewport-crossing sections.
3. **Strict `0–100` Timeline Bounds**:
   - Every `start`, `end`, and `at` value must satisfy `0 <= start <= end <= 100`. Never pass negative numbers or values `> 100`.
4. **Reduced Motion & Mobile Ergonomics**:
   - Detect reduced motion (`window.matchMedia('(prefers-reduced-motion: reduce)')` or `useReducedMotion()`) and pass `disabled={prefersReducedMotion}` to `<Scrollytelling.Root>`.
   - When `disabled` is `true`, collapse **both** `childHeight` and `pinSpacerHeight` to `"auto"` (and omit `overflow-hidden` on the sticky container) so users with vestibular sensitivities can read all stacked content vertically without clipping or scrolling through empty `300vh` spacers.
5. **Production Cleanup**:
   - Remove `debug={{ label: "..." }}` before shipping to production so the draggable debug overlay is not rendered for end users.
