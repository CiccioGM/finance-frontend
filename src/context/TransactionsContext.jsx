import React, { createContext, useContext, useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;
const TransactionsContext = createContext();
export const useTransactions = () => useContext(TransactionsContext);

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQ, setSearchQ] = useState("");

  const load = async (opts = {}) => {
    setLoading(true);
    try {
      let url = `${API}/api/transactions?limit=1000`;
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data);
    } catch (e) {
      console.error("load tx", e);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (payload) => {
    const res = await fetch(`${API}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setTransactions(t => [data, ...t]);
    return data;
  };

  const updateTransaction = async (id, updates) => {
    const res = await fetch(`${API}/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    setTransactions(t => t.map(x => x._id === id ? data : x));
    return data;
  };

  const deleteTransaction = async (id) => {
    const res = await fetch(`${API}/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setTransactions(t => t.filter(x => x._id !== id));
  };

  useEffect(() => { load(); }, []);

  return (
    <TransactionsContext.Provider value={{
      transactions, loading, load,
      addTransaction, updateTransaction, deleteTransaction,
      selectedCategory, setSelectedCategory, searchQ, setSearchQ
    }}>
      {children}
    </TransactionsContext.Provider>
  );
}
