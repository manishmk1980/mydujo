import { useCallback, useEffect, useState } from 'react';
import { useFlashToast } from '../ui/FlashToast';
import { pushDataLayer } from '../../lib/dataLayer';
import { chatService, type ChatMessage, type ChatPresence, type ChatRole, type ChatThread } from '../../services/chatService';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';

const storageKey = 'mdpl_public_chat';
const defaultPresence: ChatPresence = { status: 'offline' };

export default function PublicChatWidget() {
  const toast = useFlashToast();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presence, setPresence] = useState<ChatPresence>(defaultPresence);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [role, setRole] = useState<ChatRole>('OTHER');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadPresence = useCallback(async () => {
    try {
      setPresence(await chatService.getPublicPresence());
    } catch {
      setPresence(defaultPresence);
    }
  }, []);

  const resume = useCallback(async () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const { id, token } = JSON.parse(saved);
      const data = await chatService.getPublicThread(id, token);
      setThread({ ...data.thread, public_token: token });
      setMessages(data.messages);
      if (data.presence) setPresence(data.presence);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => { void resume(); void loadPresence(); }, [resume, loadPresence]);

  useEffect(() => {
    if (!thread?.public_token) return;
    const timer = window.setInterval(() => { void resume(); void loadPresence(); }, 12000);
    return () => window.clearInterval(timer);
  }, [thread?.id, thread?.public_token, resume, loadPresence]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => { void loadPresence(); }, 30000);
    return () => window.clearInterval(timer);
  }, [open, loadPresence]);

  const feedback = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  };

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      const params = new URLSearchParams(location.search);
      const data = await chatService.createPublicThread({
        visitor_name: form.name,
        visitor_email: form.email || undefined,
        visitor_phone: form.phone || undefined,
        visitor_role: role,
        message_text: form.message,
        source_type: 'PUBLIC_WIDGET',
        source_page: location.href,
        campaign_source: document.referrer || undefined,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
      });
      setThread(data.thread);
      setMessages(data.messages);
      localStorage.setItem(storageKey, JSON.stringify({ id: data.thread.id, token: data.thread.public_token }));
      pushDataLayer('chat_thread_created', { chat_thread_id: data.thread.id, visitor_role: role, source_page: location.pathname });
      void loadPresence();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start chat');
    } finally {
      setBusy(false);
    }
  };

  const send = async (text: string, _internal: boolean, replyToMessageId?: string) => {
    if (!thread?.public_token) return;
    setBusy(true);
    setError('');
    try {
      const isUrl = /^https?:\/\//i.test(text);
      const data = await chatService.sendPublicMessage(
        thread.id,
        thread.public_token,
        text,
        isUrl ? 'URL' : 'TEXT',
        replyToMessageId,
      );
      setMessages((old) => [...old, data.message]);
      setReplyTo(null);
      setThread((old) => old ? { ...old, status: 'WAITING_FOR_ADMIN' } : old);
      pushDataLayer('chat_message_sent', { chat_thread_id: thread.id, message_type: isUrl ? 'URL' : 'TEXT' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to send message');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File) => {
    if (!thread?.public_token) return;
    setBusy(true);
    setError('');
    try {
      const data = await chatService.uploadPublic(thread.id, thread.public_token, file);
      setMessages((old) => [...old, data.message]);
      pushDataLayer('chat_attachment_uploaded', { chat_thread_id: thread.id, file_type: file.type });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to upload file');
    } finally {
      setBusy(false);
    }
  };

  const handoff = async () => {
    if (!thread?.public_token) return;
    try {
      await chatService.handoff(thread.id, thread.public_token);
      pushDataLayer('chat_handoff_requested', { chat_thread_id: thread.id });
      await resume();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to request handoff');
    }
  };

  return (
    <>
      {open && (
        <ChatWindow
          thread={thread}
          messages={messages}
          role={role}
          setRole={setRole}
          form={form}
          setForm={setForm}
          busy={busy}
          error={error}
          presence={presence}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onReply={setReplyTo}
          onFeedback={feedback}
          onStart={() => void start()}
          onSend={send}
          onUpload={(file) => void upload(file)}
          onHandoff={() => void handoff()}
        />
      )}
      <ChatLauncher
        open={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) {
            pushDataLayer('chat_widget_opened', { source_page: location.pathname });
            void loadPresence();
          }
        }}
      />
    </>
  );
}
