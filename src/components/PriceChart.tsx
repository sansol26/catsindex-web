'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import type { PriceHistory } from '@/lib/supabase';

function formatDate(str: string) {
  const d = new Date(str);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatPrice(v: number) {
  return `${v.toLocaleString()}원`;
}

export default function PriceChart({ history }: { history: PriceHistory[] }) {
  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400 bg-gray-50 rounded-xl">
        가격 데이터가 아직 충분하지 않아요 (수집 후 표시됩니다)
      </div>
    );
  }

  const data = history.map(h => ({
    date: formatDate(h.recorded_at),
    price: h.price
  }));

  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = Math.ceil((max - min) * 0.15) || 1000;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis
          domain={[min - padding, max + padding]}
          tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          width={36}
        />
        <Tooltip
          formatter={(v) => [formatPrice(Number(v)), '가격']}
          contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ r: 3, fill: '#f97316' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
