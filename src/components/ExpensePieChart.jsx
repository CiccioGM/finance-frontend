// src/components/ExpensePieChart.jsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function formatEuro(v) {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return "€ 0,00";
  return `€ ${n.toFixed(2)}`;
}

export default function ExpensePieChart({
  data,
  activeId,
  onActiveChange,
  legendPosition = "side", // "side" = destra, "bottom" = sotto
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-gray-500">Nessun dato disponibile.</div>;
  }

  const handleToggle = (id) => {
    if (!onActiveChange || !id) return;
    if (activeId === id) onActiveChange(null);
    else onActiveChange(id);
  };

  const getOpacityAndStroke = (entry) => {
    const isActive = activeId === entry._id;
    if (isActive) {
      return { opacity: 1, strokeWidth: 3 };
    }
    if (activeId) {
      return { opacity: 0.25, strokeWidth: 1 };
    }
    return { opacity: 0.9, strokeWidth: 1 };
  };

  const PieBlock = (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={2}
        >
          {data.map((entry) => {
            const { opacity, strokeWidth } = getOpacityAndStroke(entry);
            return (
              <Cell
                key={entry._id}
                fill={entry.color || "#AAAAAA"}
                stroke="#ffffff"
                strokeWidth={strokeWidth}
                fillOpacity={opacity}
              />
            );
          })}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );

  const LegendBlock = (
    <div className="w-full space-y-1">
      {data.map((entry) => {
        const isActive = activeId === entry._id;
        return (
          <button
            key={entry._id}
            type="button"
            onClick={() => handleToggle(entry._id)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded text-left ${
              isActive ? "bg-gray-50" : ""
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{entry.icon || "💸"}</span>
              <span
                className={`text-sm truncate ${isActive ? "font-semibold" : ""}`}
              >
                {entry.name}
              </span>
            </div>
            <div className="flex flex-col items-end text-xs">
              <span className="text-red-900 font-semibold">
                {formatEuro(entry.value)}
              </span>
              <span className="text-gray-500">
                {typeof entry.percentage === "number"
                  ? `${entry.percentage.toFixed(1)}%`
                  : ""}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );

  // DESKTOP / SCELTA: legenda a destra
  if (legendPosition === "side") {
    return (
      <div className="flex flex-row gap-3 w-full">
        <div className="w-[45%] h-56 md:h-64">{PieBlock}</div>
        <div className="w-[55%]">{LegendBlock}</div>
      </div>
    );
  }

  // MOBILE / SCELTA: legenda sotto
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="w-full h-56 md:h-64">{PieBlock}</div>
      <div className="w-full">{LegendBlock}</div>
    </div>
  );
}
