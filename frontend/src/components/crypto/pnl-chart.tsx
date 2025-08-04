import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProfitPoint {
  time: string;
  value: number;
}

export default function ProfitLossHistoryChart({ data }: { data: ProfitPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" stroke="#666" fontSize={12} tick={{ fill: '#666' }} />
        <YAxis stroke="#666" fontSize={12} tick={{ fill: '#666' }} tickFormatter={(v) => `${v.toFixed(0)} zł`} />
        <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} zł`, 'PnL']} />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}