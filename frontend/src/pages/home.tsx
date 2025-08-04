import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import FloatingExpenseButton from "@/components/floating-expense-button";
import AdminPage from "./admin";
import ExpensesPage from "./ExpensesPage";
import SummaryPage from "./SummaryPage";
import InvestmentsPage from "./InvestmentsPage";
import SavingsPage from "./SavingsPage";

export default function Home() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location === "/admin") return "admin";
    if (location === "/expenses") return "expenses";
    if (location === "/summary") return "summary";
    if (location === "/investments") return "investments";
    if (location === "/savings") return "savings";
    return "admin";
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "admin":
        return <AdminPage />;
      case "expenses":
        return <ExpensesPage />;
      case "summary":
        return <SummaryPage />;
      case "investments":
        return <InvestmentsPage />;
      case "savings":
        return <SavingsPage />;
      default:
        return <AdminPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
      <FloatingExpenseButton />
    </div>
  );
}
