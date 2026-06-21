import { API_BASE } from '../config';
import { getAdminToken, getPortalToken } from '../lib/authTokens';

export type ChatStatus = 'NEW' | 'OPEN' | 'ASSIGNED' | 'WAITING_FOR_VISITOR' | 'WAITING_FOR_ADMIN' | 'RESOLVED' | 'CLOSED' | 'SPAM';
export type ChatRole = 'PARENT' | 'STUDENT' | 'INSTRUCTOR' | 'ACADEMY' | 'OTHER';
export type ChatPresenceStatus = 'online' | 'away' | 'offline';

export type ChatMessagePreview = {
  id: string;
  sender_type: string;
  message_type: string;
  message_text?: string;
  is_internal: boolean;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  thread_id?: string;
  sender_type: string;
  message_type: string;
  message_text?: string;
  is_internal: boolean;
  is_read?: boolean;
  reply_to_message_id?: string;
  forwarded_from_message_id?: string;
  reply_to?: ChatMessagePreview | null;
  forwarded_from?: ChatMessagePreview | null;
  metadata_json?: Record<string, unknown>;
  created_at: string;
  attachments?: ChatAttachment[];
};

export type ChatAttachment = {
  id: string;
  file_name: string;
  file_url: string;
  file_mime_type: string;
  file_size: number;
  file_category: string;
};

export type ChatThread = {
  id: string;
  public_token?: string;
  visitor_name: string;
  visitor_email?: string;
  visitor_phone?: string;
  visitor_role: ChatRole;
  status: ChatStatus;
  priority: string;
  subject?: string;
  assigned_admin_id?: string;
  assigned_admin?: { id: string; display_name?: string; email: string };
  source_page?: string;
  campaign_source?: string;
  last_message_at: string;
  latest_message?: ChatMessage;
  unread_count?: number;
};

export type ChatPresence = {
  status: ChatPresenceStatus;
  last_seen_at?: string | null;
  active_admin?: { id: string; display_name?: string; email: string } | null;
  online_count?: number;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/chat${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Chat request failed');
  return data as T;
}

const json = (body: unknown, headers: HeadersInit = {}): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
});

const adminHeaders = () => ({
  Authorization: `Bearer ${getAdminToken() || ''}`,
  'Content-Type': 'application/json',
});
const portalHeaders = () => ({
  Authorization: `Bearer ${getPortalToken() || ''}`,
  'Content-Type': 'application/json',
});

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
  reader.onerror = () => reject(new Error('Unable to read file'));
  reader.readAsDataURL(file);
});

export const chatService = {
  getPublicPresence: () => request<ChatPresence>('/public/presence'),

  createPublicThread: (payload: Record<string, unknown>) =>
    request<{ thread: ChatThread; messages: ChatMessage[] }>('/public/threads', json(payload)),

  getPublicThread: (id: string, token: string) =>
    request<{ thread: ChatThread; messages: ChatMessage[]; presence?: ChatPresence }>(
      `/public/threads/${id}?token=${encodeURIComponent(token)}`,
    ),

  sendPublicMessage: (id: string, token: string, message_text: string, message_type = 'TEXT', reply_to_message_id?: string) =>
    request<{ message: ChatMessage }>(`/public/threads/${id}/messages`, json({
      public_token: token,
      message_text,
      message_type,
      ...(reply_to_message_id ? { reply_to_message_id } : {}),
    })),

  handoff: (id: string, token: string) =>
    request<{ ok: boolean }>(`/public/threads/${id}/handoff`, json({ public_token: token })),

  uploadPublic: async (id: string, token: string, file: File) =>
    request<{ message: ChatMessage }>(`/public/threads/${id}/attachments`, json({
      public_token: token,
      file_name: file.name,
      file_mime_type: file.type,
      content: await fileToBase64(file),
    })),

  getInstructorThread: () =>
    request<{ thread: ChatThread | null; messages: ChatMessage[] }>('/instructor/thread', {
      headers: portalHeaders(),
    }),

  sendInstructorMessage: (message_text: string) =>
    request<{ thread: ChatThread; message: ChatMessage }>('/instructor/thread/messages', json({
      message_text,
    }, portalHeaders())),

  sendAdminHeartbeat: () =>
    request<{ ok: boolean; last_seen_at: string; status: ChatPresenceStatus }>('/admin/presence', json({}, adminHeaders())),

  getAdminPresence: () => request<ChatPresence>('/admin/presence', { headers: adminHeaders() }),

  listAdminThreads: (params = '') =>
    request<{ threads: ChatThread[] }>(`/admin/threads${params}`, { headers: adminHeaders() }),

  getAdminThread: (id: string) =>
    request<{ thread: ChatThread; messages: ChatMessage[]; presence?: ChatPresence }>(`/admin/threads/${id}`, { headers: adminHeaders() }),

  sendAdminMessage: (id: string, message_text: string, is_internal = false, message_type = 'TEXT', reply_to_message_id?: string) =>
    request<{ message: ChatMessage }>(`/admin/threads/${id}/messages`, json({
      message_text,
      is_internal,
      message_type,
      ...(reply_to_message_id ? { reply_to_message_id } : {}),
    }, adminHeaders())),

  forwardAdminMessage: (threadId: string, source_message_id: string, options: { target_thread_id?: string; as_internal_note?: boolean } = {}) =>
    request<{ message: ChatMessage }>(`/admin/threads/${threadId}/forward`, json({
      source_message_id,
      ...options,
    }, adminHeaders())),

  uploadAdmin: async (id: string, file: File) =>
    request<{ message: ChatMessage }>(`/admin/threads/${id}/attachments`, json({
      file_name: file.name,
      file_mime_type: file.type,
      content: await fileToBase64(file),
    }, adminHeaders())),

  assign: (id: string, assigned_admin_id: string) =>
    request<{ thread: ChatThread }>(`/admin/threads/${id}/assign`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ assigned_admin_id }),
    }),

  updateStatus: (id: string, status: ChatStatus, priority?: string) =>
    request<{ thread: ChatThread }>(`/admin/threads/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status, priority }),
    }),

  listAdmins: () =>
    request<{ admins: Array<{ id: string; display_name?: string; email: string; last_seen_at?: string | null }> }>(
      '/admin/admins',
      { headers: adminHeaders() },
    ),
};
