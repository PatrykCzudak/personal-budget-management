import { z } from 'zod';

// Category
export const insertCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  budget: z.string().min(1),
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export interface Category extends InsertCategory {
  id: string;
  createdAt?: string;
}

// Income
export const insertIncomeSchema = z.object({
  name: z.string().min(1),
  amount: z.string().min(1),
  frequency: z.string().min(1),
  date: z.string().optional(),
});
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export interface Income extends InsertIncome {
  id: string;
  createdAt?: string;
}

// Expense
export const insertExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.string().min(1),
  categoryId: z.string().min(1),
  date: z.string().min(1),
});
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export interface Expense extends InsertExpense {
  id: string;
  createdAt?: string;
}

// Investment
export const insertInvestmentSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  quantity: z.string().min(1),
  purchasePrice: z.string().min(1),
  purchaseDate: z.string().min(1),
});
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export interface Investment extends InsertInvestment {
  id: string;
  currentPrice?: string;
  createdAt?: string;
}

export interface InvestmentSale {
  id: string;
  investmentId: string;
  investmentSymbol: string;
  investmentName: string;
  quantitySold: string;
  salePrice: string;
  totalSaleValue: string;
  profitLoss: string;
  saleDate: string;
  createdAt?: string;
}

// Savings goals
export const insertSavingsGoalSchema = z.object({
  title: z.string().min(1),
  targetAmount: z.string().min(1),
  targetDate: z.string().min(1),
  category: z.string().min(1),
  color: z.string().min(1),
});
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  category: string;
  color: string;
  isCompleted?: boolean;
  createdAt?: string;
}

export interface SavingsTransaction {
  id: string;
  savingsGoalId: string;
  amount: string;
  date: string;
  createdAt?: string;
}
