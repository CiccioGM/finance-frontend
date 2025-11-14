import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { TransactionsProvider } from "./context/TransactionsContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CategoriesProvider>
      <TransactionsProvider>
        <App />
      </TransactionsProvider>
    </CategoriesProvider>
  </React.StrictMode>
);
