'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Production-Grade Lenis Smooth Scroll + GSAP ScrollTrigger Bridge
 * Enforces unified RAF loop and eliminates jitter across complex 3D WebGL scenes.
 */
export function useLenisGsap() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 2. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // 3. Link Lenis scroll notifications directly to ScrollTrigger update
    lenis.on('scroll', ScrollTrigger.update);

    // 4. Hook Lenis RAF execution directly into GSAP's core ticker
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);

    // 5. Critical: Lock lag smoothing to 0 to prevent position desync between DOM & 3D WebGL
    gsap.ticker.lagSmoothing(0);

    // 6. Refresh ScrollTrigger once DOM layout settles
    ScrollTrigger.refresh();

    // 7. Teardown on unmount
    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}

export function LenisGsapProvider({ children }: { children: React.ReactNode }) {
  useLenisGsap();
  return <>{children}</>;
}
