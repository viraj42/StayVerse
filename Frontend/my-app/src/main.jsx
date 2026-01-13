import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import "./index.css"
import { WishlistProvider } from "./utils/WishlistContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
           <WishlistProvider>
        <App />
      </WishlistProvider>
    </AuthProvider>
  </BrowserRouter>
);
