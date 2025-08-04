import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { useBudget } from '../../hooks/useBudget';
import { insertInvestmentSchema } from '../../types';
import type { Investment } from '../../types';

type FormData = {
  symbol: string;
  name: string;
  type: string;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
};

interface InvestmentFormProps {
  investment?: Investment | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const typeOptions = ['akcje', 'etf', 'obligacje', 'kryptowaluty', 'nieruchomości', 'inne'];

export default function InvestmentForm({ investment, onSuccess, onCancel }: InvestmentFormProps) {
  const { createInvestment, updateInvestment } = useBudget();
  const form = useForm<FormData>({
    resolver: zodResolver(insertInvestmentSchema),
    defaultValues: {
      symbol: investment?.symbol || '',
      name: investment?.name || '',
      type: investment?.type || 'akcje',
      quantity: investment?.quantity || '',
      purchasePrice: investment?.purchasePrice || '',
      purchaseDate: investment?.purchaseDate || new Date().toISOString().substr(0, 10),
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (investment) {
        await updateInvestment.mutateAsync({ id: investment.id, data: { ...data } });
      } else {
        await createInvestment.mutateAsync({ ...data });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save investment:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="symbol" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl><Input placeholder="np. AAPL" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="name" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa inwestycji</FormLabel>
              <FormControl><Input placeholder="np. Apple Inc." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="type" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typ</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={!!investment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="quantity" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ilość</FormLabel>
              <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="purchasePrice" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cena zakupu (za jednostkę, zł)</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <FormField 
          control={form.control} 
          name="purchaseDate" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data zakupu</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Anuluj</Button>
          <Button type="submit" disabled={createInvestment.isLoading || updateInvestment.isLoading}>
            {investment ? 'Zapisz zmiany' : 'Dodaj inwestycję'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
