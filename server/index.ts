import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { handleDemo } from "./routes/demo";
import { webSocketManager } from "./websocket";
import { connectMongo, getMongoDb, closeMongo } from "./mongo";

// Import API routes

export async function createServer() {
  const app = express();
  const server = createHttpServer(app);

  const useMongoOnly = process.env.USE_MONGODB_ONLY === "true";
  if (useMongoOnly) {
    await connectMongo();
    console.log("🗄️ Mongo-only mode enabled");
  }

  // Initialize WebSocket server
  webSocketManager.initialize(server);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    const useMongoOnly = process.env.USE_MONGODB_ONLY === "true";
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: useMongoOnly ? undefined : "connected",
      websocket: "active",
      mongo: useMongoOnly
        ? getMongoDb()
          ? "connected"
          : "disconnected"
        : "disabled",
    });
  });

  // Legacy routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // === ROUTES ===
  const mongoOnly = process.env.USE_MONGODB_ONLY === "true";
  if (mongoOnly) {
    const mongoAuth = await import("./routes/mongoAuth");
    const mongoPublic = await import("./routes/mongoPublic");

    // Public
    app.post("/api/auth/login", mongoAuth.handleLogin);
    app.post("/api/auth/logout", mongoAuth.handleLogout);

    app.get("/api/menu/public", mongoPublic.handleGetPublicMenu);
    app.get(
      "/api/sessions/public/summary",
      mongoPublic.handleGetPublicSessionSummary,
    );
    app.post(
      "/api/sessions/public/start",
      mongoPublic.handleStartPublicSession,
    );
    app.post("/api/orders/public", mongoPublic.handleCreatePublicOrder);
    app.post(
      "/api/tables/public/call-waiter",
      mongoPublic.handlePublicCallWaiter,
    );
    app.post(
      "/api/tables/public/request-payment",
      mongoPublic.handlePublicRequestPayment,
    );

    // Protected (basic profile)
    app.get(
      "/api/auth/profile",
      mongoAuth.authenticateToken,
      mongoAuth.handleProfile,
    );
  } else {
    const auth = await import("./routes/auth");
    const orders = await import("./routes/orders");
    const tables = await import("./routes/tables");
    const menu = await import("./routes/menu");
    const pub = await import("./routes/public");

    // Public
    app.post("/api/auth/login", auth.handleLogin);
    app.post("/api/auth/logout", auth.handleLogout);

    app.get("/api/menu/public", menu.handleGetPublicMenu);
    app.get("/api/sessions/public/summary", pub.handleGetPublicSessionSummary);
    app.post("/api/sessions/public/start", pub.handleStartPublicSession);
    app.post("/api/orders/public", pub.handleCreatePublicOrder);
    app.post("/api/tables/public/call-waiter", pub.handlePublicCallWaiter);
    app.post(
      "/api/tables/public/request-payment",
      pub.handlePublicRequestPayment,
    );

    // Protected
    app.get("/api/auth/profile", auth.authenticateToken, auth.handleProfile);
    app.put(
      "/api/auth/password",
      auth.authenticateToken,
      auth.handleUpdatePassword,
    );
    app.post(
      "/api/auth/register",
      auth.authenticateToken,
      auth.requirePermission("manage_staff"),
      auth.handleRegister,
    );

    app.post("/api/orders", auth.authenticateToken, orders.handleCreateOrder);
    app.get("/api/orders", auth.authenticateToken, orders.handleGetOrders);
    app.get(
      "/api/orders/analytics",
      auth.authenticateToken,
      auth.requirePermission("view_analytics"),
      orders.handleGetOrderAnalytics,
    );
    app.get(
      "/api/orders/:orderId",
      auth.authenticateToken,
      orders.handleGetOrder,
    );
    app.put(
      "/api/orders/:orderId/status",
      auth.authenticateToken,
      orders.handleUpdateOrderStatus,
    );
    app.delete(
      "/api/orders/:orderId",
      auth.authenticateToken,
      auth.requirePermission("full_access"),
      orders.handleDeleteOrder,
    );

    app.post(
      "/api/sessions/:sessionId/pay",
      auth.authenticateToken,
      auth.requirePermission("manage_orders"),
      (await import("./routes/orders")).handleMarkSessionPaid,
    );

    app.get(
      "/api/tables",
      auth.authenticateToken,
      auth.requirePermission("view_tables"),
      tables.handleGetTables,
    );
    app.post(
      "/api/tables",
      auth.authenticateToken,
      auth.requirePermission("manage_staff"),
      tables.handleCreateTable,
    );
    app.get(
      "/api/tables/qr-codes",
      auth.authenticateToken,
      auth.requirePermission("view_tables"),
      tables.handleGetTableQRCodes,
    );
    app.get(
      "/api/tables/:tableId",
      auth.authenticateToken,
      auth.requirePermission("view_tables"),
      tables.handleGetTable,
    );
    app.put(
      "/api/tables/:tableId",
      auth.authenticateToken,
      auth.requirePermission("manage_staff"),
      tables.handleUpdateTable,
    );
    app.put(
      "/api/tables/:tableId/assign",
      auth.authenticateToken,
      auth.requirePermission("view_tables"),
      tables.handleAssignWaiter,
    );
    app.post(
      "/api/tables/:tableId/qr",
      auth.authenticateToken,
      auth.requirePermission("manage_staff"),
      tables.handleGenerateQR,
    );
    app.delete(
      "/api/tables/:tableId",
      auth.authenticateToken,
      auth.requirePermission("full_access"),
      tables.handleDeleteTable,
    );

    app.get("/api/menu", auth.authenticateToken, menu.handleGetMenuItems);
    app.post(
      "/api/menu",
      auth.authenticateToken,
      auth.requirePermission("manage_menu"),
      menu.handleCreateMenuItem,
    );
    app.get(
      "/api/menu/categories",
      auth.authenticateToken,
      menu.handleGetCategories,
    );
    app.get(
      "/api/menu/:itemId",
      auth.authenticateToken,
      menu.handleGetMenuItem,
    );
    app.put(
      "/api/menu/:itemId",
      auth.authenticateToken,
      auth.requirePermission("manage_menu"),
      menu.handleUpdateMenuItem,
    );
    app.put(
      "/api/menu/:itemId/toggle",
      auth.authenticateToken,
      auth.requirePermission("manage_menu"),
      menu.handleToggleAvailability,
    );
    app.delete(
      "/api/menu/:itemId",
      auth.authenticateToken,
      auth.requirePermission("full_access"),
      menu.handleDeleteMenuItem,
    );
  }

  // WebSocket management routes
  if (mongoOnly) {
    const { authenticateToken: mongoAuthMiddleware } = await import("./routes/mongoAuth");

    app.get("/api/websocket/stats", mongoAuthMiddleware, (_req, res) => {
      const stats = webSocketManager.getStats();
      res.json({ success: true, data: stats });
    });

    app.get("/api/websocket/clients", mongoAuthMiddleware, (_req, res) => {
      const clients = webSocketManager.getConnectedClients();
      res.json({ success: true, data: { clients } });
    });
  } else {
    const auth = await import("./routes/auth");

    app.get(
      "/api/websocket/stats",
      auth.authenticateToken,
      auth.requirePermission("view_analytics"),
      (_req, res) => {
        const stats = webSocketManager.getStats();
        res.json({ success: true, data: stats });
      },
    );

    app.get(
      "/api/websocket/clients",
      auth.authenticateToken,
      auth.requirePermission("view_analytics"),
      (_req, res) => {
        const clients = webSocketManager.getConnectedClients();
        res.json({ success: true, data: { clients } });
      },
    );
  }

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
    await closeMongo();
  });

  return { app, server };
}
