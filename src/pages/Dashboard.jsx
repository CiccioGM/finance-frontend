// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  const year = m.year ?? new Date().getFullYear();
  const month = m.month ?? 1;
  const yy = String(year).slice(2);
  const mm = String(month).padStart(2, "0");
  return `${mm}/${yy}`;
}

function formatEuro(v) {
  const n = safeNumber(v);
  return `€ ${n.toFixed(2)}`;
}

export default function Dashboard() {
  const { transactions, loading } = useTransactions();
  const { categories } = useCategories();

  const [summary, setSummary] = useState({
    saldo: 0,
    entrate30: 0,
    uscite30: 0,
  });
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/summary`);
        if (!res.ok) throw new Error("summary fetch failed");
        const json = await res.json();
        if (mounted)
          setSummary({
            saldo: safeNumber(json.saldo),
            entrate30: safeNumber(json.entrate30),
            uscite30: safeNumber(json.uscite30),
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
        const mapped = arr.map((m) => ({
          label: formatMonthLabel(m),
          entrate: safeNumber(m.entrate),
          uscite: safeNumber(m.uscite),
        }));
        if (mounted) setMonthly(mapped);
      } catch (err) {
        console.error("Error loading monthly:", err);
      }
    };

    loadSummary();
    loadMonthly();

    return () => {
      mounted = false;
    };
  }, []);

  // Ultime transazioni: ordine di inserimento (createdAt verso il basso)
  const latest = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return [...transactions]
      .sort((a, b) => {
        const da = a.createdAt || a.date;
        const db = b.createdAt || b.date;
        return new Date(db) - new Date(da);
      })
      .slice(0, 5);
  }, [transactions]);

  // Funzione per risolvere la categoria a partire da id/stringa/oggetto
  const resolveCategory = (catField) => {
    if (!catField) return null;
    if (typeof catField === "object") {
      if (catField._id || catField.name) return catField;
      if (catField.$oid) {
        const found = categories.find((c) => c._id === catField.$oid);
        return found || null;
      }
      return null;
    }
    if (typeof catField === "string") {
      const found = categories.find((c) => c._id === catField);
      return found || null;
    }
    return null;
  };

  // Grafico a torta: calcolato lato frontend in base a transazioni + categorie
  const pieData = useMemo(() => {
    if (!Array.isArray(transactions)) return { total: 0, data: [] };

    const now = new Date();
    const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const expenses = transactions.filter((t) => {
      const amount = safeNumber(t.amount);
      if (amount >= 0) return false; // solo uscite
      if (!t.date) return true;
      const d = new Date(t.date);
      return d >= days30Ago && d <= now;
    });

    if (expenses.length === 0) return { total: 0, data: [] };

    const groups = new Map();
    let totalAbs = 0;

    for (const t of expenses) {
      const amountAbs = Math.abs(safeNumber(t.amount));
      const cat = resolveCategory(t.category);
      const key = cat?._id || "altro";

      const current = groups.get(key) || {
        _id: key,
        name: cat?.name || "Altro",
        icon: cat?.icon || "💸",
        color: cat?.color || "#AAAAAA",
        value: 0,
      };

      current.value += amountAbs;
      groups.set(key, current);
      totalAbs += amountAbs;
    }

    const data = Array.from(groups.values()).map((g) => ({
      ...g,
      percentage: totalAbs > 0 ? Number(((g.value / totalAbs) * 100).toFixed(1)) : 0,
    }));

    return { total: totalAbs, data };
  }, [transactions, categories]);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* 3 card sempre in riga */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="bg-white p-3 md:p-4 rounded shadow">
          <div className="text-xs md:text-sm text-gray-500">Saldo</div>
          <div className="text-base md:text-2xl font-semibold whitespace-nowrap">
            {formatEuro(summary.saldo)}
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded shadow">
          <div className="text-xs md:text-sm text-gray-500">
            Entrate (30gg)
          </div>
          <div className="text-base md:text-2xl font-semibold whitespace-nowrap">
            {formatEuro(summary.entrate30)}
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded shadow">
          <div className="text-xs md:text-sm text-gray-500">
            Uscite (30gg)
          </div>
          <div className="text-base md:text-2xl font-semibold whitespace-nowrap">
            {formatEuro(summary.uscite30)}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Andamento ultimi 12 mesi</h3>
        <MonthlyBarChart data={monthly} />
      </div>

      <div className="bg-white p-4 rounded shadow flex gap-6">
        <div>
          <h3 className="font-semibold mb-3">Suddivisione uscite</h3>
          <ExpensePieChart
            data={pieData.data}
            onLegendClick={() => {}}
            activeId={null}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Ultime transazioni</h3>
        <div className="divide-y">
          {latest.map((tx) => {
            const cat = resolveCategory(tx.category);
            return (
              <div key={tx._id} className="py-2 flex justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    {tx.date ? new Date(tx.date).toLocaleDateString() : "-"}
                  </div>
                  <div className="font-medium">{tx.description || "—"}</div>
                  <div className="text-xs text-gray-500">
                    {cat ? cat.name : "—"}
                  </div>
                </div>
                <div
                  className={`${
                    safeNumber(tx.amount) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  } font-semibold`}
                >
                  {formatEuro(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
