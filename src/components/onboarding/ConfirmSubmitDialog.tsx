import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ConfirmSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}

export function ConfirmSubmitDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Submit Registration',
  message = 'Are you sure you want to submit your registration? You cannot edit after submission.',
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
}: ConfirmSubmitDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            disabled={isSubmitting}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-bold text-white transition-colors disabled:opacity-50 flex items-center gap-2 mdpl-onboarding-accent-bg"
          >
            {isSubmitting ? (
              <>
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
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