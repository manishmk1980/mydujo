import React from 'react';
import { UserCog, Shield, User, Clock, Trash2 } from 'lucide-react';

export default function AdminUsers() {
    const users = [
        { email: 'admin@mydojo.com', role: 'Super Admin', lastActive: '2 mins ago', status: 'Online' },
        { email: 'staff1@mydojo.com', role: 'Staff Member', lastActive: '1 hr ago', status: 'Offline' },
        { email: 'manager@mydojo.com', role: 'Training Manager', lastActive: '4 hrs ago', status: 'Offline' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">PLATFORM USERS</h1>
                <p className="text-slate-500 mt-1">Manage administrative access and roles for academy staff</p>
            </div>

            <div className="bg-white border rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">User Status</th>
                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Role & Permissions</th>
                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Last Activity</th>
                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 relative">
                                            <User className="size-5" />
                                            <div className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-white ${u.status === 'Online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-none">{u.email}</h4>
                                            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none italic">{u.status}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <Shield className="size-4 text-primary" />
                                        <span className="text-sm font-bold text-slate-700">{u.role}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                        <Clock className="size-4" />
                                        {u.lastActive}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <Trash2 className="size-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
