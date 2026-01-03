import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "./screens/Dashboard";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>,
);
