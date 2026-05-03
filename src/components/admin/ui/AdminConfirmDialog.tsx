import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../lib/utils';

export type AdminConfirmVariant = 'default' | 'warning' | 'danger' | 'success';

export interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Optional body between description and actions (e.g. form fields). */
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AdminConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

const variantStyles: Record<AdminConfirmVariant, { confirm: string; ring: string; bg: string }> = {
  default: {
    confirm: 'bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-hover)] shadow-sm',
    ring: 'ring-[var(--admin-primary)]/25',
    bg: 'bg-[var(--admin-primary)]/10',
  },
  warning: {
    confirm: 'bg-[var(--admin-warning)] text-white hover:opacity-90 shadow-sm',
    ring: 'ring-[var(--admin-warning)]/30',
    bg: 'bg-[var(--admin-warning)]/10',
  },
  danger: {
    confirm: 'bg-[var(--admin-danger)] text-white hover:opacity-90 shadow-sm',
    ring: 'ring-[var(--admin-danger)]/25',
    bg: 'bg-[var(--admin-danger)]/10',
  },
  success: {
    confirm: 'bg-[var(--admin-success)] text-white hover:opacity-90 shadow-sm',
    ring: 'ring-[var(--admin-success)]/25',
    bg: 'bg-[var(--admin-success)]/10',
  },
};

export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
}: AdminConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const styles = variantStyles[variant];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onOpenChange]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onOpenChange(false);
      }}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          'relative z-10 w-full max-w-md rounded-[var(--admin-radius-card)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-2xl shadow-slate-900/10',
          'ring-2',
          styles.ring
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-bold text-[var(--admin-text)] font-['Space_Grotesk',sans-serif]">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm text-[var(--admin-text-muted)] leading-relaxed">
          {description}
        </p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            className="rounded-[var(--admin-radius-control)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-surface-soft)] disabled:opacity-50"
            onClick={() => !loading && onOpenChange(false)}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            className={cn(
              "rounded-[var(--admin-radius-control)] px-4 py-2.5 text-sm font-bold font-['Space_Grotesk',sans-serif] transition-colors disabled:opacity-60",
              styles.confirm
            )}
            onClick={() => void onConfirm()}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
