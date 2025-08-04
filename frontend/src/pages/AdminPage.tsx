import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBudget } from '../hooks/useBudget';
import { useMonthContext } from '../contexts/month-context';
import { filterIncomesByMonth, calculateMonthlyIncomeAmount } from '../utils/income-filter';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import CategoryForm from '../components/forms/CategoryForm';
import IncomeForm from '../components/forms/IncomeForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Category, Income } from '../types';

export default function AdminPage() {
  // Pobierz kategorie i przychody z API
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['/api/categories'] });
  const { data: incomes = [] } = useQuery<Income[]>({ queryKey: ['/api/incomes'] });
  const { deleteCategory, deleteIncome } = useBudget();
  const { selectedMonth } = useMonthContext();

  // Stan modali i edytowanych elementów
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);

  // Obliczenia sum dla wybranego miesiąca
  const monthlyIncomes = filterIncomesByMonth(incomes, selectedMonth);
  const totalIncome = monthlyIncomes.reduce((sum, inc) => sum + calculateMonthlyIncomeAmount(inc), 0);
  const totalBudget = categories.reduce((sum, cat) => sum + parseFloat(cat.budget), 0);
  const remainingBudget = totalIncome - totalBudget;

  // Obsługa akcji usunięcia z potwierdzeniem
  const handleDeleteCategory = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę kategorię?')) {
      await deleteCategory.mutateAsync(id);
    }
  };
  const handleDeleteIncome = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć to źródło przychodu?')) {
      await deleteIncome.mutateAsync(id);
    }
  };

  // Obsługa otwarcia okien edycji (ustawienie edytowanego elementu lub null przy dodawaniu)
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };
  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setShowIncomeForm(true);
  };

  // Zamknięcie modali (po sukcesie lub anulowaniu w formularzach)
  const closeCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };
  const closeIncomeForm = () => {
    setShowIncomeForm(false);
    setEditingIncome(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Sekcja: Kategorie wydatków */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Kategorie wydatków</CardTitle>
          <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj kategorię
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edytuj kategorię' : 'Dodaj kategorię'}</DialogTitle>
              </DialogHeader>
              <CategoryForm 
                category={editingCategory} 
                onSuccess={closeCategoryForm} 
                onCancel={closeCategoryForm} 
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {/* Kropka w kolorze kategorii */}
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                  <div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <p className="text-sm text-gray-500">Limit: {category.budget} zł</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="py-8 text-center text-gray-500">Brak kategorii do wyświetlenia.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sekcja: Źródła przychodów */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Źródła przychodów</CardTitle>
          <Dialog open={showIncomeForm} onOpenChange={setShowIncomeForm}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700" onClick={() => setEditingIncome(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj przychód
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingIncome ? 'Edytuj przychód' : 'Dodaj przychód'}</DialogTitle>
              </DialogHeader>
              <IncomeForm 
                income={editingIncome} 
                onSuccess={closeIncomeForm} 
                onCancel={closeIncomeForm} 
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filterIncomesByMonth(incomes, selectedMonth).map(income => {
              const monthlyAmount = calculateMonthlyIncomeAmount(income);
              return (
                <div key={income.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <span className="font-medium text-gray-900">{income.name}</span>
                    <p className="text-sm text-gray-500">
                      {income.amount} zł / {
                        income.frequency === 'monthly' ? 'miesiąc' :
                        income.frequency === 'weekly' ? 'tydzień' :
                        income.frequency === 'yearly' ? 'rok' :
                        income.frequency === 'one-time' ? 'jednorazowo' : income.frequency
                      }
                      <span className="ml-2 text-green-600 font-medium">
                        (Aktywne: {monthlyAmount.toFixed(2)} zł/miesiąc)
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Data: {new Date(income.date).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditIncome(income)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteIncome(income.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {filterIncomesByMonth(incomes, selectedMonth).length === 0 && (
              <p className="py-8 text-center text-gray-500">Brak aktywnych przychodów w tym miesiącu.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
