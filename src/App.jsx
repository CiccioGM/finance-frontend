import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import AddTransactionPage from "./pages/AddTransactionPage";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import AddTransactionModal from "./components/AddTransactionModal";
import { useState } from "react";
import { TransactionsProvider } from "./context/TransactionsContext";

function AppInner() {
  // editingTx state gestito a livello App (servirà per aprire il modal in edit-mode)
  const [editingTx, setEditingTx] = useState(null);

  return (
    <>
      <Header onEditRequested={(tx) => setEditingTx(tx)} />
      <main className="p-4 max-w-5xl mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/add" element={<AddTransactionPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Modal montato globalmente — se editingTx è valorizzato passalo come initial */}
      <AddTransactionModal initial={editingTx} onSaved={() => setEditingTx(null)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TransactionsProvider>
        <AppInner />
      </TransactionsProvider>
    </BrowserRouter>
  );
}
