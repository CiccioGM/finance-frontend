import { useEffect, useState } from "react";
import { categories as defaultCats } from "../utils/categories";

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
          <div key={i} className="flex items-center gap-2 mb-2">
            <input value={c.icon} onChange={(e) => update(i, "icon", e.target.value)} className="w-12 p-2 border rounded" />
            <input value={c.name} onChange={(e) => update(i, "name", e.target.value)} className="flex-1 p-2 border rounded" />
            <button onClick={() => remove(i)} className="text-red-600 ml-2">Elimina</button>
          </div>
        ))}
        <div className="mt-2 text-right">
          <button onClick={add} className="bg-blue-600 text-white px-3 py-2 rounded">Aggiungi Categoria</button>
        </div>
      </div>
    </div>
  );
}
