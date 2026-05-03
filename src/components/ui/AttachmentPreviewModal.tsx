import React from 'react';
import { X } from 'lucide-react';

type AttachmentPreviewModalProps = {
  url: string;
  onClose: () => void;
  title?: string;
};

function isPdfUrl(url: string) {
  return /\.pdf($|\?)/i.test(url);
}

export function AttachmentPreviewModal({ url, onClose, title = 'Attachment Preview' }: AttachmentPreviewModalProps) {
  const pdf = isPdfUrl(url);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-bold text-slate-900">{title}</div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto bg-slate-50 p-3">
          {pdf ? (
            <iframe src={url} title={title} className="h-[75vh] w-full rounded-lg border border-slate-200 bg-white" />
          ) : (
            <img src={url} alt="Payment attachment preview" className="mx-auto max-h-[75vh] rounded-lg border border-slate-200 bg-white" />
          )}
        </div>
      </div>
    </div>
  );
}

