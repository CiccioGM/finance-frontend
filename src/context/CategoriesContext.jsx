import { createContext, useContext, useEffect, useState } from "react";

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const api = import.meta.env.VITE_API_URL;

  // Carica le categorie dal backend
  useEffect(() => {
    fetch(`${api}/api/categories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, [api]);

  const addCategory = async (cat) => {
    const res = await fetch(`${api}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
    const newCat = await res.json();
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = async (id, updates) => {
    const res = await fetch(`${api}/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setCategories(prev => prev.map(c => (c._id === id ? updated : c)));
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`${api}/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }
    setCategories(prev => prev.filter(c => c._id !== id));
  };

  return (
    <CategoriesContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => useContext(CategoriesContext);
