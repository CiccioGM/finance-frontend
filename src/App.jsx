import { useEffect, useState } from "react";
import AddTransactionForm from "./components/AddTransactionForm";
import TransactionList from "./components/TransactionList";
import ExpenseChart from "./components/ExpenseChart";
import IncomeChart from "./components/IncomeChart";
import FilterToggle from "./components/FilterToggle";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tutte"); // 'tutte' | 'entrate' | 'uscite'

  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API}/api/transactions`);
      const data = await res.json();
      const normalized = data.map((t) => ({ ...t, date: new Date(t.date) }));
      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(normalized);
    } catch (e) {
      console.error("Errore caricamento transazioni", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line
  }, []);

  const addTransaction = async (newTx) => {
    try {
      const payload = { ...newTx, date: new Date(newTx.date).toISOString() };
      const res = await fetch(`${API}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      data.date = new Date(data.date);
      setTransactions((prev) => [data, ...prev]);
    } catch (e) {
      console.error("Errore aggiunta", e);
    }
  };

  // Filtra le transazioni per la vista/lista
  const filteredTransactions = transactions.filter((t) => {
    if (filter === "tutte") return true;
    if (filter === "entrate") return Number(t.amount) > 0;
    if (filter === "uscite") return Number(t.amount) < 0;
    return true;
  });

  // calcoli dashboard (su tutte le transazioni)
  const total = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const income = transactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">💰 Finance Tracker</h1>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg text-center shadow">
          <div className="text-xs text-gray-500">Saldo</div>
          <div className="text-lg font-bold">{total.toFixed(2)}€</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center shadow">
          <div className="text-xs text-gray-500">Entrate</div>
          <div className="text-lg font-bold text-green-600">{income.toFixed(2)}€</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center shadow">
          <div className="text-xs text-gray-500">Uscite</div>
          <div className="text-lg font-bold text-red-500">{Math.abs(expenses).toFixed(2)}€</div>
        </div>
      </div>

      <AddTransactionForm onAdd={addTransaction} />

      <div className="flex items-center justify-between gap-3 mb-3">
        <FilterToggle value={filter} onChange={setFilter} />
      </div>

      {/* Grafici: mostriamo Entrate e Uscite separati */}
      <div className="grid grid-cols-1 gap-4">
        <IncomeChart transactions={transactions} />
        <ExpenseChart transactions={transactions} />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-4">Caricamento...</p>
      ) : (
        <TransactionList transactions={filteredTransactions} />
      )}
    </div>
  );
}
