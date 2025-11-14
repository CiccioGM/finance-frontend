// src/components/AddCategoryForm.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  "#A855F7",
  "#0D9488",
  "#84CC16",
  "#D97706",
  "#15803D",
  "#1D4ED8",
  "#7C2D12",
  "#FB7185",
];

export default function AddCategoryForm({ initial, onDone }) {
  const { addCategory, updateCategory, categories } = useCategories();

  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "💸");
  const [color, setColor] = useState(initial?.color || COLOR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  useEffect(() => {
    function updateSize() {
      if (typeof window !== "undefined") {
        setIsDesktop(window.innerWidth >= 1024);
      }
    }
    updateSize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setIcon(initial.icon || "💸");
      setColor(initial.color || COLOR_OPTIONS[0]);
    }
  }, [initial]);

  const usedIcons = useMemo(() => {
    if (!Array.isArray(categories)) return new Set();
    const set = new Set();
    for (const c of categories) {
      if (!c) continue;
      if (initial && c._id === initial._id) continue;
      if (c.icon) set.add(c.icon);
    }
    return set;
  }, [categories, initial?._id]);

  const usedColors = useMemo(() => {
    if (!Array.isArray(categories)) return new Set();
    const set = new Set();
    for (const c of categories) {
      if (!c) continue;
      if (initial && c._id === initial._id) continue;
      if (c.color) set.add(c.color);
    }
    return set;
  }, [categories, initial?._id]);

  const sortedIcons = useMemo(() => {
    const currentIcon = initial?.icon;
    const unused = ICON_OPTIONS.filter(
      (ico) => !usedIcons.has(ico) || ico === currentIcon
    );
    const used = ICON_OPTIONS.filter(
      (ico) => usedIcons.has(ico) && ico !== currentIcon
    );
    return [...unused, ...used];
  }, [usedIcons, initial?.icon]);

  const sortedColors = useMemo(() => {
    const currentColor = initial?.color;
    const unused = COLOR_OPTIONS.filter(
      (c) => !usedColors.has(c) || c === currentColor
    );
    const used = COLOR_OPTIONS.filter(
      (c) => usedColors.has(c) && c !== currentColor
    );
    return [...unused, ...used];
  }, [usedColors, initial?.color]);

  const iconsToShow = useMemo(
    () => (showAllIcons ? sortedIcons : sortedIcons.slice(0, 20)),
    [sortedIcons, showAllIcons]
  );

  const colorsToShow = useMemo(
    () => (showAllColors ? sortedColors : sortedColors.slice(0, 8)),
    [sortedColors, showAllColors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Il nome è obbligatorio");
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

      {isDesktop && (
        <div>
          <label className="block text-sm mb-1">Icona</label>
          <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto border rounded p-2">
            {iconsToShow.map((ico) => {
              const isCurrent = icon === ico;
              const isUsed =
                usedIcons.has(ico) && !(initial && initial.icon === ico);
              const disabled = isUsed && !isCurrent;
              return (
                <button
                  key={ico}
                  type="button"
                  onClick={() => {
                    if (disabled) return;
                    setIcon(ico);
                  }}
                  className={`flex items-center justify-center h-8 w-8 rounded text-xl ${
                    isCurrent ? "bg-blue-100 ring-2 ring-blue-500" : ""
                  } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  disabled={disabled}
                  title={ico}
                >
                  {ico}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-1">
            {!showAllIcons && sortedIcons.length > 20 && (
              <button
                type="button"
                className="text-xs text-blue-600 underline"
                onClick={() => setShowAllIcons(true)}
              >
                Altro
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm mb-1">Colore</label>
        <div className="grid grid-cols-5 gap-2">
          {colorsToShow.map((c) => {
            const isCurrent = color === c;
            const isUsed =
              usedColors.has(c) && !(initial && initial.color === c);
            const disabled = isUsed && !isCurrent;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  if (disabled) return;
                  setColor(c);
                }}
                className={`h-8 w-full rounded border ${
                  isCurrent ? "ring-2 ring-offset-1 ring-blue-500" : ""
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                style={{ backgroundColor: c }}
                disabled={disabled}
              />
            );
          })}
        </div>
        <div className="flex justify-end mt-1">
          {!showAllColors && sortedColors.length > 8 && (
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() => setShowAllColors(true)}
            >
              Altro
            </button>
          )}
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
