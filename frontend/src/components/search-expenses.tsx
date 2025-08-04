import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import type { Expense, Category } from "../types";

export default function SearchExpenses() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const categoriesMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {} as Record<string, Category>);
  }, [categories]);

  const filteredExpenses = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return expenses.filter(expense => {
      const category = categoriesMap[expense.categoryId];
      return (
        expense.description.toLowerCase().includes(term) ||
        category?.name.toLowerCase().includes(term) ||
        expense.amount.toString().includes(term)
      );
    }).slice(0, 10); // Limit to 10 results
  }, [expenses, categoriesMap, searchTerm]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Szukaj wydatków..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {searchTerm.trim() && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto bg-white border rounded-md shadow-lg">
          {filteredExpenses.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Brak wyników dla "{searchTerm}"
            </div>
          ) : (
            <div className="py-2">
              {filteredExpenses.map((expense) => {
                const category = categoriesMap[expense.categoryId];
                return (
                  <div
                    key={expense.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {expense.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(expense.date), "d MMM yyyy", { locale: pl })}
                          </div>
                          {category && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {parseFloat(expense.amount).toLocaleString("pl-PL")} zł
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}