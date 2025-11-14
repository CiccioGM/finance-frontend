import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useTransactions } from "../context/TransactionsContext";
import SearchInput from "./SearchInput";

export default function Header() {
  const navigate = useNavigate();
  const { setSearchQ } = useTransactions();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-30">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold">Gestione Finanze</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block w-64"><SearchInput onSearch={q => setSearchQ(q)} /></div>
          <button onClick={() => navigate("/add")} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md">
            <Plus size={16} /> Nuova
          </button>
          <div className="relative">
            <button onClick={(e)=>{ const el = document.getElementById("main-menu"); el.classList.toggle("hidden");}} className="px-2 py-2">☰</button>
            <div id="main-menu" className="hidden absolute right-0 mt-2 bg-white shadow rounded">
              <Link to="/" className="block px-4 py-2">Dashboard</Link>
              <Link to="/transactions" className="block px-4 py-2">Transazioni</Link>
              <Link to="/categories" className="block px-4 py-2">Categorie</Link>
              <Link to="/settings" className="block px-4 py-2">Impostazioni</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
