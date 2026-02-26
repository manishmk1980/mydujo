import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { cn } from '../lib/utils';

const transactions = [
  { id: 'TXN-9821', date: 'Oct 12, 2024', desc: 'Monthly Training Fee - Oct', amount: 4500.00, status: 'Paid', method: 'Visa •••• 4242' },
  { id: 'TXN-9754', date: 'Sep 15, 2024', desc: 'Belt Grading Fee (Brown)', amount: 2500.00, status: 'Paid', method: 'UPI - arjun@okaxis' },
  { id: 'TXN-9632', date: 'Sep 10, 2024', desc: 'Monthly Training Fee - Sep', amount: 4500.00, status: 'Paid', method: 'Visa •••• 4242' },
  { id: 'TXN-9510', date: 'Aug 12, 2024', desc: 'New Gi (Uniform) - Size 4', amount: 3200.00, status: 'Paid', method: 'Cash' },
  { id: 'TXN-9401', date: 'Aug 10, 2024', desc: 'Monthly Training Fee - Aug', amount: 4500.00, status: 'Paid', method: 'Visa •••• 4242' },
  { id: 'TXN-9322', date: 'Jul 15, 2024', desc: 'Seminar: Advanced Kata', amount: 1500.00, status: 'Paid', method: 'Visa •••• 4242' },
  { id: 'TXN-9211', date: 'Jul 10, 2024', desc: 'Monthly Training Fee - Jul', amount: 4500.00, status: 'Paid', method: 'Visa •••• 4242' },
];

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Payment History</h2>
              <p className="text-slate-500 mt-1">Manage your training fees and transaction records.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download className="size-4" /> Export CSV
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Pay Outstanding
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <ArrowUpRight className="size-6" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase">Total Paid (YTD)</p>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">₹25,200.00</h3>
              <p className="text-xs text-slate-400 mt-2">Across 14 transactions</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="size-6" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase">Outstanding</p>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">₹0.00</h3>
              <p className="text-xs text-green-600 font-bold mt-2">All fees up to date</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Calendar className="size-6" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase">Next Due Date</p>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Nov 10, 2024</h3>
              <p className="text-xs text-slate-400 mt-2">Auto-pay enabled</p>
            </div>
          </div>

          {/* Filters & Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                  <Filter className="size-3" /> Filter
                </button>
                <select className="bg-slate-50 border-slate-200 rounded-lg text-xs font-bold text-slate-600 px-3 py-2">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{txn.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{txn.date}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{txn.desc}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{txn.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          txn.status === 'Paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                        <CreditCard className="size-4" /> {txn.method}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                          <Download className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">Showing 7 of 14 transactions</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-400 cursor-not-allowed" disabled>Prev</button>
                <button className="px-3 py-1 bg-primary text-white rounded text-xs font-bold">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50">2</button>
                <button className="px-3 py-1 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
