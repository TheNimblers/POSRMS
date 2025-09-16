import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { parse } from "url";

// WebSocket event types (matching frontend)
export type WebSocketEventType =
  | "table_activated"
  | "call_waiter"
  | "payment_requested"
  | "order_placed"
  | "order_status_updated"
  | "kitchen_order"
  | "bar_order"
  | "staff_notification"
  | "table_status_changed"
  | "menu_updated"
  | "user_joined"
  | "user_left";

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
  userId?: string;
  restaurantId?: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  role: string;
  restaurantId?: string;
  isAlive: boolean;
}

class WebSocketManager {
  private clients = new Map<string, ConnectedClient>();
  private wss: WebSocketServer | null = null;

  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    // Heartbeat to detect broken connections
    setInterval(() => {
      this.pingClients();
    }, 30000);

    console.log("WebSocket server initialized");
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const url = parse(request.url || "", true);
    const userId = url.query.userId as string;
    const role = url.query.role as string;
    const restaurantId = url.query.restaurantId as string;

    if (!userId || !role) {
      ws.close(1008, "Missing required parameters");
      return;
    }

    const clientId = `${userId}-${Date.now()}`;
    const client: ConnectedClient = {
      ws,
      userId,
      role,
      restaurantId,
      isAlive: true,
    };

    this.clients.set(clientId, client);

    console.log(
      `Client connected: ${userId} (${role}) - Restaurant: ${restaurantId}`,
    );

    // Set up message handling
    ws.on("message", (data: Buffer) => {
      try {
        const event: WebSocketEvent = JSON.parse(data.toString());
        this.handleEvent(clientId, event);
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    });

    // Handle disconnection
    ws.on("close", () => {
      this.clients.delete(clientId);
      console.log(`Client disconnected: ${userId}`);

      // Notify others about user leaving
      this.broadcast(
        {
          type: "user_left",
          data: { userId, role, restaurantId },
          timestamp: new Date().toISOString(),
        },
        restaurantId,
      );
    });

    // Handle connection errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${userId}:`, error);
      this.clients.delete(clientId);
    });

    // Pong response for heartbeat
    ws.on("pong", () => {
      client.isAlive = true;
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: "staff_notification",
      data: { message: "Connected to POSRMS real-time updates" },
      timestamp: new Date().toISOString(),
    });

    // Notify others about new user
    this.broadcast(
      {
        type: "user_joined",
        data: { userId, role, restaurantId },
        timestamp: new Date().toISOString(),
      },
      restaurantId,
      clientId,
    );
  }

  private handleEvent(senderId: string, event: WebSocketEvent) {
    const sender = this.clients.get(senderId);
    if (!sender) return;

    console.log(`Event received from ${sender.userId}:`, event);

    // Add sender info to event
    event.userId = sender.userId;
    event.restaurantId = sender.restaurantId;
    event.timestamp = new Date().toISOString();

    // Route event based on type
    switch (event.type) {
      case "order_placed":
        this.handleOrderPlaced(event, sender.restaurantId);
        break;

      case "call_waiter":
        this.handleCallWaiter(event, sender.restaurantId);
        break;

      case "payment_requested":
        this.handlePaymentRequested(event, sender.restaurantId);
        break;

      case "table_activated":
        this.handleTableActivated(event, sender.restaurantId);
        break;

      case "order_status_updated":
        this.handleOrderStatusUpdated(event, sender.restaurantId);
        break;

      case "menu_updated":
        this.handleMenuUpdated(event, sender.restaurantId);
        break;

      default:
        // Broadcast general events to all staff in restaurant
        this.broadcastToStaff(event, sender.restaurantId);
    }
  }

  private handleOrderPlaced(event: WebSocketEvent, restaurantId?: string) {
    const { data } = event;

    // Notify waiters
    this.broadcastToRoles(event, ["waiter", "manager", "admin"], restaurantId);

    // Create separate events for kitchen and bar
    if (data.items) {
      const foodItems = data.items.filter((item: any) =>
        ["main", "starter", "special"].includes(item.category),
      );
      const drinkItems = data.items.filter((item: any) =>
        ["wine", "beer", "cocktail", "non-alcoholic"].includes(item.category),
      );

      if (foodItems.length > 0) {
        this.broadcastToRoles(
          {
            ...event,
            type: "kitchen_order",
            data: { ...data, items: foodItems },
          },
          ["kitchen", "manager", "admin"],
          restaurantId,
        );
      }

      if (drinkItems.length > 0) {
        this.broadcastToRoles(
          {
            ...event,
            type: "bar_order",
            data: { ...data, items: drinkItems },
          },
          ["bar", "manager", "admin"],
          restaurantId,
        );
      }
    }
  }

  private handleCallWaiter(event: WebSocketEvent, restaurantId?: string) {
    // High priority notification to waiters and managers
    this.broadcastToRoles(
      {
        ...event,
        data: { ...event.data, priority: "high" },
      },
      ["waiter", "manager", "admin"],
      restaurantId,
    );
  }

  private handlePaymentRequested(event: WebSocketEvent, restaurantId?: string) {
    // Notify waiters and managers about payment request
    this.broadcastToRoles(event, ["waiter", "manager", "admin"], restaurantId);
  }

  private handleTableActivated(event: WebSocketEvent, restaurantId?: string) {
    // Notify all staff about new active table
    this.broadcastToStaff(event, restaurantId);
  }

  private handleOrderStatusUpdated(
    event: WebSocketEvent,
    restaurantId?: string,
  ) {
    // Notify relevant staff based on status change
    this.broadcastToStaff(event, restaurantId);
  }

  private handleMenuUpdated(event: WebSocketEvent, restaurantId?: string) {
    // Notify all staff about menu changes
    this.broadcastToStaff(event, restaurantId);
  }

  private broadcastToRoles(
    event: WebSocketEvent,
    roles: string[],
    restaurantId?: string,
  ) {
    this.clients.forEach((client) => {
      if (
        roles.includes(client.role) &&
        (!restaurantId || client.restaurantId === restaurantId)
      ) {
        this.sendToClient(client.ws, event);
      }
    });
  }

  private broadcastToStaff(event: WebSocketEvent, restaurantId?: string) {
    this.clients.forEach((client) => {
      if (
        client.role !== "customer" &&
        (!restaurantId || client.restaurantId === restaurantId)
      ) {
        this.sendToClient(client.ws, event);
      }
    });
  }

  private broadcast(
    event: WebSocketEvent,
    restaurantId?: string,
    excludeClientId?: string,
  ) {
    this.clients.forEach((client, clientId) => {
      if (
        clientId !== excludeClientId &&
        (!restaurantId || client.restaurantId === restaurantId)
      ) {
        this.sendToClient(client.ws, event);
      }
    });
  }

  private sendToClient(ws: WebSocket | string, event: WebSocketEvent) {
    try {
      let targetWs: WebSocket;

      if (typeof ws === "string") {
        const client = this.clients.get(ws);
        if (!client) return;
        targetWs = client.ws;
      } else {
        targetWs = ws;
      }

      if (targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(JSON.stringify(event));
      }
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
  }

  private pingClients() {
    this.clients.forEach((client, clientId) => {
      if (!client.isAlive) {
        client.ws.terminate();
        this.clients.delete(clientId);
        return;
      }

      client.isAlive = false;
      client.ws.ping();
    });
  }

  // Public methods for triggering events from API
  public notifyTableActivated(
    tableId: number,
    tableNumber: string,
    restaurantId: string,
  ) {
    this.broadcastToStaff(
      {
        type: "table_activated",
        data: { tableId, tableNumber },
        timestamp: new Date().toISOString(),
      },
      restaurantId,
    );
  }

  public notifyOrderPlaced(orderData: any, restaurantId: string) {
    this.handleOrderPlaced(
      {
        type: "order_placed",
        data: orderData,
        timestamp: new Date().toISOString(),
      },
      restaurantId,
    );
  }

  public notifyOrderStatusUpdate(orderData: any, restaurantId: string) {
    this.broadcastToStaff(
      {
        type: "order_status_updated",
        data: orderData,
        timestamp: new Date().toISOString(),
      },
      restaurantId,
    );
  }

  public notifyMenuUpdate(menuData: any, restaurantId: string) {
    this.broadcastToStaff(
      {
        type: "menu_updated",
        data: menuData,
        timestamp: new Date().toISOString(),
      },
      restaurantId,
    );
  }

  public getConnectedClients() {
    return Array.from(this.clients.values()).map((client) => ({
      userId: client.userId,
      role: client.role,
      restaurantId: client.restaurantId,
    }));
  }

  public getStats() {
    const stats = {
      totalConnections: this.clients.size,
      byRole: {} as Record<string, number>,
      byRestaurant: {} as Record<string, number>,
    };

    this.clients.forEach((client) => {
      stats.byRole[client.role] = (stats.byRole[client.role] || 0) + 1;
      if (client.restaurantId) {
        stats.byRestaurant[client.restaurantId] =
          (stats.byRestaurant[client.restaurantId] || 0) + 1;
      }
    });

    return stats;
  }
}

export const webSocketManager = new WebSocketManager();
