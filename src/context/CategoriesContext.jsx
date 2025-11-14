// src/context/CategoriesContext.jsx
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
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error("load categories", e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async ({ name, icon, color }) => {
    const payload = {
      name,
      icon,
      color,
      // per compatibilità con il backend che si aspetta "type"
      type: "uscita",
    };
    const res = await fetch(`${API}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) {
      console.error("addCategory error:", data.error);
      throw new Error(data.error);
    }
    setCategories((c) => [data, ...(Array.isArray(c) ? c : [])]);
    return data;
  };

  const updateCategory = async (id, { name, icon, color }) => {
    const existing = (Array.isArray(categories) ? categories : []).find(
      (c) => c._id === id
    );
    const payload = {
      name,
      icon,
      color,
      type: existing?.type || "uscita",
    };
    const res = await fetch(`${API}/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) {
      console.error("updateCategory error:", data.error);
      throw new Error(data.error);
    }
    setCategories((c) =>
      (Array.isArray(c) ? c : []).map((x) => (x._id === id ? data : x))
    );
    return data;
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`${API}/api/categories/${id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      console.error("deleteCategory error:", data.error || res.statusText);
      throw new Error(data.error || "Delete failed");
    }
    setCategories((c) => (Array.isArray(c) ? c : []).filter((x) => x._id !== id));
    return true;
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{ categories, loading, load, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}
