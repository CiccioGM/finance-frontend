// src/pages/Settings.jsx
import React from "react";

export default function Settings({
  pieLegendPosition,
  setPieLegendPosition,
}) {
  const handleChange = (e) => {
    const val = e.target.value === "bottom" ? "bottom" : "side";
    setPieLegendPosition(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pieLegendPosition", val);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Impostazioni</h2>

        <div className="mb-4">
          <h3 className="font-medium mb-2">
            Posizione legenda grafico a torta
          </h3>
          <div className="space-y-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pieLegendPosition"
                value="side"
                checked={pieLegendPosition === "side"}
                onChange={handleChange}
              />
              <span>Al lato</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pieLegendPosition"
                value="bottom"
                checked={pieLegendPosition === "bottom"}
                onChange={handleChange}
              />
              <span>In basso</span>
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          La posizione scelta verrà applicata al grafico a torta nella
          Dashboard.
        </p>
      </div>
    </div>
  );
}
