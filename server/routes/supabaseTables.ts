import { RequestHandler } from "express";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";

// Get all tables
export const handleGetTables: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ success: false, error: "Restaurant ID required" });
    }

    const { data, error } = await supabase
      .from("tables")
      .select(
        `*,
        assigned_waiter:staff(name, username),
        sessions(id, status, created_at)
      `
      )
      .eq("restaurant_id", restaurantId)
      .order("number", { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get single table
export const handleGetTable: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;

    const { data, error } = await supabase
      .from("tables")
      .select(
        `*,
        assigned_waiter:staff(name, username),
        sessions(id, status, created_at)
      `
      )
      .eq("id", tableId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: "Table not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get table error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create table
export const handleCreateTable: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const { number, capacity, qr_code } = req.body;

    if (!number || !capacity || !qr_code) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const { data, error } = await supabase.from("tables").insert([
      {
        id: uuidv4(),
        restaurant_id: restaurantId,
        number,
        capacity,
        qr_code,
        status: "available",
      },
    ]).select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Create table error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update table
export const handleUpdateTable: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { number, capacity, status } = req.body;

    const { data, error } = await supabase
      .from("tables")
      .update({
        ...(number && { number }),
        ...(capacity && { capacity }),
        ...(status && { status }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", tableId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "Table not found" });
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Update table error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Assign waiter to table
export const handleAssignWaiter: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { waiterId } = req.body;

    if (!waiterId) {
      return res.status(400).json({ success: false, error: "Waiter ID required" });
    }

    const { data, error } = await supabase
      .from("tables")
      .update({
        assigned_waiter_id: waiterId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tableId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Assign waiter error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete table
export const handleDeleteTable: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;

    const { error } = await supabase.from("tables").delete().eq("id", tableId);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: "Table deleted successfully" });
  } catch (error) {
    console.error("Delete table error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get table QR codes
export const handleGetTableQRCodes: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;

    const { data, error } = await supabase
      .from("tables")
      .select("id, number, qr_code")
      .eq("restaurant_id", restaurantId)
      .order("number", { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get QR codes error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Generate QR code
export const handleGenerateQR: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({ success: false, error: "QR code required" });
    }

    const { data, error } = await supabase
      .from("tables")
      .update({ qr_code })
      .eq("id", tableId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
