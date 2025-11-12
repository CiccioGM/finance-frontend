import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import AddTransactionPage from "./pages/AddTransactionPage";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import AddTransactionModal from "./components/AddTransactionModal";
import { TransactionsProvider } from "./context/TransactionsContext";

export default function App() {
  return (
    <BrowserRouter>
      <TransactionsProvider>
        <Header />
        {/* pt-16 assicura che il contenuto parta sotto l'header (header ~64px) */}
        <main className="pt-16 p-4 max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/add" element={<AddTransactionPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>

        {/* Modal montato globalmente */}
        <AddTransactionModal />
      </TransactionsProvider>
    </BrowserRouter>
  );
}
