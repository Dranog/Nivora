// apps/web/src/components/admin/LoadingScreen.tsx :

'use client';

import { useEffect } from 'react';

export function LoadingScreen() {
  useEffect(() => {
    console.log('[LoadingScreen] 🔄 Loading screen displayed');
    const startTime = Date.now();

    // Log if loading takes too long
    const timeoutId = setTimeout(() => {
      const duration = Date.now() - startTime;
      console.warn('[LoadingScreen] ⚠️ Loading screen visible for', duration, 'ms - possible stuck state');
      console.warn('[LoadingScreen] 💡 Check browser console for auth check logs');
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.log('[LoadingScreen] ✅ Loading screen hidden after', duration, 'ms');
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-background/80 backdrop-blur-sm text-foreground"
      role="status"
      aria-live="polite"
      aria-label="Vérification de l'authentification"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg font-semibold">Vérification de l'authentification…</span>
        </div>

        <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 animate-[oliver-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-brand-start to-brand-end" />
        </div>
      </div>

      <style jsx>{`
        @keyframes oliver-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
