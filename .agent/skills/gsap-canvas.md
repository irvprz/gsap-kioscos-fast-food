---
name: gsap-canvas
description: Skill para implementar animaciones GSAP con ScrollTrigger en proyectos React + Vite. Cubre instalación, configuración, patrones de animación, canvas animado y mejores prácticas para kioscos de comida rápida.
---

# GSAP ScrollTrigger Skill — GSAP Kioscos Fast Food

## Overview

Este skill configura y aplica **GSAP (GreenSock Animation Platform)** con el plugin **ScrollTrigger** en el proyecto React + Vite + TypeScript de Kioscos Fast Food. Incluye canvas animado, transiciones cinematográficas de menú, y animaciones de entrada para tarjetas de productos.

---

## 1. Instalación

Este proyecto usa **React 19 + Vite 6 + TypeScript**. GSAP se instala como dependencia de producción:

```bash
npm install gsap
```

> ⚠️ GSAP Club (ScrollSmoother, SplitText, etc.) requiere licencia. Para uso libre, usa solo `gsap/ScrollTrigger`.

---

## 2. Configuración Base en React

### 2.1 Registro del Plugin (una sola vez, en el componente raíz o un hook custom)

```tsx
// src/hooks/useGSAP.ts
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGSAPInit() {
  useEffect(() => {
    // Configuración global de GSAP
    gsap.config({
      nullTargetWarn: false,
      trialWarn: false,
    });

    // Limpiar ScrollTriggers al desmontar
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
}
```

### 2.2 Uso en App.tsx

```tsx
import { useGSAPInit } from './hooks/useGSAP';

export default function App() {
  useGSAPInit();
  // ...
}
```

---

## 3. Patrones de Animación ScrollTrigger

### 3.1 Fade-in de Tarjeta de Producto (on scroll)

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function ProductCard({ item }: { item: MenuItem }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
          // markers: true, // ← activa solo en desarrollo
        },
      }
    );

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return <div ref={cardRef} className="product-card">...</div>;
}
```

### 3.2 Animación de Sección Hero con Timeline

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: -40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo(ctaRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
        '-=0.3'
      );
    }, heroRef);

    return () => ctx.revert(); // ← limpia todo automáticamente
  }, []);

  return (
    <section ref={heroRef}>
      <h1 ref={titleRef}>Bienvenido</h1>
      <p ref={subtitleRef}>Los mejores sabores</p>
      <button ref={ctaRef}>Ver Menú</button>
    </section>
  );
}
```

### 3.3 Parallax de Imagen de Fondo

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.hero-bg-image', {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5, // suavidad del parallax (segundos de lag)
      },
    });
  });
  return () => ctx.revert();
}, []);
```

### 3.4 Stagger de Múltiples Ítems del Menú

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      '.menu-item', // CSS selector dentro del contexto
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1, // cada item con 100ms de delay
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.menu-grid',
          start: 'top 75%',
          once: true,
        },
      }
    );
  });
  return () => ctx.revert();
}, []);
```

---

## 4. Canvas Animado con GSAP

### 4.1 Canvas de Partículas para Fondo del Kiosco

```tsx
// src/components/AnimatedCanvas.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export function AnimatedCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Colores del branding Fast Food
    const colors = ['#FF6B35', '#FFD700', '#FF3B30', '#FF9500', '#FFFFFF'];

    // Inicializar partículas
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: Math.random() * 4 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Animar con GSAP ticker (en lugar de requestAnimationFrame manual)
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
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

    gsap.ticker.add(tick);

    // Animación de entrada con GSAP
    gsap.fromTo(canvas,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: 'power2.inOut' }
    );

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
```

### 4.2 Canvas de Secuencia de Imágenes (Scroll-Driven)

```tsx
// Útil para animaciones cinematográficas de producto
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function ScrollCanvas({ frames }: { frames: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ current: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1920;
    canvas.height = 1080;

    // Precargar imágenes
    imagesRef.current = frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Dibujar frame actual
    const drawFrame = (index: number) => {
      const img = imagesRef.current[index];
      if (img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    drawFrame(0);

    // ScrollTrigger controla el frame actual
    gsap.to(frameRef.current, {
      current: frames.length - 1,
      snap: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${frames.length * 30}px`, // 30px por frame
        scrub: 0.5,
        pin: true,
        onUpdate: self => {
          const frame = Math.round(self.progress * (frames.length - 1));
          drawFrame(frame);
        },
      },
    });

    return () => ScrollTrigger.getAll().forEach(st => st.kill());
  }, [frames]);

  return (
    <div ref={sectionRef} style={{ height: '100vh' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
```

---

## 5. Reglas y Mejores Prácticas

### ✅ Siempre usar `gsap.context()` en React

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // Todas las animaciones aquí
  }, scopeRef); // ← scope limita los selectores CSS al componente

  return () => ctx.revert(); // ← El cleanup más seguro
}, []);
```

### ✅ Registrar plugins una sola vez (app entry point)

```ts
// src/main.tsx o src/hooks/useGSAP.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

### ✅ Usar `once: true` para animaciones de entrada one-shot

```ts
scrollTrigger: {
  trigger: el,
  start: 'top 80%',
  once: true, // no reverse, mejor performance
}
```

### ✅ Respetar `prefers-reduced-motion`

```ts
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 });
} else {
  gsap.set(el, { opacity: 1 }); // sin animación
}
```

### ✅ Debug con markers (solo desarrollo)

```ts
scrollTrigger: {
  trigger: '.section',
  start: 'top 80%',
  markers: import.meta.env.DEV, // ← solo en dev
}
```

### ❌ Evitar

- Mutar `ref.current` directamente sin verificar null
- Olvidar cleanup (`ctx.revert()` o `tween.kill()`)
- Usar `document.querySelector` dentro de componentes React (usar refs)
- Registrar plugins múltiples veces en diferentes componentes

---

## 6. Animaciones Específicas para Kiosco Fast Food

### 6.1 Entrada de Categorías de Menú

```tsx
gsap.fromTo('.category-tab',
  { opacity: 0, y: -20 },
  {
    opacity: 1,
    y: 0,
    duration: 0.4,
    stagger: { each: 0.08, from: 'start' },
    ease: 'power2.out',
  }
);
```

### 6.2 Pulse en Botón "Agregar al Carrito"

```tsx
const addPulse = (el: HTMLElement) => {
  gsap.timeline()
    .to(el, { scale: 0.92, duration: 0.1, ease: 'power2.in' })
    .to(el, { scale: 1.08, duration: 0.15, ease: 'power2.out' })
    .to(el, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.5)' });
};
```

### 6.3 Transición entre Pantallas del Kiosco

```tsx
const slideToScreen = (fromEl: HTMLElement, toEl: HTMLElement) => {
  const tl = gsap.timeline();
  tl.to(fromEl, { x: '-100%', opacity: 0, duration: 0.4, ease: 'power2.in' })
    .fromTo(toEl,
      { x: '100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.1'
    );
};
```

### 6.4 Loader de Kiosco (intro animation)

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo('.loader-logo',
      { scale: 0, rotation: -180, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'back.out(2)' }
    )
    .fromTo('.loader-bar',
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1, ease: 'power3.inOut' },
      '-=0.2'
    )
    .to('.loader-overlay',
      { yPercent: -100, duration: 0.5, ease: 'power2.inOut' },
      '+=0.2'
    );
  });

  return () => ctx.revert();
}, []);
```

---

## 7. Integración con Tailwind CSS v4

Este proyecto usa Tailwind v4. Para combinar con GSAP:

```tsx
// Las clases de Tailwind definen estado base, GSAP agrega animaciones
<div
  className="opacity-0 translate-y-8" // estado inicial (invisible)
  ref={cardRef}
  // GSAP anima a opacity-1, translateY(0)
>
```

> ⚠️ Evita usar `transition` de Tailwind en elementos que GSAP va a animar — pueden entrar en conflicto. Preferir GSAP para todo movimiento animado.

---

## 8. Estructura de Archivos Recomendada

```
src/
├── hooks/
│   └── useGSAP.ts          # Setup global + useGSAPInit
├── animations/
│   ├── heroAnimations.ts   # Timelines del hero
│   ├── menuAnimations.ts   # Stagger de tarjetas
│   ├── transitionAnim.ts   # Transiciones entre pantallas
│   └── canvasEffects.ts    # Canvas particle / scroll sequences
├── components/
│   └── AnimatedCanvas.tsx  # Canvas GSAP ticker
└── main.tsx                # gsap.registerPlugin(ScrollTrigger)
```

---

## 9. Variables de Entorno / Configuración

No se requieren variables de entorno para GSAP estándar. Sin embargo:

| Variable | Descripción |
|----------|-------------|
| `VITE_GSAP_TRIAL` | `true` si se usa versión de evaluación |
| `VITE_DISABLE_ANIMATIONS` | `true` para deshabilitar todas las animaciones |

---

## 10. Referencias

- [GSAP Docs](https://gsap.com/docs/v3/)
- [ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP + React Guide](https://gsap.com/resources/React/)
- [GSAP Cheatsheet](https://gsap.com/cheatsheet/)
- [GSAP Easing Visualizer](https://gsap.com/docs/v3/Eases/)
