// src/components/AddCategoryForm.jsx
import React, { useEffect, useState } from "react";
import { useCategories } from "../context/CategoriesContext";

export default function AddCategoryForm({ initial, onDone }) {
  const { addCategory, updateCategory } = useCategories();
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "uscita");
  const [icon, setIcon] = useState(initial?.icon || "💸");
  const [color, setColor] = useState(initial?.color || "#FF8042");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setType(initial.type || "uscita");
      setIcon(initial.icon || "💸");
      setColor(initial.color || "#FF8042");
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Il nome è obbligatorio");
      return;
    }
    setLoading(true);
    try {
      if (initial && initial._id) {
        await updateCategory(initial._id, { name, type, icon, color });
      } else {
        await addCategory({ name, type, icon, color });
      }
      onDone?.();
    } catch (err) {
      console.error("Errore salvataggio categoria", err);
      alert("Errore durante il salvataggio della categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold mb-1">
        {initial ? "Modifica categoria" : "Nuova categoria"}
      </h2>

      <div>
        <label className="block text-sm mb-1">Nome</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Spesa, Stipendio..."
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Tipo</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("entrata")}
            className={`px-3 py-1 rounded ${
              type === "entrata" ? "bg-green-500 text-white" : "border"
            }`}
          >
            Entrata
          </button>
          <button
            type="button"
            onClick={() => setType("uscita")}
            className={`px-3 py-1 rounded ${
              type === "uscita" ? "bg-red-500 text-white" : "border"
            }`}
          >
            Uscita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm mb-1">Icona</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Colore</label>
          <input
            type="color"
            className="w-full border rounded h-[38px]"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-2 border rounded"
          disabled={loading}
        >
          Annulla
        </button>
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Salvo..." : "Salva"}
        </button>
      </div>
    </form>
  );
}
