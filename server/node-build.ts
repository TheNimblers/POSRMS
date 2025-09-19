import { createServer } from "./index";
import express from "express";
import path from "path";
import { createServer } from "./index";

const { app, server } = await createServer();
const portEnv = process.env.PORT || process.env.NODE_PORT || "3000";
const port = Number(portEnv);
console.log("Render PORT env:", portEnv);

// In production, serve the built SPA files
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../spa");
console.log("Static dist path:", distPath);

try {
  // Serve static files
  app.use(express.static(distPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    res.sendFile(path.join(distPath, "index.html"));
  });
} catch (e) {
  console.error("Error setting up static file serving:", e);
}

// Bind on all interfaces for Render
server.on("error", (err) => {
  console.error("HTTP server error:", err);
});

server.listen(port, () => {
  console.log(`🚀 POSRMS server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${port}/ws`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
