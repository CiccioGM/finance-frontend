// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import Budget from "./pages/Budget";
import AddTransactionPage from "./pages/AddTransactionPage";
import AddTransactionModal from "./components/AddTransactionModal";

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pieLegendPosition, setPieLegendPosition] = useState("side");

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("pieLegendPosition");
    if (saved === "bottom" || saved === "side") {
      setPieLegendPosition(saved);
    } else {
      const width = window.innerWidth || 0;
      if (width < 768) {
        setPieLegendPosition("bottom");
      } else {
        setPieLegendPosition("side");
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop>
        <div className="min-h-screen bg-gray-50">
          <Header onNewTransaction={openAddModal} />

          <main className="pt-16 px-4 md:px-8">
            <Routes>
              <Route
                path="/"
                element={<Dashboard pieLegendPosition={pieLegendPosition} />}
              />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/budget" element={<Budget />} />
              <Route
                path="/settings"
                element={
                  <Settings
                    pieLegendPosition={pieLegendPosition}
                    setPieLegendPosition={setPieLegendPosition}
                  />
                }
              />
              <Route path="/add" element={<AddTransactionPage />} />
            </Routes>
          </main>

          <AddTransactionModal
            open={isAddModalOpen}
            onClose={closeAddModal}
          />
        </div>
      </ScrollToTop>
    </BrowserRouter>
  );
}
