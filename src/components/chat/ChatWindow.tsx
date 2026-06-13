import { ExternalLink, MessageCircle } from 'lucide-react';
import type { ChatMessage, ChatRole, ChatThread } from '../../services/chatService';
import { ChatComposer } from './ChatComposer';
import { ChatMessageList } from './ChatMessageList';

export const quickOptions: Array<{ label: string; role: ChatRole; link?: string }> = [
  { label: 'I want to enroll as student', role: 'STUDENT', link: '/register/student' },
  { label: 'I am a parent', role: 'PARENT', link: '/join-mydojo' },
  { label: 'I am an instructor', role: 'INSTRUCTOR', link: '/register/instructor' },
  { label: 'I represent an academy', role: 'ACADEMY', link: '/academy' },
  { label: 'I need fee/payment help', role: 'STUDENT', link: '/student/login' },
];

export function ChatWindow({ thread, messages, role, setRole, form, setForm, busy, error, onStart, onSend, onUpload, onHandoff }: {
  thread: ChatThread | null; messages: ChatMessage[]; role: ChatRole; setRole: (role: ChatRole) => void;
  form: { name: string; email: string; phone: string; message: string }; setForm: (form: { name: string; email: string; phone: string; message: string }) => void;
  busy: boolean; error: string; onStart: () => void; onSend: (text: string) => Promise<void>; onUpload: (file: File) => void; onHandoff: () => void;
}) {
  return (
    <section className="fixed bottom-24 right-4 z-[69] flex h-[min(620px,calc(100vh-120px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      <header className="bg-slate-950 px-4 py-4 text-white">
        <div className="flex items-center gap-2 font-bold"><MessageCircle className="size-5 text-orange-400" /> MDPL Chat</div>
        <p className="mt-1 text-xs text-slate-300">Human support, with quick guidance while you wait.</p>
      </header>
      {!thread ? (
        <div className="flex-1 overflow-y-auto p-4 text-slate-900">
          <p className="text-sm font-semibold">How can we help?</p>
          <div className="mt-3 grid gap-2">
            {quickOptions.map((option) => (
              <button key={option.label} type="button" onClick={() => { setRole(option.role); setForm({ ...form, message: option.label }); }}
                className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold ${form.message === option.label ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}>
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name *" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can the MDPL team help? *" rows={3} maxLength={4000} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button type="button" disabled={busy} onClick={onStart} className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Talk to MDPL team</button>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickOptions.filter((o) => o.link).map((o) => <a key={o.label} href={o.link} className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 hover:underline">{o.label}<ExternalLink className="size-3" /></a>)}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-xs text-slate-600">
            <span>{thread.status.replaceAll('_', ' ')}</span>
            <button type="button" onClick={onHandoff} className="font-bold text-orange-700">Talk to team</button>
          </div>
          <ChatMessageList messages={messages} />
          {error && <p className="px-4 py-1 text-xs text-red-600">{error}</p>}
          <ChatComposer busy={busy} onSend={(text) => onSend(text)} onUpload={onUpload} />
        </>
      )}
    </section>
  );
}
