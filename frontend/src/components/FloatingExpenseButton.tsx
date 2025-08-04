import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import ExpenseForm from './forms/ExpenseForm';
import type { Category } from '../../types';  // zakładamy istnienie typu Category

export default function FloatingExpenseButton() {
  const [open, setOpen] = useState(false);
  // Pobierz listę kategorii (do przekazania do formularza wydatku)
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['/api/categories'] });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg hover:shadow-xl z-50"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Szybki Wydatek</DialogTitle>
        </DialogHeader>
        {/* Formularz dodawania wydatku, po zakończeniu (onSuccess/onCancel) zamykamy dialog */}
        <ExpenseForm 
          categories={categories} 
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
