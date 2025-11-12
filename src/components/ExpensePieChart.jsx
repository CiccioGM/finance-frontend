import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  // Aggrega per categoria e calcola totale
  const { data, total } = useMemo(() => {
    const map = {};
    let tot = 0;
    expenses.forEach((t) => {
      const cat = t.category || "Altro";
      const val = Math.abs(Number(t.amount) || 0);
      map[cat] = (map[cat] || 0) + val;
      tot += val;
    });
    const arr = Object.entries(map).map(([name, value]) => ({
      name,
      value,
      percent: tot > 0 ? (value / tot) * 100 : 0,
    }));
    arr.sort((a, b) => b.value - a.value);
    return { data: arr, total: tot };
  }, [expenses]);

  // stato per evidenziare la fetta selezionata (clic legenda / hover)
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const handleLegendClick = (i) => {
    setActiveIndex((curr) => (curr === i ? null : i));
  };

  const handleSliceEnter = (_, index) => {
    setHoverIndex(index);
  };
  const handleSliceLeave = () => setHoverIndex(null);

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h2 className="text-lg font-semibold mb-3">🧾 Suddivisione uscite per categoria</h2>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Chart: prende spazio flessibile */}
        <div className="w-full md:w-2/3" style={{ minHeight: 260 }}>
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
                onMouseEnter={handleSliceEnter}
                onMouseLeave={handleSliceLeave}
                isAnimationActive={false}
              >
                {data.map((entry, i) => {
                  const isActive = activeIndex === i;
                  const isHover = hoverIndex === i;
                  return (
                    <Cell
                      key={entry.name}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={activeIndex === null ? (isHover ? 1 : 0.95) : isActive ? 1 : 0.35}
                      stroke={isActive || isHover ? "#222" : "transparent"}
                      strokeWidth={isActive || isHover ? 2 : 0}
                    />
                  );
                })}
              </Pie>
              <Tooltip formatter={(v) => `${v.toFixed(2)}€`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda: lato destro su md+, sotto su mobile */}
        <div className="w-full md:w-1/3">
          <div className="flex flex-col gap-2">
            {data.map((entry, i) => {
              const color = COLORS[i % COLORS.length];
              const isActive = activeIndex === i;
              const isHover = hoverIndex === i;
              return (
                <button
                  key={entry.name}
                  onClick={() => handleLegendClick(i)}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className={`flex items-center justify-between gap-3 p-2 rounded ${isActive ? "bg-gray-50" : "hover:bg-gray-50"}`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded-sm shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-gray-700">{entry.name}</span>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: "#b91c1c" /* rosso per valore */ }}>
                      {entry.value.toFixed(2)}€
                    </div>
                    <div className="text-xs text-gray-500">{entry.percent.toFixed(1)}%</div>
                  </div>
                </button>
              );
            })}

            {/* Totale */}
            <div className="mt-2 pt-2 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700 font-semibold">Totale uscite</div>
              <div className="text-sm font-semibold text-red-600">{total.toFixed(2)}€</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
