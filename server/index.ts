import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { handleDemo } from "./routes/demo";
import { webSocketManager } from "./websocket";

// Import API routes

export async function createServer() {
  const app = express();
  const server = createHttpServer(app);

  console.log("🔌 Supabase mode enabled");

  // WebSocket initialization moved to server startup (node-build.ts) to ensure the HTTP server is already listening

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "supabase",
      websocket: "active",
    });
  });

  // Legacy routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // === SUPABASE ROUTES ===
  const supabaseAuth = await import("./routes/supabaseAuth");

  // Public Routes
  app.post("/api/auth/login", supabaseAuth.handleLogin);
  app.post("/api/auth/logout", supabaseAuth.handleLogout);

  // Protected Routes
  app.get(
    "/api/auth/profile",
    supabaseAuth.authenticateToken,
    supabaseAuth.handleProfile
  );

  // Placeholder for additional routes (orders, tables, menu)
  // These can be added as needed with proper Supabase integration

  // WebSocket management routes
  app.get("/api/websocket/stats", supabaseAuth.authenticateToken, (_req, res) => {
    const stats = webSocketManager.getStats();
    res.json({ success: true, data: stats });
  });

  app.get(
    "/api/websocket/clients",
    supabaseAuth.authenticateToken,
    (_req, res) => {
      const clients = webSocketManager.getConnectedClients();
      res.json({ success: true, data: { clients } });
    }
  );

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("API Error:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    }
  );

  // 404 handler for API routes
  app.use("/api/*", (_req, res) => {
    res.status(404).json({
      success: false,
      error: "API endpoint not found",
    });
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("🛑 Received SIGTERM, shutting down gracefully");
    process.exit(0);
  });

  return { app, server };
}
