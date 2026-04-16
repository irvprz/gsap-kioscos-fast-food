import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins once at module level
gsap.registerPlugin(ScrollTrigger);

/**
 * Call this hook once at the App root level.
 * Configures global GSAP defaults and cleans up all ScrollTriggers on unmount.
 */
export function useGSAPInit() {
  useEffect(() => {
    gsap.config({
      nullTargetWarn: false,
    });

    // Global ScrollTrigger defaults
    ScrollTrigger.defaults({
      markers: false, // change to true to debug triggers in dev
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
}

/**
 * Utility: check if user prefers reduced motion.
 * Use before any decorative animation to respect accessibility.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
