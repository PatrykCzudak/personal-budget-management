import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface BinanceBalance {
  asset: string;
  quantity: number;
  price: number;
  value: number;
  pnl_24h: number;
}

export default function CryptoPage() {
  const { data, isLoading, error } = useQuery<{ balances: BinanceBalance[] }>({
    queryKey: ['/api/crypto/binance'],
  });

  if (isLoading) {
    return <div className="p-8">Ładowanie...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Błąd wczytywania danych</div>;
  }

  const balances = data?.balances || [];
  const totalValue = balances.reduce((sum, b) => sum + b.value, 0);
  const totalPnl = balances.reduce((sum, b) => sum + b.pnl_24h, 0);

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
                <th className="py-2 text-right">Cena [USDT]</th>
                <th className="py-2 text-right">Wartość [USDT]</th>
                <th className="py-2 text-right">Zysk/Strata 24h [USDT]</th>
              </tr>
            </thead>
            <tbody>
              {balances.map(b => (
                <tr key={b.asset} className="border-b last:border-b-0">
                  <td className="py-2">{b.asset}</td>
                  <td className="py-2 text-right">{b.quantity.toFixed(8)}</td>
                  <td className="py-2 text-right">{b.price.toFixed(2)}</td>
                  <td className="py-2 text-right">{b.value.toFixed(2)}</td>
                  <td
                    className={`py-2 text-right ${b.pnl_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {b.pnl_24h >= 0 ? '+' : ''}{b.pnl_24h.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2">Suma</td>
                <td></td>
                <td></td>
                <td className="py-2 text-right">{totalValue.toFixed(2)}</td>
                <td
                  className={`py-2 text-right ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
