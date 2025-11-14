import React from "react";
import { useTransactions } from "../context/TransactionsContext";
import TransactionList from "../components/TransactionList";

export default function Transactions() {
  const { transactions, loading } = useTransactions();
  return (
    <div className="max-w-4xl mx-auto py-6">
      <h2 className="text-xl font-semibold mb-4">Transazioni (ultimi 2 anni)</h2>
      {loading ? <div>Caricamento...</div> : <TransactionList items={transactions} />}
    </div>
  );
}
