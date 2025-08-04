import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiUrl } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Bot, TrendingUp, PieChart, Target, Lightbulb, Send, Loader2 } from 'lucide-react';

interface AnalysisResult {
  type: 'portfolio' | 'budget' | 'risk' | 'recommendation';
  title: string;
  content: string;
  data?: any;
  confidence: number;
}
interface AIQuery {
  type: 'analyze' | 'recommend' | 'predict' | 'optimize';
  context: string;
  data?: any;
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'ai-models' | 'forecasting' | 'optimization'>('analysis');
  const [activeAnalysis, setActiveAnalysis] = useState<'portfolio' | 'budget' | 'recommendations' | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [queryType, setQueryType] = useState<AIQuery['type']>('analyze');

  // Zapytania React Query do endpointów AI (wykonywane tylko gdy aktywne)
  const { data: portfolioAnalysis, isLoading: isPortfolioLoading, refetch: refetchPortfolio } = useQuery<AnalysisResult>({
    queryKey: ['/api/ai/analyze/portfolio'],
    enabled: activeAnalysis === 'portfolio'
  });
  const { data: budgetAnalysis, isLoading: isBudgetLoading, refetch: refetchBudget } = useQuery<AnalysisResult>({
    queryKey: ['/api/ai/analyze/budget'],
    enabled: activeAnalysis === 'budget'
  });
  const { data: recommendations, isLoading: isRecommendationsLoading, refetch: refetchRecommendations } = useQuery<AnalysisResult[]>({
    queryKey: ['/api/ai/recommendations'],
    enabled: activeAnalysis === 'recommendations'
  });

  // Mutacja zapytania własnego (POST na /api/ai/query)
  const customQueryMutation = useMutation({
    mutationFn: async (query: AIQuery) => {
      const res = await fetch(apiUrl('/api/ai/query'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      return res.json();
    },
    onSuccess: () => {
      setActiveTab('analysis');
      setActiveAnalysis('recommendations');  // zakładamy, że wynik pojawi się jako rekomendacja/analiza
      refetchRecommendations();
    }
  });

  // Kliknięcie w przycisk analizy (portfolio, budżet, rekomendacje)
  const handleAnalysisClick = (type: 'portfolio' | 'budget' | 'recommendations') => {
    setActiveAnalysis(type);
    switch (type) {
      case 'portfolio':
        refetchPortfolio();
        break;
      case 'budget':
        refetchBudget();
        break;
      case 'recommendations':
        refetchRecommendations();
        break;
    }
  };

  // Wysłanie własnego zapytania AI
  const handleCustomQuerySubmit = () => {
    if (!customQuery.trim()) return;
    const query: AIQuery = { type: queryType, context: customQuery };
    customQueryMutation.mutate(query);
  };

  // Renderowanie wyniku pojedynczej analizy
  const renderAnalysis = (analysis?: AnalysisResult, isLoading?: boolean) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Analizuję dane...</span>
        </div>
      );
    }
    if (!analysis) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{analysis.title}</h3>
          <Badge variant="secondary" className={`${
            analysis.confidence > 0.8 ? 'bg-green-100 text-green-800' :
            analysis.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Pewność: {(analysis.confidence * 100).toFixed(0)}%
          </Badge>
        </div>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-line text-gray-700">{analysis.content}</div>
        </div>
      </div>
    );
  };

  // Renderowanie listy rekomendacji
  const renderRecommendations = (recs?: AnalysisResult[], isLoading?: boolean) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Generuję rekomendacje...</span>
        </div>
      );
    }
    if (!recs || recs.length === 0) {
      return <div className="text-center p-8 text-gray-500">Brak rekomendacji do wyświetlenia</div>;
    }
    return (
      <div className="space-y-6">
        {recs.map((rec, index) => (
          <div key={index} className="border-l-4 border-purple-500 pl-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{rec.title}</h4>
              <Badge variant="outline">{(rec.confidence * 100).toFixed(0)}%</Badge>
            </div>
            <div className="whitespace-pre-line text-gray-700 text-sm">{rec.content}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek AI Asystenta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-6 w-6 text-purple-600" />
            AI Asystent Finansowy – Zaawansowana Analiza
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Przełączniki trybów analizy */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Button variant={activeTab === 'analysis' ? 'default' : 'outline'} onClick={() => setActiveTab('analysis')}>
              <TrendingUp className="mr-2 h-4 w-4" /> Analiza Klasyczna
            </Button>
            <Button variant={activeTab === 'ai-models' ? 'default' : 'outline'} onClick={() => setActiveTab('ai-models')}>
              <Lightbulb className="mr-2 h-4 w-4" /> Modele AI
            </Button>
            <Button variant={activeTab === 'forecasting' ? 'default' : 'outline'} onClick={() => setActiveTab('forecasting')}>
              <TrendingUp className="mr-2 h-4 w-4" /> Prognozowanie
            </Button>
            <Button variant={activeTab === 'optimization' ? 'default' : 'outline'} onClick={() => setActiveTab('optimization')}>
              <Target className="mr-2 h-4 w-4" /> Optymalizacja
            </Button>
          </div>

          {/* Zawartość zakładki Analiza Klasyczna */}
          {activeTab === 'analysis' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Podzakładki analizy klasycznej */}
              <Button variant={activeAnalysis === 'portfolio' ? 'default' : 'outline'} onClick={() => handleAnalysisClick('portfolio')}>
                <PieChart className="mr-2 h-4 w-4" /> Analiza Portfolio
              </Button>
              <Button variant={activeAnalysis === 'budget' ? 'default' : 'outline'} onClick={() => handleAnalysisClick('budget')}>
                <PieChart className="mr-2 h-4 w-4" /> Analiza Budżetu
              </Button>
              <Button variant={activeAnalysis === 'recommendations' ? 'default' : 'outline'} onClick={() => handleAnalysisClick('recommendations')}>
                <PieChart className="mr-2 h-4 w-4" /> Rekomendacje
              </Button>

              {/* Wyniki wybranej analizy */}
              <div className="md:col-span-3 space-y-6 mt-4">
                {activeAnalysis === 'portfolio' && renderAnalysis(portfolioAnalysis, isPortfolioLoading)}
                {activeAnalysis === 'budget' && renderAnalysis(budgetAnalysis, isBudgetLoading)}
                {activeAnalysis === 'recommendations' && renderRecommendations(recommendations, isRecommendationsLoading)}
              </div>
            </div>
          )}

          {/* Zawartość zakładki Modele AI / Prognozowanie / Optymalizacja */}
          {activeTab !== 'analysis' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Ten moduł pozwala na interakcję z zaawansowanymi modelami AI. Możesz wpisać własne pytanie lub polecenie poniżej:
              </p>
              <div>
                <select 
                  value={queryType} 
                  onChange={e => setQueryType(e.target.value as AIQuery['type'])}
                  className="border border-gray-300 rounded mr-2"
                >
                  <option value="analyze">Analiza</option>
                  <option value="recommend">Rekomendacje</option>
                  <option value="predict">Prognoza</option>
                  <option value="optimize">Optymalizacja</option>
                </select>
                <Input 
                  value={customQuery} 
                  onChange={e => setCustomQuery(e.target.value)} 
                  placeholder="Wpisz pytanie do AI..." 
                  className="inline-block w-1/2 mr-2"
                />
                <Button onClick={handleCustomQuerySubmit}>
                  <Send className="mr-2 h-4 w-4" /> Wyślij
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
