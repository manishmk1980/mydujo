import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  title?: string;
  message?: string;
  saveLabel?: string;
  discardLabel?: string;
  cancelLabel?: string;
}

export function UnsavedChangesDialog({
  isOpen,
  onClose,
  onSaveDraft,
  onDiscard,
  title = 'Unsaved Changes',
  message = 'You have unsaved changes. Do you want to save them as a draft before leaving?',
  saveLabel = 'Save Draft',
  discardLabel = 'Discard',
  cancelLabel = 'Cancel',
}: UnsavedChangesDialogProps) {
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
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors order-3 sm:order-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onDiscard();
              onClose();
            }}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors order-2"
          >
            {discardLabel}
          </button>
          <button
            onClick={() => {
              onSaveDraft();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-white transition-colors order-1 sm:order-3 mdpl-onboarding-accent-bg"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}