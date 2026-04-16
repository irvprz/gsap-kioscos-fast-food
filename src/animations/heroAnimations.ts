import { gsap, ScrollTrigger } from '../hooks/useGSAP';
import { prefersReducedMotion } from '../hooks/useGSAP';

/**
 * Animate hero content elements on page load.
 * @param scope - The hero section element (used as GSAP context scope)
 */
export function animateHeroEntrance(scope: HTMLElement) {
  if (prefersReducedMotion()) {
    gsap.set(scope, { opacity: 1 });
    return;
  }

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(
      '.hero-badge',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }
    )
      .fromTo(
        '.hero-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo(
        '.hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
      .fromTo(
        '.hero-trust',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power1.out' },
        '-=0.1'
      );
  }, scope);

  return () => ctx.revert();
}

/**
 * Parallax background image on scroll — tied to the hero section.
 * @param triggerEl - The section element to use as ScrollTrigger trigger
 * @param targetEl  - The element to move with parallax
 */
export function animateHeroParallax(
  triggerEl: HTMLElement,
  targetEl: HTMLElement
) {
  const tween = gsap.to(targetEl, {
    yPercent: -25,
    ease: 'none',
    scrollTrigger: {
      trigger: triggerEl,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });

  return () => {
    tween.kill();
    ScrollTrigger.getAll().forEach(st => st.kill());
  };
}
