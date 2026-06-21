import { useEffect, useState } from 'react';
import { Loader2, MessageSquareText, RefreshCw } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { ChatMessageList } from '../../components/chat/ChatMessageList';
import { chatService, type ChatMessage, type ChatThread } from '../../services/chatService';

export default function InstructorMessages() {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const data = await chatService.getInstructorThread();
      setThread(data.thread);
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const send = async (text: string) => {
    setBusy(true);
    try {
      const data = await chatService.sendInstructorMessage(text);
      setThread(data.thread);
      setMessages((previous) => [...previous, data.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Messages"
        description="Contact the MDPL administration team about center assignments, students, attendance, grading, or account support."
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-900"><MessageSquareText className="size-5 text-orange-600" /> Administration support</h2>
            <p className="mt-1 text-xs text-slate-500">{thread ? `Status: ${thread.status.replaceAll('_', ' ')}` : 'Start a private operational conversation with MDPL.'}</p>
          </div>
          <button type="button" onClick={() => void load()} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Refresh messages">
            <RefreshCw className="size-4" />
          </button>
        </header>
        {error && <div className="border-b border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <div className="flex min-h-[520px] flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center"><Loader2 className="size-7 animate-spin text-orange-600" /></div>
          ) : messages.length ? (
            <ChatMessageList messages={messages} />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              No messages yet. Send your first message to the administration team below.
            </div>
          )}
          <ChatComposer busy={busy} onSend={(text) => send(text)} />
        </div>
      </div>
    </PageContainer>
  );
}
