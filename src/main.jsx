import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "@/i18n";

// Supports weights 100-900
import "@fontsource-variable/montserrat/wght.css";
// Supports weights 200-700
import "@fontsource-variable/oswald/wght.css";
import "@fontsource/indie-flower";
import { StrictMode } from "react";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
