import React from 'react';
import { TrendingUp, Users, GraduationCap, MapPin } from 'lucide-react';
import { AdminWidgetCard } from './AdminWidgetCard';

export interface MonthlyInsightRow {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}

interface AdminMonthlyInsightsProps {
  rows: MonthlyInsightRow[];
}

const iconWrap = 'inline-flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 shrink-0';

export function AdminMonthlyInsights({ rows }: AdminMonthlyInsightsProps) {
  return (
    <AdminWidgetCard title="Monthly Insights" subtitle="Key operational indicators">
      <ul className="space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.label}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 px-3 py-3"
            >
              <div className={iconWrap}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 font-['Space_Grotesk',sans-serif]">
                  {row.label}
                </p>
                <p className="text-lg font-bold text-slate-900 truncate font-['Space_Grotesk',sans-serif]">{row.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{row.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </AdminWidgetCard>
  );
}
