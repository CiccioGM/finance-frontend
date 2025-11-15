// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";

export default function Header({ onNewTransaction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Chiudi il menù quando cambia pagina
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Chiudi il menù cliccando fuori
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-30">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Nome app */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold">
            Gestione Finanze
          </Link>
        </div>

        {/* Pulsante Nuova + Menu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewTransaction}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md"
          >
            <Plus size={16} />
            <span>Nuova</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="px-2 py-2"
            >
              ☰
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow rounded overflow-hidden z-40 min-w-[180px]">
                <Link to="/" className="block px-4 py-2 hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Transazioni
                </Link>
                <Link
                  to="/categories"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Categorie
                </Link>
                <Link
                  to="/budget"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Budget
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Impostazioni
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
