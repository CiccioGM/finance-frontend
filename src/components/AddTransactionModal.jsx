import { useEffect, useRef } from "react";
import AddTransactionForm from "./AddTransactionForm";
import { useTransactions } from "../context/TransactionsContext";

export default function AddTransactionModal({ initial = null, onSaved = null }) {
  const { modalOpen, setModalOpen, addTransaction, updateTransaction, editingTx, closeModal } = useTransactions();
  const refPanel = useRef();

  const effectiveInitial = initial || editingTx || null;

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  // click outside to close
  useEffect(() => {
    const onClick = (e) => {
      if (!modalOpen) return;
      if (refPanel.current && !refPanel.current.contains(e.target)) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  const handleAdd = async (payload) => {
    if (effectiveInitial && effectiveInitial._id) {
      await updateTransaction(effectiveInitial._id, payload);
    } else {
      await addTransaction(payload);
    }
    if (onSaved) onSaved();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div ref={refPanel} className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-4 z-50">
        <h3 className="text-lg font-semibold mb-2">{effectiveInitial ? "Modifica transazione" : "Nuova transazione"}</h3>
        <AddTransactionForm
          initial={effectiveInitial}
          onAdd={handleAdd}
          onCancel={() => closeModal()}
          submitLabel={effectiveInitial ? "Salva" : "Aggiungi"}
        />
      </div>
    </div>
  );
}
