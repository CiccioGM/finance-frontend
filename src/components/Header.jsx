import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";
import { useTransactions } from "../context/TransactionsContext";
import { Menu as MenuIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const { setSearchQuery, openAddModal } = useTransactions();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const onOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3 gap-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">Gestione Finanze</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-72">
            <SearchInput onSearch={(q) => setSearchQuery(q)} />
          </div>

          <button
            onClick={() => openAddModal()}
            className="bg-blue-600 text-white px-3 py-2 rounded-md shadow hover:bg-blue-700"
            title="Aggiungi transazione"
          >
            + Nuova
          </button>

          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((s) => !s)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Apri menu">
              <MenuIcon size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-60">
                <Link to="/" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/transactions" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Transazioni</Link>
                <Link to="/categories" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Categorie</Link>
                <Link to="/settings" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Impostazioni</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
