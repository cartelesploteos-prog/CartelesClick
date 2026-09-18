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

// Force cleanup of any stale Service Worker or cache from previous sessions
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister().then(() => {
        console.log("[PWA] Service Worker unregistered:", reg.scope);
      });
    }
  });
  if ("caches" in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
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
