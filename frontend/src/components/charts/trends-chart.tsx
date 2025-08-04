import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Expense } from "../../types";

interface TrendsChartProps {
  expenses: Expense[];
}

export default function TrendsChart({ expenses }: TrendsChartProps) {
  const data = useMemo(() => {
    const last6Months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' });
      
      const monthExpenses = expenses
        .filter(expense => expense.date.startsWith(monthStr))
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      last6Months.push({
        month: monthName,
        expenses: monthExpenses,
      });
    }
    
    return last6Months;
  }, [expenses]);

  if (data.every(item => item.expenses === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Brak danych historycznych</p>
          <p className="text-sm">Dodaj wydatki w poprzednich miesiącach aby zobaczyć trendy</p>
          <p className="text-xs mt-2">Wykres pokazuje ostatnie 6 miesięcy</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} zł`, 'Wydatki']} />
        <Legend formatter={() => 'Wydatki miesięczne'} />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
