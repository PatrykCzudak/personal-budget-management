import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Category, Expense } from "../../types";

interface CategoryChartProps {
  categories: Category[];
  expenses: Expense[];
}

export default function CategoryChart({ categories, expenses }: CategoryChartProps) {
  const data = useMemo(() => {
    const categoryData = categories.map(category => {
      const categoryExpenses = expenses
        .filter(expense => expense.categoryId === category.id)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      return {
        name: category.name,
        value: categoryExpenses,
        color: category.color,
      };
    }).filter(item => item.value > 0);

    return categoryData;
  }, [categories, expenses]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Brak wydatków do wyświetlenia
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
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} zł`, 'Wydatki']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
