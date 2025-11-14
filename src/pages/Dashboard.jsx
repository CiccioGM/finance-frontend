import React, { useEffect, useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useCategories } from "../context/CategoriesContext";
import MonthlyBarChart from "../components/MonthlyBarChart";
import ExpensePieChart from "../components/ExpensePieChart";
const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const { transactions, loading } = useTransactions();
  const { categories } = useCategories();
  const [summary, setSummary] = useState({ saldo:0, entrate30:0, uscite30:0 });
  const [monthly, setMonthly] = useState([]);
  const [pie, setPie] = useState({ total:0, data:[] });
  const [filterCategory, setFilterCategory] = useState(null);

  useEffect(()=>{ fetch(`${API}/api/dashboard/summary`).then(r=>r.json()).then(setSummary); fetch(`${API}/api/dashboard/monthly`).then(r=>r.json()).then(d=> {
    setMonthly(d.map(m => ({ label: `${String(m.month).padStart(2,"0")}/${String(m.year).slice(2)}`, entrate: +m.entrate, uscite: +m.uscite })));
  }); fetch(`${API}/api/dashboard/pie-expenses`).then(r=>r.json()).then(setPie); }, []);

  const latest = transactions.slice(0,5);
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Saldo</div>
          <div className="text-2xl font-semibold">{summary.saldo?.toFixed(2)} €</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Entrate (30gg)</div>
          <div className="text-2xl font-semibold">{summary.entrate30?.toFixed(2)} €</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Uscite (30gg)</div>
          <div className="text-2xl font-semibold">{summary.uscite30?.toFixed(2)} €</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Andamento ultimi 12 mesi</h3>
        <MonthlyBarChart data={monthly} />
      </div>

      <div className="bg-white p-4 rounded shadow flex gap-6">
        <div>
          <h3 className="font-semibold mb-3">Suddivisione uscite</h3>
          <ExpensePieChart data={pie.data} onLegendClick={(id)=> setFilterCategory(filterCategory === id ? null : id)} activeId={filterCategory} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Ultime transazioni</h3>
        <div className="divide-y">
          {latest.map(tx => (
            <div key={tx._id} className="py-2 flex justify-between">
              <div>
                <div className="text-sm text-gray-500">{(new Date(tx.date)).toLocaleDateString()}</div>
                <div className="font-medium">{tx.description}</div>
                <div className="text-xs text-gray-500">{tx.category?.name}</div>
              </div>
              <div className={`${tx.amount >= 0 ? "text-green-600" : "text-red-600"} font-semibold`}>{tx.amount.toFixed(2)} €</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
