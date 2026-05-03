import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface StudentAnalyticsDatum {
  name: string;
  value: number;
  fill: string;
}

interface AdminStudentAnalyticsChartProps {
  data: StudentAnalyticsDatum[];
  /** Footnote clarifying this is snapshot distribution, not a time series */
  footnote?: string;
}

export function AdminStudentAnalyticsChart({ data, footnote }: AdminStudentAnalyticsChartProps) {
  return (
    <div className="w-full h-[280px] min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(234, 88, 12, 0.06)' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(148, 163, 184, 0.35)',
              fontSize: 12,
            }}
            formatter={(value: number) => [value, 'Count']}
          />
          <Bar dataKey="value" name="Count" radius={[10, 10, 10, 10]} maxBarSize={48}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {footnote ? <p className="mt-2 text-xs text-slate-500">{footnote}</p> : null}
    </div>
  );
}
