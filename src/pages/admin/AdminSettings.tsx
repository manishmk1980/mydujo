import React from 'react';
import { Settings, Globe, Bell, Lock, Shield, ArrowRight } from 'lucide-react';

export default function AdminSettings() {
    const sections = [
        { title: 'General Preferences', desc: 'Academy name, timezone, and language', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Notification Hub', desc: 'Email alerts and student registration cues', icon: Bell, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Security & Access', desc: 'Password policies and login MFA', icon: Lock, color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'Global Status', desc: 'Maintainance mode and registration open/close', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Platform Settings</h1>
                <p className="text-slate-500 mt-1">Global configuration and platform-wide rules</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {sections.map((s, i) => (
                    <button key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between text-left group overflow-hidden relative">
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`size-16 rounded-[1.5rem] ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <s.icon className={`size-8 ${s.color}`} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 leading-none">{s.title}</h4>
                                <p className="text-sm font-bold text-slate-400 mt-2">{s.desc}</p>
                            </div>
                        </div>
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all relative z-10">
                            <ArrowRight className="size-5" />
                        </div>
                        <div className={`absolute bottom-0 right-0 size-32 opacity-[0.03] transition-transform group-hover:scale-110 -mb-16 -mr-16 ${s.color}`}>
                            <s.icon className="size-full" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
