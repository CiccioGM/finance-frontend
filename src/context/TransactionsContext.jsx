import React, { createContext, useContext, useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;
const TransactionsContext = createContext();

export function useTransactions() {
  return useContext(TransactionsContext);
}

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false); // <-- nuovo: stato modal

  const load = async () => {
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
    load();
    // eslint-disable-next-line
  }, []);

  const addTransaction = async (payload) => {
    const res = await fetch(`${API}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, date: new Date(payload.date).toISOString() }),
    });
    const data = await res.json();
    data.date = new Date(data.date);
    setTransactions((p) => [data, ...p]);
  };

  const updateTransaction = async (id, payload) => {
    const res = await fetch(`${API}/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, date: new Date(payload.date).toISOString() }),
    });
    const data = await res.json();
    data.date = new Date(data.date);
    setTransactions((p) => p.map((t) => (t._id === id ? data : t)));
  };

  const deleteTransaction = async (id) => {
    await fetch(`${API}/api/transactions/${id}`, { method: "DELETE" });
    setTransactions((p) => p.filter((t) => t._id !== id));
  };

  const value = {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    searchQuery,
    setSearchQuery,
    modalOpen,       // export modal state
    setModalOpen,    // export setter
  };

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}
