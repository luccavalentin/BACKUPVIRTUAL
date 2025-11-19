import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Configurar locale para pt-BR
if (typeof document !== "undefined") {
  document.documentElement.lang = "pt-BR";
  document.documentElement.setAttribute("lang", "pt-BR");
}

createRoot(document.getElementById("root")!).render(<App />);
