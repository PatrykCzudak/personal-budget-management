import type { Income } from "../types";

export function filterIncomesByMonth(incomes: Income[], targetMonth: string): Income[] {
  return incomes.filter(income => {
    const incomeDate = new Date(income.date);
    const targetDate = new Date(targetMonth + "-01");
    // Add one month to target date to check if income date is in the same month or before
    targetDate.setMonth(targetDate.getMonth() + 1);
    
    switch (income.frequency) {
      case "one-time":
        // One-time incomes only appear in the exact month they were recorded
        return income.date.startsWith(targetMonth);
        
      case "monthly":
        // Monthly incomes appear in all months from their start date onwards
        return incomeDate < targetDate;
        
      case "yearly":
        // Yearly incomes appear once per year in the same month they were created
        const incomeMonth = incomeDate.getMonth();
        const targetMonthNum = new Date(targetMonth + "-01").getMonth();
        const targetYear = new Date(targetMonth + "-01").getFullYear();
        const incomeYear = incomeDate.getFullYear();
        
        return incomeMonth === targetMonthNum && targetYear >= incomeYear;
        
      case "weekly":
        // Weekly incomes appear in all months from their start date onwards (4 times per month)
        return incomeDate < targetDate;
        
      default:
        return false;
    }
  });
}

export function calculateMonthlyIncomeAmount(income: Income): number {
  const amount = parseFloat(income.amount);
  
  switch (income.frequency) {
    case "monthly":
    case "one-time":
      return amount;
      
    case "weekly":
      // 4 weeks per month
      return amount * 4;
      
    case "yearly":
      // Divide by 12 months
      return amount / 12;
      
    default:
      return amount;
  }
}