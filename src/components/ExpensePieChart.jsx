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
  legendPosition = "side", // "side" (destra) | "bottom"
}) {
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

  const isSide = legendPosition === "side";

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-gray-500">Nessun dato disponibile.</div>;
  }

  if (isSide) {
    // Grafico a sinistra, legenda a destra
    return (
      <div
        className="flex flex-row gap-3 items-start w-full"
        style={{ overflow: "hidden" }}
      >
        {/* GRAFICO A SINISTRA */}
        <div className="w-[45%] h-56 md:h-64 flex-shrink-0">
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
                  if (entry && entry._id) {
                    handleToggle(entry._id);
                  }
                }}
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
        </div>

        {/* LEGENDA A DESTRA */}
        <div className="w-[55%] space-y-1 min-w-0">
          {data.map((entry) => {
            const isActive = activeId === entry._id;
            const highlighted = isActive;

            return (
              <button
                key={entry._id}
                type="button"
                onClick={() => handleToggle(entry._id)}
                className={`w-full flex items-center justify-between px-2 py-1 rounded text-left ${
                  highlighted ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">
                    {entry.icon || "💸"}
                  </span>
                  <span
                    className={`text-xs md:text-sm truncate ${
                      highlighted ? "font-semibold" : ""
                    }`}
                  >
                    {entry.name}
                  </span>
                </div>
                <div className="flex flex-col items-end text-[10px] md:text-xs flex-shrink-0">
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

  // LEGENDA IN BASSO
  return (
    <div
      className="flex flex-col gap-3 items-center w-full"
      style={{ overflow: "hidden" }}
    >
      <div className="w-full h-56 md:h-64">
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
                if (entry && entry._id) {
                  handleToggle(entry._id);
                }
              }}
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
      </div>

      <div className="w-full space-y-1">
        {data.map((entry) => {
          const isActive = activeId === entry._id;
          const highlighted = isActive;

          return (
            <button
              key={entry._id}
              type="button"
              onClick={() => handleToggle(entry._id)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded text-left ${
                highlighted ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">
                  {entry.icon || "💸"}
                </span>
                <span
                  className={`text-xs md:text-sm truncate ${
                    highlighted ? "font-semibold" : ""
                  }`}
                >
                  {entry.name}
                </span>
              </div>
              <div className="flex flex-col items-end text-[10px] md:text-xs flex-shrink-0">
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
