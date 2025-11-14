import React, { useState } from "react";
import AddTransactionForm from "../components/AddTransactionForm";

export default function AddTransactionPage() {
  const [done, setDone] = useState(false);
  return (
    <div className="max-w-md mx-auto py-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Nuova transazione</h2>
        <AddTransactionForm onDone={()=>setDone(true)} />
        {done && <div className="text-sm text-green-600 mt-3">Transazione salvata.</div>}
      </div>
    </div>
  );
}
