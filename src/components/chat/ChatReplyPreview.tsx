import { X } from 'lucide-react';
import type { ChatMessage } from '../../services/chatService';
import { getSenderLabel, messagePreview } from './chatUtils';

export function ChatReplyPreview({ message, onCancel }: { message: ChatMessage; onCancel: () => void }) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-950">
      <div className="min-w-0 flex-1 border-l-2 border-orange-400 pl-2">
        <div className="font-bold">Replying to {getSenderLabel(message)}</div>
        <div className="truncate opacity-80">{messagePreview(message)}</div>
      </div>
      <button type="button" onClick={onCancel} className="rounded p-1 hover:bg-orange-100" aria-label="Cancel reply">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function ChatQuotedMessage({ message, adminView = false }: { message: ChatMessage; adminView?: boolean }) {
  return (
    <div className="mb-2 rounded-lg border border-current/15 bg-black/5 px-2 py-1.5 text-[11px]">
      <div className="font-bold opacity-80">{getSenderLabel(message, adminView)}</div>
      <div className="truncate opacity-70">{messagePreview(message)}</div>
    </div>
  );
}
