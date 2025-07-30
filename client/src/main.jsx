import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext.jsx"; // spelling check
import { ChatProvider } from "./context/ChatContext.jsx";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        <App />
        <Toaster />
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
);

