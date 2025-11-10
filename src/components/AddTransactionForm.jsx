import { useEffect, useState } from "react";
import { categories as defaultCats } from "../utils/categories";

export default function AddTransactionForm({ onAdd, initial = null, onCancel = null, submitLabel = "Aggiungi" }) {
  const [cats, setCats] = useState(defaultCats);
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("finance_categories_v1") || "null");
    if (stored) setCats(stored);
  }, []);

  const [form, setForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    type: "uscita",
    description: "",
    category: cats[0]?.name || "Altro",
    amount: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        date: new Date(initial.date).toISOString().substring(0, 10),
        type: Number(initial.amount) >= 0 ? "entrata" : "uscita",
        description: initial.description || "",
        category: initial.category || (cats[0]?.name || "Altro"),
        amount: Math.abs(Number(initial.amount || 0)).toString(),
      });
    }
    // eslint-disable-next-line
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || form.amount === "") {
      alert("Compila descrizione e importo.");
      return;
    }

    let amount = parseFloat(form.amount);
    if (Number.isNaN(amount)) { alert("Importo non valido"); return; }
    if (form.type === "uscita" && amount > 0) amount = -Math.abs(amount);
    if (form.type === "entrata" && amount < 0) amount = Math.abs(amount);

    const payload = {
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      amount,
      account: "Default",
      method: "Card",
    };

    onAdd(payload);

    if (!initial) {
      setForm({
        date: new Date().toISOString().substring(0, 10),
        type: "uscita",
        description: "",
        category: cats[0]?.name || "Altro",
        amount: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col gap-3">
      <input type="date" className="border rounded p-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />

      <div className="flex gap-2">
        <label className={`flex-1 p-2 text-center border rounded cursor-pointer ${form.type === "entrata" ? "bg-green-50 border-green-300" : ""}`}>
          <input type="radio" name="type" value="entrata" checked={form.type === "entrata"} onChange={() => setForm({ ...form, type: "entrata" })} className="sr-only" />
          Entrata
        </label>
        <label className={`flex-1 p-2 text-center border rounded cursor-pointer ${form.type === "uscita" ? "bg-red-50 border-red-300" : ""}`}>
          <input type="radio" name="type" value="uscita" checked={form.type === "uscita"} onChange={() => setForm({ ...form, type: "uscita" })} className="sr-only" />
          Uscita
        </label>
      </div>

      <input placeholder="Descrizione" className="border rounded p-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />

      <select className="border rounded p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {cats.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>

      <input type="number" step="0.01" placeholder="Importo (€)" className="border rounded p-2" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-500 text-white rounded p-2 font-semibold hover:bg-blue-600">{submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className="flex-1 border rounded p-2">Annulla</button>}
      </div>
    </form>
  );
}
