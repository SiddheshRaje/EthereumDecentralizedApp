import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { TransactionsProvider } from "./context/TransactionContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.render(
  <BrowserRouter>
    <AuthProvider>
      <TransactionsProvider>
        <App />
      </TransactionsProvider>
    </AuthProvider>
  </BrowserRouter>,
  document.getElementById("root"),
);
