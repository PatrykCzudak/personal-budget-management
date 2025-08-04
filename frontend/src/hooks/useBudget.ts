import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertCategory, InsertIncome, InsertExpense, InsertInvestment } from "../types";

export function useBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Categories
  const createCategory = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Sukces",
        description: "Kategoria została dodana",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać kategorii",
        variant: "destructive",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCategory> }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Sukces",
        description: "Kategoria została zaktualizowana",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować kategorii",
        variant: "destructive",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Sukces",
        description: "Kategoria została usunięta",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć kategorii",
        variant: "destructive",
      });
    },
  });

  // Incomes
  const createIncome = useMutation({
    mutationFn: async (data: InsertIncome) => {
      const response = await apiRequest("POST", "/api/incomes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      toast({
        title: "Sukces",
        description: "Przychód został dodany",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać przychodu",
        variant: "destructive",
      });
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertIncome> }) => {
      const response = await apiRequest("PUT", `/api/incomes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      toast({
        title: "Sukces",
        description: "Przychód został zaktualizowany",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować przychodu",
        variant: "destructive",
      });
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/incomes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      toast({
        title: "Sukces",
        description: "Przychód został usunięty",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć przychodu",
        variant: "destructive",
      });
    },
  });

  // Expenses
  const createExpense = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Sukces",
        description: "Wydatek został dodany",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać wydatku",
        variant: "destructive",
      });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertExpense> }) => {
      const response = await apiRequest("PUT", `/api/expenses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Sukces",
        description: "Wydatek został zaktualizowany",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować wydatku",
        variant: "destructive",
      });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Sukces",
        description: "Wydatek został usunięty",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć wydatku",
        variant: "destructive",
      });
    },
  });

  // Investments
  const createInvestment = useMutation({
    mutationFn: async (data: InsertInvestment) => {
      const response = await apiRequest("POST", "/api/investments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({
        title: "Sukces",
        description: "Inwestycja została dodana",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać inwestycji",
        variant: "destructive",
      });
    },
  });

  const updateInvestment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertInvestment> }) => {
      const response = await apiRequest("PUT", `/api/investments/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({
        title: "Sukces",
        description: "Inwestycja została zaktualizowana",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować inwestycji",
        variant: "destructive",
      });
    },
  });

  const deleteInvestment = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({
        title: "Sukces",
        description: "Inwestycja została usunięta",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć inwestycji",
        variant: "destructive",
      });
    },
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createIncome,
    updateIncome,
    deleteIncome,
    createExpense,
    updateExpense,
    deleteExpense,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  };
}
