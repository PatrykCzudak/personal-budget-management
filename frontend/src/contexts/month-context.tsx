import { createContext, useContext, useState } from 'react';

interface MonthContextValue {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}
const MonthContext = createContext<MonthContextValue | undefined>(undefined);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${mm}`;
  });
  return (
    <MonthContext.Provider value={{ selectedMonth, setSelectedMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonthContext() {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonthContext must be used within MonthProvider');
  }
  return context;
}
