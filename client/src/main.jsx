import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#fff",
            color: "#111",
            borderRadius: "10px",
            border: "1px solid #eee",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);