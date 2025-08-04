import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiUrl } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Plus, Trash2, Target } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { insertSavingsGoalSchema } from '../types';  // zod schema for validation
import type { SavingsGoal } from '../types';

type SavingsGoalFormData = {
  title: string;
  targetAmount: string;
  category: string;
  color: string;
  targetDate: string;
};

const defaultCategories = ['Wakacje', 'Samochód', 'Dom/Mieszkanie', 'Fundusz awaryjny', 'Edukacja', 'Emerytura', 'Sprzęt elektroniczny', 'Inne'];
const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export default function SavingsPage() {
  const queryClient = useQueryClient();
  // Stany dla dialogów i aktualnie wybranego celu (do dodawania oszczędności)
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddSavingsDialog, setShowAddSavingsDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [addAmount, setAddAmount] = useState('');

  // Pobranie listy celów oszczędnościowych
  const { data: goals = [], isLoading } = useQuery<SavingsGoal[]>({ queryKey: ['/api/savings-goals'] });

  // Mutacja tworzenia nowego celu
  const createGoalMutation = useMutation({
    mutationFn: async (data: SavingsGoalFormData) => {
      // Przetworzenie danych formularza na format zgodny z API (konwersja liczby do stringa itp.)
      const payload = {
        title: data.title,
        targetAmount: parseFloat(data.targetAmount).toString(),
        targetDate: data.targetDate,
        category: data.category,
        color: data.color,
      };
      await fetch(apiUrl('/api/savings-goals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/savings-goals']);
      setShowCreateDialog(false);
      form.reset();
    },
  });

  // Mutacja dodawania oszczędności do wybranego celu
  const addSavingsMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      await fetch(apiUrl(`/api/savings-goals/${id}/add`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/savings-goals']);
      queryClient.invalidateQueries(['/api/savings-transactions']);
      setShowAddSavingsDialog(false);
      setAddAmount('');
      setSelectedGoal(null);
    },
  });

  // Mutacja usuwania celu
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(apiUrl(`/api/savings-goals/${id}`), { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/savings-goals']);
    },
  });

  // Konfiguracja formularza dodawania celu z walidacją Zod
  const form = useForm<SavingsGoalFormData>({
    resolver: zodResolver(insertSavingsGoalSchema),
    defaultValues: {
      title: '',
      targetAmount: '',
      category: defaultCategories[0],
      color: defaultColors[0],
      targetDate: '',
    },
  });
  const onSubmit = (data: SavingsGoalFormData) => createGoalMutation.mutate(data);

  // Obliczenie procentu realizacji celu
  const calculateProgress = (current: string, target: string) => {
    const curr = parseFloat(current);
    const tgt = parseFloat(target);
    return Math.min((curr / tgt) * 100, 100);
  };

  // Obliczenie wymaganej miesięcznej kwoty oszczędzania (jeśli jest data docelowa)
  const calculateMonthlySavings = (goal: SavingsGoal) => {
    if (!goal.targetDate) return null;
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const daysLeft = differenceInDays(targetDate, today);
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
    return Math.ceil(remaining / monthsLeft);
  };

  if (isLoading) {
    // Prosty placeholder w trakcie ładowania listy celów
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cele Oszczędnościowe</h1>
          <p className="text-muted-foreground">Twoje finansowe cele i postępy w oszczędzaniu</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj cel
        </Button>
      </div>

      {/* Lista celów oszczędnościowych */}
      {goals.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Brak zdefiniowanych celów oszczędnościowych.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const monthlySave = calculateMonthlySavings(goal);
            return (
              <Card key={goal.id}>
                <CardHeader className="flex items-center justify-between pb-3">
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-green-600" /> {goal.title}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => { setSelectedGoal(goal); setShowAddSavingsDialog(true); }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteGoalMutation.mutate(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 mb-4">
                    <Progress value={progress} className="w-full h-3" style={{ background: `${goal.color}20` }} />
                    <p className="text-sm text-gray-600 mt-1">{progress.toFixed(1)}% ({goal.currentAmount} / {goal.targetAmount} zł)</p>
                  </div>
                  {goal.targetDate && (
                    <p className="text-xs text-gray-500 mb-2">
                      Cel do: {format(new Date(goal.targetDate), 'LLLL yyyy', { locale: pl })}
                      {monthlySave !== null && monthlySave >= 0 && (
                        <> – aby zdążyć, odkładaj ~<span className="font-medium">{monthlySave} zł</span> / miesiąc</>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Kategoria: {goal.category}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog dodawania nowego celu */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nowy cel</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Pola formularza: nazwa, kwota, kategoria, kolor, data */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa celu</FormLabel>
                    <FormControl><Input placeholder="Np. Wakacje w Grecji" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Docelowa kwota (zł)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {defaultCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kolor</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input type="color" {...field} className="w-16 h-10 p-0" />
                        <Input {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data realizacji</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Anuluj</Button>
                <Button type="submit" disabled={createGoalMutation.isLoading}>Dodaj cel</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog dodawania oszczędności do wybranego celu */}
      <Dialog open={showAddSavingsDialog} onOpenChange={setShowAddSavingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj oszczędności</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4">
              <p>Cel: <span className="font-medium">{selectedGoal.title}</span></p>
              <Input
                type="number"
                step="0.01"
                placeholder="Kwota"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddSavingsDialog(false)}>Anuluj</Button>
                <Button onClick={() => {
                  if (selectedGoal && addAmount) {
                    addSavingsMutation.mutate({ id: selectedGoal.id, amount: parseFloat(addAmount) });
                  }
                }}>Dodaj</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
