import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import { runAuditDiagnostic } from "./utils/auditDiagnostic";

// Run diagnostic in dev mode or make it globally available
if (import.meta.env.DEV) {
  // @ts-ignore
  window.runAuditDiagnostic = runAuditDiagnostic;
  // Delay slightly to let React mount the DOM
  setTimeout(() => runAuditDiagnostic(), 2500);
}

// Service Worker Registration for PWA
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[PWA] Service Worker registrado con éxito:", reg.scope))
        .catch((err) => console.warn("[PWA] Error registrando Service Worker:", err));
    });
  } else {
    // In dev mode, ensure old workers don't intercept Vite development modules
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
