// src/components/AddCategoryModal.jsx
import React from "react";
import AddCategoryForm from "./AddCategoryForm";

export default function AddCategoryModal({ open, onClose, initial }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mt-8 p-4">
        <button
          className="absolute right-3 top-3"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <AddCategoryForm onDone={onClose} initial={initial} />
      </div>
    </div>
  );
}
