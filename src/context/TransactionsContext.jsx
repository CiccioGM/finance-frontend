import React, { createContext, useContext, useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;
const TransactionsContext = createContext();
export const useTransactions = () => useContext(TransactionsContext);

function ensureArrayResponse(data) {
  // Se il backend ha restituito un errore, non usiamo i dati
  if (!data || typeof data !== "object") return [];
  if ("error" in data) {
    console.error("API /transactions returned error:", data.error);
    return [];
  }
  if (Array.isArray(data)) return data;
  // se per caso la risposta è { data: [...] }
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.transactions)) return data.transactions;
  return [];
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
      if (opts.limit) url += `?limit=${opts.limit}`;
      const res = await fetch(url);
      const json = await res.json();
      const arr = ensureArrayResponse(json);
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
    const res = await fetch(`${API}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.error) {
      console.error("addTransaction API error:", json.error);
      throw new Error(json.error);
    }
    setTransactions(prev => [json, ...(Array.isArray(prev) ? prev : [])]);
    return json;
  };

  const updateTransaction = async (id, updates) => {
    const res = await fetch(`${API}/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (json.error) {
      console.error("updateTransaction API error:", json.error);
      throw new Error(json.error);
    }
    setTransactions(prev => (Array.isArray(prev) ? prev : []).map(t => t._id === id ? json : t));
    return json;
  };

  const deleteTransaction = async (id) => {
    const res = await fetch(`${API}/api/transactions/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("deleteTransaction API error:", json.error || res.statusText);
      throw new Error(json.error || "Delete failed");
    }
    setTransactions(prev => (Array.isArray(prev) ? prev : []).filter(t => t._id !== id));
  };

  useEffect(() => {
    load({ limit: 1000 });
  }, []);

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
