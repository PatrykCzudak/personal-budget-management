import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { InvestmentSale } from '../../types';

interface ProfitLossChartProps {
  investmentSales: InvestmentSale[];
}

export default function ProfitLossChart({ investmentSales }: ProfitLossChartProps) {
  // Sortuj sprzedaże chronologicznie i oblicz skumulowane zyski/straty
  const sortedSales = [...investmentSales].sort((a, b) => 
    new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
  );

  let cumulativeProfitLoss = 0;
  const chartData = sortedSales.map((sale) => {
    cumulativeProfitLoss += parseFloat(sale.profitLoss);
    return {
      date: new Date(sale.saleDate).toLocaleDateString('pl-PL', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      fullDate: sale.saleDate,
      transactionProfitLoss: parseFloat(sale.profitLoss),
      cumulativeProfitLoss: cumulativeProfitLoss,
      symbol: sale.investmentSymbol,
      quantity: parseFloat(sale.quantitySold),
      saleValue: parseFloat(sale.totalSaleValue)
    };
  });

  // Jeśli brak danych, pokaż pustą wiadomość
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Brak danych do wyświetlenia</p>
          <p className="text-sm">Sprzedaj jakieś inwestycje aby zobaczyć wykres zysków/strat</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium">{`Data: ${label}`}</p>
          <p className="text-blue-600">
            {`Skumulowane: ${data.cumulativeProfitLoss >= 0 ? '+' : ''}${data.cumulativeProfitLoss.toFixed(2)} zł`}
          </p>
          <p className={`${data.transactionProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {`Transakcja: ${data.transactionProfitLoss >= 0 ? '+' : ''}${data.transactionProfitLoss.toFixed(2)} zł`}
          </p>
          <p className="text-sm text-gray-600">
            {`${data.symbol}: ${data.quantity} szt. za ${data.saleValue.toFixed(2)} zł`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          stroke="#666"
          fontSize={12}
          tick={{ fill: '#666' }}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          tick={{ fill: '#666' }}
          tickFormatter={(value) => `${value.toFixed(0)} zł`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="cumulativeProfitLoss" 
          stroke="#2563eb" 
          strokeWidth={3}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, fill: '#2563eb' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}