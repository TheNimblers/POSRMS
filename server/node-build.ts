import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createAppServer } from "./index";
import { webSocketManager } from "./websocket";

// Create app/http server (WebSocket is initialized inside createServer)
const { app, server } = await createAppServer();

// Ensure we use the PORT Render provides and fail loudly if missing/invalid
const rawPort = process.env.PORT ?? process.env.NODE_PORT;
if (!rawPort) {
  console.error("FATAL: No PORT environment variable provided. Render requires binding to process.env.PORT.");
  // Exit with non-zero code so platform indicates a failure instead of silent scanning
  process.exit(1);
}
const port = Number.parseInt(String(rawPort), 10);
if (Number.isNaN(port) || port <= 0) {
  console.error("FATAL: Invalid PORT value:", rawPort);
  process.exit(1);
}
const host = process.env.HOST || "0.0.0.0";

console.log("Server boot parameters:", {
  PORT: rawPort,
  parsedPort: port,
  host,
});

// Lightweight health endpoint at root for platforms that probe non-API paths
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

// Serve the built SPA in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../spa");
console.log("Static dist path:", distPath);

try {
  app.use(express.static(distPath));

  // Route all non-API requests to index.html for SPA routing
  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api/") ||
      req.path === "/ws" ||
      req.path === "/health"
    ) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
} catch (e) {
  console.error("Error setting up static file serving:", e);
}

server.on("error", (err) => {
  console.error("HTTP server error:", err);
});

server.on("listening", () => {
  const address = server.address();
  // Initialize WebSocket after the HTTP server is actively listening so PaaS port scanners can detect the open port
  try {
    webSocketManager.initialize(server);
    console.log("WebSocket initialized on HTTP server");
  } catch (e) {
    console.error("Failed to initialize WebSocket server:", e);
  }

  console.log("HTTP server is listening:", address);
  console.log(`\n🚀 POSRMS listening on http://${host}:${port}`);
  console.log(`🔧 API: http://${host}:${port}/api`);
  console.log(`🔌 WebSocket: ws://${host}:${port}/ws\n`);
});

// Attempt to bind to the provided port on all interfaces. Omitting host lets Node bind IPv4/IPv6.
console.log("Attempting to bind server to port:", port, "(omitting host to allow all interfaces)");
server.listen(Number.isFinite(port) ? port : 10000);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
