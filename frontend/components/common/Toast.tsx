'use client';

import React, { createContext, useCallback, useContext, useReducer, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Toast } from '../../features/chat/types/chat';

/* ── Context ──────────────────────────────────────────── */
interface ToastCtx {
  toasts: Toast[];
  addToast: (msg: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

/* ── Reducer ──────────────────────────────────────────── */
type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string };

function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast];
    case 'REMOVE': return state.filter((t) => t.id !== action.id);
    default:       return state;
  }
}

/* ── Provider ─────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
    dispatch({ type: 'REMOVE', id });
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    dispatch({ type: 'ADD', toast: { id, message, type, duration } });
    const timer = setTimeout(() => removeToast(id), duration);
    timers.current.set(id, timer);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastPortal toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

/* ── Icon map ─────────────────────────────────────────── */
const icons: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
  error:   <XCircle      className="w-4 h-4 text-red-400 flex-shrink-0" />,
  info:    <Info         className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--k-accent-text)' }} />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
};

const borderColors: Record<Toast['type'], string> = {
  success: 'rgba(16,185,129,0.25)',
  error:   'rgba(239,68,68,0.25)',
  info:    'var(--k-accent-border)',
  warning: 'rgba(245,158,11,0.25)',
};

/* ── Toast item ───────────────────────────────────────── */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  return (
    <div
      className="flex items-center space-x-3 px-4 py-3 rounded-xl min-w-[220px] max-w-[340px] animate-toast-in"
      style={{
        background: 'var(--k-surface)',
        border: `1px solid ${borderColors[toast.type]}`,
        boxShadow: 'var(--k-shadow-md)',
        backdropFilter: 'blur(12px)',
      }}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--k-text)' }}>
        {toast.message}
      </span>
      <button
        onClick={onRemove}
        aria-label="Dismiss notification"
        className="p-0.5 rounded-md k-transition"
        style={{ color: 'var(--k-text-3)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--k-text)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--k-text-3)')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Portal / container ──────────────────────────────── */
function ToastPortal({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center space-y-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={() => onRemove(t.id)} />
        </div>
      ))}
    </div>
  );
}
