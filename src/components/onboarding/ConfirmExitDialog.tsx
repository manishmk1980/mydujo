import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmExitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmExitDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Leave this page?',
  message = 'You have unsaved changes. Are you sure you want to leave?',
  confirmLabel = 'Leave',
  cancelLabel = 'Stay',
}: ConfirmExitDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
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
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className="px-5 py-2.5 rounded-xl font-bold text-white transition-colors"
            style={{ backgroundColor: 'var(--mdpl-danger)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}