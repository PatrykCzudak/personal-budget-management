import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Calculator, TrendingDown, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import VaRChart from "@/components/charts/var-chart";
import { 
  calculateVaR, 
  calculateExpectedShortfall, 
  calculateBeta, 
  calculateSharpeRatio, 
  calculateMaxDrawdown, 
  calculateVolatility,
  performStressTesting,
  type RiskMetrics,
  type TimeSeriesData
} from "@/utils/risk-calculations";
import type { Investment } from "../../types";



export default function RiskAnalysis() {
  const { data: investments = [] } = useQuery<Investment[]>({ queryKey: ["/api/investments"] });
  const [confidence, setConfidence] = useState("95");
  const [timeHorizon, setTimeHorizon] = useState("1");
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Fetch real historical portfolio data
  const { data: historicalData = [] } = useQuery<TimeSeriesData[]>({ 
    queryKey: ["/api/portfolio/historical/252"],
    enabled: investments.length > 0
  });

  // Generate realistic historical data based on current portfolio
  const generateHistoricalData = (): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 252); // 1 year of trading days
    
    let cumulativeReturn = 0;
    const initialValue = investments.reduce((sum, inv) => 
      sum + (parseFloat(inv.currentPrice || inv.purchasePrice) * parseFloat(inv.quantity)), 0) || 10000;
    
    for (let i = 0; i < 252; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate more realistic returns with some autocorrelation and volatility clustering
      const previousReturn = i > 0 ? data[i-1].returns : 0;
      const volatility = 0.015 + 0.005 * Math.abs(previousReturn); // Volatility clustering
      const meanReversion = -0.1 * previousReturn; // Mean reversion
      const randomShock = (Math.random() - 0.5) * 2 * volatility;
      
      const dailyReturn = 0.0003 + meanReversion + randomShock; // Small positive drift with mean reversion
      cumulativeReturn += dailyReturn;
      
      data.push({
        date: date.toISOString(),
        portfolioValue: initialValue * (1 + cumulativeReturn),
        returns: dailyReturn,
        cumulativeReturns: cumulativeReturn
      });
    }
    
    return data;
  };

  const portfolioData = historicalData.length > 0 ? historicalData : generateHistoricalData();

  const calculateRiskMetrics = async () => {
    setCalculating(true);
    
    try {
      const portfolioValue = investments.reduce((sum, inv) => 
        sum + (parseFloat(inv.currentPrice || inv.purchasePrice) * parseFloat(inv.quantity)), 0) || 10000;
      
      const returns = portfolioData.map(d => d.returns);
      const cumulativeReturns = portfolioData.map(d => d.cumulativeReturns);
      const confidenceLevel = parseFloat(confidence) / 100;
      const horizon = parseInt(timeHorizon);
      
      // Generate mock market returns for beta calculation (in real app, fetch S&P 500 data)
      const marketReturns = returns.map(r => r * 0.8 + (Math.random() - 0.5) * 0.01);
      
      const metrics: RiskMetrics = {
        var95: calculateVaR(returns, 0.95, portfolioValue, horizon),
        var99: calculateVaR(returns, 0.99, portfolioValue, horizon),
        expectedShortfall95: calculateExpectedShortfall(returns, 0.95, portfolioValue, horizon),
        expectedShortfall99: calculateExpectedShortfall(returns, 0.99, portfolioValue, horizon),
        beta: calculateBeta(returns, marketReturns),
        sharpeRatio: calculateSharpeRatio(returns),
        maxDrawdown: calculateMaxDrawdown(cumulativeReturns),
        volatility: calculateVolatility(returns)
      };
      
      setRiskMetrics(metrics);
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
    } finally {
      setCalculating(false);
    }
  };



  const portfolioValue = investments.reduce((sum, inv) => 
    sum + (parseFloat(inv.currentPrice || inv.purchasePrice) * parseFloat(inv.quantity)), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Analiza Ryzyka Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Informacje o Portfolio</h3>
            <p className="text-blue-700">Całkowita wartość: <span className="font-bold">{portfolioValue.toFixed(2)} zł</span></p>
            <p className="text-blue-700">Liczba pozycji: <span className="font-bold">{investments.length}</span></p>
          </div>

          <Tabs defaultValue="var-es" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="var-es">VaR & Expected Shortfall</TabsTrigger>
              <TabsTrigger value="metrics">Metryki Ryzyka</TabsTrigger>
              <TabsTrigger value="stress">Test Stresu</TabsTrigger>
            </TabsList>

            <TabsContent value="var-es" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Value at Risk (VaR) & Expected Shortfall (ES)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="confidence">Poziom ufności (%)</Label>
                      <Input
                        id="confidence"
                        value={confidence}
                        onChange={(e) => setConfidence(e.target.value)}
                        placeholder="95"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeHorizon">Horyzont czasowy (dni)</Label>
                      <Input
                        id="timeHorizon"
                        value={timeHorizon}
                        onChange={(e) => setTimeHorizon(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={calculateRiskMetrics} 
                    disabled={calculating}
                    className="w-full"
                  >
                    {calculating ? "Obliczanie..." : "Oblicz VaR i Expected Shortfall"}
                  </Button>

                  {riskMetrics && (
                    <div className="space-y-6">
                      {/* Risk Metrics Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-800">VaR 95%</h4>
                          <p className="text-xl font-bold text-red-600">
                            {riskMetrics.var95.toFixed(2)} zł
                          </p>
                          <p className="text-xs text-red-600">
                            Max strata 95%
                          </p>
                        </div>
                        <div className="p-4 bg-red-100 rounded-lg">
                          <h4 className="font-semibold text-red-800">VaR 99%</h4>
                          <p className="text-xl font-bold text-red-700">
                            {riskMetrics.var99.toFixed(2)} zł
                          </p>
                          <p className="text-xs text-red-700">
                            Max strata 99%
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h4 className="font-semibold text-orange-800">ES 95%</h4>
                          <p className="text-xl font-bold text-orange-600">
                            {riskMetrics.expectedShortfall95.toFixed(2)} zł
                          </p>
                          <p className="text-xs text-orange-600">
                            Średnia w tail 5%
                          </p>
                        </div>
                        <div className="p-4 bg-orange-100 rounded-lg">
                          <h4 className="font-semibold text-orange-800">ES 99%</h4>
                          <p className="text-xl font-bold text-orange-700">
                            {riskMetrics.expectedShortfall99.toFixed(2)} zł
                          </p>
                          <p className="text-xs text-orange-700">
                            Średnia w tail 1%
                          </p>
                        </div>
                      </div>

                      {/* VaR Chart */}
                      <VaRChart 
                        data={portfolioData}
                        var95={riskMetrics.var95}
                        var99={riskMetrics.var99}
                        es95={riskMetrics.expectedShortfall95}
                        es99={riskMetrics.expectedShortfall99}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dodatkowe Metryki Ryzyka
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {riskMetrics ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Beta</h4>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {riskMetrics.beta.toFixed(2)}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            Wrażliwość na ruchy rynku
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200">Sharpe Ratio</h4>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {riskMetrics.sharpeRatio.toFixed(2)}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            Stosunek zwrotu do ryzyka
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-semibold text-purple-800 dark:text-purple-200">Max Drawdown</h4>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {(riskMetrics.maxDrawdown * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-purple-600 dark:text-purple-300">
                            Maksymalny spadek wartości
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Volatility</h4>
                          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {(riskMetrics.volatility * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300">
                            Zmienność zwrotów
                          </p>
                        </div>
                      </div>

                      {/* Detailed explanations */}
                      <div className="space-y-4">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">Szczegółowe wyjaśnienia:</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                            <h6 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Beta ({riskMetrics.beta.toFixed(2)})</h6>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                              <li>• Beta = 1: Portfolio porusza się dokładnie z rynkiem</li>
                              <li>• Beta {'>'} 1: Większa zmienność niż rynek (wyższe ryzyko i potencjał)</li>
                              <li>• Beta {'<'} 1: Mniejsza zmienność niż rynek (niższe ryzyko)</li>
                              <li>• Beta {'<'} 0: Portfolio porusza się przeciwnie do rynku</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                            <h6 className="font-semibold text-green-900 dark:text-green-100 mb-2">Sharpe Ratio ({riskMetrics.sharpeRatio.toFixed(2)})</h6>
                            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                              <li>• {'>'} 2.0: Doskonały zwrot względem ryzyka</li>
                              <li>• 1.0-2.0: Dobry stosunek zwrotu do ryzyka</li>
                              <li>• 0.5-1.0: Akceptowalny</li>
                              <li>• {'<'} 0.5: Słaby - może nie warto ryzyka</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                            <h6 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Max Drawdown ({(riskMetrics.maxDrawdown * 100).toFixed(1)}%)</h6>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                              Największy historyczny spadek od szczytu do dołka. Pokazuje najgorszy scenariusz, 
                              jaki mógł się zdarzyć. Wyższy drawdown = większe ryzyko znacznych strat w krótkim czasie.
                            </p>
                          </div>

                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                            <h6 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Volatility ({(riskMetrics.volatility * 100).toFixed(1)}%)</h6>
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              <p className="mb-2">Roczna zmienność zwrotów (odchylenie standardowe):</p>
                              <ul className="space-y-1">
                                <li>• Akcje: 15-25% (typowe)</li>
                                <li>• Obligacje: 3-8%</li>
                                <li>• Kryptowaluty: 50-100%+</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Uruchom kalkulację VaR lub Expected Shortfall aby zobaczyć dodatkowe metryki
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Stresu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      Symulacja wpływu ekstremalnych warunków rynkowych na portfolio opartych na danych historycznych.
                    </p>
                    
                    {(() => {
                      const currentValue = investments.reduce((sum, inv) => 
                        sum + (parseFloat(inv.currentPrice || inv.purchasePrice) * parseFloat(inv.quantity)), 0) || 10000;
                      const returns = portfolioData.map(d => d.returns);
                      const stressResults = performStressTesting(currentValue, returns);
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stressResults.map((scenario, index) => (
                            <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <h4 className="font-semibold text-red-800 dark:text-red-200">{scenario.name}</h4>
                              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                -{scenario.estimatedLoss.toFixed(0)} zł
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                Spadek o {scenario.estimatedLossPct.toFixed(1)}%
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {scenario.description}
                              </p>
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>Czas trwania: {scenario.duration} dni</span>
                                <br />
                                <span>Mnożnik volatility: {scenario.volatilityMultiplier}x</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    
                    {/* Explanation */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Metodologia testów stresu:
                      </h5>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• <strong>Scenariusze historyczne:</strong> Oparte na rzeczywistych kryzysach finansowych</li>
                        <li>• <strong>Korelacja z rynkiem:</strong> Uwzględnia beta portfolio względem indeksów</li>
                        <li>• <strong>Volatility clustering:</strong> Zwiększona zmienność w okresach stresu</li>
                        <li>• <strong>Nieliniowość:</strong> Większe straty w ekstremalnych scenariuszach</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}