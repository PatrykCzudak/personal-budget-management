import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Investment } from "../../types";

interface AllocationChartProps {
  investments: Investment[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

export default function AllocationChart({ investments }: AllocationChartProps) {
  const data = useMemo(() => {
    const typeMap = new Map<string, number>();
    
    investments.forEach(investment => {
      const value = parseFloat(investment.currentPrice || investment.purchasePrice) * parseFloat(investment.quantity);
      const currentValue = typeMap.get(investment.type) || 0;
      typeMap.set(investment.type, currentValue + value);
    });

    const allocationData = Array.from(typeMap.entries()).map(([type, value]) => ({
      name: type,
      value,
    }));

    return allocationData;
  }, [investments]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Brak inwestycji do wyświetlenia
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} zł`, 'Wartość']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
