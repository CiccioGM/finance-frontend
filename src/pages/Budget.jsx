// src/pages/Budget.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useCategories } from "../context/CategoriesContext";
import { useTransactions } from "../context/TransactionsContext";
import { useBudgets } from "../context/BudgetsContext";
import AddBudgetModal from "../components/AddBudgetModal";
import { MoreVertical } from "lucide-react";

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
  const { budgets, deleteBudget, error } = useBudgets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  // chiusura menù a tre puntini cliccando fuori
  useEffect(() => {
    function handleClickOutside(e) {
      const refs = menuRefs.current || {};
      const clickedInside = Object.values(refs).some(
        (node) => node && node.contains(e.target)
      );
      if (!clickedInside) setOpenMenuId(null);
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const openNewModal = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminare questo budget?")) return;
    try {
      await deleteBudget(id);
    } catch {
      alert("Errore durante l'eliminazione del budget");
    } finally {
      setOpenMenuId(null);
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

                  <div
                    className="relative"
                    ref={(el) => {
                      menuRefs.current[b._id] = el;
                    }}
                  >
                    <button
                      type="button"
                      className="p-1 rounded-full hover:bg-gray-100"
                      onClick={() =>
                        setOpenMenuId((prev) =>
                          prev === b._id ? null : b._id
                        )
                      }
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === b._id && (
                      <div className="absolute right-0 mt-1 bg-white border rounded shadow z-20 min-w-[140px] text-sm">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                          onClick={() => openEditModal(b)}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(b._id)}
                        >
                          Elimina
                        </button>
                      </div>
                    )}
                  </div>
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
          onClick={openNewModal}
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

      {/* MODAL Nuovo / Modifica Budget */}
      <AddBudgetModal
        open={isModalOpen}
        onClose={closeModal}
        initial={editingBudget}
      />
    </div>
  );
}
