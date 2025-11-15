// src/components/AddBudgetForm.jsx
import React, { useEffect, useState } from "react";
import { useCategories } from "../context/CategoriesContext";
import { useBudgets } from "../context/BudgetsContext";

function safeNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export default function AddBudgetForm({ onDone, initial }) {
  const { categories } = useCategories();
  const { createBudget, updateBudget } = useBudgets();

  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      const catId =
        typeof initial.category === "object"
          ? initial.category._id || initial.category.$oid
          : initial.category || "";
      setCategoryId(catId);
      setLimit(initial.limit != null ? String(initial.limit) : "");
    } else {
      setCategoryId("");
      setLimit("");
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      alert("Seleziona una categoria");
      return;
    }
    const lim = safeNumber(limit);
    if (lim <= 0) {
      alert("Inserisci un importo valido");
      return;
    }

    setLoading(true);
    try {
      if (initial && initial._id) {
        await updateBudget(initial._id, {
          category: categoryId,
          limit: lim,
          period: "monthly",
        });
      } else {
        await createBudget({
          category: categoryId,
          limit: lim,
          period: "monthly",
        });
      }
      onDone?.();
    } catch (err) {
      console.error("Errore salvataggio budget", err);
      alert("Errore durante il salvataggio del budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-base font-semibold mb-1">
        {initial ? "Modifica budget" : "Nuovo budget mensile"}
      </h3>

      <div>
        <label className="block text-sm mb-1">Categoria</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Seleziona una categoria</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {(c.icon || "💼") + " " + c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Limite mensile</label>
        <input
          type="number"
          step="0.01"
          className="w-full border rounded px-2 py-1"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Es. 500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-2 text-sm rounded border border-gray-300"
          disabled={loading}
        >
          Annulla
        </button>
        <button
          type="submit"
          className="px-3 py-2 text-sm rounded bg-blue-600 text-white"
          disabled={loading}
        >
          {loading ? "Salvo..." : "Salva budget"}
        </button>
      </div>
    </form>
  );
}
