> Codex guidance for the relevant parts of the requested task. Preserve the user's scope and existing project conventions. Examples require the installed tool's supported syntax; a skill or rule does not grant permissions or install its dependencies.


# Motion & Interactive Animation Standards (`MOTION.md`)

Motion is the definitive craft differentiator between generic AI-generated interfaces ("slop") and top-tier, tactile digital products. Apply these rules to turn static views into living, responsive, and delightful user experiences.

> **Guiding Principle**: *"Pick by the job. Combine for the feeling."* Every animation must communicate state, provide physical tactile feedback, or reward achievement—never create decorative friction.

---

## Quick-Execution Contract (4 Core Mandates)

For standard UI transitions and micro-interactions, enforce these 4 rules immediately (read Sections 1–7 below when authoring complex animations, physics, Rive/Lottie state machines, or scroll timelines):

1. **Springs Over Linear Transitions**: Use physical spring presets or cubic-bezier curves (`cubic-bezier(0.25, 1, 0.5, 1)`); never use flat `linear` easing for interactive UI, and settle within `300ms`.
2. **Animate Only `transform` & `opacity`**: Animate composite-only properties (`translate3d`, `scale`, `rotate`, `opacity`). Never animate `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding`.
3. **Enforce Deterministic Rest State**: Every interactive entity must follow `[Rest State] -> [Active Action] -> [Settled Rest State]` and blend mid-flight interruptions smoothly without snapping.
4. **Include `@media (prefers-reduced-motion: reduce)` Fallback**: Collapse spatial translation and bounce into a gentle opacity fade or instant state change when reduced motion is enabled.

---

## 1. The 12 Animation Archetypes (The Animation Toolbox)

When implementing motion, choose the right technique for the specific job or stack them for emotional depth:

| # | Technique | Primary Job | Typical Use Case | Key Parameters |
|---|---|---|---|---|
| **1** | **Springs** | Make UI feel tactile & responsive | Buttons, modals, card releases | Stiffness, damping ratio, mass |
| **2** | **Gestures** | Follow direct user manipulation | Swipe to dismiss, card drag, sheet drag | Velocity, rubberbanding, release fling |
| **3** | **Physics** | Simulate real-world kinetic forces | Falling items, collisions, tilt gravity | Gravity vector, friction, restitution/bounce |
| **4** | **Layout (FLIP)** | Animate structural rearrangements | Grid to list, card expand, reordering | Bounding box delta, View Transitions API |
| **5** | **SVG Paths** | Draw, reshape, or guide vectors | Icon morphs, stroke drawing, curved travel | `stroke-dashoffset`, path morphing |
| **6** | **Keyframes** | Choreograph deterministic sequences | Multi-step intro reveals, progress cycles | Timeline steps (0%, 50%, 100%), easings |
| **7** | **Rive / Lottie** | Embed authored vector motion | Character acting, complex interactive icons | State machines, inputs, ViewModels |
| **8** | **Particles** | Celebrate milestones & actions | Confetti bursts, sparkles, achievement star showers | Emission rate, particle lifetime, spread |
| **9** | **Shaders (GPU)** | Pixel-level dynamic rendering | Superellipse squircles, refraction, caustics | WebGL/GLSL fragment uniforms, resolution |
| **10**| **Skeletal Rigs**| Pose connected multi-joint entities | Interactive mascots, puppet rigging | Joint hierarchies, skin weights, bone angles |
| **11**| **Flipbooks / Sprites** | Frame-by-frame character flair | Expressive stickers, retro arcade effects | Frame rate (8–24 FPS), sprite sheets |
| **12**| **Composition** | Stack layers for tactile depth | 2.5D parallax hero, masked tilt cards | Multi-plane z-index, SVG masks, specular sheen |

---

## 2. Spring Physics & Easing Standards

Never use flat, linear transitions for interactive UI. Always apply natural physical curves:

- **Spring Presets**:
  - **Gentle** (`stiffness: 120, damping: 14`): Modals, dropdown reveals, large surface transitions.
  - **Snappy** (`stiffness: 280, damping: 20`): Button clicks, tab toggles, small icon state changes.
  - **Bouncy** (`stiffness: 400, damping: 12`): Success celebrations, playful sticker drops, gamified milestones.
- **Cubic Bézier Presets**:
  - **Standard Ease-Out** (`cubic-bezier(0.25, 1, 0.5, 1)` or `cubicOut`): Entering elements, responsive expands.
  - **Smooth S-Curve** (`cubic-bezier(0.65, 0, 0.35, 1)` or `easeInOutCubic`): Coordinated layout transitions.
- **Overshoot & Settle Discipline**:
  - Interactive elements may overshoot their final target by **3% to 8%** on fast actions, but must settle within **300ms** to prevent sluggishness.

---

## 3. State Machine Architecture & Deterministic Rest

Every dynamic or interactive animated entity must follow a deterministic state machine:

```text
[ Rest State ] ─── Trigger (Tap/Event) ───> [ Active Action ]
      ▲                                             │
      │                                             │
      └────────── Settled / Return Arc ─────────────┘
```

1. **The Rest-State Invariant**: Every entity must have a well-defined resting pose. When an animation completes, it must explicitly settle back into its neutral rest state.
2. **Interruption & Re-entrancy**: If a new action triggers while an animation is playing, blend smoothly into the new action or immediately return along a settled arc. Never freeze or snap instantly.
3. **Data Model Decoupling**: For tools like Rive, bind triggers to data models (`BohoControlsV2 ViewModel`, `ActionState`) rather than hardcoding scene timeline offsets.

---

## 4. Cross-Device Responsive Motion Matrix

Scale motion behavior, travel distances, and hardware load to the viewport and input modality:

### A. Mobile (375px – 430px)
- **Input**: 1:1 direct thumb tracking, swipe gestures, pull-to-refresh spring resistance.
- **Travel Bounds**: Constrain motion displacement to viewport percentage or `rem` (max **16px–32px** for micro-drifts) to prevent off-screen clipping.
- **Touch Feedback**: Instant tactile depress (`scale: 0.96`) on `:active` with sub-100ms spring rebound.
- **Celebrations**: Anchor particles inside the thumb zone (lower 60% of viewport).

### B. Tablet (768px – 1024px)
- **Input**: Multi-touch gestures and stylus hover.
- **Orientation Transitions**: Enforce FLIP or View Transitions API when rotating between portrait and landscape to smoothly animate reflowing grids.

### C. Laptop & Desktop (1280px+)
- **Input**: Precision cursor hover, mouse wheel, trackpad inertia.
- **Affordance**: Subtle cursor magnetic attraction on interactive buttons (max 4px pull).
- **Scroll Storytelling**: Use scrubbed timelines (e.g. declarative React + GSAP ScrollTrigger timelines via [scrollytelling](../skills/scrollytelling/SKILL.md) or [scroll-experience](../skills/scroll-experience/SKILL.md)) pinned to viewport heights for deep product tours and 3D/canvas sequences.
- **Containment**: Clamp max travel distances inside centered container wrappers so ultrawide monitors (2560px+) do not create jarring long-distance motion.

---

## 5. Performance, GPU Hygiene & Level of Detail (LOD)

Animations must never compromise responsiveness or drop below 60 FPS (target 120 FPS on ProMotion displays).

1. **Composite-Only Properties & Anti-Slop Scroll Discipline**:
   - Only animate `transform` (`translate3d`, `scale`, `rotate`) and `opacity`.
   - **Strictly Ban**: Never animate `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding` directly, and never use `transition: all`. Use the FLIP technique (invert geometry with transforms) for layout changes.
   - **No Uniform Section Scroll Fade-Ups**: Never wrap every page section in identical `initial={{ opacity: 0, y: 20 }}` scroll-triggered fade-up entrances or continuous unrequested marquees that delay readability for fast scrollers. Render text content immediately visible and reserve scroll-linked motion for intentional storytelling.
2. **Hardware Level-of-Detail (LOD)**:
   - **Desktop**: Up to 150 simultaneous celebration particles; high-resolution WebGL fragment shader passes.
   - **Mobile**: Throttle to 30–40 particles; disable heavy refraction shaders; fall back to pre-rendered SVG or CSS borders if GPU load causes battery drain or frame stutter.
3. **Memory & Lifecycle Cleanup**:
   - Remove `will-change` once an animation settles to release GPU layer memory.
   - Disconnect `requestAnimationFrame` loops, physics engines, or canvas listeners immediately when elements leave the viewport (use `IntersectionObserver`).

---

## 6. Accessibility & Reduced Motion Protocol

Respect system accessibility preferences without breaking application usability:

1. **Mandatory Media Query**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
2. **Intentional Fallback Experience**:
   - In place of spring translation or physical bouncing, swap to a gentle opacity fade (`opacity: 0` to `opacity: 1` over 150ms).
   - Completely disable decorative background particles, parallax drift, and continuous loops.
   - Preserve functional state feedback (e.g., instant tab highlights, color changes).

---

## 7. AI Steering & Visual Verification Protocol

AI models often generate generic keyframes when given vague prompts. Follow these steering guardrails:

1. **Prompt With Exact Physics**:
   - Reject: *"Make this button animate."*
   - Specify: *"Apply a snappy spring with stiffness 300, damping 20, scaling down to 0.95 on active click and bouncing back on release."*
2. **Mandatory Human-in-the-Loop Visual Verification**:
   - Unit and Playwright tests verify logic, DOM presence, and zero console errors.
   - **Motion feel must be visually verified**: Check for edge clipping, jittery frame drops, unnatural easing, or awkward character acting.
3. **Agent GUI Automation**:
   - For graphical animation software without CLI APIs (e.g. Rive, Blender, After Effects), leverage desktop agent computer use with vision to build rigs, hierarchy structures, and state transitions.
