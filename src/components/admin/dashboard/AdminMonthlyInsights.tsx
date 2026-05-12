import type { ComponentType } from 'react';

import { AdminWidgetCard } from './AdminWidgetCard';

export type MonthlyInsightRow = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ComponentType<{ className?: string }>;
  color?: string;
  bg?: string;
};

type AdminMonthlyInsightsProps = {
  rows?: MonthlyInsightRow[];
};

export function AdminMonthlyInsights({ rows = [] }: AdminMonthlyInsightsProps) {
  const hasLiveInsights = rows.length > 0;

  return (
    <AdminWidgetCard title="Monthly Insights" subtitle="Key operational indicators">
      {hasLiveInsights ? (
        <div className="space-y-3">
          {rows.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                {Icon ? (
                  <div
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                      item.bg || 'bg-slate-100',
                    ].join(' ')}
                  >
                    <Icon className={['h-5 w-5', item.color || 'text-slate-600'].join(' ')} />
                  </div>
                ) : null}

                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-1 break-words text-xl font-black text-slate-950">
                    {item.value}
                  </p>

                  {item.detail ? (
                    <p className="mt-1 text-sm font-medium text-slate-500">{item.detail}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">
            No live monthly insights available yet.
          </p>

          <p className="mt-1">
            Revenue, student activity, instructor performance, and center-level insights will appear here after verified operational data is available.
          </p>
        </div>
      )}
    </AdminWidgetCard>
  );
}