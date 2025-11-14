// src/pages/Transactions.jsx
import React, { useMemo } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useCategories } from "../context/CategoriesContext";
import TransactionList from "../components/TransactionList";
import SearchInput from "../components/SearchInput";

export default function Transactions() {
  const { transactions, loading, searchQ, setSearchQ } = useTransactions();
  const { categories } = useCategories();

  const resolveCategory = (catField) => {
    if (!catField) return null;
    if (typeof catField === "object") {
      if (catField._id || catField.name) return catField;
      if (catField.$oid) {
        const found = categories.find((c) => c._id === catField.$oid);
        return found || null;
      }
      return null;
    }
    if (typeof catField === "string") {
      const found = categories.find((c) => c._id === catField);
      return found || null;
    }
    return null;
  };

  const filtered = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    const q = (searchQ || "").toLowerCase().trim();
    if (!q) return transactions;
    return transactions.filter((t) => {
      const desc = (t.description || "").toLowerCase();
      const dateStr = t.date
        ? new Date(t.date).toLocaleDateString().toLowerCase()
        : "";
      const cat = resolveCategory(t.category);
      const catName = (cat?.name || "").toLowerCase();
      return (
        desc.includes(q) ||
        dateStr.includes(q) ||
        catName.includes(q)
      );
    });
  }, [transactions, searchQ, categories]);

  const ordered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const da = a.date || a.createdAt;
      const db = b.date || b.createdAt;
      return new Date(db) - new Date(da);
    });
  }, [filtered]);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Transazioni</h2>
        <div className="mb-3">
          <SearchInput onSearch={(q) => setSearchQ(q)} />
        </div>
        {loading && (
          <div className="text-sm text-gray-500 mb-2">Caricamento...</div>
        )}
        <TransactionList items={ordered} />
      </div>
    </div>
  );
}
