import { categories } from "../utils/categories";

export default function TransactionList({ transactions }) {
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
            <div className="text-right">
              <div className={`font-bold ${isIncome ? "text-green-600" : "text-red-500"}`}>
                {Number(t.amount).toFixed(2)}€
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
