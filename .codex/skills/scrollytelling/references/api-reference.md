# API Reference — `@bsmnt/scrollytelling`

Complete API reference, TypeScript types, and declarative patterns for Basement Studio's `@bsmnt/scrollytelling` library.

---

## 1. `<Scrollytelling.Root>`

Creates a GSAP `Timeline` linked to a `ScrollTrigger` instance and provides React Context to all descendant scrollytelling components.

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `React.ReactNode` | `undefined` | Child elements to wrap or provide context to. When `trigger` is omitted, `Root` wraps its single direct child in a Radix `<Slot ref={ref}>` as the ScrollTrigger trigger element. |
| `start` | `ScrollTrigger.Vars["start"]` | `"top top"` | ScrollTrigger start position (e.g. `"top top"`, `"top bottom"`, `"top 80%"`, or a number/function). |
| `end` | `ScrollTrigger.Vars["end"]` | `"bottom bottom"` | ScrollTrigger end position (e.g. `"bottom bottom"`, `"bottom top"`, `"+=2000"`). |
| `scrub` | `boolean \| number` | `true` | Links timeline progress directly to scroll position (`true`), smooths with a damping duration in seconds (e.g. `0.75`), or disables scrubbing (`false`, which defaults `toggleActions` to `"play none none none"`). |
| `defaults` | `gsap.TweenVars` | `{ duration: 1 }` | Default GSAP tween variables inherited by child animations (e.g. `{ ease: "linear" }`). |
| `trigger` | `ScrollTrigger.Vars["trigger"]` | `undefined` | Optional explicit DOM element or selector string to trigger the ScrollTrigger instead of the `Slot` child. |
| `toggleActions` | `ScrollTrigger.Vars["toggleActions"]` | `undefined` | Four-state ScrollTrigger toggle actions (`"onEnter onLeave onEnterBack onLeaveBack"`). |
| `callbacks` | `Pick<ScrollTrigger.Vars, "onEnter" \| "onEnterBack" \| "onLeave" \| "onLeaveBack" \| "onToggle" \| "onUpdate" \| "onRefresh">` | `undefined` | Lifecycle callbacks forwarded directly to the underlying GSAP `ScrollTrigger`. |
| `disabled` | `boolean` | `false` | Disables timeline initialization and all child animations (useful for `@media (prefers-reduced-motion: reduce)` or mobile breakpoints). |
| `debug` | `false \| { label: string; visualizer?: boolean; markers?: boolean }` | `false` | Enables the draggable Scrollytelling Visualizer panel (`visualizer: true` by default when `debug` object is passed) and/or GSAP ScrollTrigger markers (`markers: true`). |

### How Timeline Normalization (0–100) Works

Internally, `<Scrollytelling.Root>` maintains a normalized timeline of **total length `100`**. Whenever a child component (`<Animation>`, `<Parallax>`, `<Stagger>`, or `<Waypoint>`) registers a `start` and `end` (e.g., `start: 20, end: 60`), `Root` places the tween at `position = start` (`20`) with `duration = end - start` (`40`) and appends a dummy `rest` tween from `lastEnd` to `100` so the timeline always spans `0` to `100` exactly.

**Strict Bounds Invariant**:
- `start` must be `>= 0`
- `end` must be `<= 100`
- `end` must be `>= start`

Violating these bounds throws a runtime error (`"start time must be greater than 0"`, `"end time must be less than 100"`, or `"end time must be greater than start time"`).

---

## 2. `<Scrollytelling.Pin>`

Pins an element inside a reserved scroll spacer using native `position: sticky`, avoiding DOM reparenting issues with React Server Components.

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `childHeight` | `string \| number` | **Required** | Height of the inner sticky container (e.g. `"100vh"`, `"100dvh"`, or `0` for layered fullscreen pinning). |
| `pinSpacerHeight` | `string \| number` | **Required** | Total scroll height of the outer pin spacer (e.g. `"300vh"`, `"400vh"`). Must be greater than `childHeight` to give the user scroll distance while pinned. |
| `top` | `string \| number` | `0` | CSS `top` offset for the sticky container (e.g. `0`, `"4rem"`). |
| `childClassName` | `string` | `undefined` | CSS class applied to the inner sticky `<div>`. |
| `pinSpacerClassName` | `string` | `undefined` | CSS class applied to the outer spacer `<div>`. |
| `children` | `React.ReactNode` | `undefined` | Content rendered inside the sticky container. |

> **Important Note**: Both `childHeight` and `pinSpacerHeight` are required (`if (!childHeight || !pinSpacerHeight)` throws an error—note that passing numeric `0` in older builds can trigger the falsy check if not passed as `"0px"` when zero height is desired; prefer `"100vh"` or `"0px"` as strings).

---

## 3. `<Scrollytelling.Animation>`

Appends one or more declarative GSAP tweens to the active `<Scrollytelling.Root>` timeline.

### Modes of Operation

1. **Wrapper Mode (`children` provided, no `target` in `tween`)**:
   Wraps a single React element via Radix `<Slot ref={ref}>` and animates that DOM node directly.
2. **Target Mode (no `children`, `target` specified in `tween`)**:
   Renders `null` in the DOM and animates the specified `target` (CSS selector scoped to `Root`, `React.RefObject`, array of elements, or arbitrary JS state object).

### TypeScript Definitions

```ts
export type FromToOptions =
  | { to: gsap.TweenVars; from?: never; fromTo?: never }
  | { from: gsap.TweenVars; to?: never; fromTo?: never }
  | { fromTo: [gsap.TweenVars, gsap.TweenVars]; to?: never; from?: never };

export type StartEndOptions = {
  start: number; // 0 to 100
  end: number;   // 0 to 100 (must be >= start)
};

export type TweenWithChildrenDef = StartEndOptions & FromToOptions;

export type TweenWithTargetDef = StartEndOptions & FromToOptions & {
  target: gsap.TweenTarget | React.RefObject<HTMLElement>;
};
```

### Sequential & Multi-Segment Tweens

Pass an **array of tween objects** to `tween` to choreograph multiple sequential phases on the same element across `0–100`:

```tsx
<Scrollytelling.Animation
  tween={[
    {
      start: 0,
      end: 35,
      fromTo: [{ opacity: 0, y: 32 }, { opacity: 1, y: 0, ease: "power2.out" }],
    },
    {
      start: 75,
      end: 100,
      to: { opacity: 0, y: -32, ease: "power2.in" },
    },
  ]}
>
  <div className="story-card">Card Content</div>
</Scrollytelling.Animation>
```

---

## 4. `<Scrollytelling.Parallax>`

Convenience wrapper around `<Scrollytelling.Animation>` that translates children from `-movement` to `+movement` with `ease: "linear"`.

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `tween` | `{ start: number; end: number; movementX?: { value: number; unit: string }; movementY?: { value: number; unit: string }; target?: TweenTarget }` | **Required** | Must specify at least one of `movementX` or `movementY`. |
| `children` | `React.ReactNode` | `undefined` | Element to move with parallax. |
| `disabled` | `boolean` | `false` | Disables the parallax tween. |

```tsx
<Scrollytelling.Parallax
  tween={{
    start: 0,
    end: 100,
    movementY: { value: -60, unit: "px" },
  }}
>
  <h2 className="text-4xl font-semibold tracking-tight">Depth Layer</h2>
</Scrollytelling.Parallax>
```

---

## 5. `<Scrollytelling.Stagger>`

Splits a `[start, end]` range across an array of `children` or an array of `tween.target` items, with configurable `overlap`.

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `overlap` | `number` | `0` | Overlap factor between `0` (strictly sequential chunks) and `1` (maximum overlap while keeping total range within `[start, end]`). |
| `tween` | `TweenWithChildrenDef \| TweenWithTargetDef` | **Required** | Tween configuration with `start` and `end`. When `target` is used instead of `children`, `target` must be an array and `onUpdate` receives the item index `idx`. |
| `children` | `React.ReactNode[]` | `undefined` | Array of React elements to stagger. |
| `disabled` | `boolean` | `false` | Disables all staggered tweens. |

### Animating Data Arrays (e.g., Three.js / R3F Objects)

When `tween.target` is an array of plain JavaScript objects, `<Scrollytelling.Stagger>` passes the element index `i` via `onUpdateParams: [i]` to `onUpdate(idx)`:

```tsx
const items = useMemo(() => [{ progress: 0 }, { progress: 0 }, { progress: 0 }], []);

<Scrollytelling.Stagger
  overlap={0.5}
  tween={{
    start: 10,
    end: 90,
    target: items,
    to: {
      progress: 1,
      ease: "power2.inOut",
      onUpdate: (idx: number) => {
        updateMeshAtIndex(idx, items[idx].progress);
      },
    },
  }}
/>
```

---

## 6. `<Scrollytelling.Waypoint>`

Triggers callbacks (`onCall`, `onReverseCall`), adds a named GSAP timeline label (`label`), or plays an independent time-based tween (`SimpleTween` with `duration` in seconds) when scroll progress crosses `at` (`0–100`).

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `at` | `number` | **Required** | Percentage (`0–100`) along the `Root` timeline where the waypoint triggers. |
| `onCall` | `() => void` | `undefined` | Fired when scrolling forward past `at`. |
| `onReverseCall` | `() => void` | `undefined` | Fired when scrolling backward past `at`. |
| `label` | `string` | `undefined` | Registers a named label on the GSAP timeline at `at` (used by `useScrollToLabel(label)`). |
| `tween` | `FromToOptions & { duration: number; forwards?: boolean; target?: TweenTarget }` | `undefined` | Time-based GSAP tween played when passing `at` (and reversed on scroll-back unless `forwards: true`). |
| `children` | `React.ReactNode` | `undefined` | Optional child element targeted by `tween` when `tween.target` is omitted. |
| `disabled` | `boolean` | `false` | Disables the waypoint. |

---

## 7. Hooks & Utilities

### `useScrollytelling()`
Returns `{ timeline, rootRef, events }` from the nearest `<Scrollytelling.Root>`.
- Use `timeline?.scrollTrigger?.progress` (`0` to `1`) inside a React Three Fiber `useFrame()` loop or custom canvas renderer.

### `useScrollToLabel(label, opts?)`
Returns a memoized `() => void` function that scrolls the window to the pixel position of a `<Waypoint label="..." />` inside the current `<Scrollytelling.Root>`.
- `opts.behavior`: `"smooth" | "instant" | "auto"`
- `opts.offset`: pixel offset added to the target scroll coordinate.

### `<Scrollytelling.ImageSequenceCanvas>`
High-performance `<canvas>` primitive with automatic WebP/AVIF detection (`supportsWebp`, `supportsAvif`), in-memory `HTMLImageElement` caching, and an imperative `controllerRef` exposing:
- `preload(frameStart: number, frameEnd: number): Promise<void>`
- `draw(frame: number): Promise<void>`
- `canvas: HTMLCanvasElement | null`

### `<Scrollytelling.RegisterGsapPlugins>`
Registers additional GSAP plugins (`plugins: Plugin[]`) inside `useIsoLayoutEffect` prior to ScrollTrigger initialization.
