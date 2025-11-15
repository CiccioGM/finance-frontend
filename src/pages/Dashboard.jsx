// src/pages/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../context/TransactionsContext";
import { useCategories } from "../context/CategoriesContext";
import { useBudgets } from "../context/BudgetsContext";
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

export default function Dashboard({ pieLegendPosition = "side" }) {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budgets } = useBudgets();
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

  const currentMonthSummary = useMemo(() => {
    if (!Array.isArray(transactions)) return {};
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const map = {};
    for (const t of transactions) {
      if (!t.date) continue;
      const d = new Date(t.date);
      if (d < start || d > end) continue;
      const amount = safeNumber(t.amount);
      if (amount >= 0) continue;

      const catId =
        typeof t.category === "object"
          ? t.category._id || t.category.$oid
          : t.category;
      if (!catId) continue;

      map[catId] = (map[catId] || 0) + Math.abs(amount);
    }
    return map;
  }, [transactions]);

  const budgetsWithInfo = useMemo(() => {
    return (budgets || []).map((b) => {
      const catId =
        typeof b.category === "object"
          ? b.category._id || b.category.$oid
          : b.category;
      const cat = categories.find((c) => c._id === catId);
      const spent = currentMonthSummary[catId] || 0;
      const ratio =
        b.limit > 0 ? Math.min(1, spent / b.limit) : 0;
      const ratioPct =
        b.limit > 0 ? ((spent / b.limit) * 100).toFixed(0) : "0";
      return {
        ...b,
        categoryId: catId,
        categoryName: cat?.name || "Categoria sconosciuta",
        spent,
        ratio,
        ratioPct,
      };
    });
  }, [budgets, categories, currentMonthSummary]);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* SALDO / ENTRATE / USCITE */}
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

      {/* GRAFICO BARRE */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Andamento ultimi 12 mesi</h3>
        <MonthlyBarChart data={monthlyData} />
      </div>

      {/* GRAFICO A TORTA */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">
          Suddivisione uscite (ultimi 30gg)
        </h3>
        <ExpensePieChart
          data={pieData}
          activeId={activeCategoryId}
          onActiveChange={setActiveCategoryId}
          legendPosition={pieLegendPosition}
        />
      </div>

      {/* ULTIME TRANSAZIONI + VEDI TUTTE */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Ultime transazioni</h3>
          <Link
            to="/transactions"
            className="text-xs text-blue-600 underline"
          >
            Vedi tutte
          </Link>
        </div>
        <TransactionList transactions={latest} />
      </div>

      {/* RIEPILOGO BUDGET */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Riepilogo Budget</h3>
          <Link to="/budget" className="text-xs text-blue-600 underline">
            Modifica Budget
          </Link>
        </div>
        {budgetsWithInfo.length === 0 ? (
          <div className="text-sm text-gray-500">
            Nessun budget impostato. Puoi aggiungerli dalla pagina Budget.
          </div>
        ) : (
          <div className="space-y-2">
            {budgetsWithInfo.map((b) => (
              <div key={b._id} className="border rounded px-3 py-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{b.categoryName}</span>
                  <span>
                    {formatEuro(b.spent)} / {formatEuro(b.limit)} (
                    {b.ratioPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded ${
                      b.ratio < 0.8
                        ? "bg-green-500"
                        : b.ratio < 1
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${b.ratio * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
