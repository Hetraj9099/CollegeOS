import React from "react";
import ReactDOM from "react-dom/client";
import { AuthBootstrap } from "@/app/AuthBootstrap";
import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/routes/router";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
    </AppProviders>
  </React.StrictMode>
);
