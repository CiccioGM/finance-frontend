import { useEffect, useRef } from "react";
import AddTransactionForm from "./AddTransactionForm";
import { useTransactions } from "../context/TransactionsContext";

export default function AddTransactionModal({ initial = null, onSaved = null }) {
  const { modalOpen, setModalOpen, addTransaction, updateTransaction } = useTransactions();
  const refPanel = useRef();

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setModalOpen]);

  // click outside to close
  useEffect(() => {
    const onClick = (e) => {
      if (!modalOpen) return;
      if (refPanel.current && !refPanel.current.contains(e.target)) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [modalOpen, setModalOpen]);

  if (!modalOpen) return null;

  const handleAdd = async (payload) => {
    if (initial && initial._id) {
      await updateTransaction(initial._id, payload);
    } else {
      await addTransaction(payload);
    }
    if (onSaved) onSaved();
    setModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4">
      {/* backdrop semi-trasparente (vedi la dashboard sotto) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* panel in primo piano */}
      <div ref={refPanel} className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-4 z-50">
        <h3 className="text-lg font-semibold mb-2">{initial ? "Modifica transazione" : "Nuova transazione"}</h3>
        <AddTransactionForm
          initial={initial}
          onAdd={handleAdd}
          onCancel={() => setModalOpen(false)}
          submitLabel={initial ? "Salva" : "Aggiungi"}
        />
      </div>
    </div>
  );
}
