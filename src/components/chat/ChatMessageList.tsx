import type { ChatMessage } from '../../services/chatService';

export function ChatMessageList({ messages, adminView = false }: { messages: ChatMessage[]; adminView?: boolean }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.map((message) => {
        const mine = adminView ? message.sender_type === 'ADMIN' : message.sender_type === 'VISITOR';
        return (
          <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.is_internal ? 'border border-amber-300 bg-amber-50 text-amber-950' : mine ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
              {message.is_internal && <div className="mb-1 text-[10px] font-bold uppercase">Internal note</div>}
              {message.message_type === 'URL' && message.message_text ? <a href={message.message_text} target="_blank" rel="noreferrer" className="underline break-all">{message.message_text}</a> : <div className="whitespace-pre-wrap break-words">{message.message_text}</div>}
              {message.attachments?.map((a) => <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="mt-2 block rounded-lg border border-current/20 px-2 py-1 underline break-all">{a.file_name}</a>)}
              <div className="mt-1 text-[10px] opacity-60">{new Date(message.created_at).toLocaleString()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
