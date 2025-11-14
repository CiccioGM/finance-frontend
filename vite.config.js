import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // optional: reduce chunk size warnings
    chunkSizeWarningLimit: 1200
  }
});
