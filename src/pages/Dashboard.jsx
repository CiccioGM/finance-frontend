import { useMemo } from "react";
import { useTransactions } from "../context/TransactionsContext";
import MonthlyBarChart from "../components/MonthlyBarChart";
import ExpensePieChart from "../components/ExpensePieChart";
import TransactionList from "../components/TransactionList";

export default function Dashboard() {
  const { transactions, loading } = useTransactions();

  const last30 = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    return transactions.filter((t) => new Date(t.date) >= since);
  }, [transactions]);

  const total = transactions.reduce((s, t) => s + Number(t.amount || 0), 0);
  const income30 = last30.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
  const expense30 = last30.filter((t) => Number(t.amount) < 0).reduce((s, t) => s + Number(t.amount), 0);

  const last5 = transactions.slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg text-center shadow">
          <div className="text-xs text-gray-500">Saldo</div>
          <div className="text-lg font-bold">{total.toFixed(2)}€</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center shadow">
          <div className="text-xs text-gray-500">Entrate (30d)</div>
          <div className="text-lg font-bold text-green-600">{income30.toFixed(2)}€</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center shadow">
          <div className="text-xs text-gray-500">Uscite (30d)</div>
          <div className="text-lg font-bold text-red-500">{Math.abs(expense30).toFixed(2)}€</div>
        </div>
      </div>

      <MonthlyBarChart transactions={transactions} />
      <ExpensePieChart transactions={transactions} />

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Ultime transazioni</h3>
        {loading ? <p>Caricamento...</p> : <TransactionList transactions={last5} />}
      </div>
    </div>
  );
}
