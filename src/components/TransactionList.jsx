import { categories } from "../utils/categories";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) return <p className="text-center text-gray-500">Nessuna transazione</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">
      {transactions.map((t) => (
        <TransactionRow key={t._id || `${t.date}-${t.description}-${t.amount}`} t={t} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function TransactionRow({ t, onEdit, onDelete }) {
  const cat = categories.find((c) => c.name === t.category) || {};
  const isIncome = Number(t.amount) > 0;

  // menu state per riga
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div className="flex justify-between border-b py-3 items-center">
      <div className="flex items-center gap-3">
        <div className="text-xl">{cat.icon || "💸"}</div>
        <div>
          <p className="font-semibold">{t.description}</p>
          <p className="text-sm text-gray-500">
            {new Date(t.date).toLocaleDateString()} • {isIncome ? "Entrata" : "Uscita"} • {t.category}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 relative" ref={ref}>
        <div className={`font-bold ${isIncome ? "text-green-600" : "text-red-500"} mr-2`}>{Number(t.amount).toFixed(2)}€</div>

        {/* menu button (più compatto e touch-friendly) */}
        <button onClick={() => setOpen((s) => !s)} className="p-2 rounded hover:bg-gray-100" aria-label="Azioni">
          <MoreVertical size={18} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow z-30">
            <button
              onClick={() => {
                setOpen(false);
                onEdit && onEdit(t);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit size={16} /> Modifica
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete && onDelete(t._id);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <Trash2 size={16} /> Elimina
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
