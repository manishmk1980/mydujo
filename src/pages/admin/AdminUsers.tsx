/**
 * Admin: Platform Users
 * Super Admin can create and manage admin users with defined roles.
 * User creation API is pending — UI shell is fully built with clear pending states.
 *
 * Roles:
 *   SUPER_ADMIN        — Full access
 *   OPERATIONS_ADMIN   — Students, centers, instructors, disciplines, applications
 *   FINANCE_ADMIN      — Fee requests, payment review, receipts
 *   EVENT_ADMIN        — Events, tournaments, participation records
 *   CENTER_ADMIN       — Assigned center students/instructors only (future scoping)
 *   READ_ONLY_ADMIN    — View-only access
 */
import React, { useState } from 'react';
import {
  UserCog, Shield, User, Clock, Trash2, Plus, X, Loader2,
  CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff, RefreshCw,
  Edit, PauseCircle,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminTableCard } from '../../components/admin/ui/AdminTableCard';
import { AdminBadge } from '../../components/admin/ui/AdminBadge';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { authService } from '../../services/authService';

// ─── Role definitions ─────────────────────────────────────────────────────────

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full access to all modules.' },
  { value: 'OPERATIONS_ADMIN', label: 'Operations Admin', description: 'Students, centers, instructors, disciplines, applications.' },
  { value: 'FINANCE_ADMIN', label: 'Finance Admin', description: 'Fee requests, payment review, receipts.' },
  { value: 'EVENT_ADMIN', label: 'Event Admin', description: 'Events, tournaments, participation records.' },
  { value: 'CENTER_ADMIN', label: 'Center Admin', description: 'Assigned center students/instructors only (scoped — future).' },
  { value: 'READ_ONLY_ADMIN', label: 'Read-Only Admin', description: 'View-only access across modules.' },
] as const;

type RoleValue = (typeof ROLES)[number]['value'];
type UserStatus = 'ACTIVE' | 'DISABLED' | 'PENDING_INVITE';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleValue;
  status: UserStatus;
  lastActive?: string;
  createdAt?: string;
}

function roleBadge(role: RoleValue) {
  const map: Record<RoleValue, { label: string; variant: 'primary' | 'success' | 'warning' | 'info' | 'neutral' }> = {
    SUPER_ADMIN: { label: 'Super Admin', variant: 'primary' },
    OPERATIONS_ADMIN: { label: 'Operations', variant: 'success' },
    FINANCE_ADMIN: { label: 'Finance', variant: 'warning' },
    EVENT_ADMIN: { label: 'Events', variant: 'info' },
    CENTER_ADMIN: { label: 'Center', variant: 'neutral' },
    READ_ONLY_ADMIN: { label: 'Read Only', variant: 'neutral' },
  };
  const m = map[role] ?? { label: role, variant: 'neutral' };
  return <AdminBadge variant={m.variant} size="sm">{m.label}</AdminBadge>;
}

function statusBadge(status: UserStatus) {
  if (status === 'ACTIVE') return <AdminBadge variant="success" size="sm"><CheckCircle2 className="mr-1 size-3" />Active</AdminBadge>;
  if (status === 'DISABLED') return <AdminBadge variant="danger" size="sm"><XCircle className="mr-1 size-3" />Disabled</AdminBadge>;
  return <AdminBadge variant="warning" size="sm"><Clock className="mr-1 size-3" />Pending invite</AdminBadge>;
}

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_15%,transparent)]';

// ─── Create user modal ────────────────────────────────────────────────────────

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}

function CreateUserModal({ onClose, onCreated }: CreateUserModalProps) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'OPERATIONS_ADMIN' as RoleValue, sendInvite: true, password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedRole = ROLES.find((r) => r.value === form.role);

  const handleSubmit = async () => {
    setFormError(null);
    if (!form.fullName.trim() || !form.email.trim()) { setFormError('Full name and email are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setFormError('Enter a valid email address.'); return; }
    if (!form.sendInvite && form.password.length < 6) { setFormError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    try {
      // User creation API is pending — simulate locally
      await new Promise((r) => setTimeout(r, 800));
      throw new Error('User creation API not yet implemented. The user record was NOT saved.');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'User creation failed.');
      setSubmitting(false);
      return;
    }
    // This code runs if API is available in the future
    onCreated({
      id: crypto.randomUUID(),
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      role: form.role,
      status: form.sendInvite ? 'PENDING_INVITE' : 'ACTIVE',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-y-auto max-h-[94dvh] rounded-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-bold text-slate-900">Create admin user</h3>
            <p className="mt-0.5 text-xs text-slate-500">Only Super Admin can create and manage admin users.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </div>

        <div className="p-5 space-y-4 sm:p-6">
          {/* Backend pending notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <AlertTriangle className="inline size-3.5 mr-1" />
            <strong>Backend integration pending.</strong> The user management API is not yet connected. This form is a UI shell — no user will be created until the API is wired.
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Full Name *</label>
              <input className={inputCls} value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="e.g. Arjun Sharma" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Email *</label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="admin@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Phone (optional)</label>
              <input className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Role *</label>
              <select className={inputCls} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as RoleValue }))}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {selectedRole && (
                <p className="mt-1 text-xs text-slate-400">{selectedRole.description}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={form.sendInvite} onChange={(e) => setForm((f) => ({ ...f, sendInvite: e.target.checked }))} className="size-4 accent-[var(--admin-primary)]" />
                Send password setup email (recommended)
              </label>
              <p className="ml-6 text-xs text-slate-400">User receives a link to set their own password. Requires email backend.</p>
            </div>

            {!form.sendInvite && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Temporary Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className={`${inputCls} pr-12`} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Hide' : 'Show'}>
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => void handleSubmit()} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50">
            {submitting && <Loader2 className="size-4 animate-spin" />} Create user
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const DEMO_USERS: AdminUser[] = [
  { id: '1', email: 'admin@mydojo.com', fullName: 'MDPL Admin', role: 'SUPER_ADMIN', status: 'ACTIVE', lastActive: '2 mins ago' },
  { id: '2', email: 'staff1@mydojo.com', fullName: 'Staff Member', role: 'OPERATIONS_ADMIN', status: 'ACTIVE', lastActive: '1 hr ago' },
  { id: '3', email: 'manager@mydojo.com', fullName: 'Training Manager', role: 'CENTER_ADMIN', status: 'ACTIVE', lastActive: '4 hrs ago' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(DEMO_USERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [flash, setFlash] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const confirm = useAdminConfirm();

  const showFlash = (text: string, type: 'success' | 'error' = 'success') => {
    setFlash({ text, type });
    setTimeout(() => setFlash(null), 4000);
  };

  const handleDisable = async (u: AdminUser) => {
    const ok = await confirm({
      title: u.status === 'DISABLED' ? 'Reactivate user?' : 'Disable user?',
      description: u.status === 'DISABLED'
        ? `"${u.fullName}" will be reactivated. User management API is pending.`
        : `"${u.fullName}" will lose admin access. They cannot log in until reactivated. User management API is pending.`,
      confirmLabel: u.status === 'DISABLED' ? 'Reactivate' : 'Disable',
      cancelLabel: 'Cancel',
      variant: u.status === 'DISABLED' ? 'default' : 'warning',
    });
    if (!ok) return;
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: x.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED' } : x));
    showFlash(`${u.fullName} ${u.status === 'DISABLED' ? 'reactivated' : 'disabled'} (local — user API pending).`);
  };

  const handleDelete = async (u: AdminUser) => {
    const ok = await confirm({
      title: 'Delete admin user?',
      description: `"${u.fullName}" (${u.email}) will be permanently removed. This cannot be undone. User management API is pending — this removes from local list only.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    showFlash(`${u.fullName} removed (local — user API pending).`);
  };

  const handlePasswordReset = async (u: AdminUser) => {
    const ok = await confirm({
      title: 'Send password reset?',
      description: `Send a password reset link to ${u.email}?`,
      confirmLabel: 'Send link',
      cancelLabel: 'Cancel',
      variant: 'default',
    });
    if (!ok) return;
    try {
      const { error } = await authService.resetPasswordForEmail(u.email);
      if (error) throw new Error(error.message);
      showFlash('Password reset link sent.');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Failed to send reset link.', 'error');
    }
  };

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === 'ACTIVE').length,
    pending: users.filter((u) => u.status === 'PENDING_INVITE').length,
    disabled: users.filter((u) => u.status === 'DISABLED').length,
  };

  return (
    <div className="min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <AdminPageHeader
        title="Platform users"
        subtitle="Manage administrative access, roles, and permissions for academy staff."
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            <button type="button" onClick={() => {}} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RefreshCw className="size-4" />
            </button>
            <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--admin-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--admin-primary-hover)] sm:flex-none">
              <Plus className="size-4" /> Create admin user
            </button>
          </div>
        }
      />

      {/* Backend pending banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <p className="font-bold">User management API pending</p>
        <p className="mt-1 text-amber-700">The user directory below shows demo data. Creating, editing, or disabling users is a UI shell — no backend calls are made until the admin user API is connected.</p>
      </div>

      {flash && (
        <div className={`rounded-2xl border p-4 text-sm font-medium ${flash.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {flash.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Users', value: counts.total },
          { label: 'Active', value: counts.active },
          { label: 'Pending Invite', value: counts.pending },
          { label: 'Disabled', value: counts.disabled },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* User table */}
      <AdminTableCard title="User directory" subtitle="Demo data — real users load once user API is connected.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">User</th>
                <th className="hidden px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 sm:table-cell">Role</th>
                <th className="hidden px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:table-cell">Status</th>
                <th className="hidden px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 lg:table-cell">Last active</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <User className="size-5" />
                        <div className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{u.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                        <div className="mt-0.5 sm:hidden">{roleBadge(u.role)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 shrink-0 text-[var(--admin-primary)]" />
                      {roleBadge(u.role)}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">{statusBadge(u.status)}</td>
                  <td className="hidden px-5 py-4 text-xs text-slate-500 lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" /> {u.lastActive ?? '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="Reset password"
                        onClick={() => void handlePasswordReset(u)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <UserCog className="size-4" />
                      </button>
                      <button
                        type="button"
                        title={u.status === 'DISABLED' ? 'Reactivate' : 'Disable'}
                        onClick={() => void handleDisable(u)}
                        className={`rounded-lg p-2 transition-colors ${u.status === 'DISABLED' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'}`}
                      >
                        {u.status === 'DISABLED' ? <CheckCircle2 className="size-4" /> : <PauseCircle className="size-4" />}
                      </button>
                      <button
                        type="button"
                        title="Edit role"
                        onClick={() => showFlash('Role edit UI pending — user API not connected.', 'error')}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete user"
                        onClick={() => void handleDelete(u)}
                        className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>

      {/* Role legend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Role permissions reference</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r.value} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-800">{r.label}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{r.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create modal */}
      {createOpen && (
        <CreateUserModal
          onClose={() => setCreateOpen(false)}
          onCreated={(u) => { setUsers((prev) => [u, ...prev]); setCreateOpen(false); showFlash('User created (local only — API pending).'); }}
        />
      )}
    </div>
  );
}
