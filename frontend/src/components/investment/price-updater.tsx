import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";
import CandlestickChart from "./candlestick-chart";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PriceData {
  symbol: string;
  price: number;
}

interface SearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  typeDisp: string;
  exchange: string;
}

export default function PriceUpdater() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  // Update all prices mutation
  const updatePricesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/prices/update");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Ceny zostały zaktualizowane",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować cen",
        variant: "destructive",
      });
    },
  });

  // Search symbols mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/search/${encodeURIComponent(query)}`);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data || []);
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się wyszukać symboli",
        variant: "destructive",
      });
    },
  });

  // Get specific price mutation
  const getPriceMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await apiRequest("GET", `/api/prices/${symbol}`);
      return response.json();
    },
    onSuccess: (data: PriceData) => {
      toast({
        title: "Cena pobrana",
        description: `${data.symbol}: ${data.price} USD`,
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ceny",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery.trim());
    }
  };

  const handleGetPrice = (symbol: string) => {
    getPriceMutation.mutate(symbol);
  };

  const getExchangeBadgeColor = (exchange: string) => {
    switch (exchange?.toUpperCase()) {
      case 'NASDAQ':
        return 'bg-blue-100 text-blue-800';
      case 'NYSE':
        return 'bg-green-100 text-green-800';
      case 'TSX':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type?.toLowerCase().includes('etf')) {
      return <TrendingUp className="h-4 w-4" />;
    }
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Price Update Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 h-5 w-5 text-blue-600" />
            Aktualizacja Cen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Automatyczna aktualizacja</p>
                  <p className="text-sm text-blue-700">Ceny są aktualizowane co 15 minut w godzinach handlowych</p>
                </div>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            <Button
              onClick={() => updatePricesMutation.mutate()}
              disabled={updatePricesMutation.isPending}
              className="w-full"
            >
              {updatePricesMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Aktualizuję ceny...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Aktualizuj wszystkie ceny teraz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Component */}
      <CandlestickChart />

      {/* Market Data Info */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="text-green-600 h-6 w-6 mt-1" />
            <div>
              <h3 className="font-medium text-green-800 mb-2">Źródła Danych Rynkowych</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Yahoo Finance - akcje, ETF-y, indeksy</li>
                <li>• Dane w czasie rzeczywistym z głównych giełd</li>
                <li>• Obsługa instrumentów z NYSE, NASDAQ, LSE i innych</li>
                <li>• Automatyczne aktualizacje w godzinach handlowych</li>
                <li>• Historia cen i dane fundamentalne</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}