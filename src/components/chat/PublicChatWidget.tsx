import { useEffect, useState } from 'react';
import { pushDataLayer } from '../../lib/dataLayer';
import { chatService, type ChatMessage, type ChatRole, type ChatThread } from '../../services/chatService';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';

const storageKey = 'mdpl_public_chat';

export default function PublicChatWidget() {
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [role, setRole] = useState<ChatRole>('OTHER');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const resume = async () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const { id, token } = JSON.parse(saved);
      const data = await chatService.getPublicThread(id, token);
      setThread({ ...data.thread, public_token: token }); setMessages(data.messages);
    } catch { localStorage.removeItem(storageKey); }
  };
  useEffect(() => { void resume(); }, []);
  useEffect(() => {
    if (!thread?.public_token) return;
    const timer = window.setInterval(() => void resume(), 12000);
    return () => window.clearInterval(timer);
  }, [thread?.id, thread?.public_token]);

  const start = async () => {
    setBusy(true); setError('');
    try {
      const params = new URLSearchParams(location.search);
      const data = await chatService.createPublicThread({
        visitor_name: form.name, visitor_email: form.email || undefined, visitor_phone: form.phone || undefined, visitor_role: role,
        message_text: form.message, source_type: 'PUBLIC_WIDGET', source_page: location.href, campaign_source: document.referrer || undefined,
        utm_source: params.get('utm_source'), utm_medium: params.get('utm_medium'), utm_campaign: params.get('utm_campaign'),
      });
      setThread(data.thread); setMessages(data.messages);
      localStorage.setItem(storageKey, JSON.stringify({ id: data.thread.id, token: data.thread.public_token }));
      pushDataLayer('chat_thread_created', { chat_thread_id: data.thread.id, visitor_role: role, source_page: location.pathname });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to start chat'); } finally { setBusy(false); }
  };
  const send = async (text: string) => {
    if (!thread?.public_token) return;
    setBusy(true); setError('');
    try {
      const isUrl = /^https?:\/\//i.test(text);
      const data = await chatService.sendPublicMessage(thread.id, thread.public_token, text, isUrl ? 'URL' : 'TEXT');
      setMessages((old) => [...old, data.message]); pushDataLayer('chat_message_sent', { chat_thread_id: thread.id, message_type: isUrl ? 'URL' : 'TEXT' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send message'); } finally { setBusy(false); }
  };
  const upload = async (file: File) => {
    if (!thread?.public_token) return;
    setBusy(true); setError('');
    try {
      const data = await chatService.uploadPublic(thread.id, thread.public_token, file);
      setMessages((old) => [...old, data.message]); pushDataLayer('chat_attachment_uploaded', { chat_thread_id: thread.id, file_type: file.type });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to upload file'); } finally { setBusy(false); }
  };
  const handoff = async () => {
    if (!thread?.public_token) return;
    try { await chatService.handoff(thread.id, thread.public_token); pushDataLayer('chat_handoff_requested', { chat_thread_id: thread.id }); await resume(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to request handoff'); }
  };

  return (
    <>
      {open && <ChatWindow thread={thread} messages={messages} role={role} setRole={setRole} form={form} setForm={setForm} busy={busy} error={error} onStart={() => void start()} onSend={send} onUpload={(file) => void upload(file)} onHandoff={() => void handoff()} />}
      <ChatLauncher open={open} onClick={() => { setOpen((v) => !v); if (!open) pushDataLayer('chat_widget_opened', { source_page: location.pathname }); }} />
    </>
  );
}
