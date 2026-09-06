import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const VARIANTS = {
  success: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100',
  error: 'border-red-500/40 bg-red-500/15 text-red-950 dark:text-red-100',
  warning: 'border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-100',
  info: 'border-accent/40 bg-accent/15 text-ink',
};

const DURATIONS = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, { variant = 'info', duration } = {}) => {
    if (!message) return null;
    const id = ++idCounter;
    const ttl = duration ?? DURATIONS[variant] ?? 5000;
    setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
    window.setTimeout(() => dismiss(id), ttl);
    return id;
  }, [dismiss]);

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      toast: push,
      success: (message, opts) => push(message, { ...opts, variant: 'success' }),
      error: (message, opts) => push(message, { ...opts, variant: 'error' }),
      warning: (message, opts) => push(message, { ...opts, variant: 'warning' }),
      info: (message, opts) => push(message, { ...opts, variant: 'info' }),
    }),
    [toasts, dismiss, push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg motion-safe animate-message-in ${VARIANTS[toast.variant] || VARIANTS.info}`}
            role="status"
          >
            <div className="flex items-start gap-3">
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-xs opacity-80 hover:opacity-100"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
