import React, { createContext, useContext, useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;
const CategoriesContext = createContext();
export const useCategories = () => useContext(CategoriesContext);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error("load categories", e);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (payload) => {
    const res = await fetch(`${API}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setCategories(c => [data, ...c]);
    return data;
  };

  const updateCategory = async (id, updates) => {
    const res = await fetch(`${API}/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    setCategories(c => c.map(x => x._id === id ? data : x));
    return data;
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`${API}/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setCategories(c => c.filter(x => x._id !== id));
    return true;
  };

  useEffect(() => { load(); }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading, load, addCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}
