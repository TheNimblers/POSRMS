import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: command === "serve" ? [react(), expressPlugin()] : [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      (async () => {
        try {
          const mod = await import("./server");
          const created = await mod.createServer();
          const app = created.app ?? created;
          server.middlewares.use(app);
        } catch (err) {
          console.error("Failed to start embedded Express server:", err);
        }
      })();
    },
  };
}
