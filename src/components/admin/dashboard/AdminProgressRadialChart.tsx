import React, { useId } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AdminWidgetCard } from './AdminWidgetCard';

interface AdminProgressRadialChartProps {
  registered: number;
  approved: number;
  activePortal: number;
}

export function AdminProgressRadialChart({ registered, approved, activePortal }: AdminProgressRadialChartProps) {
  const gradId = useId().replace(/:/g, '');
  const approvalRate = registered > 0 ? Math.round((approved / registered) * 100) : 0;
  const pending = Math.max(0, registered - approved);

  const pieData = [
    { name: 'Approved share', value: approvalRate },
    { name: 'Remaining', value: Math.max(0, 100 - approvalRate) },
  ];

  return (
    <AdminWidgetCard title="Progress Overview" subtitle="Approval and readiness snapshot">
      <div className="relative flex flex-col items-center pt-2">
        <div className="h-[200px] w-full max-w-[260px]">
          <ResponsiveContainer width="100%" height={240} minWidth={1}>
            <PieChart>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius="58%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="none"
              >
                <Cell fill={`url(#${gradId})`} />
                <Cell fill="#e2e8f0" />
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [`${v}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="-mt-14 text-center relative z-10">
          <p className="text-3xl font-bold text-slate-900 tabular-nums font-['Space_Grotesk',sans-serif]">
            {approvalRate}%
          </p>
          <p className="text-sm font-semibold text-slate-600 mt-0.5 font-['Space_Grotesk',sans-serif]">
            Approval Completion
          </p>
        </div>
        <dl className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Approved</dt>
            <dd className="text-sm font-bold text-slate-900 tabular-nums">{approved}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Pending</dt>
            <dd className="text-sm font-bold text-slate-900 tabular-nums">{pending}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Active portal</dt>
            <dd className="text-sm font-bold text-slate-900 tabular-nums">{activePortal}</dd>
          </div>
        </dl>
      </div>
    </AdminWidgetCard>
  );
}
