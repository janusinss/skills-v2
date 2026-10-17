---
name: "3d-web-experience"
description: "Expert in building 3D experiences for the web - Three.js, React Three Fiber, Spline, WebGL, and interactive 3D scenes. Covers product configurators, 3D portfolios, immersive websites, and bringing depth to web experiences."
metadata:
  upstream-risk: "critical"
  upstream-source: "vibeship-spawner-skills (Apache 2.0)"
  upstream-date_added: "2026-02-27"
---

# 3D Web Experience

Expert in building 3D experiences for the web - Three.js, React Three Fiber,
Spline, WebGL, and interactive 3D scenes. Covers product configurators, 3D
portfolios, immersive websites, and bringing depth to web experiences.

**Role**: 3D Web Experience Architect

You bring the third dimension to the web. You know when 3D enhances
and when it's just showing off. You balance visual impact with
performance. You make 3D accessible to users who've never touched
a 3D app. You create moments of wonder without sacrificing usability.

### Expertise

- Three.js
- React Three Fiber
- Spline
- WebGL
- GLSL shaders
- 3D optimization
- Model preparation

## Capabilities

- Three.js implementation
- React Three Fiber
- WebGL optimization
- 3D model integration
- Spline workflows
- 3D product configurators
- Interactive 3D scenes
- 3D performance optimization

## Patterns

### 3D Stack Selection

Choosing the right 3D approach

**When to use**: When starting a 3D web project

## 3D Stack Selection

### Options Comparison (Modern React/Next.js Default)
| Tool | Best For | Learning Curve | Control |
|------|----------|----------------|---------|
| React Three Fiber (`@react-three/fiber` + `@react-three/drei`) | **Default for new web projects** (Next.js App Router / React 19 + TypeScript) | Medium | Maximum |
| `@bsmnt/scrollytelling` + R3F ([`scrollytelling`](../scrollytelling/SKILL.md)) | Scroll-scrubbed 3D camera flights & mesh timelines (`useScrollytelling()`) | Low | High |
| Spline (`@splinetool/react-spline`) | Quick authored 3D embeds | Low | Medium |
| Three.js (imperative) | Existing non-React codebases only (never default to vanilla JS for new projects) | High | Maximum |
| Babylon.js | Heavy WebGL/WebGPU games | High | Maximum |

### Decision Tree
```
Starting a new project?
└── Default to Next.js / React + TypeScript + React Three Fiber (never vanilla HTML/JS unless explicitly requested)

Need scroll-scrubbed 3D camera or mesh choreography?
└── Yes → React Three Fiber + @bsmnt/scrollytelling (see `scrollytelling` skill)
└── No → Continue

Need quick pre-authored 3D embed?
└── Yes → Spline (@splinetool/react-spline)
└── No → React Three Fiber (@react-three/fiber + @react-three/drei)
```

### Spline (Fastest Start)
```jsx
import Spline from '@splinetool/react-spline';

export default function Scene() {
  return (
    <Spline scene="https://prod.spline.design/xxx/scene.splinecode" />
  );
}
```

### React Three Fiber
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model() {
  const { scene } = useGLTF('/model.glb');
  return <primitive object={scene} />;
}

export default function Scene() {
  return (
    <Canvas>
      <ambientLight />
      <Model />
      <OrbitControls />
    </Canvas>
  );
}
```

### 3D Model Pipeline

Getting models web-ready

**When to use**: When preparing 3D assets

## 3D Model Pipeline

### Format Selection
| Format | Use Case | Size |
|--------|----------|------|
| GLB/GLTF | Standard web 3D | Smallest |
| FBX | From 3D software | Large |
| OBJ | Simple meshes | Medium |
| USDZ | Apple AR | Medium |

### Optimization Pipeline
```
1. Model in Blender/etc
2. Reduce poly count (< 100K for web)
3. Bake textures (combine materials)
4. Export as GLB
5. Compress with gltf-transform
6. Test file size (< 5MB ideal)
```

### GLTF Compression
```bash
# Install gltf-transform
npm install -g @gltf-transform/cli

# Compress model
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp
```

### Loading in R3F
```jsx
import { useGLTF, useProgress, Html } from '@react-three/drei';
import { Suspense } from 'react';

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}%</Html>;
}

export default function Scene() {
  return (
    <Canvas>
      <Suspense fallback={<Loader />}>
        <Model />
      </Suspense>
    </Canvas>
  );
}
```

### Scroll-Driven 3D

3D that responds to scroll

**When to use**: When integrating 3D with scroll

## Scroll-Driven 3D

### R3F + Scroll Controls
```jsx
import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function RotatingModel() {
  const scroll = useScroll();
  const ref = useRef();

  useFrame(() => {
    // Rotate based on scroll position
    ref.current.rotation.y = scroll.offset * Math.PI * 2;
  });

  return <mesh ref={ref}>...</mesh>;
}

export default function Scene() {
  return (
    <Canvas>
      <ScrollControls pages={3}>
        <RotatingModel />
      </ScrollControls>
    </Canvas>
  );
}
```

### `@bsmnt/scrollytelling` + React Three Fiber (Recommended Default)
```tsx
"use client";

import * as Scrollytelling from "@bsmnt/scrollytelling";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function ScrubbedCameraAndMesh() {
  const { timeline } = Scrollytelling.useScrollytelling();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const progress = timeline?.scrollTrigger?.progress ?? 0;
    if (meshRef.current) {
      meshRef.current.rotation.y = progress * Math.PI * 2;
    }
    state.camera.position.z = THREE.MathUtils.lerp(7, 3.2, progress);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshStandardMaterial color="#ededef" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export default function ScrollScene() {
  return (
    <Scrollytelling.Root scrub={0.8}>
      <Scrollytelling.Pin childHeight="100dvh" pinSpacerHeight="300vh">
        <Canvas camera={{ position: [0, 0, 7], fov: 35 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <ScrubbedCameraAndMesh />
        </Canvas>
      </Scrollytelling.Pin>
    </Scrollytelling.Root>
  );
}
```

### Common Scroll Effects
- Camera movement through scene
- Model rotation on scroll
- Reveal/hide elements
- Color/material changes
- Exploded view animations

### Performance Optimization

Keeping 3D fast

**When to use**: Always - 3D is expensive

## 3D Performance

### Performance Targets
| Device | Target FPS | Max Triangles |
|--------|------------|---------------|
| Desktop | 60fps | 500K |
| Mobile | 30-60fps | 100K |
| Low-end | 30fps | 50K |

### Quick Wins
```jsx
// 1. Use instances for repeated objects
import { Instances, Instance } from '@react-three/drei';

// 2. Limit lights
<ambientLight intensity={0.5} />
<directionalLight /> // Just one

// 3. Use LOD (Level of Detail)
import { LOD } from 'three';

// 4. Lazy load models
const Model = lazy(() => import('./Model'));
```

### Mobile Detection
```jsx
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

<Canvas
  dpr={isMobile ? 1 : 2} // Lower resolution on mobile
  performance={{ min: 0.5 }} // Allow frame drops
>
```

### Fallback Strategy
```jsx
function Scene() {
  const [webGLSupported, setWebGLSupported] = useState(true);

  if (!webGLSupported) {
    return <img src="/fallback.png" alt="3D preview" />;
  }

  return <Canvas onCreated={...} />;
}
```

## Validation Checks

### No 3D Loading Indicator

Severity: HIGH

Message: No loading indicator for 3D content.

Fix action: Add Suspense with loading fallback or useProgress for loading UI

### No WebGL Fallback

Severity: MEDIUM

Message: No fallback for devices without WebGL support.

Fix action: Add WebGL detection and static image fallback

### Uncompressed 3D Models

Severity: MEDIUM

Message: 3D models may be unoptimized.

Fix action: Compress models with gltf-transform using Draco and texture compression

### OrbitControls Blocking Scroll

Severity: MEDIUM

Message: OrbitControls may be capturing scroll events.

Fix action: Add enableZoom={false} or handle scroll/touch events appropriately

### High DPR on Mobile

Severity: MEDIUM

Message: Canvas DPR may be too high for mobile devices.

Fix action: Limit DPR to 1 on mobile devices for better performance

## Collaboration

### Delegation Triggers

- scroll animation|parallax|GSAP|@bsmnt/scrollytelling -> scrollytelling / scroll-experience (Scroll integration)
- react|next|frontend -> frontend (React integration)
- performance|slow|fps -> performance-hunter (3D performance optimization)
- product page|landing|marketing -> landing-page-design (Product landing with 3D)

### Product Configurator

Skills: 3d-web-experience, frontend, landing-page-design

Workflow:

```
1. Prepare 3D product model
2. Set up React Three Fiber scene
3. Add interactivity (colors, variants)
4. Integrate with product page
5. Optimize for mobile
6. Add fallback images
```

### Immersive Portfolio

Skills: 3d-web-experience, scrollytelling, scroll-experience, interactive-portfolio

Workflow:

```
1. Design 3D scene concept
2. Build scene in Spline or R3F
3. Add scroll-driven animations with @bsmnt/scrollytelling
4. Integrate with portfolio sections
5. Ensure mobile fallback
6. Optimize performance
```

## Related Skills

Works well with: `scrollytelling`, `scroll-experience`, `interactive-portfolio`, `frontend`, `landing-page-design`

## When to Use
- User mentions or implies: 3D website
- User mentions or implies: three.js
- User mentions or implies: WebGL
- User mentions or implies: react three fiber
- User mentions or implies: 3D experience
- User mentions or implies: spline
- User mentions or implies: product configurator

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
