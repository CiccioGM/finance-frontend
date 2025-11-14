import React, { useState } from "react";
import { useCategories } from "../context/CategoriesContext";

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("uscita");
  const [icon, setIcon] = useState("💸");
  const [color, setColor] = useState("#FF8042");

  const onAdd = async () => {
    if (!name) return alert("Nome richiesto");
    await addCategory({ name, type, icon, color });
    setName(""); setIcon("💸");
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Aggiungi Categoria</h3>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} className="border p-2 rounded" />
          <select value={type} onChange={e=>setType(e.target.value)} className="border p-2 rounded">
            <option value="uscita">Uscita</option>
            <option value="entrata">Entrata</option>
          </select>
          <input value={icon} onChange={e=>setIcon(e.target.value)} className="border p-2 rounded" />
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="border p-2 rounded" />
          <div className="col-span-2 flex justify-end">
            <button onClick={onAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Aggiungi</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Categorie</h3>
        <div className="divide-y">
          {categories.map(c => (
            <div key={c._id} className="py-2 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div style={{ fontSize: 20 }}>{c.icon}</div>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.type}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{ setEditing(c); setName(c.name); setIcon(c.icon || ""); setColor(c.color || "#fff"); setType(c.type || "uscita"); }} className="text-sm text-blue-600">Modifica</button>
                <button onClick={async ()=>{ if(!confirm("Eliminare?")) return; try{ await deleteCategory(c._id); }catch(e){ alert("Impossibile eliminare: categoria in uso"); } }} className="text-sm text-red-600">Elimina</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
