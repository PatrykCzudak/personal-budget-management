import { NavLink } from 'react-router-dom';
import { Settings, CreditCard, PiggyBank, TrendingUp, PieChart } from 'lucide-react';

const tabs = [
  { id: 'admin', label: 'Admin/Budżet', icon: Settings, path: '/admin' },
  { id: 'expenses', label: 'Wydatki', icon: CreditCard, path: '/expenses' },
  { id: 'savings', label: 'Cele Oszczędnościowe', icon: PiggyBank, path: '/savings' },
  { id: 'summary', label: 'Podsumowanie', icon: TrendingUp, path: '/summary' },
  { id: 'investments', label: 'Inwestycje', icon: PieChart, path: '/investments' },
];

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon, path }) => (
            <NavLink 
              key={id} 
              to={path} 
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
