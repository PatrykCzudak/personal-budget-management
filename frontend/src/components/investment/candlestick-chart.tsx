import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, TrendingUp, TrendingDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, LineChart } from "recharts";

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  typeDisp: string;
  exchange: string;
}

export default function CandlestickChart() {
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [period, setPeriod] = useState("1y");

  // Search symbols mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/search/${encodeURIComponent(query)}`);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data || []);
    }
  });

  // Get historical data mutation
  const historicalMutation = useMutation({
    mutationFn: async ({ symbol, period }: { symbol: string; period: string }) => {
      const response = await apiRequest("GET", `/api/historical/${symbol}?period=${period}`);
      return response.json();
    },
    onSuccess: (data) => {
      // Przekształć dane Yahoo Finance na format dla wykresu
      const formattedData = data.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('pl-PL'),
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
        volume: item.volume || 0
      })).slice(-100); // Ostatnie 100 punktów danych

      setHistoricalData(formattedData);
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery.trim());
    }
  };

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchResults([]);
    setSearchQuery("");
    historicalMutation.mutate({ symbol, period });
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (selectedSymbol) {
      historicalMutation.mutate({ symbol: selectedSymbol, period: newPeriod });
    }
  };

  const formatTooltip = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(2)} USD`, name === 'close' ? 'Zamknięcie' : name === 'volume' ? 'Wolumen' : name];
    }
    return [value, name];
  };

  // Oblicz zmianę cenową
  const priceChange = historicalData.length >= 2 
    ? historicalData[historicalData.length - 1].close - historicalData[historicalData.length - 2].close
    : 0;
  const priceChangePercent = historicalData.length >= 2
    ? (priceChange / historicalData[historicalData.length - 2].close) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Symbol Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5 text-blue-600" />
            Wybierz instrument do analizy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Wpisz nazwę lub symbol (np. AAPL, MSFT, Tesla)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={searchMutation.isPending || !searchQuery.trim()}
              >
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-gray-900">Wybierz instrument:</h4>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSymbolSelect(result.symbol)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{result.symbol}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{result.exchange}</span>
                      </div>
                      <p className="text-sm text-gray-600">{result.shortname || result.longname}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Selection */}
            {selectedSymbol && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <span className="font-medium text-blue-900">Wybrany: {selectedSymbol}</span>
                  {historicalData.length > 0 && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        Ostatnia cena: {historicalData[historicalData.length - 1]?.close.toFixed(2)} USD
                      </span>
                      <span className={`text-sm flex items-center ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {priceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </div>
                <Select value={period} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 miesiąc</SelectItem>
                    <SelectItem value="3m">3 miesiące</SelectItem>
                    <SelectItem value="6m">6 miesięcy</SelectItem>
                    <SelectItem value="1y">1 rok</SelectItem>
                    <SelectItem value="2y">2 lata</SelectItem>
                    <SelectItem value="5y">5 lat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {selectedSymbol && (
        <Card>
          <CardHeader>
            <CardTitle>Wykres cenowy - {selectedSymbol}</CardTitle>
          </CardHeader>
          <CardContent>
            {historicalMutation.isPending ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Ładowanie danych historycznych...</span>
              </div>
            ) : historicalData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin * 0.95', 'dataMax * 1.05']}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      formatter={formatTooltip}
                      labelStyle={{ color: '#333' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                Brak danych do wyświetlenia
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market Data Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="text-blue-600 h-6 w-6 mt-1" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Funkcje Analizy Rynkowej</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Dane w czasie rzeczywistym z Yahoo Finance</li>
                <li>• Historia cen z różnymi okresami czasu</li>
                <li>• Interaktywne wykresy z dokładnymi danymi</li>
                <li>• Wyszukiwanie po symbolach i nazwach firm</li>
                <li>• Obsługa akcji, ETF-ów i innych instrumentów</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}