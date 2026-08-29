'use client';

// TYPES //
import type { ReactNode } from 'react';

// LIBRARIES //
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ToastToneData = 'success' | 'error' | 'info';

interface ToastData {
  id: number;
  title: string;
  description: string | null;
  tone: ToastToneData;
}

interface ToastContextData {
  showToast: (toast: { title: string; description?: string; tone?: ToastToneData }) => void;
}

const ToastContext = createContext<ToastContextData | null>(null);

/** How long a toast stays on screen before dismissing itself. */
const TOAST_TIMEOUT_MS = 5000;

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provides toast notifications to the admin app.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  // Define Navigation

  // Define Context

  // Define Refs

  // Define States
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Helper Functions
  /**
   * Removes a toast by id.
   */
  const dismissToast = useCallback((id: number): void => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Queues a toast for display.
   */
  const showToast = useCallback(
    ({
      title,
      description,
      tone = 'info',
    }: {
      title: string;
      description?: string;
      tone?: ToastToneData;
    }): void => {
      setToasts((currentToasts) => [
        ...currentToasts,
        { id: Date.now() + Math.random(), title, description: description ?? null, tone },
      ]);
    },
    [],
  );

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  // Use Effects

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-atomic="false"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} onDismiss={() => dismissToast(toast.id)} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastCardProps {
  toast: ToastData;
  onDismiss: () => void;
}

/**
 * Renders a single toast and dismisses it after the timeout.
 */
function ToastCard({ toast, onDismiss }: ToastCardProps) {
  // Define Navigation

  // Define Context

  // Define Refs

  // Define States

  // Helper Functions
  const toneClassName =
    toast.tone === 'error'
      ? 'border-danger'
      : toast.tone === 'success'
        ? 'border-accent'
        : 'border-rule';

  // Use Effects
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, TOAST_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 border border-rule bg-paper px-4 py-3 ${toneClassName}`}
      role={toast.tone === 'error' ? 'alert' : 'status'}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-ink">{toast.title}</p>
        {toast.description ? (
          <p className="text-sm leading-5 text-ink-muted">{toast.description}</p>
        ) : null}
      </div>

      <button
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-ink-muted transition-colors hover:text-ink"
        onClick={onDismiss}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="16"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Reads the toast context.
 * @returns Toast controls
 */
export function useToast(): ToastContextData {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider.');
  }

  return context;
}
