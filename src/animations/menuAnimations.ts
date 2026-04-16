import { gsap, ScrollTrigger } from '../hooks/useGSAP';
import { prefersReducedMotion } from '../hooks/useGSAP';

/**
 * Stagger-reveal a grid of menu cards on scroll.
 * Targets elements matching `selector` within `scope`.
 * @param scope      - Parent container element
 * @param selector   - CSS selector for cards (e.g. '.menu-item')
 * @param triggerEl  - Element that triggers the animation (defaults to scope)
 */
export function animateMenuGrid(
  scope: HTMLElement,
  selector = '.menu-item',
  triggerEl?: HTMLElement
) {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      selector,
      { opacity: 0, y: 50, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: { each: 0.09, from: 'start' },
        ease: 'power3.out',
        scrollTrigger: {
          trigger: triggerEl ?? scope,
          start: 'top 78%',
          once: true,
          markers: false, // flip to true to debug ScrollTrigger in dev
        },
      }
    );
  }, scope);

  return () => ctx.revert();
}

/**
 * Animate category tabs sliding down on mount (no scroll required).
 * @param scope - Container element with `.category-tab` children
 */
export function animateCategoryTabs(scope: HTMLElement) {
  if (prefersReducedMotion()) return () => {};

  const ctx = gsap.context(() => {
    gsap.fromTo(
      '.category-tab',
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: { each: 0.08, from: 'start' },
        ease: 'power2.out',
        delay: 0.3,
      }
    );
  }, scope);

  return () => ctx.revert();
}

/**
 * Elastic pulse on "Add to cart" button click.
 * @param el - The button element
 */
export function pulseAddToCart(el: HTMLElement) {
  gsap
    .timeline()
    .to(el, { scale: 0.9, duration: 0.1, ease: 'power2.in' })
    .to(el, { scale: 1.08, duration: 0.15, ease: 'power2.out' })
    .to(el, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.5)' });
}

/**
 * Subtle hover lift for a card element.
 * Attach to onMouseEnter / onMouseLeave.
 */
export function hoverCardLift(el: HTMLElement, enter: boolean) {
  gsap.to(el, {
    y: enter ? -6 : 0,
    boxShadow: enter
      ? '0 20px 40px rgba(0,0,0,0.15)'
      : '0 4px 12px rgba(0,0,0,0.08)',
    duration: 0.3,
    ease: 'power2.out',
  });
}

export { ScrollTrigger };
