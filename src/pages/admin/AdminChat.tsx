import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Search } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { ChatMessageList } from '../../components/chat/ChatMessageList';
import { pushDataLayer } from '../../lib/dataLayer';
import { chatService, type ChatMessage, type ChatStatus, type ChatThread } from '../../services/chatService';

const filters: Array<{ label: string; status?: ChatStatus; unread?: boolean; assignedSelf?: boolean; open?: boolean }> = [
  { label: 'New', status: 'NEW' }, { label: 'Assigned to me', assignedSelf: true }, { label: 'All open', open: true }, { label: 'Waiting for admin', status: 'WAITING_FOR_ADMIN' },
  { label: 'Unread', unread: true }, { label: 'Closed', status: 'CLOSED' },
];

export default function AdminChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selected, setSelected] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>({ label: 'All' });
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [admins, setAdmins] = useState<Array<{ id: string; display_name?: string; email: string }>>([]);

  const loadThreads = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.unread) params.set('unread', 'true');
    if (filter.assignedSelf) params.set('assigned_admin_id', 'self');
    if (filter.open) params.set('open', 'true');
    if (search.trim()) params.set('search', search.trim());
    try { setThreads((await chatService.listAdminThreads(`?${params}`)).threads); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load chats'); }
  }, [filter, search]);
  const loadSelected = useCallback(async (id: string) => {
    try { const data = await chatService.getAdminThread(id); setSelected(data.thread); setMessages(data.messages); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load conversation'); }
  }, []);
  useEffect(() => { void loadThreads(); }, [loadThreads]);
  useEffect(() => { void chatService.listAdmins().then((data) => setAdmins(data.admins)).catch(() => undefined); }, []);
  useEffect(() => {
    const timer = window.setInterval(() => { void loadThreads(); if (selected) void loadSelected(selected.id); }, 12000);
    return () => window.clearInterval(timer);
  }, [loadThreads, loadSelected, selected?.id]);

  const send = async (text: string, internal: boolean) => {
    if (!selected) return;
    setBusy(true); setError('');
    try {
      const data = await chatService.sendAdminMessage(selected.id, text, internal, /^https?:\/\//i.test(text) ? 'URL' : 'TEXT');
      setMessages((old) => [...old, data.message]);
      if (!internal) pushDataLayer('admin_chat_replied', { chat_thread_id: selected.id });
      void loadThreads();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to reply'); } finally { setBusy(false); }
  };
  const upload = async (file: File) => {
    if (!selected) return;
    setBusy(true);
    try { const data = await chatService.uploadAdmin(selected.id, file); setMessages((old) => [...old, data.message]); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to upload'); } finally { setBusy(false); }
  };
  const status = async (next: ChatStatus) => {
    if (!selected) return;
    const data = await chatService.updateStatus(selected.id, next);
    setSelected(data.thread); pushDataLayer(next === 'CLOSED' ? 'chat_thread_closed' : 'chat_thread_status_changed', { chat_thread_id: selected.id, status: next }); void loadThreads();
  };
  const assignSelf = async () => {
    if (!selected) return;
    const data = await chatService.assign(selected.id, 'self');
    setSelected(data.thread); pushDataLayer('chat_thread_assigned', { chat_thread_id: selected.id, assigned_admin_id: data.thread.assigned_admin_id }); void loadThreads();
  };
  const assignAdmin = async (adminId: string) => {
    if (!selected || !adminId) return;
    const data = await chatService.assign(selected.id, adminId);
    setSelected(data.thread); pushDataLayer('chat_thread_assigned', { chat_thread_id: selected.id, assigned_admin_id: adminId }); void loadThreads();
  };

  return (
    <div className="min-w-0">
      <AdminPageHeader title="Chat & enquiries" subtitle="Respond to public conversations, assign ownership, and manage handoffs." actions={
        <button type="button" onClick={() => void loadThreads()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm font-bold text-[var(--admin-text)]"><RefreshCw className="size-4" /> Refresh</button>
      } />
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter({ label: 'All' })} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter.label === 'All' ? 'bg-[var(--admin-primary)] text-white' : 'bg-[var(--admin-surface)] text-[var(--admin-text-muted)]'}`}>All</button>
        {filters.map((f) => <button key={f.label} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter.label === f.label ? 'bg-[var(--admin-primary)] text-white' : 'bg-[var(--admin-surface)] text-[var(--admin-text-muted)]'}`}>{f.label}</button>)}
      </div>
      {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-card)] lg:grid-cols-[340px_1fr]">
        <aside className="border-b border-[var(--admin-border)] lg:border-b-0 lg:border-r">
          <div className="relative border-b border-[var(--admin-border)] p-3">
            <Search className="absolute left-6 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone, message" className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] py-2 pl-9 pr-3 text-sm text-[var(--admin-text)]" />
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {threads.map((thread) => (
              <button key={thread.id} type="button" onClick={() => void loadSelected(thread.id)} className={`w-full border-b border-[var(--admin-border)] p-4 text-left hover:bg-[var(--admin-surface-soft)] ${selected?.id === thread.id ? 'bg-[var(--admin-primary-soft)]' : ''}`}>
                <div className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-[var(--admin-text)]">{thread.visitor_name}</strong>{Boolean(thread.unread_count) && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">{thread.unread_count}</span>}</div>
                <div className="mt-1 truncate text-xs text-[var(--admin-text-muted)]">{thread.latest_message?.message_text || thread.subject || 'No preview'}</div>
                <div className="mt-2 flex flex-wrap gap-1"><Badge>{thread.visitor_role}</Badge><Badge>{thread.status.replaceAll('_', ' ')}</Badge><Badge>{thread.priority}</Badge></div>
              </button>
            ))}
          </div>
        </aside>
        <section className="flex min-h-[620px] min-w-0 flex-col bg-white">
          {!selected ? <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500">Select a conversation to begin.</div> : <>
            <header className="border-b border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-bold text-slate-950">{selected.visitor_name}</h2><p className="text-xs text-slate-500">{selected.visitor_email || selected.visitor_phone} · {selected.source_page || 'Unknown source'}</p></div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => void assignSelf()} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">Assign to self</button>
                  <select value={selected.assigned_admin_id || ''} onChange={(e) => void assignAdmin(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
                    <option value="">Assign admin...</option>
                    {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.display_name || admin.email}</option>)}
                  </select>
                  <button onClick={() => void status('RESOLVED')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white"><CheckCircle2 className="size-3" /> Resolve</button>
                  <button onClick={() => void status(selected.status === 'CLOSED' ? 'OPEN' : 'CLOSED')} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700">{selected.status === 'CLOSED' ? 'Reopen' : 'Close'}</button>
                </div>
              </div>
            </header>
            <ChatMessageList messages={messages} adminView />
            <ChatComposer busy={busy} onSend={send} onUpload={(file) => void upload(file)} allowInternal />
          </>}
        </section>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[var(--admin-surface-soft)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--admin-text-muted)]">{children}</span>;
}
