import { useState } from 'react';
import { Send } from 'lucide-react';
import { ChatAttachmentUploader } from './ChatAttachmentUploader';

export function ChatComposer({ onSend, onUpload, busy, allowInternal = false }: { onSend: (text: string, internal: boolean) => Promise<void>; onUpload: (file: File) => void; busy?: boolean; allowInternal?: boolean }) {
  const [text, setText] = useState('');
  const [internal, setInternal] = useState(false);
  const submit = async () => { if (!text.trim() || busy) return; await onSend(text.trim(), internal); setText(''); };
  return (
    <div className="border-t border-slate-200 bg-white p-3">
      {allowInternal && <label className="mb-2 flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note</label>}
      <div className="flex items-end gap-2">
        <ChatAttachmentUploader onUpload={onUpload} busy={busy} />
        <textarea value={text} maxLength={4000} rows={1} placeholder={internal ? 'Add an internal note...' : 'Type a message or paste a URL...'} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit(); } }}
          className="min-h-10 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400" />
        <button type="button" disabled={busy || !text.trim()} onClick={() => void submit()} className="rounded-xl bg-orange-500 p-2.5 text-white disabled:opacity-40"><Send className="size-5" /></button>
      </div>
    </div>
  );
}
