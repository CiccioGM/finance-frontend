// src/components/ExpensePieChart.jsx
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatEuro(v) {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return "€ 0,00";
  return `€ ${n.toFixed(2)}`;
}

export default function ExpensePieChart({ data, activeId, onActiveChange }) {
  const [hoverId, setHoverId] = useState(null);

  const handleToggle = (id) => {
    if (!onActiveChange) return;
    if (activeId === id) onActiveChange(null);
    else onActiveChange(id);
  };

  const getOpacityAndStroke = (entry) => {
    const isActive = activeId === entry._id;
    const isHover = hoverId === entry._id;

    if (isActive) {
      return { opacity: 1, strokeWidth: 3 };
    }
    if (isHover) {
      return { opacity: 1, strokeWidth: 2 };
    }
    if (activeId || hoverId) {
      return { opacity: 0.25, strokeWidth: 1 };
    }
    return { opacity: 0.9, strokeWidth: 1 };
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="w-full md:w-1/2 h-64">
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
              onClick={(_, index) => {
                const entry = data[index];
                if (entry) handleToggle(entry._id);
              }}
              onMouseLeave={() => setHoverId(null)}
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
                    onMouseEnter={() => setHoverId(entry._id)}
                    onMouseLeave={() => setHoverId(null)}
                  />
                );
              })}
            </Pie>
            <Tooltip
              formatter={(val, name, props) => {
                const value = Number(val || 0);
                const pct = props?.payload?.percentage;
                return [
                  `${formatEuro(value)}${typeof pct === "number" ? ` (${pct.toFixed(1)}%)` : ""}`,
                  props?.payload?.name || "",
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:flex-1 space-y-1">
        {data.map((entry) => {
          const isActive = activeId === entry._id;
          const isHover = hoverId === entry._id;
          const highlighted = isActive || isHover;

          return (
            <button
              key={entry._id}
              type="button"
              onClick={() => handleToggle(entry._id)}
              onMouseEnter={() => setHoverId(entry._id)}
              onMouseLeave={() => setHoverId(null)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded text-left ${
                highlighted ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{entry.icon || "💸"}</span>
                <span className={`text-sm ${highlighted ? "font-semibold" : ""}`}>
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
    </div>
  );
}
