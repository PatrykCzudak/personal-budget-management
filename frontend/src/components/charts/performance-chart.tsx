import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Investment } from "../../types";

interface PerformanceChartProps {
  investments: Investment[];
}

export default function PerformanceChart({ investments }: PerformanceChartProps) {
  const data = useMemo(() => {
    // Generate mock performance data for the last 12 months
    // In a real app, this would come from historical price data
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' });
      
      // Calculate portfolio value for this month (simplified simulation)
      const portfolioValue = investments.reduce((sum, investment) => {
        const purchaseDate = new Date(investment.purchaseDate);
        if (date >= purchaseDate) {
          // Simulate price movement (this would be real historical data in production)
          const monthsAfterPurchase = (date.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          const volatilityFactor = 1 + (Math.sin(monthsAfterPurchase) * 0.1) + (Math.random() - 0.5) * 0.05;
          const simulatedPrice = parseFloat(investment.purchasePrice) * volatilityFactor;
          return sum + (simulatedPrice * parseFloat(investment.quantity));
        }
        return sum;
      }, 0);
      
      months.push({
        month: monthName,
        value: portfolioValue,
      });
    }
    
    return months;
  }, [investments]);

  if (investments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Brak inwestycji do wyświetlenia
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => [`${value.toFixed(2)} zł`, 'Wartość portfolio']} />
        <Legend formatter={() => 'Wartość portfolio'} />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
