import React from 'react';
import { Globe, Bell, Lock, Shield, ArrowRight } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/ui/AdminPageHeader';
import { AdminCard } from '../../components/admin/ui/AdminCard';

export default function AdminSettings() {
    const sections = [
        { title: 'General Preferences', desc: 'Academy name, timezone, and language', icon: Globe, color: 'text-[var(--admin-info)]', bg: 'bg-[color-mix(in_srgb,var(--admin-info)_12%,transparent)]' },
        { title: 'Notification Hub', desc: 'Email alerts and student registration cues', icon: Bell, color: 'text-[var(--admin-primary)]', bg: 'bg-[var(--admin-primary-soft)]' },
        { title: 'Security & Access', desc: 'Password policies and login MFA', icon: Lock, color: 'text-[var(--admin-success)]', bg: 'bg-[color-mix(in_srgb,var(--admin-success)_12%,transparent)]' },
        { title: 'Global Status', desc: 'Maintainance mode and registration open/close', icon: Shield, color: 'text-[var(--admin-warning)]', bg: 'bg-[color-mix(in_srgb,var(--admin-warning)_12%,transparent)]' },
    ];

    return (
        <div className="min-w-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminPageHeader
                title="Platform settings"
                subtitle="Global configuration and platform-wide rules."
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {sections.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        className="group relative w-full overflow-hidden text-left transition-shadow hover:shadow-[var(--admin-shadow-card)]"
                    >
                        <AdminCard padding="lg" className="flex h-full items-center justify-between gap-4">
                            <div className="relative z-10 flex min-w-0 flex-1 items-center gap-6">
                                <div className={`flex size-16 shrink-0 items-center justify-center rounded-[var(--admin-radius-control)] ${s.bg} transition-transform group-hover:scale-105`}>
                                    <s.icon className={`size-8 ${s.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xl font-black leading-none text-[var(--admin-text)]">{s.title}</h4>
                                    <p className="mt-2 text-sm font-bold text-[var(--admin-text-muted)]">{s.desc}</p>
                                </div>
                            </div>
                            <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-soft)] text-[var(--admin-text-muted)] transition-colors group-hover:border-[var(--admin-primary-border)] group-hover:bg-[var(--admin-primary-soft)] group-hover:text-[var(--admin-primary)]">
                                <ArrowRight className="size-5" />
                            </div>
                            <div className={`pointer-events-none absolute -bottom-16 -right-16 size-32 opacity-[0.06] transition-transform group-hover:scale-110 ${s.color}`}>
                                <s.icon className="size-full" />
                            </div>
                        </AdminCard>
                    </button>
                ))}
            </div>
        </div>
    );
}
