import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface FeeStatusDatum {
  name: string;
  count: number;
  fill: string;
}

interface AdminFeeStatusChartProps {
  data: FeeStatusDatum[];
}

export function AdminFeeStatusChart({ data }: AdminFeeStatusChartProps) {
  return (
    <div className="w-full h-[220px] min-h-[220px]">
      <ResponsiveContainer width="100%" height={260} minWidth={1}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(234, 88, 12, 0.06)' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(148, 163, 184, 0.35)',
              fontSize: 12,
            }}
            formatter={(value: number) => [value, 'Items']}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="count" name="Items" radius={[0, 8, 8, 0]} barSize={18}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
