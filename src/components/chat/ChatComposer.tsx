import { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import type { ChatMessage } from '../../services/chatService';
import { ChatAttachmentUploader } from './ChatAttachmentUploader';
import { ChatReplyPreview } from './ChatReplyPreview';

export function ChatComposer({
  onSend,
  onUpload,
  busy,
  allowInternal = false,
  replyTo,
  onCancelReply,
  adminTheme = false,
}: {
  onSend: (text: string, internal: boolean, replyToMessageId?: string) => Promise<void>;
  onUpload: (file: File) => void;
  busy?: boolean;
  allowInternal?: boolean;
  replyTo?: ChatMessage | null;
  onCancelReply?: () => void;
  adminTheme?: boolean;
}) {
  const [text, setText] = useState('');
  const [internal, setInternal] = useState(false);

  useEffect(() => {
    if (!allowInternal) setInternal(false);
  }, [allowInternal]);

  const submit = async () => {
    if (!text.trim() || busy) return;
    await onSend(text.trim(), internal, replyTo?.id);
    setText('');
    onCancelReply?.();
  };

  const borderClass = adminTheme ? 'border-[var(--admin-border)]' : 'border-slate-200';
  const surfaceClass = adminTheme ? 'bg-[var(--admin-surface)]' : 'bg-white';
  const buttonClass = adminTheme ? 'bg-[var(--admin-primary)]' : 'bg-orange-500';

  return (
    <div className={`border-t ${borderClass} ${surfaceClass} p-3`}>
      {replyTo && onCancelReply && <ChatReplyPreview message={replyTo} onCancel={onCancelReply} />}
      {allowInternal && (
        <label className="mb-2 flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
          Internal note (not visible to visitor)
        </label>
      )}
      <div className="flex items-end gap-2">
        <ChatAttachmentUploader onUpload={onUpload} busy={busy} />
        <textarea
          value={text}
          maxLength={4000}
          rows={1}
          placeholder={internal ? 'Add an internal note...' : replyTo ? 'Write your reply...' : 'Type a message or paste a URL...'}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit(); } }}
          className={`min-h-10 flex-1 resize-none rounded-xl border ${borderClass} px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400`}
        />
        <button
          type="button"
          disabled={busy || !text.trim()}
          onClick={() => void submit()}
          className={`rounded-xl ${buttonClass} p-2.5 text-white disabled:opacity-40`}
          aria-label="Send message"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
        </button>
      </div>
    </div>
  );
}
