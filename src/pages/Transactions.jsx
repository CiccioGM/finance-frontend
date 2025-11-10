import { useMemo } from "react";
import { useTransactions } from "../context/TransactionsContext";
import TransactionList from "../components/TransactionList";

export default function Transactions() {
  const { transactions, loading, searchQuery } = useTransactions();

  // ultimi 2 anni
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => new Date(t.date) >= twoYearsAgo)
      .filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          (t.description || "").toLowerCase().includes(q) ||
          (t.category || "").toLowerCase().includes(q)
        );
      });
  }, [transactions, searchQuery]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Transazioni (ultimi 2 anni)</h2>
      {loading ? <p>Caricamento...</p> : <TransactionList transactions={filtered} />}
    </div>
  );
}
