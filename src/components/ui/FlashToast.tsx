import React, { createContext, useCallback, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface FlashToastContextValue {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const FlashToastContext = createContext<FlashToastContextValue | null>(null);

export function useFlashToast() {
  const ctx = useContext(FlashToastContext);
  if (!ctx) {
    return {
      show: (msg: string) => console.warn('FlashToast not mounted, message:', msg),
      success: (msg: string) => console.warn('FlashToast not mounted, success:', msg),
      error: (msg: string) => console.warn('FlashToast not mounted, error:', msg),
    };
  }
  return ctx;
}

interface FlashToastProviderProps {
  children: React.ReactNode;
}

/** Provider + renderer for success/error toasts. Wrap app or layout. */
export function FlashToastProvider({ children }: FlashToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((message: string) => show(message, 'success'), [show]);
  const error = useCallback((message: string) => show(message, 'error'), [show]);

  return (
    <FlashToastContext.Provider value={{ show, success, error }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg pointer-events-auto',
                t.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              )}
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="size-5 shrink-0 text-red-600" />
              )}
              <span className="text-sm font-medium">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlashToastContext.Provider>
  );
}
