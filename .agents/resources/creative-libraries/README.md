# Creative Scroll & Motion Libraries

Production-grade libraries and components for high-end, immersive web scrolling experiences powered by **GSAP (Full Suite)** and **Lenis Smooth Scroll**.

> **Rule Precedence**: All interactive options, motion selection questions, and WebGL/scroll integrations are strictly quarantined to [.agents/rules/overdrive.md](file:///c:/xampp/htdocs/YEAR%204/Skills/.agents/rules/overdrive.md). Standard web development pipelines do not ask the user for creative choices or inject scroll animations.

---

## 1. Directory Structure

```text
.agents/resources/creative-libraries/
├── gsap/                       # GSAP Core & Full Club Suite (ScrollTrigger, Flip, Observer, SplitText, etc.)
│   ├── dist/                   # Production minified bundles (.min.js)
│   └── src/                    # Source ES modules (all.js)
├── lenis/                      # Lenis smooth-scroll core, React wrapper, and snap physics
│   ├── packages/core/          # @studio-freight/lenis core engine
│   ├── packages/react/         # React/Next.js wrapper (<ReactLenis>)
│   ├── packages/snap/          # Magnetic scroll snap physics
│   └── lenis.min.js            # Standalone UMD minified bundle
└── components/
    └── LenisGsapBridge.tsx     # SSR-safe provider linking Lenis RAF to gsap.ticker with lagSmoothing(0)
```

---

## 2. Available Choices & Capabilities

### A. GSAP & Plugins (`gsap/dist/`)
- **ScrollTrigger**: Pinning, scrubbing, velocity tracking, snap points, dynamic scroll timelines.
- **ScrollSmoother**: Native alternative smooth-scrolling engine with lag/speed parallax attributes.
- **Flip**: Seamless layout state transitions (card-to-modal expansions, re-parenting, bento reflows).
- **Observer**: Unified multi-touch, wheel, pointer velocity, and gesture detection.
- **SplitText**: Kinetic character, word, and line typography animations.
- **MorphSVG & DrawSVG**: SVG path shape-shifting and stroke drawing.
- **Inertia & Draggable**: Momentum physics, flick/throw inertia, and touch drag-and-drop.
- **ScrambleText & TextPlugin**: Monospace decoding, terminal text typing, and glyph scrambling.
- **CustomEase / CustomBounce / CustomWiggle**: Handcrafted cubic bezier and spring curves.

### B. Lenis Ecosystem (`lenis/`)
- **Lenis Core**: Ultra-smooth inertia momentum wheel and touch physics.
- **Lenis React**: Declarative `<ReactLenis root>` wrapper and `useLenis` hook for Next.js App Router and React 19.
- **Lenis Snap**: Snap-to-section magnetic scroll physics.
- **GSAP Bridge**: Unified RAF lock (`gsap.ticker.lagSmoothing(0)`) preventing frame jitter.

---

## 3. Quick Start

### HTML / Vanilla JS
```html
<script src="vendor/gsap.min.js"></script>
<script src="vendor/ScrollTrigger.min.js"></script>
<script src="vendor/lenis.min.js"></script>
<script>
  const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
</script>
```

### Next.js App Router (React)
```tsx
import { LenisGsapProvider } from '@/resources/creative-libraries/components/LenisGsapBridge';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LenisGsapProvider>
          {children}
        </LenisGsapProvider>
      </body>
    </html>
  );
}
```

---

## 4. Premium Component Sources (21st.dev & ThreeUI)

When projects require WebGL background shaders, 3D heroes, glowing borders, or modern containers, pull them from **21st.dev** or **ThreeUI** instead of writing raw WebGL boilerplate.

### A. 21st.dev (`npx shadcn` & `@21st-dev/cli`)
Marketplace of design-engineer React/Tailwind components:
- **Background Shaders**: `npx shadcn@latest add "https://21st.dev/r/<author>/shader-background"`
- **Animated Borders**: `npx shadcn@latest add "https://21st.dev/r/<author>/glowing-border"`
- **Hero Sections**: `npx shadcn@latest add "https://21st.dev/r/<author>/hero-section"`
- **Interactive Containers**: `npx shadcn@latest add "https://21st.dev/r/<author>/bento-grid"`
- **Agent Discovery**: Query via `npx @21st-dev/cli search "<component>"` or use the installed `.agents/skills/21st-*` skills.

### B. ThreeUI (`@designcodeio/threeui`)
DesignCode's curated 3D Three.js React library:
- **Installation**: `npm install @designcodeio/threeui three @types/three`
- **Background Shaders**: `WarpFieldBackground`, `StreamConvergenceBackground`, `RibbonFieldBackground`, `AtTheHorizon`
- **Interactive Canvases**: `TypographyVortexCanvas`, `SylvaLivingWorldScene`, `TempleNightScene`
- **Micro-3D Controls**: `ShaderButtons`, `GlassToggle`, `ModernToggle`, `SparkBadge`
- **Assets Sync**: Copy `node_modules/@designcodeio/threeui/lib-dist/assets/` to `./public/`.

