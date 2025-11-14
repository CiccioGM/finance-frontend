import React, { useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import AddTransactionModal from "./AddTransactionModal";

export default function TransactionList({ items }) {
  const { deleteTransaction } = useTransactions();
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <ul className="divide-y">
        {items.map(tx => (
          <li key={tx._id} className="py-3 flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">{(new Date(tx.date)).toLocaleDateString()}</div>
              <div className="font-medium">{tx.description}</div>
              <div className="text-xs text-gray-500">{tx.category? (tx.category.name) : "—"}</div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <div className={`${tx.amount >= 0 ? "text-green-600" : "text-red-600"} font-semibold`}>{(tx.amount).toFixed(2)} €</div>
              <div className="flex gap-2">
                <button onClick={()=>setEditing(tx)} className="text-sm text-blue-600">Modifica</button>
                <button onClick={()=>{ if(confirm("Elimina?")) deleteTransaction(tx._id); }} className="text-sm text-red-600">Elimina</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AddTransactionModal open={!!editing} initial={editing} onClose={()=>setEditing(null)} />
    </div>
  );
}
