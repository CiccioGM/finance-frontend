// src/pages/Settings.jsx
import React from "react";

export default function Settings({
  pieLegendPosition,
  setPieLegendPosition,
  exportFormat,
  setExportFormat,
}) {
  const handleLegendChange = (e) => {
    const val = e.target.value === "bottom" ? "bottom" : "side";
    setPieLegendPosition(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pieLegendPosition", val);
    }
  };

  const handleFormatChange = (e) => {
    const val = e.target.value;
    const allowed = ["pdf", "csv", "excel"];
    const finalVal = allowed.includes(val) ? val : "pdf";
    setExportFormat(finalVal);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("reportsExportFormat", finalVal);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Impostazioni</h2>

        {/* Posizione legenda grafico a torta */}
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
                onChange={handleLegendChange}
              />
              <span>Al lato</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pieLegendPosition"
                value="bottom"
                checked={pieLegendPosition === "bottom"}
                onChange={handleLegendChange}
              />
              <span>In basso</span>
            </label>
          </div>
        </div>

        {/* Formato esportazione resoconti */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">
            Formato esportazione resoconti
          </h3>
          <div className="space-y-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="pdf"
                checked={exportFormat === "pdf"}
                onChange={handleFormatChange}
              />
              <span>PDF</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="csv"
                checked={exportFormat === "csv"}
                onChange={handleFormatChange}
              />
              <span>CSV</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="exportFormat"
                value="excel"
                checked={exportFormat === "excel"}
                onChange={handleFormatChange}
              />
              <span>Excel (CSV apribile con Excel)</span>
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Le impostazioni vengono salvate sul dispositivo e applicate alla
          Dashboard e alla pagina Resoconti.
        </p>
      </div>
    </div>
  );
}
