// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { TransactionsProvider } from "./context/TransactionsContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import { BudgetsProvider } from "./context/BudgetsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CategoriesProvider>
      <TransactionsProvider>
        <BudgetsProvider>
          <App />
        </BudgetsProvider>
      </TransactionsProvider>
    </CategoriesProvider>
  </React.StrictMode>
);
