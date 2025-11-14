import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import AddTransactionPage from "./pages/AddTransactionPage"; // opzionale, se vuoi tenerla
import AddTransactionModal from "./components/AddTransactionModal";

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Header fissato in alto */}
        <Header onNewTransaction={openAddModal} />

        {/* Contenuto sotto l'header (pt-16 per non coprirlo) */}
        <main className="pt-16 px-4 md:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
            {/* Pagina standalone, se vuoi ancora usarla da URL diretto */}
            <Route path="/add" element={<AddTransactionPage />} />
          </Routes>
        </main>

        {/* Modal di aggiunta transazione in overlay sulla schermata corrente */}
        <AddTransactionModal
          open={isAddModalOpen}
          onClose={closeAddModal}
        />
      </div>
    </BrowserRouter>
  );
}
