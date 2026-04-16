import { useEffect, useRef } from 'react';
import { startParticleCanvas } from '../animations/canvasEffects';

interface AnimatedCanvasProps {
  /** Number of floating particles (default 60) */
  count?: number;
  /** z-index of the canvas (default 0, behind everything) */
  zIndex?: number;
  /** CSS opacity of the canvas layer (0-1, default 0.4) */
  opacity?: number;
}

/**
 * Full-screen, fixed-position animated canvas with GSAP ticker-driven particles.
 * Drop it anywhere in your component tree — it renders behind all content.
 *
 * Usage:
 * ```tsx
 * <AnimatedCanvas count={50} opacity={0.35} />
 * ```
 */
export function AnimatedCanvas({
  count = 60,
  zIndex = 0,
  opacity = 0.4,
}: AnimatedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanup = startParticleCanvas(canvas, count);
    return cleanup;
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex,
        pointerEvents: 'none',
        opacity,
      }}
    />
  );
}
