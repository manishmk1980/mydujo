import React from 'react';
import { User, Mail, Shield, Award, Calendar, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminProfile() {
    const { adminUser } = useAdminAuth();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">ADMIN PROFILE</h1>
                    <p className="text-slate-500 mt-1">Manage personal administrative identity and security</p>
                </div>
                <button className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                    <Shield className="size-5" />
                    Update Security
                </button>
            </div>

            <div className="bg-white border rounded-[3rem] p-12 shadow-sm border-slate-200 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 opacity-20"></div>
                <div className="size-32 rounded-[2.5rem] bg-amber-500 flex items-center justify-center p-6 mb-8 ring-8 ring-amber-50 relative z-10">
                    <User className="size-16 text-white" />
                </div>

                <h2 className="text-3xl font-black text-slate-900 leading-none relative z-10">{adminUser?.email?.split('@')[0] || 'Super Admin'}</h2>
                <div className="mt-4 flex flex-wrap justify-center gap-3 relative z-10">
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest leading-none flex items-center gap-2 border border-slate-200">
                        <Shield className="size-3.5" /> Super Admin Role
                    </span>
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest leading-none flex items-center gap-2 border border-slate-200">
                        <Calendar className="size-3.5" /> Joined —
                    </span>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl relative z-10 text-left">
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
                </div>
            </div>
        </div>
    );
}
