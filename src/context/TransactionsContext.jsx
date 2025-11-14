import React, { createContext, useContext, useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;
const TransactionsContext = createContext();
export const useTransactions = () => useContext(TransactionsContext);

function ensureArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  // se è un oggetto con chiave "data" o "transactions", proviamo a estrarre
  if (typeof x === "object") {
    if (Array.isArray(x.data)) return x.data;
    if (Array.isArray(x.transactions)) return x.transactions;
  }
  // fallback: proviamo a trasformare in array singolo
  return [x];
}

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQ, setSearchQ] = useState("");

  const load = async (opts = {}) => {
    setLoading(true);
    try {
      let url = `${API}/api/transactions`;
      // supporto opzionale di limit/periodo
      if (opts.limit) url += `?limit=${opts.limit}`;
      const res = await fetch(url);
      const data = await res.json();
      const arr = ensureArray(data);
      setTransactions(arr);
      return arr;
    } catch (e) {
      console.error("load transactions error:", e);
      setTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (payload) => {
    try {
      const res = await fetch(`${API}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setTransactions(prev => {
        const p = ensureArray(prev);
        // se il server ritorna l'oggetto creato: prependarlo
        return [data, ...p];
      });
      return data;
    } catch (e) {
      console.error("addTransaction error:", e);
      throw e;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const res = await fetch(`${API}/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setTransactions(prev => {
        const p = ensureArray(prev);
        return p.map(x => (x && x._id === id ? data : x));
      });
      return data;
    } catch (e) {
      console.error("updateTransaction error:", e);
      throw e;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API}/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed: ${txt}`);
      }
      setTransactions(prev => {
        const p = ensureArray(prev);
        return p.filter(x => x && x._id !== id);
      });
    } catch (e) {
      console.error("deleteTransaction error:", e);
      throw e;
    }
  };

  useEffect(() => { load({ limit: 1000 }); }, []);

  return (
    <TransactionsContext.Provider value={{
      transactions,
      loading,
      load,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      selectedCategory, setSelectedCategory,
      searchQ, setSearchQ
    }}>
      {children}
    </TransactionsContext.Provider>
  );
}
