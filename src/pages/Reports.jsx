// src/pages/Reports.jsx
import React, { useMemo, useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useCategories } from "../context/CategoriesContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function safeNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function formatEuro(v) {
  const n = safeNumber(v);
  const sign = n < 0 ? "-" : "";
  return `${sign}€ ${Math.abs(n).toFixed(2)}`;
}

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT");
}

function resolveCategory(categories, catField) {
  if (!catField) return null;
  if (typeof catField === "object") {
    if (catField._id || catField.name) return catField;
    if (catField.$oid) {
      return categories.find((c) => c._id === catField.$oid) || null;
    }
    return null;
  }
  if (typeof catField === "string") {
    return categories.find((c) => c._id === catField) || null;
  }
  return null;
}

export default function Reports() {
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  // default: ultimi 30 giorni
  const now = new Date();
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  const [fromDate, setFromDate] = useState(
    toInputDate(thirtyDaysAgo.toISOString())
  );
  const [toDate, setToDate] = useState(toInputDate(now.toISOString()));

  const filtered = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return transactions.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) return false;

      if (from && d < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [transactions, fromDate, toDate]);

  const summary = useMemo(() => {
    let entrate = 0;
    let uscite = 0;
    for (const t of filtered) {
      const amount = safeNumber(t.amount);
      if (amount >= 0) entrate += amount;
      else uscite += Math.abs(amount);
    }
    return {
      entrate,
      uscite,
      saldo: entrate - uscite,
    };
  }, [filtered]);

  const handleDownloadPdf = () => {
    if (!filtered.length) {
      alert("Nessuna transazione nel periodo selezionato.");
      return;
    }

    const doc = new jsPDF();

    const title = "Resoconto finanziario";
    doc.setFontSize(16);
    doc.text(title, 14, 18);

    let periodText = "Periodo: ";
    if (fromDate) periodText += `dal ${fromDate}`;
    if (toDate) periodText += fromDate ? ` al ${toDate}` : `fino al ${toDate}`;
    if (!fromDate && !toDate) periodText += "tutti i dati";

    doc.setFontSize(11);
    doc.text(periodText, 14, 26);

    doc.text(
      `Entrate: ${formatEuro(summary.entrate)}`,
      14,
      36
    );
    doc.text(
      `Uscite: ${formatEuro(summary.uscite)}`,
      14,
      42
    );
    doc.text(
      `Saldo: ${formatEuro(summary.saldo)}`,
      14,
      48
    );

    const tableBody = filtered.map((t) => {
      const cat = resolveCategory(categories, t.category);
      return [
        formatDisplayDate(t.date),
        t.description || "",
        cat ? `${cat.icon || ""} ${cat.name}` : "",
        formatEuro(t.amount),
      ];
    });

    autoTable(doc, {
      startY: 56,
      head: [["Data", "Descrizione", "Categoria", "Importo"]],
      body: tableBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [33, 150, 243] },
    });

    doc.save("resoconto.pdf");
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-lg font-semibold">Resoconti</h2>

        {/* Filtri data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Dal</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Al</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 px-3 py-2 border rounded text-sm"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Annulla filtro
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm"
              onClick={handleDownloadPdf}
            >
              Scarica PDF
            </button>
          </div>
        </div>

        {/* Riepilogo */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500">Entrate</div>
            <div className="text-sm md:text-lg font-semibold">
              {formatEuro(summary.entrate)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500">Uscite</div>
            <div className="text-sm md:text-lg font-semibold">
              {formatEuro(-summary.uscite)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500">Saldo</div>
            <div className="text-sm md:text-lg font-semibold">
              {formatEuro(summary.saldo)}
            </div>
          </div>
        </div>
      </div>

      {/* Elenco transazioni filtrate */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">
          Transazioni nel periodo ({filtered.length})
        </h3>
        {filtered.length === 0 ? (
          <div className="text-sm text-gray-500">
            Nessuna transazione nel periodo selezionato.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-2">Data</th>
                  <th className="text-left py-2 pr-2">Descrizione</th>
                  <th className="text-left py-2 pr-2">Categoria</th>
                  <th className="text-right py-2 pl-2">Importo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const cat = resolveCategory(categories, t.category);
                  const isEntrata = safeNumber(t.amount) >= 0;
                  return (
                    <tr key={t._id} className="border-b last:border-0">
                      <td className="py-1 pr-2">
                        {formatDisplayDate(t.date)}
                      </td>
                      <td className="py-1 pr-2">{t.description || ""}</td>
                      <td className="py-1 pr-2">
                        {cat ? `${cat.icon || ""} ${cat.name}` : ""}
                      </td>
                      <td
                        className={`py-1 pl-2 text-right ${
                          isEntrata ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatEuro(t.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
