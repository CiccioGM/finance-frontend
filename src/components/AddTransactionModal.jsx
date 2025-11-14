// src/components/AddTransactionModal.jsx
import React from "react";
import AddTransactionForm from "./AddTransactionForm";

export default function AddTransactionModal({ open, onClose, initial }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <AddTransactionForm onDone={onClose} initial={initial} />
      </div>
    </div>
  );
}
