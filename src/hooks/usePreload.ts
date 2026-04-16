/**
 * usePreload.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Soluciona el problema de "salto / flash" que ocurre la primera vez que el
 * usuario hace scroll hacia un elemento animado con Framer Motion o GSAP.
 *
 * ¿Por qué ocurre el salto?
 *   1. El navegador renderiza el DOM con los estilos INICIALES de la animación
 *      (opacity: 0, y: 20…) antes de que el motor de animación haya tenido
 *      tiempo de calcular si el elemento ya está en el viewport.
 *   2. Las imágenes/fuentes tardan en cargar → el layout cambia → los
 *      ScrollTriggers / IntersectionObservers calculan posiciones incorrectas.
 *
 * Estrategia de esta solución (sin librerías extra):
 *   A. CSS: Los elementos animados arrancan con `visibility: hidden` vía
 *      [data-animate] hasta que el hook marca el documento como listo.
 *   B. Hook: Espera a que (1) `document.fonts` cargue y (2) todas las imágenes
 *      del viewport estén completas. Luego activa `data-preload-ready` en
 *      <html>, que hace visibles los elementos y le dice a ScrollTrigger y
 *      Framer Motion que recalculen posiciones.
 *   C. ScrollTrigger.refresh(): Se llama después de que el layout es estable
 *      para que todos los triggers tengan coordenadas correctas desde el inicio.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface PreloadOptions {
  /**
   * Tiempo máximo de espera en ms antes de continuar aunque no todo esté listo.
   * Evita bloquear la página si algún recurso tarda demasiado.
   * @default 3000
   */
  timeout?: number;

  /**
   * Si true, muestra logs en consola durante el proceso de preload (solo dev).
   * @default false
   */
  debug?: boolean;

  /**
   * Callback que se ejecuta cuando el preload termina.
   */
  onReady?: () => void;
}

export interface PreloadState {
  /** true cuando todas las fuentes e imágenes han cargado (o el timeout expiró) */
  isReady: boolean;
  /** Tiempo en ms que tardó el preload (útil para debug) */
  loadTime: number;
}

// ─── Utilidades internas ─────────────────────────────────────────────────────

/**
 * Devuelve una promise que resuelve cuando TODAS las imágenes visibles en el
 * viewport están completamente cargadas. Ignora imágenes lazy fuera de pantalla.
 */
function waitForViewportImages(): Promise<void> {
  return new Promise(resolve => {
    // Seleccionamos todas las imágenes que ya tienen `src` asignado
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[src]'));

    if (images.length === 0) {
      resolve();
      return;
    }

    // Filtramos solo las que están dentro del viewport inicial (above the fold)
    const viewportHeight = window.innerHeight;
    const aboveFoldImages = images.filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.top < viewportHeight * 1.5; // incluimos un 50% extra de margen
    });

    if (aboveFoldImages.length === 0) {
      resolve();
      return;
    }

    let loaded = 0;
    const total = aboveFoldImages.length;

    const checkDone = () => {
      loaded++;
      if (loaded >= total) resolve();
    };

    aboveFoldImages.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        checkDone();
      } else {
        img.addEventListener('load', checkDone, { once: true });
        img.addEventListener('error', checkDone, { once: true }); // no bloquear en 404
      }
    });
  });
}

/**
 * Devuelve una promise que resuelve cuando el document.fonts API indica que
 * todas las fuentes web están cargadas y listas para renderizar.
 */
function waitForFonts(): Promise<void> {
  if ('fonts' in document) {
    return document.fonts.ready.then(() => undefined);
  }
  // Fallback para browsers sin FontFace API
  return Promise.resolve();
}

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * Hook de preload para eliminar el flash/salto en animaciones de scroll.
 *
 * Uso básico en App.tsx:
 * ```tsx
 * const { isReady } = usePreload();
 * ```
 *
 * Añade `data-animate` al elemento que quieres proteger del flash:
 * ```tsx
 * <motion.div data-animate initial={{ opacity: 0, y: 20 }} whileInView={...}>
 * ```
 *
 * Añade en index.css:
 * ```css
 * [data-animate] { visibility: hidden; }
 * html[data-preload-ready] [data-animate] { visibility: visible; }
 * ```
 */
export function usePreload(options: PreloadOptions = {}): PreloadState {
  const { timeout = 3000, debug = false, onReady } = options;
  const [isReady, setIsReady] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  const startTime = useRef(performance.now());
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevenir doble ejecución en React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const log = debug ? console.log.bind(console, '[Preload]') : () => {};

    log('Iniciando preload…');

    const timeoutPromise = new Promise<void>(resolve =>
      setTimeout(() => {
        log(`Timeout de ${timeout}ms alcanzado, continuando de todas formas.`);
        resolve();
      }, timeout)
    );

    const loadPromise = Promise.all([
      waitForFonts(),
      waitForViewportImages(),
    ]).then(() => undefined);

    // Race: el que llegue primero gana, pero nunca bloqueamos más de `timeout` ms
    Promise.race([loadPromise, timeoutPromise]).then(() => {
      const elapsed = Math.round(performance.now() - startTime.current);
      log(`Listo en ${elapsed}ms`);

      // 1. Marcar el documento como listo → CSS activa `visibility: visible`
      document.documentElement.setAttribute('data-preload-ready', 'true');

      // 2. Dar un frame al browser para que pinte el estado inicial correcto
      //    antes de que Framer Motion y ScrollTrigger empiecen a calcular
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // 3. Refrescar ScrollTrigger para que recalcule posiciones con el
          //    layout completo (fuentes e imágenes ya cargadas)
          try {
            ScrollTrigger.refresh();
            log('ScrollTrigger.refresh() ejecutado');
          } catch {
            // ScrollTrigger puede no estar inicializado aún en la primera carga
            log('ScrollTrigger no disponible todavía (normal en la carga inicial)');
          }

          setLoadTime(elapsed);
          setIsReady(true);
          onReady?.();
        });
      });
    });
  }, [debug, onReady, timeout]);

  return { isReady, loadTime };
}

// ─── Utilidad CSS helper ──────────────────────────────────────────────────────

/**
 * Reglas CSS que debes añadir a index.css para que el preload funcione
 * correctamente. Se exportan como referencia (no se aplican automáticamente).
 *
 * ```css
 * // Oculta elementos animados hasta que el preload esté listo
 * [data-animate] {
 *   visibility: hidden;
 * }
 *
 * // Los hace visibles cuando el preload termina
 * html[data-preload-ready] [data-animate] {
 *   visibility: visible;
 * }
 *
 * // Pantalla de carga (opcional)
 * .preload-overlay {
 *   position: fixed;
 *   inset: 0;
 *   z-index: 9999;
 *   background: white;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   transition: opacity 0.4s ease, visibility 0.4s ease;
 * }
 *
 * .preload-overlay.hidden {
 *   opacity: 0;
 *   visibility: hidden;
 *   pointer-events: none;
 * }
 * ```
 */
export const PRELOAD_CSS_HINT = `
/* ── Pegar en index.css ── */
[data-animate] { visibility: hidden; }
html[data-preload-ready] [data-animate] { visibility: visible; }
`;
