import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  // Generowanie opcji miesięcy (ostatnie 12 miesięcy + następne 2)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    // Generuj opcje od 12 miesięcy wstecz do 2 miesięcy w przód
    for (let i = -12; i <= 2; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pl-PL', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      options.push({ value: monthKey, label: monthLabel });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();
  const selectedMonthLabel = monthOptions.find(option => option.value === value)?.label || value;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40 bg-green-600 text-white border-green-600 hover:bg-green-700 dark:bg-green-700 dark:border-green-700 dark:hover:bg-green-800">
        <SelectValue>{selectedMonthLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {monthOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}