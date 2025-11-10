import { categories } from "../utils/categories";
import { useTransactions } from "../context/TransactionsContext";

export default function TransactionList({ transactions, onEdit, onDelete }) {
  const { setSearchQuery } = useTransactions();

  if (!transactions.length) return <p className="text-center text-gray-500">Nessuna transazione</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">
      {transactions.map((t) => {
        const cat = categories.find((c) => c.name === t.category) || {};
        const isIncome = Number(t.amount) > 0;
        return (
          <div key={t._id || `${t.date}-${t.description}-${t.amount}`} className="flex justify-between border-b py-3 items-center">
            <div className="flex items-center gap-3">
              <div className="text-xl">{cat.icon || "💸"}</div>
              <div>
                <p className="font-semibold">{t.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString()} • {isIncome ? "Entrata" : "Uscita"} • {t.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`font-bold ${isIncome ? "text-green-600" : "text-red-500"} mr-2`}>
                {Number(t.amount).toFixed(2)}€
              </div>
              {onEdit && <button onClick={() => onEdit(t)} className="text-sm text-blue-600 hover:underline">Modifica</button>}
              {onDelete && <button onClick={() => onDelete(t._id)} className="text-sm text-red-600 hover:underline ml-2">Elimina</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
