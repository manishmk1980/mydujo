import type { ChatMessage, ChatPresenceStatus, ChatStatus, ChatThread } from '../../services/chatService';

export function formatChatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatChatDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

export function formatRelativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatChatDate(value);
}

export function groupMessagesByDate(messages: ChatMessage[]) {
  const groups: Array<{ date: string; messages: ChatMessage[] }> = [];
  for (const message of messages) {
    const date = formatChatDate(message.created_at);
    const last = groups[groups.length - 1];
    if (last?.date === date) last.messages.push(message);
    else groups.push({ date, messages: [message] });
  }
  return groups;
}

export function getSenderLabel(message: ChatMessage, adminView = false) {
  if (message.sender_type === 'ADMIN') return 'MDPL Support';
  if (message.sender_type === 'BOT') return 'MDPL Assistant';
  if (message.sender_type === 'SYSTEM') return 'System';
  if (message.sender_type === 'VISITOR') return adminView ? 'Visitor' : 'You';
  return message.sender_type.replaceAll('_', ' ');
}

export function presenceLabel(status: ChatPresenceStatus) {
  if (status === 'online') return 'Admin online';
  if (status === 'away') return 'Admin away';
  return 'Currently offline';
}

export function presenceBadgeClass(status: ChatPresenceStatus) {
  if (status === 'online') return 'bg-emerald-500/15 text-emerald-700 border-emerald-200';
  if (status === 'away') return 'bg-amber-500/15 text-amber-800 border-amber-200';
  return 'bg-slate-500/10 text-slate-600 border-slate-200';
}

export function threadWaitingForAdmin(thread?: ChatThread | null) {
  if (!thread) return false;
  return ['NEW', 'WAITING_FOR_ADMIN'].includes(thread.status);
}

export function statusBadgeClass(status: ChatStatus | string) {
  const map: Record<string, string> = {
    NEW: 'bg-sky-100 text-sky-800',
    OPEN: 'bg-blue-100 text-blue-800',
    ASSIGNED: 'bg-indigo-100 text-indigo-800',
    WAITING_FOR_VISITOR: 'bg-violet-100 text-violet-800',
    WAITING_FOR_ADMIN: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-emerald-100 text-emerald-800',
    CLOSED: 'bg-slate-200 text-slate-700',
    SPAM: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

export function messagePreview(message?: ChatMessage | null) {
  if (!message) return 'No messages yet';
  if (message.message_type === 'URL') return message.message_text || 'Link shared';
  if (message.attachments?.length) return `Attachment: ${message.attachments[0].file_name}`;
  return message.message_text || 'Message';
}

export async function copyMessageText(text: string) {
  await navigator.clipboard.writeText(text);
}

export async function shareMessageText(text: string, title = 'MDPL Chat message') {
  if (navigator.share) {
    await navigator.share({ title, text });
    return 'shared';
  }
  await copyMessageText(text);
  return 'copied';
}

export function bubbleClass(message: ChatMessage, mine: boolean, adminView = false) {
  if (message.is_internal) return 'border border-amber-300 bg-amber-50 text-amber-950';
  if (message.sender_type === 'SYSTEM') return 'border border-slate-200 bg-slate-50 text-slate-700';
  if (message.sender_type === 'BOT') return 'border border-orange-200 bg-orange-50 text-orange-950';
  if (mine) return adminView ? 'bg-[var(--admin-primary)] text-white' : 'bg-orange-500 text-white';
  return adminView ? 'border border-slate-200 bg-white text-slate-900' : 'border border-slate-200 bg-slate-50 text-slate-900';
}
