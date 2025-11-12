import { useEffect, useState, useRef } from "react";
import { categories as defaultCats } from "../utils/categories";
import { MoreVertical, Trash2, Edit as EditIcon, Check } from "lucide-react";

const KEY = "finance_categories_v1";

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null");
    setCats(stored || defaultCats);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cats));
  }, [cats]);

  const add = () => setCats((p) => [...p, { name: "Nuova", icon: "🔖" }]);
  const update = (idx, key, val) => setCats((p) => p.map((c, i) => (i === idx ? { ...c, [key]: val } : c)));
  const remove = (idx) => setCats((p) => p.filter((_, i) => i !== idx));

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-3">Categorie</h2>
      <p className="text-sm text-gray-500 mb-2">Personalizza le categorie per Entrate e Uscite (salvate in locale).</p>

      <div className="bg-white p-4 rounded-xl shadow">
        {cats.map((c, i) => (
          <CategoryRow
            key={i}
            idx={i}
            c={c}
            editing={editingIndex === i}
            onStartEdit={() => setEditingIndex(i)}
            onCancelEdit={() => setEditingIndex(null)}
            onSave={(newC) => {
              update(i, "name", newC.name);
              update(i, "icon", newC.icon);
              setEditingIndex(null);
            }}
            onDelete={() => remove(i)}
          />
        ))}

        <div className="mt-2 text-right">
          <button onClick={add} className="bg-blue-600 text-white px-3 py-2 rounded">Aggiungi Categoria</button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ c, idx, editing, onStartEdit, onCancelEdit, onSave, onDelete }) {
  const [local, setLocal] = useState(c);
  const ref = useRef();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setLocal(c), [c]);

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-2 mb-2">
      <input
        value={local.icon}
        onChange={(e) => setLocal({ ...local, icon: e.target.value })}
        className="w-12 p-2 border rounded"
        readOnly={!editing}
        aria-label={`Icona categoria ${local.name}`}
      />
      <input
        value={local.name}
        onChange={(e) => setLocal({ ...local, name: e.target.value })}
        className="flex-1 p-2 border rounded"
        readOnly={!editing}
        aria-label={`Nome categoria ${local.name}`}
      />

      <div className="relative">
        <button onClick={() => setMenuOpen((s) => !s)} className="p-2 rounded hover:bg-gray-100" aria-label="Azioni categoria">
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow z-20">
            {!editing ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onStartEdit();
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
              >
                <EditIcon size={16} /> Modifica
              </button>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSave(local);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-green-600"
              >
                <Check size={16} /> Salva
              </button>
            )}

            <button
              onClick={() => {
                setMenuOpen(false);
                if (confirm(`Eliminare la categoria "${c.name}"?`)) onDelete();
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <Trash2 size={16} /> Elimina
            </button>

            {editing && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onCancelEdit();
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-600"
              >
                Annulla
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
