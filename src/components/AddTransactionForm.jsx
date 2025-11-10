import { useState } from "react";
import { categories } from "../utils/categories";

export default function AddTransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    type: "uscita", // 'entrata' o 'uscita'
    description: "",
    category: "Altro",
    amount: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || form.amount === "") return;

    // normalizza importo: entrata => positivo, uscita => negativo
    let amount = parseFloat(form.amount);
    if (Number.isNaN(amount)) return;

    if (form.type === "uscita" && amount > 0) amount = -Math.abs(amount);
    if (form.type === "entrata" && amount < 0) amount = Math.abs(amount);

    const payload = {
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      amount,
      // opzionali
      account: "Default",
      method: "Card",
    };

    onAdd(payload);
    setForm({
      ...form,
      description: "",
      amount: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col gap-3">
      {/* 1) Data */}
      <input
        type="date"
        className="border rounded p-2"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />

      {/* 2) Tipo: Entrata / Uscita */}
      <div className="flex gap-2">
        <label className={`flex-1 p-2 text-center border rounded cursor-pointer ${form.type === "entrata" ? "bg-green-50 border-green-300" : ""}`}>
          <input
            type="radio"
            name="type"
            value="entrata"
            checked={form.type === "entrata"}
            onChange={() => setForm({ ...form, type: "entrata" })}
            className="sr-only"
          />
          Entrata
        </label>
        <label className={`flex-1 p-2 text-center border rounded cursor-pointer ${form.type === "uscita" ? "bg-red-50 border-red-300" : ""}`}>
          <input
            type="radio"
            name="type"
            value="uscita"
            checked={form.type === "uscita"}
            onChange={() => setForm({ ...form, type: "uscita" })}
            className="sr-only"
          />
          Uscita
        </label>
      </div>

      {/* 3) Descrizione */}
      <input
        placeholder="Descrizione"
        className="border rounded p-2"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />

      {/* Categoria */}
      <select className="border rounded p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Importo */}
      <input
        type="number"
        step="0.01"
        placeholder="Importo (€)"
        className="border rounded p-2"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />

      <button className="bg-blue-500 text-white rounded p-2 font-semibold hover:bg-blue-600">Aggiungi</button>
    </form>
  );
}
