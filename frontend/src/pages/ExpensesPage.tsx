import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBudget } from '../hooks/useBudget';
import { useMonthContext } from '../contexts/month-context';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import ExpenseForm from '../components/forms/ExpenseForm';
import SearchExpenses from '../components/search-expenses';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Category, Expense } from '../types';

export default function ExpensesPage() {
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['/api/categories'] });
  const { data: expenses = [] } = useQuery<Expense[]>({ queryKey: ['/api/expenses'] });
  const { deleteExpense } = useBudget();
  const { selectedMonth } = useMonthContext();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');

  // Funkcja pomocnicza do znalezienia kategorii po ID (dla wyświetlenia nazwy kolorem w tabeli)
  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);

  // Filtrowanie listy wydatków według wybranego miesiąca i kategorii
  const filteredExpenses = expenses.filter(expense => {
    const categoryMatch = filterCategory === 'all' || expense.categoryId === filterCategory;
    const monthMatch = expense.date.startsWith(selectedMonth);
    return categoryMatch && monthMatch;
  });

  // Obsługa usuwania wydatku
  const handleDeleteExpense = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten wydatek?')) {
      await deleteExpense.mutateAsync(id);
    }
  };

  // Obsługa edycji wydatku (otwarcie formularza z uzupełnionymi danymi)
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };
  const closeExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  // Formatowanie daty do czytelnego formatu PL
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pl-PL');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolumna lewa: przycisk dodawania wydatku */}
      <Card>
        <CardHeader>
          <CardTitle>Dodaj wydatek</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => setEditingExpense(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj wydatek
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edytuj wydatek' : 'Dodaj wydatek'}</DialogTitle>
              </DialogHeader>
              <ExpenseForm 
                expense={editingExpense} 
                categories={categories} 
                onSuccess={closeExpenseForm} 
                onCancel={closeExpenseForm} 
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Kolumna prawa: Historia wydatków */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Historia wydatków</CardTitle>
          </div>
          {/* Filtrowanie: wyszukiwarka + filtr kategorii */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <SearchExpenses />  {/* pole wyszukiwania tekstowego po opisie (opcjonalne) */}
            </div>
            <div className="flex space-x-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Wszystkie kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie kategorie</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Opis</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Kategoria</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Kwota</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Brak wydatków do wyświetlenia
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => {
                    const category = getCategoryById(expense.categoryId);
                    return (
                      <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(expense.date)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{expense.description}</td>
                        <td className="py-3 px-4">
                          {category && (
                            <Badge style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                              {category.name}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-right text-gray-900">
                          -{expense.amount} zł
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditExpense(expense)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
