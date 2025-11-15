// src/pages/Budget.jsx
import React, { useMemo, useState } from "react";
import { useCategories } from "../context/CategoriesContext";
import { useTransactions } from "../context/TransactionsContext";
import { useBudgets } from "../context/BudgetsContext";

function safeNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function formatEuro(v) {
  const n = safeNumber(v);
  return `€ ${n.toFixed(2)}`;
}

export default function Budget() {
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const { budgets, createBudget, deleteBudget, loading, error } = useBudgets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryId("");
    setLimit("");
  };

  const handleAdd = async (e) => {
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

    try {
      await createBudget({
        category: categoryId,
        limit: lim,
        period: "monthly",
      });
      closeModal();
    } catch {
      alert("Errore durante il salvataggio del budget");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
    } catch {
      alert("Errore durante l'eliminazione del budget");
    }
  };

  const currentMonthSummary = useMemo(() => {
    if (!Array.isArray(transactions)) return {};
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const map = {};
    for (const t of transactions) {
      if (!t.date) continue;
      const d = new Date(t.date);
      if (d < start || d > end) continue;
      const amount = safeNumber(t.amount);
      if (amount >= 0) continue; // solo uscite

      const catId =
        typeof t.category === "object"
          ? t.category._id || t.category.$oid
          : t.category;
      if (!catId) continue;

      map[catId] = (map[catId] || 0) + Math.abs(amount);
    }
    return map;
  }, [transactions]);

  const budgetsWithInfo = useMemo(() => {
    return (budgets || []).map((b) => {
      const catId =
        typeof b.category === "object"
          ? b.category._id || b.category.$oid
          : b.category;
      const cat = categories.find((c) => c._id === catId);
      const spent = currentMonthSummary[catId] || 0;
      const ratio =
        b.limit > 0 ? Math.min(1, spent / b.limit) : 0;
      const ratioPct =
        b.limit > 0 ? ((spent / b.limit) * 100).toFixed(0) : "0";
      return {
        ...b,
        categoryId: catId,
        categoryName: cat?.name || "Categoria sconosciuta",
        categoryIcon: cat?.icon || "💸",
        spent,
        ratio,
        ratioPct,
      };
    });
  }, [budgets, categories, currentMonthSummary]);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Lista budget esistenti */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Budget mensile</h2>

        {budgetsWithInfo.length === 0 ? (
          <div className="text-sm text-gray-500 mb-3">
            Nessun budget impostato. Puoi aggiungerne uno con il pulsante qui
            sotto.
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {budgetsWithInfo.map((b) => (
              <div
                key={b._id}
                className="border rounded px-3 py-2 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.categoryIcon}</span>
                    <div>
                      <div className="text-sm font-semibold">
                        {b.categoryName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Limite mensile: {formatEuro(b.limit)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(b._id)}
                    className="text-xs text-red-600 underline"
                  >
                    Elimina
                  </button>
                </div>

                <div className="mt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Speso questo mese</span>
                    <span>
                      {formatEuro(b.spent)} / {formatEuro(b.limit)} (
                      {b.ratioPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className={`h-2 rounded ${
                        b.ratio < 0.8
                          ? "bg-green-500"
                          : b.ratio < 1
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${b.ratio * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={openModal}
          className="mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          + Aggiungi budget
        </button>

        {error && (
          <div className="text-sm text-red-600 mt-2">
            {error}
          </div>
        )}
      </div>

      {/* MODAL semitrasparente per creazione budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow max-w-sm w-full mx-4 p-4">
            <h3 className="text-base font-semibold mb-3">
              Nuovo budget mensile
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
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
                  onClick={closeModal}
                  className="px-3 py-2 text-sm rounded border border-gray-300"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm rounded bg-blue-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Salvataggio..." : "Salva budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
