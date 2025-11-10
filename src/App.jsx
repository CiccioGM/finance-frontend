import { useEffect, useState } from "react";
import AddTransactionForm from "./components/AddTransactionForm.jsx";
import TransactionList from "./components/TransactionList.jsx";
import ExpenseChart from "./components/ExpenseChart.jsx";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [transactions, setTransactions] = useState([]);

  const loadTransactions = async () => {
    const res = await fetch(`${API}/api/transactions`);
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const addTransaction = async (newTx) => {
    const res = await fetch(`${API}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTx),
    });
    const data = await res.json();
    setTransactions((prev) => [data, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">💰 Finance Tracker</h1>
      <AddTransactionForm onAdd={addTransaction} />
      <ExpenseChart transactions={transactions} />
      <TransactionList transactions={transactions} />
    </div>
  );
}
