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
  const supabaseOrders = await import("./routes/supabaseOrders");
  const supabaseTables = await import("./routes/supabaseTables");
  const supabaseMenu = await import("./routes/supabaseMenu");
  const seed = await import("./routes/seed");

  // ===== AUTH ROUTES =====
  // Public
  app.post("/api/auth/login", supabaseAuth.handleLogin);
  app.post("/api/auth/logout", supabaseAuth.handleLogout);

  // Protected
  app.get(
    "/api/auth/profile",
    supabaseAuth.authenticateToken,
    supabaseAuth.handleProfile,
  );

  // ===== ORDERS ROUTES =====
  // Public (no auth required)
  app.get("/api/menu/public", supabaseMenu.handleGetPublicMenu);

  // Protected
  app.post(
    "/api/orders",
    supabaseAuth.authenticateToken,
    supabaseOrders.handleCreateOrder,
  );
  app.get(
    "/api/orders",
    supabaseAuth.authenticateToken,
    supabaseOrders.handleGetOrders,
  );
  app.get(
    "/api/orders/analytics",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("view_analytics"),
    supabaseOrders.handleGetOrderAnalytics,
  );
  app.get(
    "/api/orders/:orderId",
    supabaseAuth.authenticateToken,
    supabaseOrders.handleGetOrder,
  );
  app.put(
    "/api/orders/:orderId/status",
    supabaseAuth.authenticateToken,
    supabaseOrders.handleUpdateOrderStatus,
  );
  app.delete(
    "/api/orders/:orderId",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("full_access"),
    supabaseOrders.handleDeleteOrder,
  );

  app.post(
    "/api/sessions/:sessionId/pay",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("manage_orders"),
    supabaseOrders.handleMarkSessionPaid,
  );

  // ===== TABLES ROUTES =====
  app.get(
    "/api/tables",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("view_tables"),
    supabaseTables.handleGetTables,
  );
  app.post(
    "/api/tables",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("manage_staff"),
    supabaseTables.handleCreateTable,
  );
  app.get(
    "/api/tables/qr-codes",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("view_tables"),
    supabaseTables.handleGetTableQRCodes,
  );
  app.get(
    "/api/tables/:tableId",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("view_tables"),
    supabaseTables.handleGetTable,
  );
  app.put(
    "/api/tables/:tableId",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("manage_staff"),
    supabaseTables.handleUpdateTable,
  );
  app.put(
    "/api/tables/:tableId/assign",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("view_tables"),
    supabaseTables.handleAssignWaiter,
  );
  app.post(
    "/api/tables/:tableId/qr",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("manage_staff"),
    supabaseTables.handleGenerateQR,
  );
  app.delete(
    "/api/tables/:tableId",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("full_access"),
    supabaseTables.handleDeleteTable,
  );

  // ===== MENU ROUTES =====
  app.get(
    "/api/menu",
    supabaseAuth.authenticateToken,
    supabaseMenu.handleGetMenuItems,
  );
  app.post(
    "/api/menu",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("manage_menu"),
    supabaseMenu.handleCreateMenuItem,
  );
  app.get(
    "/api/menu/categories",
    supabaseAuth.authenticateToken,
    supabaseMenu.handleGetCategories,
  );
  app.get(
    "/api/menu/:itemId",
    supabaseAuth.authenticateToken,
    supabaseMenu.handleGetMenuItem,
  );
  app.put(
    "/api/menu/:itemId",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("manage_menu"),
    supabaseMenu.handleUpdateMenuItem,
  );
  app.put(
    "/api/menu/:itemId/toggle",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("manage_menu"),
    supabaseMenu.handleToggleAvailability,
  );
  app.delete(
    "/api/menu/:itemId",
    supabaseAuth.authenticateToken,
    supabaseAuth.requirePermission("full_access"),
    supabaseMenu.handleDeleteMenuItem,
  );

  // WebSocket management routes
  app.get(
    "/api/websocket/stats",
    supabaseAuth.authenticateToken,
    (_req, res) => {
      const stats = webSocketManager.getStats();
      res.json({ success: true, data: stats });
    },
  );

  app.get(
    "/api/websocket/clients",
    supabaseAuth.authenticateToken,
    (_req, res) => {
      const clients = webSocketManager.getConnectedClients();
      res.json({ success: true, data: { clients } });
    },
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
    },
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
