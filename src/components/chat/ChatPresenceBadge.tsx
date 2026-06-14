import type { ChatPresenceStatus } from '../../services/chatService';
import { presenceBadgeClass, presenceLabel } from './chatUtils';

export function ChatPresenceBadge({ status, compact = false }: { status: ChatPresenceStatus; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${presenceBadgeClass(status)}`}>
      <span className={`size-1.5 rounded-full ${status === 'online' ? 'bg-emerald-500' : status === 'away' ? 'bg-amber-500' : 'bg-slate-400'}`} />
      {compact ? status : presenceLabel(status)}
    </span>
  );
}
