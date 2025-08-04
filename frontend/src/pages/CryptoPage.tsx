import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CandlestickChart from '@/components/crypto/candlestick-chart';
import ProfitLossHistoryChart from '@/components/crypto/pnl-chart';

interface BinanceBalance {
  asset: string;
  quantity: number;
  price: number;
  value: number;
  pnl_24h: number;
  price_pln: number;
  value_pln: number;
  pnl_24h_pln: number;
}

interface Kline {
  open_time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function CryptoPage() {
  const { data, isLoading, error } = useQuery<{ balances: BinanceBalance[]; usdt_pln: number }>({
    queryKey: ['/api/crypto/binance'],
  });

  const [selectedAsset, setSelectedAsset] = useState<string | undefined>();

  const { data: klinesData } = useQuery<{ klines: Kline[] }>({
    queryKey: ['/api/crypto/binance/klines', selectedAsset ? `${selectedAsset}USDT` : ''],
    enabled: !!selectedAsset,
  });

  if (isLoading) {
    return <div className="p-8">Ładowanie...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Błąd wczytywania danych</div>;
  }

  const balances = data?.balances || [];
  const totalValue = balances.reduce((sum, b) => sum + b.value_pln, 0);
  const totalPnl = balances.reduce((sum, b) => sum + b.pnl_24h_pln, 0);

  const candleData =
    klinesData?.klines.map(k => ({
      time: new Date(k.open_time).toLocaleString('pl-PL', {
        hour: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }),
      ...k,
    })) || [];

  const quantity = balances.find(b => b.asset === selectedAsset)?.quantity || 0;
  const rate = data?.usdt_pln || 0;
  const baseClose = candleData[0]?.close || 0;
  const profitHistory = candleData.map(c => ({
    time: c.time,
    value: (c.close - baseClose) * quantity * rate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfel krypto (Binance)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Aktywo</th>
                <th className="py-2 text-right">Ilość</th>
                <th className="py-2 text-right">Cena [PLN]</th>
                <th className="py-2 text-right">Wartość [PLN]</th>
                <th className="py-2 text-right">Zysk/Strata 24h [PLN]</th>
              </tr>
            </thead>
            <tbody>
              {balances.map(b => (
                <tr key={b.asset} className="border-b last:border-b-0">
                  <td className="py-2">{b.asset}</td>
                  <td className="py-2 text-right">{b.quantity.toFixed(8)}</td>
                  <td className="py-2 text-right">{b.price_pln.toFixed(2)}</td>
                  <td className="py-2 text-right">{b.value_pln.toFixed(2)}</td>
                  <td
                    className={`py-2 text-right ${b.pnl_24h_pln >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {b.pnl_24h_pln >= 0 ? '+' : ''}{b.pnl_24h_pln.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2">Suma</td>
                <td></td>
                <td></td>
                <td className="py-2 text-right">{totalValue.toFixed(2)}</td>
                <td className={`py-2 text-right ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {balances.length > 0 && (
          <div className="mt-6 space-y-6">
            <div>
              <select
                className="border p-2 rounded"
                value={selectedAsset}
                onChange={e => setSelectedAsset(e.target.value)}
              >
                <option value="" disabled>
                  Wybierz aktywo
                </option>
                {balances.map(b => (
                  <option key={b.asset} value={b.asset}>
                    {b.asset}
                  </option>
                ))}
              </select>
            </div>

            {candleData.length > 0 && (
              <div className="h-80">
                <CandlestickChart data={candleData} />
              </div>
            )}

            {profitHistory.length > 0 && (
              <div className="h-64">
                <ProfitLossHistoryChart data={profitHistory} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}