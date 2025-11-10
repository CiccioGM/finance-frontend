import { Link, useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import { useTransactions } from "../context/TransactionsContext";
import { Menu } from "lucide-react";

export default function Header() {
  const { setSearchQuery } = useTransactions();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3 gap-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">Finance Tracker</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-72">
            <SearchInput onSearch={(q) => setSearchQuery(q)} />
          </div>

          <button
            onClick={() => navigate("/add")}
            className="bg-blue-600 text-white px-3 py-2 rounded-md shadow hover:bg-blue-700"
            title="Aggiungi transazione"
          >
            + Nuova
          </button>

          {/* menu a scomparsa */}
          <div className="relative">
            <details className="relative">
              <summary className="cursor-pointer p-2 rounded-md hover:bg-gray-100">
                <Menu size={20} />
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-20">
                <Link to="/" className="block px-4 py-2 hover:bg-gray-50">Dashboard</Link>
                <Link to="/transactions" className="block px-4 py-2 hover:bg-gray-50">Transazioni</Link>
                <Link to="/categories" className="block px-4 py-2 hover:bg-gray-50">Categorie</Link>
                <Link to="/settings" className="block px-4 py-2 hover:bg-gray-50">Impostazioni</Link>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
