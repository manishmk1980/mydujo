import type { ChatMessage } from '../../services/chatService';
import { ChatMessageActions } from './ChatMessageActions';
import { ChatQuotedMessage } from './ChatReplyPreview';
import { bubbleClass, formatChatTime, getSenderLabel, groupMessagesByDate } from './chatUtils';

export function ChatMessageList({
  messages,
  adminView = false,
  onReply,
  onForward,
  onFeedback,
}: {
  messages: ChatMessage[];
  adminView?: boolean;
  onReply?: (message: ChatMessage) => void;
  onForward?: (message: ChatMessage) => void;
  onFeedback?: (message: string, type?: 'success' | 'error') => void;
}) {
  const groups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {groups.map((group) => (
        <div key={group.date}>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{group.date}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-3">
            {group.messages.map((message) => {
              const mine = adminView
                ? message.sender_type === 'ADMIN'
                : ['VISITOR', 'INSTRUCTOR', 'STUDENT'].includes(message.sender_type);
              const systemLike = ['SYSTEM', 'BOT'].includes(message.sender_type) || message.is_internal;
              return (
                <div key={message.id} className={`group flex ${mine && !systemLike ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm ${bubbleClass(message, mine, adminView)}`}>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wide opacity-75">{getSenderLabel(message, adminView)}</div>
                        {message.forwarded_from_message_id && (
                          <div className="mt-0.5 text-[10px] font-semibold uppercase opacity-70">Forwarded</div>
                        )}
                      </div>
                      <ChatMessageActions
                        message={message}
                        onReply={onReply}
                        onForward={onForward}
                        onFeedback={onFeedback}
                        allowForward={adminView}
                      />
                    </div>
                    {message.is_internal && <div className="mb-1 text-[10px] font-bold uppercase text-amber-800">Internal note</div>}
                    {message.reply_to && <ChatQuotedMessage message={message.reply_to} adminView={adminView} />}
                    {message.forwarded_from && !message.reply_to && <ChatQuotedMessage message={message.forwarded_from} adminView={adminView} />}
                    {message.message_type === 'URL' && message.message_text ? (
                      <a href={message.message_text} target="_blank" rel="noreferrer" className="underline break-all">{message.message_text}</a>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{message.message_text}</div>
                    )}
                    {message.attachments?.map((a) => (
                      <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="mt-2 block rounded-lg border border-current/20 px-2 py-1 underline break-all">
                        {a.file_name}
                      </a>
                    ))}
                    <div className="mt-1 flex items-center gap-2 text-[10px] opacity-60">
                      <span>{formatChatTime(message.created_at)}</span>
                      {adminView && message.is_read && message.sender_type !== 'ADMIN' && <span>· Read</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
