// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import AddTransactionModal from "./components/AddTransactionModal";
import { TransactionsProvider } from "./context/TransactionsContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import { BudgetsProvider } from "./context/BudgetsContext";

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

function AppShell() {
  const [newTxOpen, setNewTxOpen] = useState(false);

  const [pieLegendPosition, setPieLegendPosition] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("pieLegendPosition") || "side";
    }
    return "side";
  });

  const [exportFormat, setExportFormat] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("reportsExportFormat") || "pdf";
    }
    return "pdf";
  });

  const handleNewTransaction = () => {
    setNewTxOpen(true);
  };

  const closeNewTransaction = () => {
    setNewTxOpen(false);
  };

  return (
    <>
      <Header onNewTransaction={handleNewTransaction} />
      <ScrollToTop />
      <main className="pt-16 px-4 pb-6 bg-gray-100 min-h-screen">
        <Routes>
          <Route
            path="/"
            element={<Dashboard pieLegendPosition={pieLegendPosition} />}
          />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/budget" element={<Budget />} />
          <Route
            path="/reports"
            element={<Reports exportFormat={exportFormat} />}
          />
          <Route
            path="/settings"
            element={
              <Settings
                pieLegendPosition={pieLegendPosition}
                setPieLegendPosition={setPieLegendPosition}
                exportFormat={exportFormat}
                setExportFormat={setExportFormat}
              />
            }
          />
        </Routes>
      </main>

      <AddTransactionModal
        open={newTxOpen}
        onClose={closeNewTransaction}
        initial={null}
      />
    </>
  );
}

export default function App() {
  return (
    <TransactionsProvider>
      <CategoriesProvider>
        <BudgetsProvider>
          <Router>
            <AppShell />
          </Router>
        </BudgetsProvider>
      </CategoriesProvider>
    </TransactionsProvider>
  );
}
