import React, { useEffect, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ConfirmSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  summary?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submittingLabel?: string;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function ConfirmSubmitDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Submit Registration',
  message = 'Are you sure you want to submit your registration? You cannot edit after submission.',
  summary,
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  submittingLabel = 'Submitting...',
  returnFocusRef,
}: ConfirmSubmitDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const target = returnFocusRef?.current || previousFocusRef.current;
      target?.focus();
    };
  }, [isOpen, isSubmitting, onClose, returnFocusRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-submit-title"
        aria-describedby="confirm-submit-message"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-2 text-green-600">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 id="confirm-submit-title" className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)]"
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <p id="confirm-submit-message" className="text-slate-600">{message}</p>
          {summary ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{summary}</div> : null}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mdpl-accent)] disabled:cursor-not-allowed disabled:opacity-50 mdpl-onboarding-accent-bg"
          >
            {isSubmitting ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {submittingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
