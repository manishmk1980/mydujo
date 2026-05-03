import React, { useEffect, useMemo, useState } from 'react';
import { User, Mail, Shield, Award, Calendar, Lock, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { useAdminConfirm } from '../../components/admin/ui/AdminConfirmProvider';
import { authService } from '../../services/authService';

export default function AdminProfile() {
    const navigate = useNavigate();
    const confirm = useAdminConfirm();
    const { adminUser, logout, refreshAdminUser } = useAdminAuth();
    const roles = adminUser?.roles || [];
    const canManageSecurity = !!adminUser;

    const [securityOpen, setSecurityOpen] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securityError, setSecurityError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [securitySummary, setSecuritySummary] = useState<{
        email: string;
        isSuperAdmin: boolean;
        displayName?: string | null;
    } | null>(null);
    const [displayNameInput, setDisplayNameInput] = useState(adminUser?.full_name || '');
    const [savingDisplayName, setSavingDisplayName] = useState(false);
    const [displayNameMessage, setDisplayNameMessage] = useState('');

    useEffect(() => {
        setDisplayNameInput(adminUser?.full_name || '');
    }, [adminUser?.full_name]);

    const displayEmail = securitySummary?.email || adminUser?.email || '';
    const roleLabel = useMemo(() => {
        if (roles.includes('SUPER_ADMIN')) return 'Super Admin';
        if (roles.includes('ADMIN')) return 'Admin';
        return 'Administrator';
    }, [roles]);

    const openSecurityPanel = async () => {
        if (!canManageSecurity) return;
        setSecurityOpen(true);
        setSecurityError('');
        setSecurityLoading(true);
        try {
            const { data, error } = await authService.getAdminSecurity();
            if (error) {
                setSecurityError(error.message || 'Failed to load security settings');
            } else if (data) {
                setSecuritySummary({
                    email: data.account.email,
                    isSuperAdmin: !!data.account.isSuperAdmin,
                    displayName: data.account.displayName || null,
                });
                setNewEmail(data.account.email || '');
                setDisplayNameInput(data.account.displayName || adminUser?.full_name || '');
            }
        } finally {
            setSecurityLoading(false);
        }
    };

    const saveDisplayName = async () => {
        setDisplayNameMessage('');
        const baseline = (adminUser?.full_name || '').trim();
        const clean = displayNameInput.trim();
        if (clean === baseline) {
            setDisplayNameMessage('No changes to save.');
            return;
        }
        const ok = await confirm({
            title: 'Save changes?',
            description: 'Your updates will be saved to the system.',
            confirmLabel: 'Save changes',
            cancelLabel: 'Review again',
            variant: 'default',
        });
        if (!ok) return;

        setSavingDisplayName(true);
        try {
            const { data, error } = await authService.updateAdminProfile({ displayName: clean || null });
            if (error || !data?.ok) {
                setDisplayNameMessage(error?.message || 'Failed to update display name.');
                return;
            }
            await refreshAdminUser();
            setDisplayNameMessage('Display name updated.');
        } finally {
            setSavingDisplayName(false);
        }
    };

    const resetSecurityFormFields = () => {
        setSecurityOpen(false);
        setSecurityError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
    };

    const requestCloseSecurityPanel = async () => {
        if (submitting) return;
        const hasDraft =
            currentPassword.trim().length > 0 ||
            newPassword.trim().length > 0 ||
            confirmNewPassword.trim().length > 0 ||
            (securitySummary != null && newEmail.trim().toLowerCase() !== securitySummary.email.trim().toLowerCase());

        if (hasDraft) {
            const ok = await confirm({
                title: 'Discard unsaved changes?',
                description: 'You have unsaved changes. If you leave now, your updates may be lost.',
                confirmLabel: 'Discard changes',
                cancelLabel: 'Continue editing',
                variant: 'warning',
            });
            if (!ok) return;
        }
        resetSecurityFormFields();
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSecurityError('');

        const cleanCurrentPassword = currentPassword.trim();
        const cleanNewEmail = newEmail.trim().toLowerCase();
        const cleanNewPassword = newPassword;
        const cleanConfirmNewPassword = confirmNewPassword;

        if (!cleanCurrentPassword) {
            setSecurityError('Current password is required.');
            return;
        }
        if (!cleanNewEmail && !cleanNewPassword) {
            setSecurityError('Provide a new email or a new password.');
            return;
        }
        if (cleanNewEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanNewEmail)) {
            setSecurityError('Please enter a valid new email.');
            return;
        }
        if (cleanNewPassword && cleanNewPassword.length < 8) {
            setSecurityError('New password must be at least 8 characters.');
            return;
        }
        if (!cleanNewPassword && cleanConfirmNewPassword) {
            setSecurityError('Enter a new password before confirming it.');
            return;
        }
        if (cleanNewPassword && cleanNewPassword !== cleanConfirmNewPassword) {
            setSecurityError('New password and confirm password do not match.');
            return;
        }

        const payload: { currentPassword: string; newEmail?: string; newPassword?: string } = {
            currentPassword: cleanCurrentPassword,
        };
        if (cleanNewEmail && cleanNewEmail !== displayEmail.toLowerCase()) payload.newEmail = cleanNewEmail;
        if (cleanNewPassword) payload.newPassword = cleanNewPassword;

        if (!payload.newEmail && !payload.newPassword) {
            setSecurityError('No new values detected to update.');
            return;
        }

        const okSave = await confirm({
            title: 'Save changes?',
            description: 'Your updates will be saved to the system.',
            confirmLabel: 'Save changes',
            cancelLabel: 'Review again',
            variant: 'default',
        });
        if (!okSave) return;

        setSubmitting(true);
        try {
            const { data, error } = await authService.updateAdminSecurity(payload);
            if (error || !data?.ok) {
                setSecurityError(error?.message || 'Failed to update super admin security.');
                return;
            }

            sessionStorage.setItem('admin_security_notice', 'Security updated. Please login again.');
            await logout();
            navigate('/admin/login', { replace: true });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminPageHeader
                title="Admin profile"
                subtitle="Manage personal administrative identity and security."
                actions={
                    canManageSecurity ? (
                        <button
                            type="button"
                            onClick={openSecurityPanel}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 sm:w-auto"
                        >
                            <Shield className="size-5 shrink-0" />
                            Update security
                        </button>
                    ) : null
                }
            />

            <div className="bg-white border rounded-3xl px-6 py-8 shadow-sm border-slate-200 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
                <div className="size-32 rounded-[2.5rem] bg-amber-500 flex items-center justify-center p-6 mb-8 ring-8 ring-amber-50 relative z-10">
                    <User className="size-16 text-white" />
                </div>

                <h2 className="text-3xl font-black text-slate-900 leading-none relative z-10">{adminUser?.full_name || adminUser?.email?.split('@')[0] || 'Super Admin'}</h2>
                <div className="mt-4 flex flex-wrap justify-center gap-3 relative z-10">
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest leading-none flex items-center gap-2 border border-slate-200">
                        <Shield className="size-3.5" /> {roleLabel} Role
                    </span>
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest leading-none flex items-center gap-2 border border-slate-200">
                        <Calendar className="size-3.5" /> Joined —
                    </span>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl relative z-10 text-left">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <Mail className="size-6 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Primary Email</p>
                            <p className="text-sm font-bold text-slate-900 mt-2">{adminUser?.email}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <Award className="size-6 text-slate-400" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Personnel ID</p>
                            <p className="text-sm font-bold text-slate-900 mt-2 truncate max-w-[200px]">{adminUser?.id}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Display Name</p>
                        <input
                            value={displayNameInput}
                            onChange={(e) => setDisplayNameInput(e.target.value)}
                            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                            placeholder="MDPL CORE"
                            maxLength={255}
                        />
                        <button
                            type="button"
                            onClick={() => void saveDisplayName()}
                            disabled={savingDisplayName}
                            className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {savingDisplayName ? 'Saving...' : 'Save Display Name'}
                        </button>
                        {displayNameMessage ? <p className="mt-2 text-xs text-slate-600">{displayNameMessage}</p> : null}
                    </div>
                </div>
            </div>

            {securityOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-4 sm:items-center"
                    role="presentation"
                    onClick={(ev) => {
                        if (ev.target === ev.currentTarget && !submitting) void requestCloseSecurityPanel();
                    }}
                >
                    <div
                        className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-security-title"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-slate-200 p-6">
                            <div>
                                <h3 id="admin-security-title" className="text-xl font-black text-slate-900">
                                    Super Admin Security
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">Update super admin email/password and force re-login.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => void requestCloseSecurityPanel()}
                                className="rounded-xl p-2 text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                disabled={submitting}
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSecuritySubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">1. Account Protection Summary</h4>
                                <p className="text-sm text-slate-600 mt-2">
                                    Active identity: <span className="font-semibold text-slate-900">{displayEmail || '—'}</span>
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                    Security level: <span className="font-semibold text-slate-900">{securitySummary?.isSuperAdmin ? 'Super Admin' : roleLabel}</span>
                                </p>
                            </section>

                            <section className="rounded-2xl border border-slate-200 p-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">2. Login Identity</h4>
                                <label className="block text-xs font-bold text-slate-500 mt-3 mb-2">New Email (optional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                        placeholder="new-admin-email@example.com"
                                    />
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 p-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">3. Change Password</h4>
                                <label className="block text-xs font-bold text-slate-500 mt-3 mb-2">Current Password (required)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((p) => !p)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                    >
                                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                <label className="block text-xs font-bold text-slate-500 mt-4 mb-2">New Password (optional, min 8)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((p) => !p)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                    >
                                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                <label className="block text-xs font-bold text-slate-500 mt-4 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        type={showConfirmNewPassword ? 'text' : 'password'}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmNewPassword((p) => !p)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                                        aria-label={showConfirmNewPassword ? 'Hide confirm new password' : 'Show confirm new password'}
                                    >
                                        {showConfirmNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">4. Super Admin Configuration</h4>
                                <p className="text-sm text-slate-500 mt-2">Placeholder: advanced super admin security controls coming soon.</p>
                            </section>

                            {securityLoading && <p className="text-sm text-slate-500">Loading security details...</p>}
                            {securityError && <p className="text-sm text-red-600 font-medium">{securityError}</p>}

                            <div className="sticky bottom-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-slate-200 -mx-6 px-6 py-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => void requestCloseSecurityPanel()}
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/15 disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || securityLoading}
                                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/25 disabled:opacity-60"
                                >
                                    {submitting ? 'Updating...' : 'Update Super Admin Security'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
