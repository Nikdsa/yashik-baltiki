import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../tailwind.css";
import { Frame } from "./screens/Frame/Frame";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Frame />
  </StrictMode>,
);
