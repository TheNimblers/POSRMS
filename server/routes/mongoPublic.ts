import { RequestHandler } from "express";
import { RequestHandler } from "express";
import { getMongoDb } from "../mongo";
import { v4 as uuidv4 } from "uuid";

export const handleStartPublicSession: RequestHandler = async (req, res) => {
  try {
    const { token } = req.body as { token: string };
    const db = getMongoDb();
    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });

    const table = await db.collection("tables").findOne({ qr_code: token });
    if (!table)
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" });

    const active = await db
      .collection("sessions")
      .findOne({ table_id: table.id, status: "active" });
    if (active)
      return res.json({ success: true, data: { sessionId: active.id } });

    const session = {
      id: uuidv4(),
      table_id: table.id,
      restaurant_id: table.restaurant_id,
      start_time: new Date().toISOString(),
      total_amount: 0,
      customer_count: 0,
      status: "active",
      payment_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.collection("sessions").insertOne(session);
    res.json({ success: true, data: { sessionId: session.id } });
  } catch (e) {
    console.error("Mongo start session error", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetPublicMenu: RequestHandler = async (req, res) => {
  try {
    const token = (req.query.token as string) || "";
    const db = getMongoDb();
    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });

    const table = await db.collection("tables").findOne({ qr_code: token });
    if (!table)
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" });

    const items = await db
      .collection("menu_items")
      .find({ restaurant_id: table.restaurant_id, available: true })
      .sort({ category: 1, name: 1 })
      .toArray();

    const restaurant = await db
      .collection("restaurants")
      .findOne(
        { id: table.restaurant_id },
        { projection: { name: 1, currency: 1, tax_rate: 1 } },
      );

    const byCategory: Record<string, any[]> = {};
    for (const it of items) {
      byCategory[it.category] = byCategory[it.category] || [];
      byCategory[it.category].push(it);
    }

    res.json({
      success: true,
      data: {
        restaurant: {
          name: restaurant?.name,
          currency: restaurant?.currency,
          taxRate: restaurant?.tax_rate,
        },
        table: { id: table.id, number: table.number, capacity: table.capacity },
        menu: byCategory,
      },
    });
  } catch (e) {
    console.error("Mongo get public menu error", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetPublicSessionSummary: RequestHandler = async (
  req,
  res,
) => {
  try {
    const token = (req.query.token as string) || "";
    const db = getMongoDb();
    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });

    const table = await db.collection("tables").findOne({ qr_code: token });
    if (!table)
      return res
        .status(404)
        .json({ success: false, error: "Invalid table token" });

    const session = await db
      .collection("sessions")
      .findOne({ table_id: table.id, status: "active" });
    if (!session)
      return res
        .status(404)
        .json({ success: false, error: "No active session" });

    const orders = await db
      .collection("orders")
      .find({ session_id: session.id })
      .toArray();
    const total = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    res.json({ success: true, data: { session, total, orders } });
  } catch (e) {
    console.error("Mongo session summary error", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleCreatePublicOrder: RequestHandler = async (req, res) => {
  try {
    const { sessionId, items, type, notes } = req.body as any;
    const db = getMongoDb();
    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });

    const session = await db
      .collection("sessions")
      .findOne({ id: sessionId, status: "active" });
    if (!session)
      return res.status(404).json({ success: false, error: "Invalid session" });

    const total = items.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0,
    );
    const order = {
      id: uuidv4(),
      order_number: `ORD-${Date.now().toString().slice(-6)}`,
      session_id: sessionId,
      restaurant_id: session.restaurant_id,
      table_id: session.table_id,
      items,
      status: "new",
      type: type || "food",
      total_amount: total,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.collection("orders").insertOne(order);

    await db
      .collection("sessions")
      .updateOne(
        { id: sessionId },
        { $set: { updated_at: new Date().toISOString() } },
      );
    res
      .status(201)
      .json({
        success: true,
        data: { orderId: order.id, total: order.total_amount },
      });
  } catch (e) {
    console.error("Mongo create order error", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handlePublicCallWaiter: RequestHandler = async (req, res) => {
  res.json({ success: true, message: "Waiter notified" });
};

export const handlePublicRequestPayment: RequestHandler = async (req, res) => {
  res.json({ success: true, message: "Payment requested" });
};
