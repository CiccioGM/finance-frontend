import React, { useEffect, useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useCategories } from "../context/CategoriesContext";
import MonthlyBarChart from "../components/MonthlyBarChart";
import ExpensePieChart from "../components/ExpensePieChart";
const API = import.meta.env.VITE_API_URL;

function safeNumber(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function formatMonthLabel(m) {
  // m: { year, month } numeri o stringhe
  const year = m.year ?? (new Date()).getFullYear();
  const month = m.month ?? 1;
  const yy = String(year).slice(2);
  const mm = String(month).padStart(2, "0");
  return `${mm}/${yy}`;
}

export default function Dashboard() {
  const txContext = useTransactions();
  const catContext = useCategories();
  const transactions = Array.isArray(txContext?.transactions) ? txContext.transactions : [];
  const loading = !!txContext?.loading;
  const categories = Array.isArray(catContext?.categories) ? catContext.categories : [];

  const [summary, setSummary] = useState({ saldo: 0, entrate30: 0, uscite30: 0 });
  const [monthly, setMonthly] = useState([]);
  const [pie, setPie] = useState({ total: 0, data: [] });
  const [filterCategory, setFilterCategory] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/summary`);
        if (!res.ok) throw new Error("summary fetch failed");
        const json = await res.json();
        if (mounted) setSummary({
          saldo: safeNumber(json.saldo),
          entrate30: safeNumber(json.entrate30),
          uscite30: safeNumber(json.uscite30)
        });
      } catch (err) {
        console.error("Error loading dashboard summary:", err);
      }
    };

    const loadMonthly = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/monthly`);
        if (!res.ok) throw new Error("monthly fetch failed");
        const arr = await res.json();
        if (!Array.isArray(arr)) return;
        const mapped = arr.map(m => ({
          label: formatMonthLabel(m),
          entrate: safeNumber(m.entrate),
          uscite: safeNumber(m.uscite)
        }));
        if (mounted) setMonthly(mapped);
      } catch (err) {
        console.error("Error loading monthly:", err);
      }
    };

    const loadPie = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/pie-expenses`);
        if (!res.ok) throw new Error("pie fetch failed");
        const json = await res.json();
        if (!json || !Array.isArray(json.data)) return;
        // ensure numeric values
        const d = json.data.map(it => ({
          _id: it._id,
          name: it.name || "Altro",
          icon: it.icon || "💸",
          color: it.color || "#AAAAAA",
          value: safeNumber(it.value),
          percentage: safeNumber(it.percentage)
        }));
        if (mounted) setPie({ total: safeNumber(json.total), data: d });
      } catch (err) {
        console.error("Error loading pie:", err);
      }
    };

    loadSummary();
    loadMonthly();
    loadPie();

    return () => { mounted = false; };
  }, []);

  const latest = Array.isArray(transactions) ? transactions.slice(0, 5) : [];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Saldo</div>
          <div className="text-2xl font-semibold">{summary.saldo.toFixed(2)} €</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Entrate (30gg)</div>
          <div className="text-2xl font-semibold">{summary.entrate30.toFixed(2)} €</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Uscite (30gg)</div>
          <div className="text-2xl font-semibold">{summary.uscite30.toFixed(2)} €</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Andamento ultimi 12 mesi</h3>
        <MonthlyBarChart data={monthly} />
      </div>

      <div className="bg-white p-4 rounded shadow flex gap-6">
        <div>
          <h3 className="font-semibold mb-3">Suddivisione uscite</h3>
          <ExpensePieChart data={pie.data} onLegendClick={(id) => setFilterCategory(filterCategory === id ? null : id)} activeId={filterCategory} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Ultime transazioni</h3>
        <div className="divide-y">
          {latest.map(tx => (
            <div key={tx._id} className="py-2 flex justify-between">
              <div>
                <div className="text-sm text-gray-500">{tx.date ? new Date(tx.date).toLocaleDateString() : "-"}</div>
                <div className="font-medium">{tx.description || "—"}</div>
                <div className="text-xs text-gray-500">{tx.category?.name || "—"}</div>
              </div>
              <div className={`${(safeNumber(tx.amount) >= 0) ? "text-green-600" : "text-red-600"} font-semibold`}>
                {safeNumber(tx.amount).toFixed(2)} €
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
