import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function monthLabel(date) {
  return date.toLocaleString(undefined, { month: "short" });
}

export default function MonthlyBarChart({ transactions }) {
  // genera gli ultimi 12 mesi (ordine cronologico: da sinistra il più vecchio)
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, date: d, income: 0, expense: 0 });
  }

  // aggrega transazioni per mese
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mm) => mm.key === key);
    if (m) {
      const amt = Number(t.amount) || 0;
      if (amt > 0) m.income += amt;
      else m.expense += Math.abs(amt);
    }
  });

  const data = months.map((m) => ({
    name: monthLabel(m.date),
    income: Number(m.income.toFixed(2)),
    expense: Number(m.expense.toFixed(2)),
  }));

  // responsive barSize: più grande su schermi piccoli
  const [barSize, setBarSize] = useState(18);

  useEffect(() => {
    function computeSize() {
      const w = window.innerWidth;
      // thresholds (puoi regolare i numeri)
      if (w < 420) {
        setBarSize(30); // smartphone piccolo -> barre più spesse
      } else if (w < 640) {
        setBarSize(26); // smartphone/tablet
      } else if (w < 1024) {
        setBarSize(20); // tablet / small desktop
      } else {
        setBarSize(14); // desktop
      }
    }
    computeSize();
    window.addEventListener("resize", computeSize);
    return () => window.removeEventListener("resize", computeSize);
  }, []);

  // barGap = 0 => le due barre dello stesso mese si toccano
  const barGap = 0;
  // spazio tra gruppi (mesi) = metà di una barra
  const barCategoryGap = Math.max(6, Math.round(barSize / 2));

  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">📈 Entrate vs Uscite (ultimi 12 mesi)</h2>

      {!hasData ? (
        <p className="text-sm text-gray-500">Nessun dato disponibile per gli ultimi 12 mesi.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 6 }}
            barGap={barGap}
            barCategoryGap={barCategoryGap}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)}€`} />
            <Legend verticalAlign="top" align="right" />
            {/* Specificare barSize garantisce larghezza coerente */}
            <Bar dataKey="income" name="Entrate" fill="#00C49F" barSize={barSize} />
            <Bar dataKey="expense" name="Uscite" fill="#FF8042" barSize={barSize} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
