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

function formatDateForPdf(iso) {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

// per nome file: data inizio GG-MM
function formatStartLabel(dateStr) {
  if (!dateStr) return "tutti";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "tutti";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}`;
}

// per nome file: data fine GG-MM-AA
function formatEndLabel(dateStr) {
  if (!dateStr) return "tutti";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "tutti";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(2);
  return `${day}-${month}-${year}`;
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

export default function Reports({ exportFormat = "pdf" }) {
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

  // filtro categoria: array di id selezionati, [] = tutte le categorie
  const [categoryFilter, setCategoryFilter] = useState([]);

  const filtered = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return transactions.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) return false;

      // filtro per date
      if (from && d < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }

      // filtro per categoria: se ci sono categorie selezionate, il catId deve essere in quell'elenco
      if (categoryFilter.length > 0) {
        const cat = resolveCategory(categories, t.category);
        const catId = cat?._id;
        if (!catId || !categoryFilter.includes(catId)) return false;
      }

      return true;
    });
  }, [transactions, fromDate, toDate, categoryFilter, categories]);

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

  const downloadCsv = (baseName) => {
    const rows = [];
    // intestazione (Categoria prima della descrizione)
    rows.push("Data;Tipo;Categoria;Descrizione;Importo");

    filtered.forEach((t) => {
      const cat = resolveCategory(categories, t.category);
      const catName = cat?.name || "";
      const isEntrata = safeNumber(t.amount) >= 0;
      const tipo = isEntrata ? "Entrata" : "Uscita";
      const row = [
        formatDisplayDate(t.date),
        tipo,
        (catName || "").replace(/;/g, ","),
        (t.description || "").replace(/;/g, ","),
        formatEuro(t.amount),
      ].join(";");
      rows.push(row);
    });

    const csvContent = rows.join("\r\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const ext =
      exportFormat === "excel" ? "_excel.csv" : "_csv.csv";

    link.setAttribute("download", `${baseName}${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    if (!filtered.length) {
      alert("Nessuna transazione nel periodo selezionato.");
      return;
    }

    const startLabel = formatStartLabel(fromDate);
    const endLabel = formatEndLabel(toDate);
    const baseName = `resoconto_${startLabel}_${endLabel}`;

    if (exportFormat === "pdf") {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightX = pageWidth - 14;

      // Titolo app
      doc.setFontSize(18);
      doc.text("Gestione Finanze", 14, 18);

      // Sottotitolo: Resoconto finanziario dal ... al ...
      const fromText = formatDateForPdf(fromDate);
      const toText = formatDateForPdf(toDate);
      let subtitle = "Resoconto finanziario";
      if (fromText || toText) {
        subtitle += " ";
        if (fromText) {
          subtitle += `dal ${fromText}`;
        }
        if (toText) {
          subtitle += fromText ? ` al ${toText}` : `fino al ${toText}`;
        }
      }

      // se ci sono categorie filtrate, aggiungo info
      if (categoryFilter.length > 0) {
        const selectedCats = categories.filter((c) =>
          categoryFilter.includes(c._id)
        );
        if (selectedCats.length === 1) {
          subtitle += ` – Categoria: ${selectedCats[0].name}`;
        } else if (selectedCats.length > 1) {
          const names = selectedCats.map((c) => c.name).join(", ");
          const short =
            names.length > 40 ? names.slice(0, 37) + "..." : names;
          subtitle += ` – Categorie: ${short}`;
        }
      }

      doc.setFontSize(12);
      doc.text(subtitle, 14, 26);

      // tabella con le transazioni (Data, Tipo, Categoria, Descrizione, Importo)
      const tableBody = filtered.map((t) => {
        const cat = resolveCategory(categories, t.category);
        const catName = cat?.name || "";
        const isEntrata = safeNumber(t.amount) >= 0;
        const tipo = isEntrata ? "Entrata" : "Uscita";
        return [
          formatDisplayDate(t.date),
          tipo,
          catName,
          t.description || "",
          formatEuro(t.amount),
        ];
      });

      autoTable(doc, {
        startY: 34,
        head: [["Data", "Tipo", "Categoria", "Descrizione", "Importo"]],
        body: tableBody,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [33, 150, 243] },
        columnStyles: {
          4: { halign: "right" }, // colonna Importo allineata a destra
        },
        didParseCell: (data) => {
          // colonna Importo (index 4): entrate verdi, uscite rosse
          if (data.section === "body" && data.column.index === 4) {
            const rawAmount = filtered[data.row.index]?.amount;
            const isEntrata = safeNumber(rawAmount) >= 0;
            data.cell.styles.textColor = isEntrata
              ? [34, 197, 94] // verde
              : [220, 38, 38]; // rosso
          }
        },
      });

      // Resoconto (Entrate / Uscite / Saldo) SOTTO la tabella, a destra
      const lastY =
        (doc.lastAutoTable && doc.lastAutoTable.finalY) || 34;
      let y = lastY + 8;

      doc.setFontSize(11);

      // Entrate in verde
      doc.setTextColor(34, 197, 94);
      doc.text(
        `Entrate: ${formatEuro(summary.entrate)}`,
        rightX,
        y,
        { align: "right" }
      );
      y += 6;

      // Uscite in rosso
      doc.setTextColor(220, 38, 38);
      doc.text(
        `Uscite: ${formatEuro(summary.uscite)}`,
        rightX,
        y,
        { align: "right" }
      );
      y += 6;

      // Saldo in nero
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Saldo: ${formatEuro(summary.saldo)}`,
        rightX,
        y,
        { align: "right" }
      );

      doc.save(`${baseName}.pdf`);
    } else {
      // CSV o Excel (CSV apribile con Excel)
      downloadCsv(baseName);
    }
  };

  const exportLabel =
    exportFormat === "pdf"
      ? "PDF"
      : exportFormat === "csv"
      ? "CSV"
      : "Excel";

  // toggle singola categoria (checkbox)
  const toggleCategory = (id) => {
    setCategoryFilter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-lg font-semibold">Resoconti</h2>

        {/* Filtri data + categoria */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
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

          {/* Filtro categoria a checkbox (funziona su PC e smartphone) */}
          <div>
            <label className="block text-sm mb-1">Categoria</label>
            <div className="border rounded px-2 py-2 bg-white max-h-40 overflow-y-auto space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                <span>
                  {categoryFilter.length === 0
                    ? "Tutte le categorie"
                    : `${categoryFilter.length} categoria/e selezionate`}
                </span>
                {categoryFilter.length > 0 && (
                  <button
                    type="button"
                    className="text-blue-600 underline"
                    onClick={() => setCategoryFilter([])}
                  >
                    Seleziona tutte
                  </button>
                )}
              </div>
              {categories.map((c) => (
                <label
                  key={c._id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={categoryFilter.includes(c._id)}
                    onChange={() => toggleCategory(c._id)}
                  />
                  <span>
                    {c.icon ? `${c.icon} ${c.name}` : c.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="px-3 py-2 border rounded text-sm"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setCategoryFilter([]);
              }}
            >
              Annulla filtro
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
              onClick={handleDownload}
            >
              Scarica ({exportLabel})
            </button>
          </div>
        </div>

        {/* Riepilogo a schermo */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500">Entrate</div>
            <div className="text-sm md:text-lg font-semibold text-green-600">
              {formatEuro(summary.entrate)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500">Uscite</div>
            <div className="text-sm md:text-lg font-semibold text-red-600">
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

      {/* Elenco transazioni filtrate a schermo */}
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
                  <th className="text-left py-2 pr-2">Tipo</th>
                  <th className="text-left py-2 pr-2">Categoria</th>
                  <th className="text-left py-2 pr-2">Descrizione</th>
                  <th className="text-right py-2 pl-2">Importo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const cat = resolveCategory(categories, t.category);
                  const isEntrata = safeNumber(t.amount) >= 0;
                  const tipo = isEntrata ? "Entrata" : "Uscita";
                  return (
                    <tr key={t._id} className="border-b last:border-0">
                      <td className="py-1 pr-2">
                        {formatDisplayDate(t.date)}
                      </td>
                      <td
                        className={`py-1 pr-2 ${
                          isEntrata ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tipo}
                      </td>
                      <td className="py-1 pr-2">
                        {cat
                          ? `${cat.icon ? `${cat.icon} ` : ""}${cat.name}`
                          : ""}
                      </td>
                      <td className="py-1 pr-2">
                        {t.description || ""}
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
