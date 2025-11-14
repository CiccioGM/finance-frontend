// src/components/AddCategoryForm.jsx
import React, { useEffect, useState } from "react";
import { useCategories } from "../context/CategoriesContext";

const ICON_OPTIONS = [
  "💰",
  "💸",
  "🪙",
  "🏦",
  "🏠",
  "🚗",
  "🚌",
  "✈️",
  "⛽",
  "🛒",
  "🍽️",
  "🍕",
  "🍔",
  "🥦",
  "☕",
  "🎁",
  "🎉",
  "🎮",
  "📱",
  "💻",
  "🖥️",
  "🧾",
  "📚",
  "🎓",
  "🏥",
  "💊",
  "👕",
  "👟",
  "👶",
  "🐾",
  "🎵",
  "🎬",
  "🧳",
  "🏖️",
  "📦",
  "🛠️",
  "🧹",
  "🔌",
  "📡",
  "🌐",
  "🪑",
  "🛏️",
  "🚿",
  "🧼",
  "🧴",
  "💡",
  "🪵",
  "🧊",
  "📈",
];

const COLOR_OPTIONS = [
  "#EF4444",
  "#F97316",
  "#FACC15",
  "#22C55E",
  "#14B8A6",
  "#0EA5E9",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
  "#6B7280",
  "#4B5563",
  "#111827",
  "#A855F7",
  "#0D9488",
  "#84CC16",
  "#D97706",
  "#15803D",
  "#1D4ED8",
  "#7C2D12",
];

export default function AddCategoryForm({ initial, onDone }) {
  const { addCategory, updateCategory } = useCategories();
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "💸");
  const [color, setColor] = useState(initial?.color || "#FF8042");
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [customIcon, setCustomIcon] = useState(initial?.icon || "");

  useEffect(() => {
    function updateSize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setIcon(initial.icon || "💸");
      setColor(initial.color || "#FF8042");
      setCustomIcon(initial.icon || "");
    }
  }, [initial]);

  useEffect(() => {
    // se sono su mobile/tablet e l'utente scrive una icona a mano
    if (!isDesktop && customIcon) {
      setIcon(customIcon);
    }
  }, [customIcon, isDesktop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Il nome è obbligatorio");
      return;
    }
    if (!icon) {
      alert("Scegli un'icona");
      return;
    }
    if (!color) {
      alert("Scegli un colore");
      return;
    }
    setLoading(true);
    try {
      if (initial && initial._id) {
        await updateCategory(initial._id, { name, icon, color });
      } else {
        await addCategory({ name, icon, color });
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

      {/* ICONE */}
      <div>
        <label className="block text-sm mb-1">Icona</label>
        {isDesktop ? (
          <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto border rounded p-2">
            {ICON_OPTIONS.map((ico) => (
              <button
                key={ico}
                type="button"
                onClick={() => setIcon(ico)}
                className={`flex items-center justify-center h-8 w-8 rounded text-xl ${
                  icon === ico ? "bg-blue-100 ring-2 ring-blue-500" : ""
                }`}
              >
                {ico}
              </button>
            ))}
          </div>
        ) : (
          <input
            className="w-full border rounded px-2 py-1"
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            placeholder="Inserisci emoji (es. 💸)"
          />
        )}
      </div>

      {/* COLORI */}
      <div>
        <label className="block text-sm mb-1">Colore</label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-full rounded border ${
                color === c ? "ring-2 ring-offset-1 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
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
