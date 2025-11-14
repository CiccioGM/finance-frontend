// src/components/TransactionList.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTransactions } from "../context/TransactionsContext";
import AddTransactionModal from "./AddTransactionModal";
import { MoreVertical } from "lucide-react";

export default function TransactionList({ items }) {
  const { deleteTransaction } = useTransactions();
  const [editing, setEditing] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

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

  const handleDelete = async (tx) => {
    if (!confirm("Eliminare questa transazione?")) return;
    try {
      await deleteTransaction(tx._id);
    } catch (e) {
      console.error("delete error", e);
      alert("Errore durante l'eliminazione");
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleEdit = (tx) => {
    setEditing(tx);
    setOpenMenuId(null);
  };

  return (
    <div>
      <ul className="divide-y">
        {items.map((tx) => (
          <li
            key={tx._id}
            className="py-3 flex justify-between items-center gap-3"
          >
            <div>
              <div className="text-sm text-gray-600">
                {tx.date ? new Date(tx.date).toLocaleDateString() : "-"}
              </div>
              <div className="font-medium">{tx.description || "—"}</div>
              <div className="text-xs text-gray-500">
                {tx.category && typeof tx.category === "object"
                  ? tx.category.name
                  : tx.category || "—"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`${
                  tx.amount >= 0 ? "text-green-600" : "text-red-600"
                } font-semibold text-sm`}
              >
                {Number(tx.amount || 0).toFixed(2)} €
              </div>

              <div
                className="relative"
                ref={(el) => {
                  menuRefs.current[tx._id] = el;
                }}
              >
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() =>
                    setOpenMenuId((prev) => (prev === tx._id ? null : tx._id))
                  }
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === tx._id && (
                  <div className="absolute right-0 mt-1 bg-white border rounded shadow z-20 min-w-[120px] text-sm">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleEdit(tx)}
                    >
                      Modifica
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                      onClick={() => handleDelete(tx)}
                    >
                      Elimina
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AddTransactionModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
