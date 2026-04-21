import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { gsap, ScrollTrigger } from '../hooks/useGSAP';

// ─── Frame list ───────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 82; // BASE_1_000 → BASE_1_081

function frameUrl(index: number): string {
  const padded = String(index).padStart(3, '0');
  return `/assets/HEADER-BACKGROUND/BASE_1_${padded}.webp`;
}

const FRAME_URLS = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameUrl(i));

// ─── Scroll milestones (0-1) where text layers appear ────────────────────────
const MILESTONES = {
  badge:    0.12,
  title:    0.22,
  subtitle: 0.50,
  cta:      0.68,
  trust:    0.75,
};

// ─── How many px of scroll per frame → total scroll height ───────────────────
// 18 px × 82 frames = 1 476. Add 100vh so section exits naturally.
const PX_PER_FRAME = 30;
const SCROLL_HEIGHT = `calc(100vh + ${TOTAL_FRAMES * PX_PER_FRAME}px)`;

export function HeroSequence() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const imagesRef   = useRef<HTMLImageElement[]>([]);
  const frameObj    = useRef({ f: 0 });

  // Text layer refs
  const badgeRef    = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const trustRef    = useRef<HTMLDivElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);

  // ── Preload ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Eagerly load all frames — they are small webp files (~7–60 KB each)
    imagesRef.current = FRAME_URLS.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, []);

  // ── Canvas draw helper ───────────────────────────────────────────────────
  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Cover-fit
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth  || 1280;
      const ih = img.naturalHeight || 720;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const ox = (cw - sw) / 2;
      const oy = (ch - sh) / 2;
      ctx.drawImage(img, ox, oy, sw, sh);
    };

    if (img.complete && img.naturalWidth) {
      draw();
    } else {
      img.onload = draw;
    }
  }

  // ── GSAP setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const section  = sectionRef.current;
    const canvas   = canvasRef.current;
    if (!section || !canvas) return;

    // Size canvas to viewport
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(Math.round(frameObj.current.f));
    };
    resize();
    window.addEventListener('resize', resize);

    // Draw first frame immediately
    drawFrame(0);

    // Set initial states for text layers (hidden)
    gsap.set(
      [badgeRef.current, titleRef.current, subtitleRef.current, ctaRef.current, trustRef.current],
      { opacity: 0, y: 32 }
    );

    const ctx = gsap.context(() => {
      // ── Main scroll sequence ─────────────────────────────────────────
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `bottom bottom`,
        pin: '.hero-sticky',
        pinSpacing: false,
        scrub: 1,
        snap: {
          // Snap to key milestones so the user pauses on text/CTAs
          snapTo: [0, MILESTONES.badge, MILESTONES.title, MILESTONES.subtitle, MILESTONES.cta, 1],
          duration: { min: 0.4, max: 1.0 },
          ease: 'power2.inOut',
          delay: 0.15,
        },
        onUpdate(self) {
          const p = self.progress;

          // Drive frames
          const targetFrame = Math.round(p * (TOTAL_FRAMES - 1));
          if (targetFrame !== Math.round(frameObj.current.f)) {
            frameObj.current.f = targetFrame;
            drawFrame(targetFrame);
          }

          // Drive overlay darkness: lightest at start, darker in middle, fade at end
          if (overlayRef.current) {
            let alpha: number;
            if (p < 0.1) {
              alpha = 0.15 + p * 3; // 0.15 → 0.45
            } else if (p < 0.85) {
              alpha = 0.45;
            } else {
              alpha = 0.45 + (p - 0.85) / 0.15 * 0.35; // 0.45 → 0.80
            }
            overlayRef.current.style.background = `linear-gradient(
              to bottom,
              rgba(0,0,0,${alpha}) 0%,
              rgba(0,0,0,${alpha * 0.6}) 50%,
              rgba(0,0,0,${alpha}) 100%
            )`;
          }
        },
      });

      // ── Text layer reveals (scroll-progress-based) ───────────────────
      // Using simple ScrollTrigger toggleActions + start offsets
      const layerConfig = [
        { ref: badgeRef,    milestone: MILESTONES.badge    },
        { ref: titleRef,    milestone: MILESTONES.title    },
        { ref: subtitleRef, milestone: MILESTONES.subtitle },
        { ref: ctaRef,      milestone: MILESTONES.cta      },
        { ref: trustRef,    milestone: MILESTONES.trust    },
      ];

      layerConfig.forEach(({ ref, milestone }) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: `top+=${milestone * (section.offsetHeight - window.innerHeight)}px top`,
            toggleActions: 'play none none reverse',
          },
        });
      });

      // ── Exit fade: fade whole sticky container out at the very end ───
      gsap.to('.hero-sticky', {
        opacity: 0,
        scrollTrigger: {
          trigger: section,
          start: 'bottom 15%',
          end:   'bottom top',
          scrub: true,
        },
      });

      return () => st.kill();
    }, section);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{ height: SCROLL_HEIGHT }}
      className="relative"
    >
      {/* ── Sticky viewport ──────────────────────────────────────────── */}
      <div className="hero-sticky sticky top-0 h-screen w-full overflow-hidden">

        {/* Canvas background */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay (opacity driven by JS) */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.15)' }}
        />

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 pt-20">

          {/* Badge */}
          <div ref={badgeRef} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              La evolución del Fast Food
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter text-white leading-[1.05] mb-6 max-w-5xl"
          >
            Multiplica tus ventas con kioscos de{' '}
            <span className="text-brand">autoatención.</span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-white/80 font-medium mb-12 leading-relaxed max-w-2xl"
          >
            Permite a tus clientes ordenar a su ritmo, personalizar sus platos
            y pagar sin hacer fila. Aumenta tu ticket promedio con upselling
            automático y banners promocionales.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-4">
            <button className="bg-brand text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2 hover:bg-brand-dark transition-colors shadow-2xl shadow-brand/40 cursor-pointer">
              Ver Kioscos en acción <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/15 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/25 transition-colors cursor-pointer">
              Solicitar Demo
            </button>
          </div>

          {/* Trust */}
          <div
            ref={trustRef}
            className="mt-10 flex items-center gap-6 text-sm font-medium text-white/60"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand" /> Fácil integración
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand" /> Pagos integrados
            </div>
          </div>
        </div>

        {/* Scroll hint — fades out as user scrolls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs">
          <span>Scroll</span>
          <div className="w-px h-8 bg-white/30 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
