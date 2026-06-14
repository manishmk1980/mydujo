import React from 'react';
import { CheckCircle2, KeyRound, Loader2, Pencil, Plus, RefreshCw, Search, Shield, UserX, X } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { AdminEmptyState } from '../../components/admin/ui/AdminEmptyState';
import { AdminErrorState } from '../../components/admin/ui/AdminErrorState';
import { AdminLoadingState } from '../../components/admin/ui/AdminLoadingState';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { pushDataLayer } from '../../lib/dataLayer';
import { usersService, type PlatformUser, type PlatformUserStatus } from '../../services/usersService';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--admin-primary)]';
const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
const statuses: PlatformUserStatus[] = ['ACTIVE', 'PENDING_INVITE', 'DISABLED'];
const value = (input: string | null | undefined) => input?.trim() || 'NA';
const formatDate = (input: string | null | undefined) => input ? new Date(input).toLocaleString() : 'Not Available';

function UserModal({ user, onClose, onSaved }: { user?: PlatformUser; onClose: () => void; onSaved: (user: PlatformUser) => void }) {
  const [form, setForm] = React.useState({ name: user?.name || '', email: user?.email || '', role: user?.roles.find((role) => adminRoles.includes(role)) || 'ADMIN', status: user?.status || 'ACTIVE' as PlatformUserStatus, password: '' });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const save = async () => {
    try {
      setBusy(true); setError('');
      const saved = user
        ? await usersService.update(user.id, { name: form.name, role: form.role, status: form.status })
        : await usersService.create({ ...form, password: form.password || undefined });
      pushDataLayer(user ? 'admin_user_updated' : 'admin_user_created', { user_id: saved.id, role: form.role, status: saved.status, action_source: 'admin_users' });
      onSaved(saved);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save user'); } finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" onClick={onClose}>
    <div className="max-h-[95dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold text-slate-950">{user ? 'Edit user' : 'Create admin user'}</h2><p className="text-xs text-slate-500">Manage secure platform access.</p></div><button onClick={onClose}><X className="size-5" /></button></div>
      <div className="space-y-4 p-5">
        {error && <AdminErrorState message={error} />}
        <label className="block text-xs font-bold text-slate-600">Name<input className={`${inputClass} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-xs font-bold text-slate-600">Email<input disabled={Boolean(user)} type="email" className={`${inputClass} mt-1 disabled:bg-slate-100`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-slate-600">Role<select className={`${inputClass} mt-1`} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{adminRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
          <label className="block text-xs font-bold text-slate-600">Status<select className={`${inputClass} mt-1`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PlatformUserStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        </div>
        {!user && <label className="block text-xs font-bold text-slate-600">Temporary password<input type="password" className={`${inputClass} mt-1`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><span className="mt-1 block font-normal text-slate-400">Required for an active account; minimum 8 characters.</span></label>}
      </div>
      <div className="flex justify-end gap-2 border-t p-5"><button className="rounded-xl border px-4 py-2 text-sm font-bold" onClick={onClose}>Cancel</button><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50" onClick={() => void save()}>{busy && <Loader2 className="size-4 animate-spin" />}Save user</button></div>
    </div>
  </div>;
}

export default function AdminUsers() {
  const [users, setUsers] = React.useState<PlatformUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [editing, setEditing] = React.useState<PlatformUser | null | undefined>(undefined);
  const confirm = useAdminConfirm();
  const load = React.useCallback(async () => { try { setLoading(true); setError(''); setUsers((await usersService.list()).users); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load users'); } finally { setLoading(false); } }, []);
  React.useEffect(() => { void load(); }, [load]);
  const filtered = users.filter((user) => `${user.name || ''} ${user.email} ${user.roles.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  const replace = (updated: PlatformUser) => { setUsers((current) => current.some((item) => item.id === updated.id) ? current.map((item) => item.id === updated.id ? updated : item) : [updated, ...current]); setEditing(undefined); };
  const toggle = async (user: PlatformUser) => {
    const next = user.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    if (!await confirm({ title: `${next === 'ACTIVE' ? 'Reactivate' : 'Disable'} user?`, description: `${value(user.name)} will be ${next.toLowerCase()}.`, confirmLabel: next === 'ACTIVE' ? 'Reactivate' : 'Disable', variant: next === 'ACTIVE' ? 'default' : 'warning' })) return;
    try { const updated = await usersService.update(user.id, { status: next }); replace(updated); pushDataLayer('admin_user_status_changed', { user_id: user.id, role: user.roles[0] || 'NA', status: next, action_source: 'admin_users' }); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to change status'); }
  };
  const reset = async (user: PlatformUser) => {
    const password = window.prompt(`Temporary password for ${value(user.name)} (minimum 8 characters):`);
    if (!password) return;
    try { await usersService.resetPassword(user.id, password); pushDataLayer('admin_user_password_reset', { user_id: user.id, role: user.roles[0] || 'NA', status: 'ACTIVE', action_source: 'admin_users' }); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to reset password'); }
  };
  return <PageContainer>
    <div className="mb-4 flex justify-end"><button className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-bold text-white" onClick={() => setEditing(null)}><Plus className="size-4" />Create user</button></div>
    <div className="mb-4 flex gap-2"><label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input className={`${inputClass} pl-9`} placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} /></label><button className="rounded-xl border px-3" onClick={() => void load()} aria-label="Refresh"><RefreshCw className="size-4" /></button></div>
    {error && <AdminErrorState message={error} className="mb-4" />}
    {loading ? <AdminLoadingState label="Loading users..." /> : filtered.length === 0 ? <AdminEmptyState title="No users found" description="Create an admin user or adjust your search." /> :
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Last login</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{filtered.map((user) => <tr key={user.id}><td className="p-4"><div className="font-bold text-slate-900">{value(user.name)}</div><div className="text-xs text-slate-500">{user.email}</div></td><td className="p-4"><span className="inline-flex items-center gap-1 font-semibold"><Shield className="size-4" />{user.roles.filter((role) => adminRoles.includes(role)).join(', ') || 'NA'}</span></td><td className="p-4"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : user.status === 'DISABLED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}><CheckCircle2 className="size-3" />{user.status}</span></td><td className="p-4 text-slate-500">{formatDate(user.last_login_at)}</td><td className="p-4"><div className="flex justify-end gap-1"><button title="Edit" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setEditing(user)}><Pencil className="size-4" /></button><button title="Reset password" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => void reset(user)}><KeyRound className="size-4" /></button><button title={user.status === 'DISABLED' ? 'Reactivate' : 'Disable'} className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => void toggle(user)}><UserX className="size-4" /></button></div></td></tr>)}</tbody></table></div></div>}
    {editing !== undefined && <UserModal user={editing || undefined} onClose={() => setEditing(undefined)} onSaved={replace} />}
  </PageContainer>;
}
