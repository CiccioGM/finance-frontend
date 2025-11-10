import AddTransactionForm from "../components/AddTransactionForm";
import { useTransactions } from "../context/TransactionsContext";
import { useNavigate } from "react-router-dom";

export default function AddTransactionPage() {
  const { addTransaction } = useTransactions();
  const nav = useNavigate();

  const handleAdd = async (payload) => {
    await addTransaction(payload);
    nav("/"); // torna alla dashboard
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-3">Aggiungi Transazione</h2>
      <AddTransactionForm onAdd={handleAdd} />
    </div>
  );
}
