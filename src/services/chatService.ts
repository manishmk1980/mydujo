import { API_BASE } from '../config';
import { getAdminToken } from '../lib/authTokens';

export type ChatStatus = 'NEW' | 'OPEN' | 'ASSIGNED' | 'WAITING_FOR_VISITOR' | 'WAITING_FOR_ADMIN' | 'RESOLVED' | 'CLOSED' | 'SPAM';
export type ChatRole = 'PARENT' | 'STUDENT' | 'INSTRUCTOR' | 'ACADEMY' | 'OTHER';
export type ChatMessage = {
  id: string; sender_type: string; message_type: string; message_text?: string; is_internal: boolean;
  created_at: string; attachments: ChatAttachment[];
};
export type ChatAttachment = { id: string; file_name: string; file_url: string; file_mime_type: string; file_size: number; file_category: string };
export type ChatThread = {
  id: string; public_token?: string; visitor_name: string; visitor_email?: string; visitor_phone?: string; visitor_role: ChatRole;
  status: ChatStatus; priority: string; subject?: string; assigned_admin_id?: string; assigned_admin?: { id: string; display_name?: string; email: string };
  source_page?: string; campaign_source?: string; last_message_at: string; latest_message?: ChatMessage; unread_count?: number;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/chat${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Chat request failed');
  return data as T;
}
const json = (body: unknown, headers: HeadersInit = {}): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const adminHeaders = () => ({ Authorization: `Bearer ${getAdminToken() || ''}`, 'Content-Type': 'application/json' });
const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
  reader.onerror = () => reject(new Error('Unable to read file'));
  reader.readAsDataURL(file);
});

export const chatService = {
  createPublicThread: (payload: Record<string, unknown>) => request<{ thread: ChatThread; messages: ChatMessage[] }>('/public/threads', json(payload)),
  getPublicThread: (id: string, token: string) => request<{ thread: ChatThread; messages: ChatMessage[] }>(`/public/threads/${id}?token=${encodeURIComponent(token)}`),
  sendPublicMessage: (id: string, token: string, message_text: string, message_type = 'TEXT') =>
    request<{ message: ChatMessage }>(`/public/threads/${id}/messages`, json({ public_token: token, message_text, message_type })),
  handoff: (id: string, token: string) => request<{ ok: boolean }>(`/public/threads/${id}/handoff`, json({ public_token: token })),
  uploadPublic: async (id: string, token: string, file: File) =>
    request<{ message: ChatMessage }>(`/public/threads/${id}/attachments`, json({ public_token: token, file_name: file.name, file_mime_type: file.type, content: await fileToBase64(file) })),
  listAdminThreads: (params = '') => request<{ threads: ChatThread[] }>(`/admin/threads${params}`, { headers: adminHeaders() }),
  getAdminThread: (id: string) => request<{ thread: ChatThread; messages: ChatMessage[] }>(`/admin/threads/${id}`, { headers: adminHeaders() }),
  sendAdminMessage: (id: string, message_text: string, is_internal = false, message_type = 'TEXT') =>
    request<{ message: ChatMessage }>(`/admin/threads/${id}/messages`, json({ message_text, is_internal, message_type }, adminHeaders())),
  uploadAdmin: async (id: string, file: File) =>
    request<{ message: ChatMessage }>(`/admin/threads/${id}/attachments`, json({ file_name: file.name, file_mime_type: file.type, content: await fileToBase64(file) }, adminHeaders())),
  assign: (id: string, assigned_admin_id: string) =>
    request<{ thread: ChatThread }>(`/admin/threads/${id}/assign`, { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ assigned_admin_id }) }),
  updateStatus: (id: string, status: ChatStatus, priority?: string) =>
    request<{ thread: ChatThread }>(`/admin/threads/${id}/status`, { method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ status, priority }) }),
  listAdmins: () => request<{ admins: Array<{ id: string; display_name?: string; email: string }> }>('/admin/admins', { headers: adminHeaders() }),
};
