import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiUrl } from '@/lib/api';
import { useBudget } from '../hooks/useBudget';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Percent, ShoppingCart, Bot } from 'lucide-react';
import InvestmentForm from '../components/forms/InvestmentForm';
import AllocationChart from '../components/charts/allocation-chart';
import AIAssistant from '../components/ai/AIAssistant';
import type { Investment, InvestmentSale } from '../types';

export default function InvestmentsPage() {
  // Stany lokalne dla formularzy i filtrowania
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [sellingInvestment, setSellingInvestment] = useState<Investment | null>(null);
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [activeTab, setActiveTab] = useState<'portfolio' | 'ai'>('portfolio');

  // Pobranie danych portfela i zysków ze sprzedaży
  const { data: investments = [], isLoading } = useQuery<Investment[]>({ queryKey: ['/api/investments'] });
  const { data: profitLossData } = useQuery<{ totalProfitLoss: number }>({ queryKey: ['/api/portfolio/profit-loss'] });
  const { data: investmentSales = [] } = useQuery<InvestmentSale[]>({ queryKey: ['/api/investment-sales'] });
  const { deleteInvestment } = useBudget();

  // Mutacja sprzedaży inwestycji
  const sellInvestmentMutation = useMutation({
    mutationFn: async ({ id, quantitySold, salePrice }: { id: string; quantitySold: number; salePrice: number }) => {
      await fetch(apiUrl(`/api/investments/${id}/sell`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantitySold, salePrice }),
      });
    },
    onSuccess: () => {
      // Odśwież dane portfela po sprzedaży
      queryClient.invalidateQueries(['/api/investments']);
      queryClient.invalidateQueries(['/api/portfolio/profit-loss']);
      queryClient.invalidateQueries(['/api/investment-sales']);
      setShowSellDialog(false);
      setSellingInvestment(null);
      setSellQuantity('');
      setSellPrice('');
    }
  });

  // Obliczenia podsumowujące portfel
  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.purchasePrice) * parseFloat(inv.quantity), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => {
    const currentPrice = parseFloat(inv.currentPrice || inv.purchasePrice);
    return sum + currentPrice * parseFloat(inv.quantity);
  }, 0);
  const unrealizedProfitLoss = totalCurrentValue - totalInvested;
  const totalROI = totalInvested > 0 ? (unrealizedProfitLoss / totalInvested) * 100 : 0;
  const realizedProfitLoss = profitLossData?.totalProfitLoss || 0;
  const totalProfitLoss = unrealizedProfitLoss + realizedProfitLoss;

  // Filtruj listę inwestycji po typie
  const filteredInvestments = investments.filter(inv => filterType === 'all' || inv.type === filterType);

  // Funkcje obsługi modali
  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowInvestmentForm(true);
  };
  const closeInvestmentForm = () => {
    setEditingInvestment(null);
    setShowInvestmentForm(false);
  };
  const handleDeleteInvestment = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę inwestycję?')) {
      await deleteInvestment.mutateAsync(id);
    }
  };
  const handleSellInvestment = (investment: Investment) => {
    setSellingInvestment(investment);
    setSellPrice(investment.currentPrice || investment.purchasePrice);
    setShowSellDialog(true);
  };
  const submitSell = () => {
    if (!sellingInvestment || !sellQuantity || !sellPrice) return;
    const quantity = parseFloat(sellQuantity);
    const price = parseFloat(sellPrice);
    if (quantity <= 0 || price <= 0 || quantity > parseFloat(sellingInvestment.quantity)) {
      alert('Nieprawidłowa ilość lub cena');
      return;
    }
    sellInvestmentMutation.mutate({ id: sellingInvestment.id, quantitySold: quantity, salePrice: price });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Ładowanie...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Podsumowanie portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Wartość portfolio</p>
                <p className="text-2xl font-bold text-gray-900">{totalCurrentValue.toFixed(2)} zł</p>
                <p className={`text-sm ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)} zł ({totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%)
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Całkowita inwestycja</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvested.toFixed(2)} zł</p>
                <p className="text-sm text-gray-600">{investments.length} instrumentów</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ROI</p>
                <p className={`text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600">całkowity zwrot</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Percent className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Zrealizowane zyski/straty</p>
                <p className={`text-2xl font-bold ${realizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {realizedProfitLoss >= 0 ? '+' : ''}{realizedProfitLoss.toFixed(2)} zł
                </p>
                <p className="text-sm text-gray-600">ze sprzedanych pozycji</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ShoppingCart className="text-orange-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zakładki: Portfolio / AI Asystent */}
      <div>
        <div className="mb-4 grid grid-cols-2">
          <Button variant={activeTab === 'portfolio' ? 'default' : 'outline'} onClick={() => setActiveTab('portfolio')}>
            Portfolio
          </Button>
          <Button variant={activeTab === 'ai' ? 'default' : 'outline'} onClick={() => setActiveTab('ai')}>
            <Bot className="mr-2 h-4 w-4" /> AI Asystent
          </Button>
        </div>

        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Formularz Dodaj inwestycję + wykres alokacji */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Dodaj inwestycję</CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={showInvestmentForm} onOpenChange={setShowInvestmentForm}>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setEditingInvestment(null)}>
                        <Plus className="mr-2 h-4 w-4" /> Dodaj inwestycję
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingInvestment ? 'Edytuj inwestycję' : 'Dodaj inwestycję'}</DialogTitle>
                      </DialogHeader>
                      <InvestmentForm 
                        investment={editingInvestment} 
                        onSuccess={closeInvestmentForm} 
                        onCancel={closeInvestmentForm} 
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Alokacja portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <AllocationChart investments={investments} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela posiadanych inwestycji */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Posiadane instrumenty</CardTitle>
                <div className="flex space-x-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Wszystkie typy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="akcje">Akcje</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                      <SelectItem value="obligacje">Obligacje</SelectItem>
                      <SelectItem value="kryptowaluty">Kryptowaluty</SelectItem>
                      <SelectItem value="nieruchomości">Nieruchomości</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Inwestycja</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Typ</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Ilość</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Cena</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">Brak inwestycji do wyświetlenia</td>
                        </tr>
                      ) : (
                        filteredInvestments.map(investment => (
                          <tr key={investment.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <span className="font-medium text-gray-900">{investment.symbol}</span>
                                <p className="text-sm text-gray-500">{investment.name}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded ${investment.type === 'akcje' ? 'bg-blue-100 text-blue-800'
                                : investment.type === 'etf' ? 'bg-green-100 text-green-800'
                                : investment.type === 'obligacje' ? 'bg-yellow-100 text-yellow-800'
                                : investment.type === 'kryptowaluty' ? 'bg-purple-100 text-purple-800'
                                : investment.type === 'nieruchomości' ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'}`}>
                                {investment.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">{parseFloat(investment.quantity).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {(investment.currentPrice || investment.purchasePrice) + ' zł'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditInvestment(investment)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleSellInvestment(investment)}>
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteInvestment(investment.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'ai' && (
          <AIAssistant />
        )}
      </div>

      {/* Dialog sprzedaży inwestycji */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sprzedaj inwestycję</DialogTitle>
          </DialogHeader>
          {sellingInvestment && (
            <div className="space-y-4">
              <p className="text-sm">Sprzedawana pozycja: <span className="font-medium">{sellingInvestment.name} ({sellingInvestment.symbol})</span></p>
              <div className="flex space-x-2">
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="Ilość" 
                  value={sellQuantity} 
                  onChange={e => setSellQuantity(e.target.value)} 
                />
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="Cena sprzedaży" 
                  value={sellPrice} 
                  onChange={e => setSellPrice(e.target.value)} 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSellDialog(false)}>Anuluj</Button>
                <Button onClick={submitSell}>Zatwierdź</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
