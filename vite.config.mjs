import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist/spa",
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./client"),
      "@shared": path.resolve(process.cwd(), "./shared"),
    },
  },
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
