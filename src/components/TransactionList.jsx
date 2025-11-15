// src/components/TransactionList.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { MoreVertical } from "lucide-react";
import { useTransactions } from "../context/TransactionsContext";
import { useCategories } from "../context/CategoriesContext";
import AddTransactionModal from "./AddTransactionModal";

function formatEuro(amount) {
  const n = Number(amount) || 0;
  const sign = n < 0 ? "-" : "";
  return `${sign}€ ${Math.abs(n).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT");
}

function getType(amount) {
  const n = Number(amount) || 0;
  return n >= 0 ? "entrata" : "uscita";
}

function resolveCategory(categories, catField) {
  if (!catField) return null;
  if (typeof catField === "object") {
    if (catField._id || catField.name) return catField;
    if (catField.$oid) {
      return categories.find((c) => c._id === catField.$oid) || null;
    }
    return null;
  }
  if (typeof catField === "string") {
    return categories.find((c) => c._id === catField) || null;
  }
  return null;
}

export default function TransactionList({ transactions, items }) {
  const { deleteTransaction } = useTransactions();
  const { categories } = useCategories();

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const [editing, setEditing] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // sorgente dati: prima items (se presente), altrimenti transactions
  const source = useMemo(() => {
    if (Array.isArray(items)) return items;
    if (Array.isArray(transactions)) return transactions;
    return [];
  }, [items, transactions]);

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

  const sortedTransactions = useMemo(() => {
    // Ordina per data (più recente prima); se manca, mantiene l'ordine
    return [...source].sort((a, b) => {
      const da = a.date || a.createdAt;
      const db = b.date || b.createdAt;
      if (!da || !db) return 0;
      return new Date(db) - new Date(da);
    });
  }, [source]);

  const handleEdit = (tx) => {
    setEditing(tx);
    setEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (tx) => {
    if (!window.confirm("Eliminare questa transazione?")) return;
    try {
      await deleteTransaction(tx._id);
    } catch (err) {
      console.error("Errore eliminazione transazione", err);
      alert("Errore durante l'eliminazione della transazione");
    } finally {
      setOpenMenuId(null);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditing(null);
  };

  if (!sortedTransactions.length) {
    return (
      <div className="text-sm text-gray-500">
        Nessuna transazione trovata.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y">
        {sortedTransactions.map((t) => {
          const type = getType(t.amount);
          const isEntrata = type === "entrata";

          const cat = resolveCategory(categories, t.category);
          const categoryName = cat?.name || "";
          const categoryIcon = cat?.icon || "💸";

          return (
            <div
              key={t._id}
              className="py-2 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-lg ${
                    isEntrata ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {categoryIcon}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {t.description || "(senza descrizione)"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(t.date)}
                    {categoryName ? ` • ${categoryName}` : ""}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`text-sm font-semibold ${
                    isEntrata ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatEuro(t.amount)}
                </div>

                <div
                  className="relative"
                  ref={(el) => {
                    menuRefs.current[t._id] = el;
                  }}
                >
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={() =>
                      setOpenMenuId((prev) => (prev === t._id ? null : t._id))
                    }
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === t._id && (
                    <div className="absolute right-0 mt-1 bg-white border rounded shadow z-20 min-w-[140px] text-sm">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={() => handleEdit(t)}
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                        onClick={() => handleDelete(t)}
                      >
                        Elimina
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal per modifica transazione */}
      <AddTransactionModal
        open={editModalOpen}
        onClose={closeEditModal}
        initial={editing}
      />
    </>
  );
}
