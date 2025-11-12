import { useEffect, useState, useRef } from "react";
import { categories as defaultCats } from "../utils/categories";
import { MoreVertical, Trash2 } from "lucide-react";

const KEY = "finance_categories_v1";

export default function Categories() {
  const [cats, setCats] = useState([]);

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
            c={c}
            onChange={(key, val) => update(i, key, val)}
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

function CategoryRow({ c, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-2 mb-2">
      <input value={c.icon} onChange={(e) => onChange("icon", e.target.value)} className="w-12 p-2 border rounded" />
      <input value={c.name} onChange={(e) => onChange("name", e.target.value)} className="flex-1 p-2 border rounded" />

      {/* menu per azioni (visibile e comodo su mobile) */}
      <div className="relative">
        <button onClick={() => setOpen((s) => !s)} className="p-2 rounded hover:bg-gray-100" aria-label="Azioni categoria">
          <MoreVertical size={18} />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-36 bg-white border rounded shadow z-20">
            <button onClick={() => { setOpen(false); /* eventuali azioni future */ }} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2">
              {/* placeholder per Edit (già in-place) */} Modifica
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600">
              <Trash2 size={16} /> Elimina
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
