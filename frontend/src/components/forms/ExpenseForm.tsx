import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { useBudget } from '../../hooks/useBudget';
import { insertExpenseSchema } from '../../types';
import type { Expense, Category } from '../../types';

interface ExpenseFormProps {
  expense?: Expense | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

type FormData = {
  description: string;
  amount: string;
  categoryId: string;
  date: string;
};

export default function ExpenseForm({ expense, categories, onSuccess, onCancel }: ExpenseFormProps) {
  const { createExpense, updateExpense } = useBudget();
  const form = useForm<FormData>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      description: expense?.description || '',
      amount: expense?.amount || '',
      categoryId: expense?.categoryId || (categories[0]?.id ?? ''),
      date: expense?.date || new Date().toISOString().substr(0, 10),  // domyślnie dziś
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (expense) {
        await updateExpense.mutateAsync({ id: expense.id, data });
      } else {
        await createExpense.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save expense:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="description" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis</FormLabel>
              <FormControl><Input placeholder="Za co wydatek?" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="amount" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kwota (zł)</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="categoryId" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategoria</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Wybierz kategorię" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="date" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Anuluj</Button>
          <Button type="submit" disabled={createExpense.isLoading || updateExpense.isLoading}>
            {expense ? 'Zapisz zmiany' : 'Dodaj wydatek'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
