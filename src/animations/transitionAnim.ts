import { gsap } from '../hooks/useGSAP';

/** Direction of the slide transition */
type SlideDirection = 'left' | 'right' | 'up' | 'down';

const AXIS: Record<SlideDirection, { prop: 'x' | 'y'; sign: 1 | -1 }> = {
  left:  { prop: 'x', sign: -1 },
  right: { prop: 'x', sign:  1 },
  up:    { prop: 'y', sign: -1 },
  down:  { prop: 'y', sign:  1 },
};

/**
 * Slide from one kiosk screen to another.
 * @param fromEl    - The outgoing screen element
 * @param toEl      - The incoming screen element
 * @param direction - Direction the outgoing screen exits ('left' by default)
 * @param onDone    - Optional callback when transition completes
 */
export function slideToScreen(
  fromEl: HTMLElement,
  toEl: HTMLElement,
  direction: SlideDirection = 'left',
  onDone?: () => void
) {
  const { prop, sign } = AXIS[direction];
  const out = `${sign * -100}%`;
  const inStart = `${sign * 100}%`;

  // Make sure the incoming screen is ready and visible
  gsap.set(toEl, { [prop]: inStart, opacity: 1, display: 'flex' });

  const tl = gsap.timeline({ onComplete: onDone });

  tl.to(fromEl, {
    [prop]: out,
    opacity: 0,
    duration: 0.38,
    ease: 'power2.in',
  }).to(
    toEl,
    {
      [prop]: '0%',
      opacity: 1,
      duration: 0.38,
      ease: 'power2.out',
    },
    '-=0.12'
  );

  return tl;
}

/**
 * Fade-out the current screen and fade-in the next.
 * Use when content is completely replacing the previous screen.
 */
export function fadeToScreen(
  fromEl: HTMLElement,
  toEl: HTMLElement,
  onDone?: () => void
) {
  gsap.set(toEl, { opacity: 0, display: 'flex' });

  const tl = gsap.timeline({ onComplete: onDone });

  tl.to(fromEl, { opacity: 0, duration: 0.28, ease: 'power1.in' }).to(
    toEl,
    { opacity: 1, duration: 0.32, ease: 'power1.out' },
    '-=0.08'
  );

  return tl;
}

/**
 * Kiosk intro loader animation.
 * Plays a logo + loading bar sequence then removes overlay.
 * @param overlayEl   - The full-screen loader overlay element
 * @param logoEl      - Logo element inside the overlay
 * @param barEl       - Loading bar element inside the overlay
 * @param onComplete  - Called when the overlay has been hidden
 */
export function playKioskLoader(
  overlayEl: HTMLElement,
  logoEl: HTMLElement,
  barEl: HTMLElement,
  onComplete?: () => void
) {
  const tl = gsap.timeline({ delay: 0.2, onComplete });

  tl.fromTo(
    logoEl,
    { scale: 0, rotation: -180, opacity: 0 },
    { scale: 1, rotation: 0, opacity: 1, duration: 0.75, ease: 'back.out(2)' }
  )
    .fromTo(
      barEl,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.9, ease: 'power3.inOut' },
      '-=0.2'
    )
    .to(overlayEl, { yPercent: -100, duration: 0.5, ease: 'power2.inOut' }, '+=0.15');

  return tl;
}
