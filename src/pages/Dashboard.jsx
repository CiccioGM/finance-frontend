// src/pages/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useCategories } from "../context/CategoriesContext";
import MonthlyBarChart from "../components/MonthlyBarChart";
import ExpensePieChart from "../components/ExpensePieChart";
import TransactionList from "../components/TransactionList";

function safeNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function formatEuro(v) {
  const n = safeNumber(v);
  return `€ ${n.toFixed(2)}`;
}

function formatMonthLabel(dateObj) {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const yy = String(year).slice(2);
  const mm = String(month).padStart(2, "0");
  return `${mm}/${yy}`;
}

function resolveCategory(categories, catField) {
  if (!catField) return null;
  if (typeof catField === "object") {
    if (catField._id || catField.name) return catField;
    if (catField.$oid) {
      return categories.find((c) => c._id === catField.$oid) || null;
    }
    return null;
  }
  if (typeof catField === "string") {
    return categories.find((c) => c._id === catField) || null;
  }
  return null;
}

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    if (!activeCategoryId) return transactions;
    return transactions.filter((t) => {
      const cat = resolveCategory(categories, t.category);
      return cat && cat._id === activeCategoryId;
    });
  }, [transactions, categories, activeCategoryId]);

  const summary = useMemo(() => {
    if (!Array.isArray(filteredTransactions)) {
      return { saldo: 0, entrate30: 0, uscite30: 0 };
    }
    const now = new Date();
    const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let saldo = 0;
    let entrate30 = 0;
    let uscite30 = 0;

    for (const t of filteredTransactions) {
      const amount = safeNumber(t.amount);
      saldo += amount;

      if (t.date) {
        const d = new Date(t.date);
        if (d >= days30Ago && d <= now) {
          if (amount >= 0) entrate30 += amount;
          else uscite30 += Math.abs(amount);
        }
      }
    }

    return { saldo, entrate30, uscite30 };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    if (!Array.isArray(filteredTransactions)) return [];

    const now = new Date();
    const buckets = [];
    const indexMap = new Map();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = formatMonthLabel(d);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      indexMap.set(key, buckets.length);
      buckets.push({
        key,
        label,
        entrate: 0,
        uscite: 0,
      });
    }

    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    for (const t of filteredTransactions) {
      if (!t.date) continue;
      const d = new Date(t.date);
      if (d < startDate || d > now) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = indexMap.get(key);
      if (idx == null) continue;

      const amount = safeNumber(t.amount);
      if (amount >= 0) buckets[idx].entrate += amount;
      else buckets[idx].uscite += Math.abs(amount);
    }

    return buckets.map((b) => ({
      label: b.label,
      entrate: b.entrate,
      uscite: b.uscite,
    }));
  }, [filteredTransactions]);

  const pieData = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    const now = new Date();
    const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const expenses = transactions.filter((t) => {
      const amount = safeNumber(t.amount);
      if (amount >= 0) return false;
      if (!t.date) return true;
      const d = new Date(t.date);
      return d >= days30Ago && d <= now;
    });

    if (expenses.length === 0) return [];

    const groups = new Map();
    let totalAbs = 0;

    for (const t of expenses) {
      const amountAbs = Math.abs(safeNumber(t.amount));
      const cat = resolveCategory(categories, t.category);
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

    const arr = Array.from(groups.values()).map((g) => ({
      ...g,
      percentage:
        totalAbs > 0 ? Number(((g.value / totalAbs) * 100).toFixed(1)) : 0,
    }));

    return arr;
  }, [transactions, categories]);

  const latest = useMemo(() => {
    if (!Array.isArray(filteredTransactions)) return [];
    return [...filteredTransactions]
      .sort((a, b) => {
        const da = a.date || a.createdAt;
        const db = b.date || b.createdAt;
        return new Date(db) - new Date(da);
      })
      .slice(0, 5);
  }, [filteredTransactions]);

  const activeCategoryName = useMemo(() => {
    if (!activeCategoryId) return null;
    const c = categories.find((cat) => cat._id === activeCategoryId);
    return c?.name || null;
  }, [activeCategoryId, categories]);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
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
        <MonthlyBarChart data={monthlyData} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Suddivisione uscite (ultimi 30gg)</h3>
          {activeCategoryName && (
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() => setActiveCategoryId(null)}
            >
              Filtro: {activeCategoryName} (rimuovi)
            </button>
          )}
        </div>
        <ExpensePieChart
          data={pieData}
          activeId={activeCategoryId}
          onActiveChange={setActiveCategoryId}
        />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">
          Ultime transazioni
          {activeCategoryName ? ` – solo ${activeCategoryName}` : ""}
        </h3>
        <TransactionList items={latest} />
      </div>
    </div>
  );
}
