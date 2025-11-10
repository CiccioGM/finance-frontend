import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { TransactionsProvider } from "./context/TransactionsContext";
import "../styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TransactionsProvider>
      <App />
    </TransactionsProvider>
  </React.StrictMode>
);
