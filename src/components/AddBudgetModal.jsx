// src/components/AddBudgetModal.jsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function safeNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export default function AddBudgetModal({
  open,
  onClose,
  categories,
  onSave,
  loading,
}) {
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (open) {
      setCategoryId("");
      setLimit("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
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
    onSave({ categoryId, limit: lim });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>

        <h3 className="text-base font-semibold mb-3">
          Nuovo budget mensile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
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
              onClick={onClose}
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
    </div>,
    document.body
  );
}
