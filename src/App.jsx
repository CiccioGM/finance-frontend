import { useEffect, useState } from "react";
import AddTransactionForm from "./components/AddTransactionForm";
import TransactionList from "./components/TransactionList";
import ExpenseChart from "./components/ExpenseChart";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API}/api/transactions`);
      const data = await res.json();
      // assicurati che date siano oggetti Date nel client
      const normalized = data.map((t) => ({
        ...t,
        date: new Date(t.date),
      }));
      // ordina per data discendente
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
      // newTx.date è oggetto Date o iso string
      const payload = {
        ...newTx,
        // backend si aspetta un date ISO string (Mongo accetta anche quello)
        date: new Date(newTx.date).toISOString(),
      };
      const res = await fetch(`${API}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      // normalizza data per client
      data.date = new Date(data.date);
      setTransactions((prev) => [data, ...prev]);
    } catch (e) {
      console.error("Errore aggiunta", e);
    }
  };

  // calcoli dashboard
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
      <ExpenseChart transactions={transactions} />
      {loading ? <p className="text-center text-gray-500">Caricamento...</p> : <TransactionList transactions={transactions} />}
    </div>
  );
}
