// src/components/ExpensePieChart.jsx
import React, { useMemo } from "react";
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
  legendPosition = "side", // "side" = legenda a destra, "bottom" = sotto
}) {
  const handleToggle = (id) => {
    if (!onActiveChange || !id) return;
    if (activeId === id) onActiveChange(null);
    else onActiveChange(id);
  };

  // Costruiamo i dati per il grafico con un campo "id" sicuro
  const chartData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((item) => ({
        ...item,
        id: item._id || item.id, // fallback se arriva già "id"
      })),
    [data]
  );

  const getOpacityAndStroke = (entry) => {
    const isActive = activeId === entry.id;
    if (isActive) {
      return { opacity: 1, strokeWidth: 3 };
    }
    if (activeId) {
      return { opacity: 0.25, strokeWidth: 1 };
    }
    return { opacity: 0.9, strokeWidth: 1 };
  };

  const isSide = legendPosition === "side";

  if (!Array.isArray(chartData) || chartData.length === 0) {
    return <div className="text-sm text-gray-500">Nessun dato disponibile.</div>;
  }

  // BLOCCO GRAFICO (uguale per entrambe le varianti)
  const PieBlock = (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={2}
        >
          {chartData.map((entry) => {
            const { opacity, strokeWidth } = getOpacityAndStroke(entry);
            return (
              <Cell
                key={entry.id}
                fill={entry.color || "#AAAAAA"}
                stroke="#ffffff"
                strokeWidth={strokeWidth}
                fillOpacity={opacity}
                // 👇 QUI: click sulla fetta → stesso comportamento della legenda
                onClick={() => handleToggle(entry.id)}
              />
            );
          })}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );

  // BLOCCO LEGENDA
  const LegendBlock = (
    <div className="w-full space-y-1">
      {chartData.map((entry) => {
        const isActive = activeId === entry.id;
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => handleToggle(entry.id)}
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

  // DESKTOP: legenda a destra
  if (isSide) {
    return (
      <div className="flex flex-row gap-3 w-full">
        <div className="w-[45%] h-56 md:h-64">{PieBlock}</div>
        <div className="w-[55%]">{LegendBlock}</div>
      </div>
    );
  }

  // MOBILE: legenda sotto
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="w-full h-56 md:h-64">{PieBlock}</div>
      <div className="w-full">{LegendBlock}</div>
    </div>
  );
}
