import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: 'base' debe ser el nombre EXACTO de tu repositorio de GitHub, con diagonales.
// Si tu repo se llama distinto, cámbialo aquí.
export default defineConfig({
  plugins: [react()],
  base: "/ruta-claude/",
});
