import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Search, UserRound } from 'lucide-react';
import { useFlashToast } from '../../components/ui/FlashToast';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { ChatMessageList } from '../../components/chat/ChatMessageList';
import { ChatPresenceBadge } from '../../components/chat/ChatPresenceBadge';
import { formatRelativeTime, messagePreview, statusBadgeClass, threadWaitingForAdmin } from '../../components/chat/chatUtils';
import { pushDataLayer } from '../../lib/dataLayer';
import { chatService, type ChatMessage, type ChatPresence, type ChatStatus, type ChatThread } from '../../services/chatService';

const filters: Array<{ label: string; status?: ChatStatus; unread?: boolean; assignedSelf?: boolean; open?: boolean }> = [
  { label: 'New', status: 'NEW' },
  { label: 'Assigned to me', assignedSelf: true },
  { label: 'All open', open: true },
  { label: 'Waiting for admin', status: 'WAITING_FOR_ADMIN' },
  { label: 'Unread', unread: true },
  { label: 'Closed', status: 'CLOSED' },
];

const defaultPresence: ChatPresence = { status: 'offline' };

export default function AdminChat() {
  const toast = useFlashToast();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selected, setSelected] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presence, setPresence] = useState<ChatPresence>(defaultPresence);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]>({ label: 'All' });
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [admins, setAdmins] = useState<Array<{ id: string; display_name?: string; email: string; last_seen_at?: string | null }>>([]);

  const loadThreads = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.unread) params.set('unread', 'true');
    if (filter.assignedSelf) params.set('assigned_admin_id', 'self');
    if (filter.open) params.set('open', 'true');
    if (search.trim()) params.set('search', search.trim());
    try {
      setThreads((await chatService.listAdminThreads(`?${params}`)).threads);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load chats');
    }
  }, [filter, search]);

  const loadSelected = useCallback(async (id: string) => {
    try {
      const data = await chatService.getAdminThread(id);
      setSelected(data.thread);
      setMessages(data.messages);
      if (data.presence) setPresence(data.presence);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load conversation');
    }
  }, []);

  const loadPresence = useCallback(async () => {
    try {
      setPresence(await chatService.getAdminPresence());
    } catch {
      setPresence(defaultPresence);
    }
  }, []);

  useEffect(() => { void loadThreads(); }, [loadThreads]);
  useEffect(() => { void chatService.listAdmins().then((data) => setAdmins(data.admins)).catch(() => undefined); }, []);
  useEffect(() => {
    void chatService.sendAdminHeartbeat().catch(() => undefined);
    void loadPresence();
    const heartbeat = window.setInterval(() => { void chatService.sendAdminHeartbeat().catch(() => undefined); }, 60000);
    const refresh = window.setInterval(() => {
      void loadThreads();
      void loadPresence();
      if (selected) void loadSelected(selected.id);
    }, 12000);
    return () => {
      window.clearInterval(heartbeat);
      window.clearInterval(refresh);
    };
  }, [loadThreads, loadSelected, loadPresence, selected?.id]);

  const feedback = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  };

  const send = async (text: string, internal: boolean, replyToMessageId?: string) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const data = await chatService.sendAdminMessage(
        selected.id,
        text,
        internal,
        /^https?:\/\//i.test(text) ? 'URL' : 'TEXT',
        replyToMessageId,
      );
      setMessages((old) => [...old, data.message]);
      setReplyTo(null);
      if (!internal) pushDataLayer('admin_chat_replied', { chat_thread_id: selected.id });
      void loadThreads();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to reply');
    } finally {
      setBusy(false);
    }
  };

  const forward = async (message: ChatMessage) => {
    if (!selected) return;
    setBusy(true);
    try {
      const data = await chatService.forwardAdminMessage(selected.id, message.id, { as_internal_note: true });
      setMessages((old) => [...old, data.message]);
      feedback('Message forwarded as internal note');
    } catch (e) {
      feedback(e instanceof Error ? e.message : 'Unable to forward message', 'error');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File) => {
    if (!selected) return;
    setBusy(true);
    try {
      const data = await chatService.uploadAdmin(selected.id, file);
      setMessages((old) => [...old, data.message]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to upload');
    } finally {
      setBusy(false);
    }
  };

  const status = async (next: ChatStatus) => {
    if (!selected) return;
    const data = await chatService.updateStatus(selected.id, next);
    setSelected(data.thread);
    pushDataLayer(next === 'CLOSED' ? 'chat_thread_closed' : 'chat_thread_status_changed', { chat_thread_id: selected.id, status: next });
    void loadThreads();
  };

  const assignSelf = async () => {
    if (!selected) return;
    const data = await chatService.assign(selected.id, 'self');
    setSelected(data.thread);
    pushDataLayer('chat_thread_assigned', { chat_thread_id: selected.id, assigned_admin_id: data.thread.assigned_admin_id });
    void loadThreads();
  };

  const assignAdmin = async (adminId: string) => {
    if (!selected || !adminId) return;
    const data = await chatService.assign(selected.id, adminId);
    setSelected(data.thread);
    pushDataLayer('chat_thread_assigned', { chat_thread_id: selected.id, assigned_admin_id: adminId });
    void loadThreads();
  };

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--admin-text-muted)]">Operator status</span>
          <ChatPresenceBadge status={presence.status} />
          {presence.active_admin && (
            <span className="text-xs text-[var(--admin-text-muted)]">
              {presence.active_admin.display_name || presence.active_admin.email}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => { void loadThreads(); void loadPresence(); if (selected) void loadSelected(selected.id); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm font-bold text-[var(--admin-text)]"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter({ label: 'All' })} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter.label === 'All' ? 'bg-[var(--admin-primary)] text-white' : 'bg-[var(--admin-surface)] text-[var(--admin-text-muted)]'}`}>All</button>
        {filters.map((f) => (
          <button key={f.label} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter.label === f.label ? 'bg-[var(--admin-primary)] text-white' : 'bg-[var(--admin-surface)] text-[var(--admin-text-muted)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)] lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-[var(--admin-border)] lg:border-b-0 lg:border-r">
          <div className="relative border-b border-[var(--admin-border)] p-3">
            <Search className="absolute left-6 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, message"
              className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] py-2 pl-9 pr-3 text-sm text-[var(--admin-text)]"
            />
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => { setReplyTo(null); void loadSelected(thread.id); }}
                className={`w-full border-b border-[var(--admin-border)] p-4 text-left hover:bg-[var(--admin-surface-soft)] ${selected?.id === thread.id ? 'bg-[var(--admin-primary-soft)]' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="truncate text-sm text-[var(--admin-text)]">{thread.visitor_name}</strong>
                    <div className="truncate text-[11px] text-[var(--admin-text-muted)]">
                      {thread.visitor_email || thread.visitor_phone || 'No contact info'}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {Boolean(thread.unread_count) && (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">{thread.unread_count}</span>
                    )}
                    <span className="text-[10px] text-[var(--admin-text-muted)]">{formatRelativeTime(thread.last_message_at)}</span>
                  </div>
                </div>
                <div className="mt-1 truncate text-xs text-[var(--admin-text-muted)]">{messagePreview(thread.latest_message)}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge className={statusBadgeClass(thread.status)}>{thread.status.replaceAll('_', ' ')}</Badge>
                  {thread.assigned_admin && (
                    <Badge>
                      <UserRound className="mr-0.5 inline size-2.5" />
                      {thread.assigned_admin.display_name || thread.assigned_admin.email}
                    </Badge>
                  )}
                  {threadWaitingForAdmin(thread) && <Badge className="bg-orange-100 text-orange-800">Waiting</Badge>}
                </div>
              </button>
            ))}
            {!threads.length && (
              <div className="p-6 text-center text-sm text-[var(--admin-text-muted)]">No conversations match this filter.</div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[620px] min-w-0 flex-col bg-white">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500">
              Select a conversation to begin.
            </div>
          ) : (
            <>
              <header className="border-b border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-950">{selected.visitor_name}</h2>
                    <p className="text-xs text-slate-500">
                      {[selected.visitor_email, selected.visitor_phone].filter(Boolean).join(' · ') || 'No contact details'}
                      {selected.source_page ? ` · ${selected.source_page}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge className={statusBadgeClass(selected.status)}>{selected.status.replaceAll('_', ' ')}</Badge>
                      <ChatPresenceBadge status={presence.status} compact />
                      {selected.assigned_admin && (
                        <span className="text-xs text-slate-500">
                          Assigned: {selected.assigned_admin.display_name || selected.assigned_admin.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => void assignSelf()} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">Assign to self</button>
                    <select value={selected.assigned_admin_id || ''} onChange={(e) => void assignAdmin(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                      <option value="">Assign admin...</option>
                      {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.display_name || admin.email}</option>)}
                    </select>
                    <button onClick={() => void status('RESOLVED')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                      <CheckCircle2 className="size-3" />
                      Resolve
                    </button>
                    <button onClick={() => void status(selected.status === 'CLOSED' ? 'OPEN' : 'CLOSED')} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                      {selected.status === 'CLOSED' ? 'Reopen' : 'Close'}
                    </button>
                  </div>
                </div>
                {threadWaitingForAdmin(selected) && (
                  <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">
                    Visitor is waiting for an admin reply.
                  </div>
                )}
              </header>
              <ChatMessageList
                messages={messages}
                adminView
                onReply={setReplyTo}
                onForward={(message) => void forward(message)}
                onFeedback={feedback}
              />
              <ChatComposer
                busy={busy}
                allowInternal
                adminTheme
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onSend={send}
                onUpload={(file) => void upload(file)}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full bg-[var(--admin-surface-soft)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--admin-text-muted)] ${className}`}>
      {children}
    </span>
  );
}
