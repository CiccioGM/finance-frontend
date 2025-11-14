// src/pages/Categories.jsx
import React, { useState, useEffect, useRef } from "react";
import { useCategories } from "../context/CategoriesContext";
import { MoreVertical, Plus } from "lucide-react";
import AddCategoryModal from "../components/AddCategoryModal";

export default function Categories() {
  const { categories, deleteCategory } = useCategories();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  useEffect(() => {
    function handleClickOutside(e) {
      const refs = menuRefs.current || {};
      const clickedInside = Object.values(refs).some(
        (node) => node && node.contains(e.target)
      );
      if (!clickedInside) setOpenMenuId(null);
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleDelete = async (cat) => {
    if (!confirm(`Eliminare la categoria "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat._id);
    } catch (e) {
      console.error("delete category error", e);
      alert(
        "Impossibile eliminare la categoria: probabilmente è associata a transazioni."
      );
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setAddOpen(true);
    setOpenMenuId(null);
  };

  const handleNew = () => {
    setEditing(null);
    setAddOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      {/* Lista categorie esistenti */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Categorie</h3>
        {categories.length === 0 && (
          <div className="text-sm text-gray-500">Nessuna categoria.</div>
        )}
        <div className="divide-y">
          {categories.map((c) => (
            <div
              key={c._id}
              className="py-2 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div style={{ fontSize: 20 }}>{c.icon}</div>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.type}</div>
                </div>
              </div>
              <div
                className="relative"
                ref={(el) => {
                  menuRefs.current[c._id] = el;
                }}
              >
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() =>
                    setOpenMenuId((prev) => (prev === c._id ? null : c._id))
                  }
                >
                  <MoreVertical size={18} />
                </button>
                {openMenuId === c._id && (
                  <div className="absolute right-0 mt-1 bg-white border rounded shadow z-20 min-w-[140px] text-sm">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleEdit(c)}
                    >
                      Modifica
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                      onClick={() => handleDelete(c)}
                    >
                      Elimina
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solo pulsante per aprire il modal Aggiungi/Modifica categoria */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow"
        >
          <Plus size={16} />
          <span>Aggiungi categoria</span>
        </button>
      </div>

      <AddCategoryModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
        }}
        initial={editing}
      />
    </div>
  );
}
