import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { handleDemo } from "./routes/demo";
import { webSocketManager } from "./websocket";
import { db } from "./database";

// Import API routes
import {
  handleLogin,
  handleRegister,
  handleProfile,
  handleUpdatePassword,
  handleLogout,
  authenticateToken,
  requirePermission
} from "./routes/auth";

import {
  handleCreateOrder,
  handleGetOrders,
  handleGetOrder,
  handleUpdateOrderStatus,
  handleGetOrderAnalytics,
  handleDeleteOrder
} from "./routes/orders";

import {
  handleGetTables,
  handleGetTable,
  handleCreateTable,
  handleUpdateTable,
  handleAssignWaiter,
  handleGenerateQR,
  handleDeleteTable,
  handleGetTableQRCodes
} from "./routes/tables";

import {
  handleGetMenuItems,
  handleGetPublicMenu,
  handleGetMenuItem,
  handleCreateMenuItem,
  handleUpdateMenuItem,
  handleToggleAvailability,
  handleDeleteMenuItem,
  handleGetCategories
} from "./routes/menu";

import {
  handleCreatePublicOrder,
  handlePublicCallWaiter,
  handlePublicRequestPayment,
  handleStartPublicSession,
} from "./routes/public";

export function createServer() {
  const app = express();
  const server = createHttpServer(app);

  // Initialize database (this happens automatically in the constructor)
  console.log('����️ Database initialized');

  // Initialize WebSocket server
  webSocketManager.initialize(server);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      websocket: "active"
    });
  });

  // Legacy routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // === PUBLIC ROUTES (No authentication required) ===

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);

  // Public menu and customer endpoints (for customers)
  app.get("/api/menu/public", handleGetPublicMenu);
  app.post("/api/sessions/public/start", handleStartPublicSession);
  app.post("/api/orders/public", handleCreatePublicOrder);
  app.post("/api/tables/public/call-waiter", handlePublicCallWaiter);
  app.post("/api/tables/public/request-payment", handlePublicRequestPayment);

  // === PROTECTED ROUTES (Authentication required) ===

  // Authentication routes (protected)
  app.get("/api/auth/profile", authenticateToken, handleProfile);
  app.put("/api/auth/password", authenticateToken, handleUpdatePassword);
  app.post("/api/auth/register", authenticateToken, requirePermission('manage_staff'), handleRegister);

  // Order routes
  app.post("/api/orders", authenticateToken, handleCreateOrder);
  app.get("/api/orders", authenticateToken, handleGetOrders);
  app.get("/api/orders/analytics", authenticateToken, requirePermission('view_analytics'), handleGetOrderAnalytics);
  app.get("/api/orders/:orderId", authenticateToken, handleGetOrder);
  app.put("/api/orders/:orderId/status", authenticateToken, handleUpdateOrderStatus);
  app.delete("/api/orders/:orderId", authenticateToken, requirePermission('full_access'), handleDeleteOrder);

  // Table routes
  app.get("/api/tables", authenticateToken, requirePermission('view_tables'), handleGetTables);
  app.post("/api/tables", authenticateToken, requirePermission('manage_staff'), handleCreateTable);
  app.get("/api/tables/qr-codes", authenticateToken, requirePermission('view_tables'), handleGetTableQRCodes);
  app.get("/api/tables/:tableId", authenticateToken, requirePermission('view_tables'), handleGetTable);
  app.put("/api/tables/:tableId", authenticateToken, requirePermission('manage_staff'), handleUpdateTable);
  app.put("/api/tables/:tableId/assign", authenticateToken, requirePermission('view_tables'), handleAssignWaiter);
  app.post("/api/tables/:tableId/qr", authenticateToken, requirePermission('manage_staff'), handleGenerateQR);
  app.delete("/api/tables/:tableId", authenticateToken, requirePermission('full_access'), handleDeleteTable);

  // Menu routes
  app.get("/api/menu", authenticateToken, handleGetMenuItems);
  app.post("/api/menu", authenticateToken, requirePermission('manage_menu'), handleCreateMenuItem);
  app.get("/api/menu/categories", authenticateToken, handleGetCategories);
  app.get("/api/menu/:itemId", authenticateToken, handleGetMenuItem);
  app.put("/api/menu/:itemId", authenticateToken, requirePermission('manage_menu'), handleUpdateMenuItem);
  app.put("/api/menu/:itemId/toggle", authenticateToken, requirePermission('manage_menu'), handleToggleAvailability);
  app.delete("/api/menu/:itemId", authenticateToken, requirePermission('full_access'), handleDeleteMenuItem);

  // WebSocket management routes
  app.get("/api/websocket/stats", authenticateToken, requirePermission('view_analytics'), (_req, res) => {
    const stats = webSocketManager.getStats();
    res.json({ success: true, data: stats });
  });

  app.get("/api/websocket/clients", authenticateToken, requirePermission('view_analytics'), (_req, res) => {
    const clients = webSocketManager.getConnectedClients();
    res.json({ success: true, data: { clients } });
  });

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  });

  return { app, server };
}
