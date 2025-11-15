// src/components/AddBudgetModal.jsx
import React, { useEffect, useState } from "react";

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

  const handleBackdropClick = (e) => {
    // se clicchi sullo sfondo scuro, chiudi
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-40"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow max-w-sm w-full mx-4 p-4">
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
    </div>
  );
}
