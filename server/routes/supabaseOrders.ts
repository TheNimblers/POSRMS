import { RequestHandler } from "express";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";

// Create order
export const handleCreateOrder: RequestHandler = async (req, res) => {
  try {
    const {
      session_id,
      table_id,
      menu_item_id,
      quantity,
      notes,
      special_instructions,
    } = req.body;
    const userId = (req as any).user?.userId;

    if (!session_id || !table_id || !menu_item_id || !quantity) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          id: uuidv4(),
          session_id,
          table_id,
          menu_item_id,
          quantity,
          notes,
          special_instructions,
          ordered_by: userId,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get orders
export const handleGetOrders: RequestHandler = async (req, res) => {
  try {
    const { table_id, status, session_id } = req.query;
    const restaurantId = (req as any).user?.restaurantId;

    let query = supabase.from("orders").select(
      `*,
        menu_items(name, category, price),
        sessions(table_id, status)
      `,
    );

    if (status) {
      query = query.eq("status", status);
    }

    if (session_id) {
      query = query.eq("session_id", session_id);
    }

    if (table_id) {
      query = query.eq("table_id", table_id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get single order
export const handleGetOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabase
      .from("orders")
      .select(
        `*,
        menu_items(name, category, price),
        sessions(table_id, status)
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update order status
export const handleUpdateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, error: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete order
export const handleDeleteOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get order analytics
export const handleGetOrderAnalytics: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;

    // Get total orders
    const { data: orders } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .eq("status", "served");

    // Get top items
    const { data: topItems } = await supabase
      .from("orders")
      .select("menu_item_id, quantity")
      .eq("status", "served");

    res.json({
      success: true,
      data: {
        totalOrders: orders?.length || 0,
        topItems,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Mark session as paid
export const handleMarkSessionPaid: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data, error } = await supabase
      .from("sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Mark session paid error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
