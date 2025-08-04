import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { createPLHistogram } from '@/utils/risk-calculations';

interface VaRChartProps {
  data: Array<{
    date: string;
    portfolioValue: number;
    returns: number;
    cumulativeReturns: number;
  }>;
  var95: number;
  var99: number;
  es95: number;
  es99: number;
}

export default function VaRChart({ data, var95, var99, es95, es99 }: VaRChartProps) {
  // Generate P&L distribution data for histogram
  const returns = data.map(d => d.returns).filter(r => !isNaN(r) && isFinite(r));
  
  if (returns.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        Brak danych do wyświetlenia histogramu
      </div>
    );
  }
  
  // Create histogram with more bins for better granularity
  const binCount = 30; // Increased bins for better detail
  const currentValue = data[data.length - 1]?.portfolioValue || 10000;
  
  // Convert returns to P&L in PLN
  const plValues = returns.map(r => r * currentValue);
  const sortedPL = [...plValues].sort((a, b) => a - b);
  const minPL = sortedPL[0];
  const maxPL = sortedPL[sortedPL.length - 1];
  const binWidth = (maxPL - minPL) / binCount;
  
  const histogram = Array.from({ length: binCount }, (_, i) => {
    const binStart = minPL + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = sortedPL.filter(pl => pl >= binStart && pl < binEnd).length;
    
    return {
      binStart,
      binEnd,
      binCenter: binStart + binWidth / 2,
      count,
      frequency: count // Use absolute count for easier interpretation
    };
  }); // Keep all bins for better visualization

  // VaR and ES values are already in PLN (absolute loss amounts)
  const var95PLN = -Math.abs(var95);
  const var99PLN = -Math.abs(var99);
  const es95PLN = -Math.abs(es95);
  const es99PLN = -Math.abs(es99);

  return (
    <div className="space-y-6">
      {/* P&L Histogram with VaR and ES */}
      <div className="h-96">
        <h4 className="text-lg font-semibold mb-4">Histogram P&L z VaR i Expected Shortfall</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogram} margin={{ top: 20, right: 30, left: 50, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="binCenter"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => typeof value === 'number' ? `${value.toFixed(0)} zł` : String(value)}
              label={{ value: 'Zysk/Strata (zł)', position: 'insideBottom', offset: -10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => String(value)}
              label={{ value: 'Liczba dni', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => [
                `${value} dni`, 
                'Częstość'
              ]}
              labelFormatter={(value) => 
                typeof value === 'number' ? `P&L: ${value.toFixed(0)} zł` : `P&L: ${String(value)}`
              }
            />
            <Legend />
            
            {/* Histogram bars */}
            <Bar
              dataKey="frequency"
              fill="#60a5fa"
              fillOpacity={0.7}
              name="Rozkład P&L"
            />
            
            {/* VaR 95% line */}
            <ReferenceLine 
              x={var95PLN} 
              stroke="#f59e0b" 
              strokeWidth={4}
              strokeDasharray="8 4"
              label={{
                value: "VaR 95%",
                offset: 10,
                position: "top"
              }}
            />
            
            {/* VaR 99% line */}
            <ReferenceLine 
              x={var99PLN} 
              stroke="#ef4444" 
              strokeWidth={4}
              strokeDasharray="8 4"
              label={{
                value: "VaR 99%",
                offset: 10,
                position: "top"
              }}
            />
            
            {/* ES 95% line */}
            <ReferenceLine 
              x={es95PLN} 
              stroke="#f97316" 
              strokeWidth={3}
              strokeDasharray="12 3"
              label={{
                value: "ES 95%",
                offset: 10,
                position: "bottom"
              }}
            />
            
            {/* ES 99% line */}
            <ReferenceLine 
              x={es99PLN} 
              stroke="#dc2626" 
              strokeWidth={3}
              strokeDasharray="12 3"
              label={{
                value: "ES 99%",
                offset: 10,
                position: "bottom"
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for risk metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-amber-500 relative">
            <div className="absolute inset-0 bg-amber-500" style={{ clipPath: 'polygon(0 25%, 100% 25%, 100% 75%, 0 75%)' }}></div>
          </div>
          <span className="text-sm font-medium">VaR 95%: {Math.abs(var95PLN).toFixed(0)} zł</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-red-500 relative">
            <div className="absolute inset-0 bg-red-500" style={{ clipPath: 'polygon(0 25%, 100% 25%, 100% 75%, 0 75%)' }}></div>
          </div>
          <span className="text-sm font-medium">VaR 99%: {Math.abs(var99PLN).toFixed(0)} zł</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 border-t-2 border-orange-500 border-dashed"></div>
          <span className="text-sm font-medium">ES 95%: {Math.abs(es95PLN).toFixed(0)} zł</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 border-t-2 border-red-600 border-dashed"></div>
          <span className="text-sm font-medium">ES 99%: {Math.abs(es99PLN).toFixed(0)} zł</span>
        </div>
      </div>

      {/* Risk Interpretation */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Interpretacja:</h5>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>VaR 95%:</strong> Prawdopodobieństwo straty większej niż {Math.abs(var95PLN).toFixed(0)} zł wynosi 5%</li>
          <li>• <strong>VaR 99%:</strong> Prawdopodobieństwo straty większej niż {Math.abs(var99PLN).toFixed(0)} zł wynosi 1%</li>
          <li>• <strong>ES:</strong> Oczekiwana strata w najgorszych scenariuszach (tail risk)</li>
          <li>• <strong>Histogram:</strong> Pokazuje rozkład dziennych zysków/strat portfolio na podstawie rzeczywistych danych historycznych</li>
        </ul>
      </div>
    </div>
  );
}