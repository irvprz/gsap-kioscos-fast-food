import { gsap, ScrollTrigger } from '../hooks/useGSAP';

// ─── Brand color palette ─────────────────────────────────────────────────────
const BRAND_COLORS = ['#FF6B35', '#FFD700', '#FF3B30', '#FF9500', '#FFFFFF'];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

// ─── Particle Canvas ─────────────────────────────────────────────────────────

/**
 * Start a GSAP-ticker-driven particle canvas effect.
 * Uses brand colors; responds to window resize.
 *
 * @param canvas      - The HTMLCanvasElement to draw on
 * @param count       - Number of particles (default 60)
 * @returns cleanup   - Call to stop the effect and remove event listeners
 */
export function startParticleCanvas(
  canvas: HTMLCanvasElement,
  count = 60
): () => void {
  const ctx = canvas.getContext('2d')!;
  let particles: Particle[] = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  };

  const initParticles = () => {
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      radius: Math.random() * 3.5 + 1,
      alpha: Math.random() * 0.55 + 0.15,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
    }));
  };

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  resize();
  window.addEventListener('resize', resize);
  gsap.ticker.add(tick);

  // Fade-in canvas on start
  gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'power2.inOut' });

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', resize);
  };
}

// ─── Scroll-Driven Frame Sequence ─────────────────────────────────────────────

/**
 * Preload an array of image URLs and return the HTMLImageElement array.
 */
export function preloadFrames(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    urls.map(
      src =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        })
    )
  );
}

/**
 * Bind a scroll-driven frame sequence to a canvas.
 * The section is pinned while the user scrolls through all frames.
 *
 * @param canvas      - Canvas element to draw frames on
 * @param sectionEl   - Section element used as ScrollTrigger trigger (will be pinned)
 * @param images      - Pre-loaded HTMLImageElements from `preloadFrames`
 * @param pxPerFrame  - Pixels of scroll per frame (default 30)
 * @returns cleanup   - Call to kill the ScrollTrigger
 */
export function bindScrollFrameSequence(
  canvas: HTMLCanvasElement,
  sectionEl: HTMLElement,
  images: HTMLImageElement[],
  pxPerFrame = 30
): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1920;
  canvas.height = 1080;

  const drawFrame = (index: number) => {
    const img = images[Math.max(0, Math.min(index, images.length - 1))];
    if (!img) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  drawFrame(0);

  const proxy = { frame: 0 };

  const st = ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top top',
    end: `+=${images.length * pxPerFrame}px`,
    scrub: 0.5,
    pin: true,
    onUpdate: self => {
      const frame = Math.round(self.progress * (images.length - 1));
      drawFrame(frame);
    },
  });

  return () => st.kill();
}
