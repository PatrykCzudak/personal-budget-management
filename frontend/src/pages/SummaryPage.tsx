import { useQuery } from '@tanstack/react-query';
import { useMonthContext } from '../contexts/month-context';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import BudgetChart from '../components/charts/budget-chart';
import CategoryChart from '../components/charts/category-chart';
import TrendsChart from '../components/charts/trends-chart';
import { CreditCard, Wallet, Calendar, PiggyBank } from 'lucide-react';
import { filterIncomesByMonth, calculateMonthlyIncomeAmount } from '../utils/income-filter';
import type { Category, Expense, Income, SavingsTransaction } from '../types';

export default function SummaryPage() {
  const { selectedMonth } = useMonthContext();
  const [year, month] = selectedMonth.split('-').map(Number);

  // Pobierz listy kategorii, wydatków, przychodów
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['/api/categories'] });
  const { data: expenses = [] } = useQuery<Expense[]>({ queryKey: ['/api/expenses'] });
  const { data: incomes = [] } = useQuery<Income[]>({ queryKey: ['/api/incomes'] });
  // Pobierz transakcje oszczędności dla bieżącego miesiąca (lista kwot odłożonych do celów w tym miesiącu)
  const { data: savingsTransactions = [] } = useQuery<SavingsTransaction[]>({
    queryKey: ['/api/savings-transactions', year, month],
    enabled: !!(year && month),
  });

  // Filtruj wydatki i przychody do bieżącego miesiąca
  const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(selectedMonth));
  const monthlyIncomes = filterIncomesByMonth(incomes, selectedMonth);

  // Obliczenia podsumowań
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalIncome = monthlyIncomes.reduce((sum, inc) => sum + calculateMonthlyIncomeAmount(inc), 0);
  const totalBudget = categories.reduce((sum, cat) => sum + parseFloat(cat.budget), 0);
  const remainingBudget = totalBudget - totalMonthlyExpenses;
  // Oblicz dzisiejszą datę w kontekście bieżącego miesiąca
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = (selectedMonth === new Date().toISOString().slice(0, 7))
    ? new Date().getDate()
    : daysInMonth;
  const dailyAverage = totalMonthlyExpenses / currentDay;
  // Suma środków przeniesionych do oszczędności w tym miesiącu
  const totalSavingsAdded = savingsTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const savings = totalIncome - totalMonthlyExpenses - totalSavingsAdded;

  // Pomocnicze funkcje do wykresów
  const getCategoryExpenses = (categoryId: string) =>
    monthlyExpenses.filter(exp => exp.categoryId === categoryId)
                   .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);

  return (
    <div className="space-y-8">
      {/* Karty podsumowań */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wydatki w miesiącu</p>
                <p className="text-2xl font-bold">{totalMonthlyExpenses.toFixed(2)} zł</p>
                <p className="text-sm text-green-600">
                  {new Date(`${selectedMonth}-01`).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="text-blue-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pozostały budżet</p>
                <p className="text-2xl font-bold">{remainingBudget.toFixed(2)} zł</p>
                <p className="text-sm text-green-600">
                  {totalBudget > 0 ? ((remainingBudget / totalBudget) * 100).toFixed(1) : 0}% budżetu
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Wallet className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Średni wydatek dzienny</p>
                <p className="text-2xl font-bold">{dailyAverage.toFixed(2)} zł</p>
                <p className="text-sm text-muted-foreground">W wybranym miesiącu</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="text-orange-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oszczędności</p>
                <p className="text-2xl font-bold">{savings.toFixed(2)} zł</p>
                {totalSavingsAdded > 0 && (
                  <p className="text-xs text-orange-500">
                    -{totalSavingsAdded.toFixed(2)} zł przeznaczono do celów
                  </p>
                )}
                {savingsTransactions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {savingsTransactions.length} transakcji oszczędnościowych
                  </p>
                )}
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <PiggyBank className="text-purple-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sekcja wykresów */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Budżet vs Rzeczywiste wydatki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <BudgetChart categories={categories} expenses={monthlyExpenses} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wydatki wg kategorii</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <CategoryChart categories={categories} expenses={monthlyExpenses} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trendy i wykorzystanie budżetu */}
      <Card>
        <CardHeader>
          <CardTitle>Trendy wydatków (ostatnie 6 miesięcy)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <TrendsChart expenses={expenses} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Wykorzystanie budżetu wg kategorii</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map(category => {
              const spent = getCategoryExpenses(category.id);
              const budget = parseFloat(category.budget);
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;
              return (
                <div key={category.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {spent.toFixed(2)} zł / {budget.toFixed(2)} zł
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="w-full h-3" 
                    style={{ background: `${category.color}20` }} 
                  />
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% wykorzystania</p>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Brak kategorii do wyświetlenia. Dodaj kategorie w zakładce Admin/Budżet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
