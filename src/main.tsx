import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Configurar locale para pt-BR
if (typeof document !== "undefined") {
  document.documentElement.lang = "pt-BR";
  document.documentElement.setAttribute("lang", "pt-BR");
}

// Registrar Service Worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registrado com sucesso:", registration.scope);
        
        // Verifica atualizações do service worker
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("🔄 Nova versão do Service Worker disponível!");
                // Opcional: mostrar notificação para o usuário atualizar
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("❌ Falha ao registrar Service Worker:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
