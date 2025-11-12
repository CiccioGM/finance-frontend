import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Tavolozza colori coerente ma variata
const COLORS = [
  "#FF8042",
  "#FFBB28",
  "#00C49F",
  "#0088FE",
  "#FF6666",
  "#AA66CC",
  "#33B5E5",
  "#FF4444",
  "#0099CC",
  "#669900",
  "#9933CC",
  "#FF8800",
];

export default function ExpensePieChart({ transactions }) {
  // Filtra solo uscite (< 0)
  const expenses = transactions.filter((t) => Number(t.amount) < 0);

  if (!expenses.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow mb-4 text-center text-gray-500">
        Nessuna uscita registrata.
      </div>
    );
  }

  // Aggrega per categoria
  const map = {};
  expenses.forEach((t) => {
    const cat = t.category || "Altro";
    const val = Math.abs(Number(t.amount) || 0);
    map[cat] = (map[cat] || 0) + val;
  });

  const data = Object.entries(map).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">🧾 Suddivisione uscite per categoria</h2>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            innerRadius="40%"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v.toFixed(2)}€`} />
        </PieChart>
      </ResponsiveContainer>

      {/* 🔹 LEGGENDA sotto al grafico */}
      <div className="flex flex-wrap justify-center gap-3 mt-3 text-sm">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            ></span>
            <span className="text-gray-700">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
