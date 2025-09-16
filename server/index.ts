import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { handleDemo } from "./routes/demo";
import { webSocketManager } from "./websocket";

export function createServer() {
  const app = express();
  const server = createHttpServer(app);

  // Initialize WebSocket server
  webSocketManager.initialize(server);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // WebSocket stats endpoint
  app.get("/api/websocket/stats", (_req, res) => {
    const stats = webSocketManager.getStats();
    res.json(stats);
  });

  // WebSocket connected clients endpoint
  app.get("/api/websocket/clients", (_req, res) => {
    const clients = webSocketManager.getConnectedClients();
    res.json({ clients });
  });

  return { app, server };
}
