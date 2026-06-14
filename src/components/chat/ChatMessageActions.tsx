import { useState } from 'react';
import { Copy, Forward, MoreHorizontal, Reply, Share2 } from 'lucide-react';
import type { ChatMessage } from '../../services/chatService';
import { copyMessageText, shareMessageText } from './chatUtils';

export function ChatMessageActions({
  message,
  onReply,
  onForward,
  onFeedback,
  allowForward = false,
}: {
  message: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onForward?: (message: ChatMessage) => void;
  onFeedback?: (message: string, type?: 'success' | 'error') => void;
  allowForward?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const text = message.message_text || message.attachments?.[0]?.file_name || '';

  const copy = async () => {
    try {
      await copyMessageText(text);
      onFeedback?.('Message copied');
      setOpen(false);
    } catch {
      onFeedback?.('Unable to copy message', 'error');
    }
  };

  const share = async () => {
    try {
      const result = await shareMessageText(text);
      onFeedback?.(result === 'shared' ? 'Message shared' : 'Message copied');
      setOpen(false);
    } catch {
      onFeedback?.('Unable to share message', 'error');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded p-1 opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-black/5"
        aria-label="Message actions"
      >
        <MoreHorizontal className="size-3.5" />
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-10" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-20 min-w-[132px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {onReply && (
              <button type="button" onClick={() => { onReply(message); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50">
                <Reply className="size-3.5" /> Reply
              </button>
            )}
            <button type="button" onClick={() => void copy()} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50">
              <Copy className="size-3.5" /> Copy
            </button>
            <button type="button" onClick={() => void share()} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50">
              <Share2 className="size-3.5" /> Share
            </button>
            {allowForward && onForward && (
              <button type="button" onClick={() => { onForward(message); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50">
                <Forward className="size-3.5" /> Forward
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
