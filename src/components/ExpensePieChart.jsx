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
  legendPosition = "side", // "side" = destra (desktop), "bottom" = sotto (mobile)
}) {
  const handleToggle = (id) => {
    if (!onActiveChange || !id) return;
    if (activeId === id) onActiveChange(null);
    else onActiveChange(id);
  };

  // 🔥 COSTRUZIONE DATI PER RECHARTS — SEMPRE CON CAMPO ID
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      id: item._id, // Recharts userà *sempre* questo
    }));
  }, [data]);

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

  if (isSide) {
    // LEGENDA A DESTRA (desktop)
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
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                // 🔥 CLIC SU UNA FETTA FUNZIONA SEMPRE
                onClick={(slice) => {
                  const id = slice?.payload?.id;
                  if (id) handleToggle(id);
                }}
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
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGENDA A DESTRA */}
        <div className="w-[55%] space-y-1 min-w-0">
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
                  <span className="text-lg flex-shrink-0">
                    {entry.icon || "💸"}
                  </span>
                  <span
                    className={`text-xs md:text-sm truncate ${
                      isActive ? "font-semibold" : ""
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
                    {entry.percentage?.toFixed(1)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // LEGENDA IN BASSO (mobile)
  return (
    <div
      className="flex flex-col gap-3 items-center w-full"
      style={{ overflow: "hidden" }}
    >
      {/** GRAFICO */}
      <div className="w-full h-56 md:h-64">
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
              // 🔥 CLIC SU UNA FETTA FUNZIONA SEMPRE
              onClick={(slice) => {
                const id = slice?.payload?.id;
                if (id) handleToggle(id);
              }}
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
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/** LEGENDA */}
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
                <span className="text-lg flex-shrink-0">
                  {entry.icon || "💸"}
                </span>
                <span
                  className={`text-xs md:text-sm truncate ${
                    isActive ? "font-semibold" : ""
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
                  {entry.percentage?.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
