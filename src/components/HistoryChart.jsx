import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

/**
 * data: [{ day: 'Mon', value: number, key: 'YYYY-MM-DD' }]
 */
export default function HistoryChart({ data, color = '#52885b', unit = '' }) {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f3" vertical={false} />
          <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(82, 136, 91, 0.08)' }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(v) => [`${v}${unit ? ' ' + unit : ''}`, 'Value']}
          />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
