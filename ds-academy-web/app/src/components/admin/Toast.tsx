'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

/** The prototype's bottom-centre toast, promoted to a real notifier. */
type Toast = { text: string; tone: 'ok' | 'bad' };

const ToastCtx = createContext<(text: string, tone?: 'ok' | 'bad') => void>(() => {});

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const push = useCallback((text: string, tone: 'ok' | 'bad' = 'ok') => {
    setToast({ text, tone });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[10px] px-5 py-[11px] text-[13px] text-white shadow-pop transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'
        } ${toast?.tone === 'bad' ? 'bg-bad' : 'bg-navy'}`}
      >
        {toast?.text ?? ''}
      </div>
    </ToastCtx.Provider>
  );
}
