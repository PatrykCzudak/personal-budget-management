import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import FloatingExpenseButton from './components/FloatingExpenseButton';

import AdminPage from './pages/AdminPage';
import ExpensesPage from './pages/ExpensesPage';
import SavingsPage from './pages/SavingsPage';
import SummaryPage from './pages/SummaryPage';
import InvestmentsPage from './pages/InvestmentsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <>
      {/* Nagłówek strony z tytułem aplikacji, wyborem miesiąca, przełącznikiem motywu */}
      <Header />
      {/* Pasek nawigacji głównych sekcji */}
      <Navigation />
      {/* Definicje tras aplikacji */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {/* Pływający przycisk dodawania wydatku (widoczny na wszystkich podstronach) */}
      <FloatingExpenseButton />
    </>
  );
}
