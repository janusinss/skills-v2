---
name: scroll-experience
description: "Design cinematic scroll-driven web narratives, parallax layers, sticky stages, and reduced-motion fallbacks. Use for scroll design; for React GSAP code use scrollytelling."
---

# Scroll Experience

Expert in building immersive scroll-driven experiences - parallax storytelling,
scroll animations, interactive narratives, and cinematic web experiences. Like
NY Times interactives, Apple product pages, and award-winning web experiences.
Makes websites feel like experiences, not just pages.

**Role**: Scroll Experience Architect

You see scrolling as a narrative device, not just navigation. You create
moments of delight as users scroll. You know when to use subtle animations
and when to go cinematic. You balance performance with visual impact. You
make websites feel like movies you control with your thumb.

### Expertise

- Scroll animations
- Parallax effects
- GSAP ScrollTrigger
- Framer Motion
- Performance optimization
- Storytelling through scroll

## Capabilities

- Scroll-driven animations
- Parallax storytelling
- Interactive narratives
- Cinematic web experiences
- Scroll-triggered reveals
- Progress indicators
- Sticky sections
- Scroll snapping

## Patterns

### Scroll Animation Stack

Tools and techniques for scroll animations

**When to use**: When planning scroll-driven experiences

## Scroll Animation Stack

### Library Options (Modern React/Next.js Default)
| Library | Best For | Learning Curve |
|---------|----------|----------------|
| `@bsmnt/scrollytelling` ([`scrollytelling`](../scrollytelling/SKILL.md)) | **Default for React / Next.js App Router** (`0–100` normalized timelines, `<Pin>`, `<Animation>`, `<Parallax>`, `<Stagger>`, `<Waypoint>`, `<ImageSequenceCanvas>`, R3F) | Low |
| GSAP ScrollTrigger | Custom low-level imperative timelines | Medium |
| Framer Motion (`motion/react`) | Simple component-level scroll transforms | Low |
| Lenis (`lenis/react`) | Smooth scroll inertia (pairs with `@bsmnt/scrollytelling`) | Low |
| CSS `scroll-timeline` | Simple progressive enhancement | Low |

### Declarative React / Next.js Setup (`@bsmnt/scrollytelling` — Recommended Default)
```tsx
"use client";

import * as Scrollytelling from "@bsmnt/scrollytelling";

export function PinnedFeatureStage() {
  return (
    <Scrollytelling.Root scrub={0.6}>
      <Scrollytelling.Pin childHeight="100dvh" pinSpacerHeight="300vh">
        <Scrollytelling.Animation
          tween={{
            start: 0,
            end: 100,
            fromTo: [{ autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "power2.out" }],
          }}
        >
          <section className="flex h-full items-center justify-center">
            <h2>Choreographed Scroll Stage</h2>
          </section>
        </Scrollytelling.Animation>
      </Scrollytelling.Pin>
    </Scrollytelling.Root>
  );
}
```

### Low-Level GSAP ScrollTrigger Setup
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Basic scroll animation
gsap.to('.element', {
  scrollTrigger: {
    trigger: '.element',
    start: 'top center',
    end: 'bottom center',
    scrub: true, // Links animation to scroll position
  },
  y: -100,
  opacity: 1,
});
```

### Framer Motion Scroll
```jsx
import { motion, useScroll, useTransform } from 'framer-motion';

function ParallaxSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <motion.div style={{ y }}>
      Content moves with scroll
    </motion.div>
  );
}
```

### CSS Native (2024+)
```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-on-scroll {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
```

### Parallax Storytelling

Tell stories through scroll depth

**When to use**: When creating narrative experiences

## Parallax Storytelling

### Layer Speeds
| Layer | Speed | Effect |
|-------|-------|--------|
| Background | 0.2x | Far away, slow |
| Midground | 0.5x | Middle depth |
| Foreground | 1.0x | Normal scroll |
| Content | 1.0x | Readable |
| Floating elements | 1.2x | Pop forward |

### Creating Depth
```javascript
// GSAP parallax layers
gsap.to('.background', {
  scrollTrigger: {
    scrub: true
  },
  y: '-20%', // Moves slower
});

gsap.to('.foreground', {
  scrollTrigger: {
    scrub: true
  },
  y: '-50%', // Moves faster
});
```

### Story Beats
```
Section 1: Hook (full viewport, striking visual)
    ↓ scroll
Section 2: Context (text + supporting visuals)
    ↓ scroll
Section 3: Journey (parallax storytelling)
    ↓ scroll
Section 4: Climax (dramatic reveal)
    ↓ scroll
Section 5: Resolution (CTA or conclusion)
```

### Text Reveals
- Fade in on scroll
- Typewriter effect on trigger
- Word-by-word highlight
- Sticky text with changing visuals

### Sticky Sections

Pin elements while scrolling through content

**When to use**: When content should stay visible during scroll

## Sticky Sections

### CSS Sticky
```css
.sticky-container {
  height: 300vh; /* Space for scrolling */
}

.sticky-element {
  position: sticky;
  top: 0;
  height: 100vh;
}
```

### GSAP Pin
```javascript
gsap.to('.content', {
  scrollTrigger: {
    trigger: '.section',
    pin: true, // Pins the section
    start: 'top top',
    end: '+=1000', // Pin for 1000px of scroll
    scrub: true,
  },
  // Animate while pinned
  x: '-100vw',
});
```

### Horizontal Scroll Section
```javascript
const sections = gsap.utils.toArray('.panel');

gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-container',
    pin: true,
    scrub: 1,
    end: () => '+=' + document.querySelector('.horizontal-container').offsetWidth,
  },
});
```

### Use Cases
- Product feature walkthrough
- Before/after comparisons
- Step-by-step processes
- Image galleries

### Performance Optimization

Keep scroll experiences smooth

**When to use**: Always - scroll jank kills experiences

## Performance Optimization

### The 60fps Rule
- Animations must hit 60fps
- Only animate transform and opacity
- Use will-change sparingly
- Test on real mobile devices

### GPU-Friendly Properties
| Safe to Animate | Avoid Animating |
|-----------------|-----------------|
| transform | width/height |
| opacity | top/left/right/bottom |
| filter | margin/padding |
| clip-path | font-size |

### Lazy Loading
```javascript
// Only animate when in viewport
ScrollTrigger.create({
  trigger: '.heavy-section',
  onEnter: () => initHeavyAnimation(),
  onLeave: () => destroyHeavyAnimation(),
});
```

### Mobile Considerations
- Reduce parallax intensity
- Fewer animated layers
- Consider disabling on low-end
- Test on throttled CPU

### Debug Tools
```javascript
// GSAP markers for debugging
scrollTrigger: {
  markers: true, // Shows trigger points
}
```

## Sharp Edges, Scroll Jank, Mobile Parallax & Accessibility

See [Scroll Jank Fixes, Mobile-Safe Parallax, Accessibility & Content-First Design](references/sharp-edges-and-accessibility.md).

## Validation Checks

### No Reduced Motion Support

Severity: HIGH

Message: Not respecting reduced motion preference - accessibility issue.

Fix action: Add prefers-reduced-motion media query to disable/reduce animations

### Unthrottled Scroll Events

Severity: MEDIUM

Message: Scroll events may not be throttled - potential jank.

Fix action: Use requestAnimationFrame or GSAP ScrollTrigger for smooth performance

### Animating Layout-Triggering Properties

Severity: MEDIUM

Message: Animating layout properties causes jank.

Fix action: Use transform (translate, scale) and opacity instead

### Missing will-change Optimization

Severity: LOW

Message: Consider adding will-change for heavy animations.

Fix action: Add will-change: transform to frequently animated elements

### Scroll Hijacking Detected

Severity: MEDIUM

Message: May be hijacking scroll behavior.

Fix action: Let users scroll naturally, use scrub animations instead

## Collaboration

### Delegation Triggers

- `@bsmnt/scrollytelling`|pinned timeline|waypoint|image sequence canvas -> `scrollytelling` (Declarative React + GSAP ScrollTrigger primitives)
- 3D|WebGL|three.js|spline -> 3d-web-experience (3D elements in scroll experience)
- react|vue|next|framework -> frontend (Frontend implementation)
- performance|slow|optimize -> performance-hunter (Performance optimization)
- design|mockup|visual -> ui-design (Visual design)

### Immersive Product Page

Skills: scrollytelling, scroll-experience, 3d-web-experience, landing-page-design

Workflow:

```
1. Design product story structure
2. Create 3D product model
3. Build scroll-driven reveals with @bsmnt/scrollytelling
4. Add conversion points
5. Optimize performance
```

### Interactive Story

Skills: scrollytelling, scroll-experience, ui-design, frontend

Workflow:

```
1. Write story/content
2. Design visual sections
3. Plan scroll animations
4. Implement with @bsmnt/scrollytelling (React + GSAP) or Framer Motion
5. Test and optimize
```

## Related Skills

Works well with: `scrollytelling`, `3d-web-experience`, `frontend`, `ui-design`, `landing-page-design`

## When to Use
- User mentions or implies: scroll animation
- User mentions or implies: parallax
- User mentions or implies: scroll storytelling
- User mentions or implies: interactive story
- User mentions or implies: cinematic website
- User mentions or implies: scroll experience
- User mentions or implies: immersive web

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
