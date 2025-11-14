import React, { useEffect, useState } from "react";
import { useCategories } from "../context/CategoriesContext";
import { useTransactions } from "../context/TransactionsContext";

function toInputDate(value) {
  // value può essere: stringa ISO, Date object, oppure altro
  if (!value) return new Date().toISOString().slice(0, 10);
  if (typeof value === "string") {
    // se è già stringa tipo "2025-11-09T00:00:00.000Z" o "2025-11-09", prendi i primi 10
    return value.length >= 10 ? value.slice(0, 10) : value;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  // fallback
  try {
    const d = new Date(value);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  } catch (err) {}
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionForm({ onDone, initial }) {
  const { categories } = useCategories();
  const { addTransaction, updateTransaction } = useTransactions();

  const [date, setDate] = useState(() => toInputDate(initial?.date));
  const [type, setType] = useState(initial ? (Number(initial.amount) >= 0 ? "entrata" : "uscita") : "uscita");
  const [description, setDescription] = useState(initial?.description || "");
  const [amount, setAmount] = useState(initial ? Math.abs(Number(initial.amount || 0)) : "");
  const [categoryId, setCategoryId] = useState(initial?.category?._id || initial?.category || "");

  useEffect(() => {
    if (initial) {
      setDate(toInputDate(initial.date));
      setType(Number(initial.amount) >= 0 ? "entrata" : "uscita");
      setDescription(initial.description || "");
      setAmount(Math.abs(Number(initial.amount || 0)));
      setCategoryId(initial?.category?._id || initial?.category || "");
    }
  }, [initial]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const signedAmount = type === "entrata" ? Math.abs(Number(amount)) : -Math.abs(Number(amount));
    const payload = { date, description, amount: signedAmount, category: categoryId || null };
    try {
      if (initial && initial._id) {
        await updateTransaction(initial._id, payload);
      } else {
        await addTransaction(payload);
      }
      onDone?.();
    } catch (err) {
      console.error("Errore salvataggio transazione", err);
      alert("Si è verificato un errore durante il salvataggio.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm">Data</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm">Tipo</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setType("entrata")} className={`px-3 py-1 rounded ${type === "entrata" ? "bg-green-500 text-white" : "border"}`}>Entrata</button>
          <button type="button" onClick={() => setType("uscita")} className={`px-3 py-1 rounded ${type === "uscita" ? "bg-red-500 text-white" : "border"}`}>Uscita</button>
        </div>
      </div>
      <div>
        <label className="block text-sm">Categoria</label>
        <select value={categoryId || ""} onChange={e => setCategoryId(e.target.value || "")} className="w-full border rounded px-2 py-1">
          <option value="">-- Nessuna --</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.icon || ""} {c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm">Descrizione</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm">Importo</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded px-2 py-1" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="px-3 py-2 border rounded">Annulla</button>
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Salva</button>
      </div>
    </form>
  );
}
