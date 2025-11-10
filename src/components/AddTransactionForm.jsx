import { useState } from "react";
import { categories } from "../utils/categories.js";

export default function AddTransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    description: "",
    category: "Altro",
    amount: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    onAdd({
      ...form,
      amount: parseFloat(form.amount),
      date: new Date(form.date),
    });
    setForm({ ...form, description: "", amount: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col gap-3"
    >
      <input
        className="border rounded p-2"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
      <input
        className="border rounded p-2"
        placeholder="Descrizione"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <select
        className="border rounded p-2"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        {categories.map((c) => (
          <option key={c.name}>{c.name}</option>
        ))}
      </select>
      <input
        className="border rounded p-2"
        type="number"
        placeholder="Importo (€)"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />
      <button className="bg-blue-500 text-white rounded p-2 font-semibold hover:bg-blue-600">
        Aggiungi
      </button>
    </form>
  );
}
