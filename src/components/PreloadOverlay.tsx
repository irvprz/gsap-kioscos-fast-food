import { usePreload } from '../hooks/usePreload';

/**
 * Overlay component that shows a loading animation while the preload hook
 * guarantees that all critical assets are ready before the initial scroll.
 */
export function PreloadOverlay() {
  // Using a timeout of 4 seconds just in case some heavy image gets stuck
  const { isReady } = usePreload({ timeout: 4000 });

  return (
    <div className={`preload-overlay ${isReady ? 'is-hidden' : ''}`}>
      {/* Brand logo or text during preload */}
      <div className="font-display font-bold text-3xl tracking-tight text-ink animate-pulse">
        Kiosk<span className="text-brand">Food</span>
      </div>

      {/* Progress bar */}
      <div className="preload-bar-track">
        <div className="preload-bar-fill"></div>
      </div>
    </div>
  );
}
