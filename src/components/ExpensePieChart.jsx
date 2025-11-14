import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTransactions } from "../context/TransactionsContext";

export default function ExpensePieChart({ data, onLegendClick, activeId }) {
  const COLORS = data.map(d => d.color || "#888");

  return (
    <div className="flex">
      <div style={{ width: 220, height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40}>
              {data.map((entry, idx) => <Cell key={entry._id} fill={entry.color || COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v)=>v.toFixed(2)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="ml-4">
        {data.map(d => (
          <div key={d._id} className="flex items-center gap-2 cursor-pointer" onClick={()=>onLegendClick?.(d._id)}>
            <div style={{ width: 16, height: 16, background: d.color, borderRadius: 4 }} />
            <div className="text-sm">
              <div className="font-medium">{d.name} <span className="text-xs text-gray-500">({d.percentage}%)</span></div>
              <div className="text-xs text-gray-500">{d.value.toFixed(2)} €</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
