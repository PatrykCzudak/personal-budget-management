import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { useBudget } from '../../hooks/useBudget';
import { insertIncomeSchema } from '../../types';
import type { Income } from '../../types';

type FormData = Omit<Income, 'id' | 'createdAt' | 'date'>;

interface IncomeFormProps {
  income?: Income | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const frequencyOptions = [
  { value: 'monthly', label: 'Miesięczny' },
  { value: 'weekly', label: 'Tygodniowy' },
  { value: 'yearly', label: 'Roczny' },
  { value: 'one-time', label: 'Jednorazowy' },
];

export default function IncomeForm({ income, onSuccess, onCancel }: IncomeFormProps) {
  const { createIncome, updateIncome } = useBudget();
  const form = useForm<FormData>({
    resolver: zodResolver(insertIncomeSchema),
    defaultValues: {
      name: income?.name || '',
      amount: income?.amount || '',
      frequency: income?.frequency || 'monthly',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (income) {
        await updateIncome.mutateAsync({ id: income.id, data });
      } else {
        await createIncome.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save income:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="name" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa przychodu</FormLabel>
              <FormControl><Input placeholder="np. Wynagrodzenie" {...field} /></FormControl>
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
          name="frequency" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Częstotliwość</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Anuluj</Button>
          <Button type="submit" disabled={createIncome.isLoading || updateIncome.isLoading}>
            {income ? 'Zapisz zmiany' : 'Dodaj przychód'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
