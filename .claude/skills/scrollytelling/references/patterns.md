# Production Patterns & Recipes — `@bsmnt/scrollytelling`

Copy-ready patterns for Next.js App Router (RSC), Sticky Pinned Storytelling, Horizontal Scroll Galleries, Image Sequence Scrubbing, React Three Fiber (3D Camera & Mesh Scrubbing), and Lenis Smooth Scroll integration.

---

## 1. Next.js App Router (`"use client"`) Re-Export Boundary

Because `@bsmnt/scrollytelling` uses React Context and `useEffect` to manage GSAP timelines, create a thin client boundary so Server Components can compose scrollytelling primitives without turning the entire page tree into a client bundle:

```tsx
// src/lib/scrollytelling-client.tsx
"use client";

export * from "@bsmnt/scrollytelling";
```

---

## 2. Pinned Multi-Step Feature Storytelling

Pin a `100dvh` stage over a `400vh` scroll track and choreograph 3 sequential narrative beats across `0–100`:

```tsx
"use client";

import * as Scrollytelling from "@/lib/scrollytelling-client";
import { useReducedMotion } from "framer-motion";

const STORY_STEPS = [
  {
    id: "ingest",
    metric: "14.2 GB/s",
    title: "Zero-copy stream ingestion",
    body: "Capture telemetry packets directly from edge nodes without intermediate serialization overhead.",
    range: [0, 33] as const,
  },
  {
    id: "index",
    metric: "0.4 ms",
    title: "Sub-millisecond columnar indexing",
    body: "Partition incoming time-series slices into immutable Parquet blocks with live bloom filters.",
    range: [33, 66] as const,
  },
  {
    id: "query",
    metric: "99.98%",
    title: "Deterministic query execution",
    body: "Execute federated SQL across hot and cold tiers with bounded memory allocation.",
    range: [66, 100] as const,
  },
];

export function PinnedStorySection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Scrollytelling.Root
      defaults={{ ease: "power2.out" }}
      scrub={0.6}
      disabled={Boolean(prefersReducedMotion)}
    >
      <Scrollytelling.Pin
        childHeight={prefersReducedMotion ? "auto" : "100dvh"}
        pinSpacerHeight={prefersReducedMotion ? "auto" : "350vh"}
        childClassName={`relative flex items-center justify-center ${
          prefersReducedMotion ? "py-16" : "overflow-hidden"
        } bg-[var(--canvas)] text-[var(--ink)]`}
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Engineered for high-frequency workloads.
            </h2>
          </div>

          <div className="relative min-h-[260px] lg:col-span-7">
            {STORY_STEPS.map((step, idx) => {
              const [start, end] = step.range;
              const fadeInEnd = start + 8;
              const fadeOutStart = end - 8;

              return (
                <Scrollytelling.Animation
                  key={step.id}
                  tween={[
                    {
                      start,
                      end: fadeInEnd,
                      fromTo: [
                        { autoAlpha: idx === 0 ? 1 : 0, y: idx === 0 ? 0 : 24 },
                        { autoAlpha: 1, y: 0 },
                      ],
                    },
                    ...(idx < STORY_STEPS.length - 1
                      ? [
                          {
                            start: fadeOutStart,
                            end,
                            to: { autoAlpha: 0, y: -24 },
                          },
                        ]
                      : []),
                  ]}
                >
                  <article
                    className={`${
                      prefersReducedMotion
                        ? "mb-8 relative"
                        : `absolute inset-0 ${idx > 0 ? "invisible opacity-0" : ""}`
                    } flex flex-col justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8`}
                  >
                    <span className="font-mono text-4xl font-semibold tabular-nums text-[var(--accent)]">
                      {step.metric}
                    </span>
                    <h3 className="mt-3 text-xl font-medium text-[var(--ink)]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-[var(--muted)]">
                      {step.body}
                    </p>
                  </article>
                </Scrollytelling.Animation>
              );
            })}
          </div>
        </div>
      </Scrollytelling.Pin>
    </Scrollytelling.Root>
  );
}
```

---

## 3. React Three Fiber (R3F) 3D Camera & Model Scrubbing

Replace paid video generation with real-time, zero-API-cost 3D camera flights and object manipulation driven by `useScrollytelling()` or `<Scrollytelling.Animation>` / `<Scrollytelling.Stagger>`:

```tsx
"use client";

import * as Scrollytelling from "@/lib/scrollytelling-client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function ScrubbedScene() {
  const { timeline } = Scrollytelling.useScrollytelling();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const progress = timeline?.scrollTrigger?.progress ?? 0;
    if (groupRef.current) {
      groupRef.current.rotation.y = progress * Math.PI * 2;
      groupRef.current.position.y = Math.sin(progress * Math.PI) * 0.5;
    }
    // Smoothly fly camera along Z/Y axis based on scroll progress
    state.camera.position.z = THREE.MathUtils.lerp(8, 3.5, progress);
    state.camera.position.y = THREE.MathUtils.lerp(0.5, 1.8, progress);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <torusKnotGeometry args={[1, 0.32, 128, 32]} />
        <meshStandardMaterial color="#ededef" roughness={0.2} metalness={0.8} />
      </mesh>
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <ambientLight intensity={0.6} />
    </group>
  );
}

export function ThreeDScrollStage() {
  return (
    <Scrollytelling.Root scrub={0.8}>
      <Scrollytelling.Pin childHeight="100dvh" pinSpacerHeight="300vh">
        <div className="relative h-full w-full">
          <Canvas
            camera={{ position: [0, 0.5, 8], fov: 35 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          >
            <ScrubbedScene />
          </Canvas>
        </div>
      </Scrollytelling.Pin>
    </Scrollytelling.Root>
  );
}
```

---

## 4. Canvas Image Sequence Scrubbing (`<ImageSequenceCanvas>`)

Scrub through a pre-rendered frame sequence (`0001.webp` … `0090.webp`) using `<Scrollytelling.ImageSequenceCanvas>`, preloading the initial batch for instant first paint and warming the remaining frames in the background:

```tsx
"use client";

import * as Scrollytelling from "@/lib/scrollytelling-client";
import { useCallback, useEffect, useMemo, useRef } from "react";

const TOTAL_FRAMES = 90;
const INITIAL_PRELOAD = 15;

export function ProductSequenceScrubber() {
  const controllerRef = useRef<{
    preload: (start: number, end: number) => Promise<void>;
    draw: (frame: number) => Promise<void>;
    canvas: HTMLCanvasElement | null;
  }>(null);

  const playhead = useMemo(() => ({ frame: 1 }), []);

  const getFrameSrc = useCallback(
    (frame: number, { supportsWebp }: { supportsWebp: boolean }) => {
      const clamped = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(frame)));
      const padded = String(clamped).padStart(4, "0");
      const ext = supportsWebp ? "webp" : "jpg";
      return `/frames/sequence-${padded}.${ext}`;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const initialEnd = Math.min(INITIAL_PRELOAD, TOTAL_FRAMES);
    controllerRef.current?.preload(1, initialEnd).then(() => {
      if (cancelled) return;
      controllerRef.current?.draw(1);
      if (TOTAL_FRAMES > initialEnd) {
        controllerRef.current?.preload(initialEnd + 1, TOTAL_FRAMES);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Scrollytelling.Root scrub={0.5}>
      <Scrollytelling.Pin childHeight="100dvh" pinSpacerHeight="300vh">
        <div className="relative flex h-full w-full items-center justify-center">
          <Scrollytelling.Animation
            tween={{
              start: 0,
              end: 100,
              target: playhead,
              to: {
                frame: TOTAL_FRAMES,
                ease: "linear",
                onUpdate: () => {
                  controllerRef.current?.draw(Math.round(playhead.frame));
                },
              },
            }}
          />
          <Scrollytelling.ImageSequenceCanvas
            controllerRef={controllerRef}
            getFrameSrc={getFrameSrc}
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
        </div>
      </Scrollytelling.Pin>
    </Scrollytelling.Root>
  );
}
```

---

## 5. Waypoint Navigation with `useScrollToLabel`

Add named `<Scrollytelling.Waypoint>` markers and let users jump directly to narrative chapters:

```tsx
"use client";

import * as Scrollytelling from "@/lib/scrollytelling-client";

function ChapterJumpBar() {
  const scrollToIntro = Scrollytelling.useScrollToLabel("chapter-intro", {
    behavior: "smooth",
  });
  const scrollToSpecs = Scrollytelling.useScrollToLabel("chapter-specs", {
    behavior: "smooth",
  });

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5">
      <button
        type="button"
        onClick={scrollToIntro}
        className="min-h-[44px] cursor-pointer rounded-md px-4 text-sm font-medium"
      >
        01 Overview
      </button>
      <button
        type="button"
        onClick={scrollToSpecs}
        className="min-h-[44px] cursor-pointer rounded-md px-4 text-sm font-medium"
      >
        02 Architecture
      </button>
    </nav>
  );
}
```

---

## 6. Horizontal Scroll Gallery Track

Pin a `100dvh` viewport and translate a wide horizontal flex track across `0–100` using GPU-accelerated `xPercent`:

```tsx
"use client";

import * as Scrollytelling from "@/lib/scrollytelling-client";
import { useReducedMotion } from "framer-motion";

const PANELS = [
  { id: "01", title: "Edge Ingestion", metric: "240k req/s" },
  { id: "02", title: "Vector Indexing", metric: "1.8 ms p99" },
  { id: "03", title: "Global Replication", metric: "38 regions" },
  { id: "04", title: "Zero-Trust Audit", metric: "SOC2 Type II" },
];

export function HorizontalScrollGallery() {
  const prefersReducedMotion = useReducedMotion();
  const shiftPercent = -100 * ((PANELS.length - 1) / PANELS.length);

  return (
    <Scrollytelling.Root
      scrub={0.75}
      disabled={Boolean(prefersReducedMotion)}
    >
      <Scrollytelling.Pin
        childHeight={prefersReducedMotion ? "auto" : "100dvh"}
        pinSpacerHeight={prefersReducedMotion ? "auto" : `${PANELS.length * 100}vh`}
        childClassName={`flex items-center ${
          prefersReducedMotion ? "py-16" : "overflow-hidden"
        } bg-[var(--canvas)]`}
      >
        <Scrollytelling.Animation
          tween={{
            start: 0,
            end: 100,
            to: { xPercent: shiftPercent, ease: "none" },
          }}
        >
          <div
            className={
              prefersReducedMotion
                ? "mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-2"
                : "flex w-[400vw] gap-8 px-12"
            }
          >
            {PANELS.map((panel) => (
              <section
                key={panel.id}
                className="flex min-h-[360px] w-full flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10"
              >
                <span className="font-mono text-sm text-[var(--muted)]">
                  {panel.id}
                </span>
                <div>
                  <p className="font-mono text-4xl font-semibold tabular-nums text-[var(--accent)]">
                    {panel.metric}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                    {panel.title}
                  </h3>
                </div>
              </section>
            ))}
          </div>
        </Scrollytelling.Animation>
      </Scrollytelling.Pin>
    </Scrollytelling.Root>
  );
}
```

---

## 7. Lenis Smooth Scroll Integration (`lenis/react`)

When pairing `@bsmnt/scrollytelling` with Lenis (`npm install lenis`), synchronize Lenis ticks with GSAP's `ScrollTrigger.update` so pinned stages and scrubbed timelines remain sub-pixel locked:

```tsx
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
```
