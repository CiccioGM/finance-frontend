// src/context/BudgetsContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const BudgetsContext = createContext(null);

export function BudgetsProvider({ children }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL || "";

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/budgets`);
      if (!res.ok) throw new Error("Errore caricamento budget");
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Errore caricamento budget");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const createBudget = async ({ category, limit, period = "monthly" }) => {
    try {
      const res = await fetch(`${baseUrl}/api/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, limit, period }),
      });
      if (!res.ok) throw new Error("Errore creazione budget");
      const saved = await res.json();
      setBudgets((prev) => [...prev, saved]);
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/budgets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Errore eliminazione budget");
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const value = {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    deleteBudget,
  };

  return (
    <BudgetsContext.Provider value={value}>
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const ctx = useContext(BudgetsContext);
  if (!ctx) {
    throw new Error("useBudgets deve essere usato dentro BudgetsProvider");
  }
  return ctx;
}
