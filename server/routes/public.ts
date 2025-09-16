import { RequestHandler } from "express";
import { db } from "../database";
import { z } from "zod";
import { ApiResponse, Session } from "@shared/database";
import { webSocketManager } from "../websocket";

const createPublicOrderSchema = z.object({
  token: z.string().min(1, "Table token is required"),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().min(1),
        notes: z.string().optional(),
      }),
    )
    .min(1, "At least one item is required"),
  currency: z.enum(["EUR", "USD"]).optional(),
  notes: z.string().optional(),
});

const startSessionSchema = z.object({
  token: z.string().min(1, "Table token is required"),
  customerCount: z.number().min(1).max(20).default(1),
});

export const handleStartPublicSession: RequestHandler = async (req, res) => {
  try {
    const { token, customerCount } = startSessionSchema.parse(req.body);

    // Find table by QR code token
    const table = db.queryOne("SELECT * FROM tables WHERE qr_code = ?", [
      token,
    ]) as any;
    if (!table) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" } as ApiResponse);
    }

    // Reuse existing active session if any
    let session = db.queryOne(
      "SELECT * FROM sessions WHERE table_id = ? AND restaurant_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1",
      [table.id, table.restaurant_id, "active"],
    ) as Session | undefined;

    if (!session) {
      const sessionId = db.generateId();
      db.execute(
        `
        INSERT INTO sessions (
          id, table_id, restaurant_id, start_time, total_amount, customer_count, status, payment_status
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0, ?, 'active', 'pending')
      `,
        [sessionId, table.id, table.restaurant_id, customerCount],
      );

      session = db.queryOne("SELECT * FROM sessions WHERE id = ?", [
        sessionId,
      ]) as Session;
    }

    // Mark table active
    db.execute(
      "UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ["active", table.id],
    );
    webSocketManager.notifyTableActivated(
      table.id,
      table.number,
      table.restaurant_id,
    );

    res
      .status(201)
      .json({
        success: true,
        data: session,
        message: "Session started",
      } as ApiResponse);
  } catch (error) {
    console.error("Start public session error:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Validation error",
          message: error.errors[0].message,
        } as ApiResponse);
    }
    res
      .status(500)
      .json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

export const handleCreatePublicOrder: RequestHandler = async (req, res) => {
  try {
    const {
      token,
      items,
      currency = "USD",
      notes,
    } = createPublicOrderSchema.parse(req.body);

    // Find table and restaurant
    const table = db.queryOne("SELECT * FROM tables WHERE qr_code = ?", [
      token,
    ]) as any;
    if (!table) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" } as ApiResponse);
    }

    // Ensure an active session exists or create one
    let session = db.queryOne(
      "SELECT * FROM sessions WHERE table_id = ? AND restaurant_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1",
      [table.id, table.restaurant_id, "active"],
    ) as Session | undefined;

    if (!session) {
      const sessionId = db.generateId();
      db.execute(
        `
        INSERT INTO sessions (
          id, table_id, restaurant_id, start_time, total_amount, customer_count, status, payment_status
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0, 1, 'active', 'pending')
      `,
        [sessionId, table.id, table.restaurant_id],
      );

      session = db.queryOne("SELECT * FROM sessions WHERE id = ?", [
        sessionId,
      ]) as Session;
    }

    // Build order items and total
    let totalAmount = 0;
    const orderItems: any[] = [];
    let hasFood = false;
    let hasDrinks = false;

    for (const item of items) {
      const menuItem = db.queryOne(
        "SELECT id, name, category, price_eur, price_usd FROM menu_items WHERE id = ? AND restaurant_id = ? AND available = true",
        [item.menuItemId, table.restaurant_id],
      ) as any;

      if (!menuItem) {
        return res
          .status(404)
          .json({
            success: false,
            error: `Menu item not found: ${item.menuItemId}`,
          } as ApiResponse);
      }

      const price =
        currency === "EUR" ? menuItem.price_eur : menuItem.price_usd;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        id: db.generateId(),
        menu_item_id: menuItem.id,
        name: menuItem.name,
        quantity: item.quantity,
        price,
        category: menuItem.category,
        notes: item.notes,
        status: "pending",
      });

      if (["starter", "main", "dessert", "special"].includes(menuItem.category))
        hasFood = true;
      else hasDrinks = true;
    }

    const orderType =
      hasFood && hasDrinks ? "mixed" : hasFood ? "food" : "drink";

    const orderId = db.generateId();
    const orderNumber = db.generateOrderNumber();

    db.execute(
      `
      INSERT INTO orders (
        id, order_number, session_id, restaurant_id, table_id, items, status, type, total_amount, notes, waiter_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, NULL)
    `,
      [
        orderId,
        orderNumber,
        session.id,
        table.restaurant_id,
        table.id,
        JSON.stringify(orderItems),
        orderType,
        totalAmount,
        notes || null,
      ],
    );

    // Update session total
    db.execute(
      "UPDATE sessions SET total_amount = total_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [totalAmount, session.id],
    );

    // Notify via WebSocket
    webSocketManager.notifyOrderPlaced(
      {
        orderId,
        orderNumber,
        tableId: table.id,
        tableNumber: table.number,
        items: orderItems,
        total: totalAmount,
        type: orderType,
      },
      table.restaurant_id,
    );

    const newOrder = db.queryOne("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);

    res
      .status(201)
      .json({
        success: true,
        data: { ...newOrder, items: orderItems },
        message: "Order placed",
      } as ApiResponse);
  } catch (error) {
    console.error("Create public order error:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Validation error",
          message: error.errors[0].message,
        } as ApiResponse);
    }
    res
      .status(500)
      .json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

const tokenOnlySchema = z.object({ token: z.string().min(1) });

export const handlePublicCallWaiter: RequestHandler = async (req, res) => {
  try {
    const { token } = tokenOnlySchema.parse(req.body);
    const table = db.queryOne("SELECT * FROM tables WHERE qr_code = ?", [
      token,
    ]) as any;
    if (!table)
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" } as ApiResponse);

    webSocketManager.notifyTableActivated(
      table.id,
      table.number,
      table.restaurant_id,
    );
    webSocketManager["broadcastToRoles" as any](
      {
        type: "call_waiter",
        data: {
          tableId: table.id,
          tableNumber: table.number,
          message: "Customer requested assistance",
        },
        timestamp: new Date().toISOString(),
      },
      ["waiter", "manager", "admin"],
      table.restaurant_id,
    );

    res.json({ success: true, message: "Waiter notified" } as ApiResponse);
  } catch (error) {
    console.error("Public call waiter error:", error);
    res
      .status(500)
      .json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

export const handlePublicRequestPayment: RequestHandler = async (req, res) => {
  try {
    const { token } = tokenOnlySchema.parse(req.body);
    const table = db.queryOne("SELECT * FROM tables WHERE qr_code = ?", [
      token,
    ]) as any;
    if (!table)
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" } as ApiResponse);

    webSocketManager["broadcastToRoles" as any](
      {
        type: "payment_requested",
        data: { tableId: table.id, tableNumber: table.number },
        timestamp: new Date().toISOString(),
      },
      ["waiter", "manager", "admin"],
      table.restaurant_id,
    );

    res.json({ success: true, message: "Payment request sent" } as ApiResponse);
  } catch (error) {
    console.error("Public request payment error:", error);
    res
      .status(500)
      .json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};

// Public session summary (by table token)
export const handleGetPublicSessionSummary: RequestHandler = async (
  req,
  res,
) => {
  try {
    const token = String(req.query.token || "");
    if (!token)
      return res
        .status(400)
        .json({
          success: false,
          error: "Table token is required",
        } as ApiResponse);

    const table = db.queryOne("SELECT * FROM tables WHERE qr_code = ?", [
      token,
    ]) as any;
    if (!table)
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" } as ApiResponse);

    const session = db.queryOne(
      "SELECT * FROM sessions WHERE table_id = ? AND restaurant_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1",
      [table.id, table.restaurant_id, "active"],
    ) as Session | undefined;

    if (!session) {
      return res.json({
        success: true,
        data: {
          totalAmount: 0,
          paymentStatus: "none",
          hasActiveSession: false,
        },
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        totalAmount: session.total_amount,
        paymentStatus: session.payment_status,
        hasActiveSession: true,
        sessionId: session.id,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Get public session summary error:", error);
    res
      .status(500)
      .json({ success: false, error: "Internal server error" } as ApiResponse);
  }
};
