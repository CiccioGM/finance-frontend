import { categories } from "../utils/categories.js";

export default function TransactionList({ transactions }) {
  if (!transactions.length)
    return <p className="text-center text-gray-500">Nessuna transazione</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">
      {transactions.map((t) => {
        const cat = categories.find((c) => c.name === t.category) || {};
        return (
          <div key={t._id} className="flex justify-between border-b py-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{cat.icon || "💸"}</span>
              <div>
                <p className="font-semibold">{t.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString()} — {t.category}
                </p>
              </div>
            </div>
            <p
              className={`font-bold ${
                t.amount < 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {t.amount.toFixed(2)}€
            </p>
          </div>
        );
      })}
    </div>
  );
}
