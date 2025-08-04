import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Category, Expense } from "../../types";

interface BudgetChartProps {
  categories: Category[];
  expenses: Expense[];
}

export default function BudgetChart({ categories, expenses }: BudgetChartProps) {
  const data = useMemo(() => {
    return categories.map(category => {
      const categoryExpenses = expenses
        .filter(expense => expense.categoryId === category.id)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      return {
        name: category.name,
        budget: parseFloat(category.budget),
        actual: categoryExpenses,
        color: category.color,
      };
    });
  }, [categories, expenses]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Brak danych do wyświetlenia
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => [
            `${value.toFixed(2)} zł`,
            name === 'budget' ? 'Budżet' : 'Rzeczywiste'
          ]}
        />
        <Legend 
          formatter={(value) => value === 'budget' ? 'Budżet' : 'Rzeczywiste wydatki'}
        />
        <Bar dataKey="budget" fill="#3B82F6" name="budget" />
        <Bar dataKey="actual" fill="#EF4444" name="actual" />
      </BarChart>
    </ResponsiveContainer>
  );
}
