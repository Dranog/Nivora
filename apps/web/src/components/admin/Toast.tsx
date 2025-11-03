'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function genId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const t = timers.current[id];
    if (t) {
      window.clearTimeout(t);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = genId();
    const duration = toast.duration ?? 5000;

    setToasts(prev => {
      const next = [...prev, { ...toast, id, duration }];
      // limite douce pour éviter l’empilement infini
      if (next.length > 6) next.shift();
      return next;
    });

    timers.current[id] = window.setTimeout(() => {
      hideToast(id);
    }, duration);
  }, [hideToast]);

  const clearToasts = useCallback(() => {
    Object.values(timers.current).forEach(t => window.clearTimeout(t));
    timers.current = {};
    setToasts([]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearToasts();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clearToasts]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearToasts }}>
      {children}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex w-[min(92vw,420px)] flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map(toast => (
          <ToastCard key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function TypeIcon({ type }: { type: ToastType }) {
  const cls = 'w-5 h-5 shrink-0';
  if (type === 'success') return <CheckCircle className={cls} aria-hidden={true} />;
  if (type === 'error') return <AlertCircle className={cls} aria-hidden={true} />;
  if (type === 'warning') return <AlertTriangle className={cls} aria-hidden={true} />;
  return <Info className={cls} aria-hidden={true} />;
}

function TypeBadge({ type }: { type: ToastType }) {
  const label =
    type === 'success' ? 'Succès' :
    type === 'error' ? 'Erreur' :
    type === 'warning' ? 'Alerte' : 'Info';

  const styles =
    type === 'success' ? 'bg-green-200 text-green-900' :
    type === 'error' ? 'bg-red-200 text-red-900' :
    type === 'warning' ? 'bg-yellow-200 text-yellow-900' :
    'bg-blue-200 text-blue-900';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-4 font-medium ${styles}`}>
      {label}
    </span>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  // Pause auto-dismiss au survol
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    let paused = false;

    const onEnter = () => {
      if (paused) return;
      paused = true;
      el.dataset.paused = 'true';
    };
    const onLeave = () => {
      if (!paused) return;
      paused = false;
      el.dataset.paused = 'false';
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Define background and text colors based on toast type
  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  return (
    <div
      ref={cardRef}
      role="status"
      aria-live="polite"
      className={`
        animate-in fade-in slide-in-from-top-5
        pointer-events-auto overflow-hidden rounded-2xl shadow-lg border-2
        ${getTypeStyles()}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 opacity-90">
          <TypeIcon type={toast.type} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="truncate font-semibold">{toast.title}</p>
            <TypeBadge type={toast.type} />
          </div>
          {toast.message ? (
            <p className="text-sm/5 opacity-95 break-words">{toast.message}</p>
          ) : null}

          {/* Boutons d'action */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-black/5 px-2.5 py-1.5 text-xs font-medium hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[.98]"
              aria-label="Fermer la notification"
            >
              OK
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded-xl p-1.5 opacity-60 hover:opacity-100 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[.98]"
          aria-label="Fermer"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
