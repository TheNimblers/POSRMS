import { RequestHandler } from "express";
import { db } from "../database";
import { z } from "zod";
import { ApiResponse, Table } from "@shared/database";
import { webSocketManager } from "../websocket";

// Validation schemas
const createTableSchema = z.object({
  number: z.string().min(1, "Table number is required"),
  capacity: z
    .number()
    .min(1, "Capacity must be at least 1")
    .max(20, "Capacity cannot exceed 20"),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

const updateTableSchema = z.object({
  number: z.string().min(1, "Table number is required").optional(),
  capacity: z
    .number()
    .min(1, "Capacity must be at least 1")
    .max(20, "Capacity cannot exceed 20")
    .optional(),
  status: z.enum(["available", "active", "maintenance", "reserved"]).optional(),
  assignedWaiter: z.string().uuid().nullable().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

// Get all tables
export const handleGetTables: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const { status, assignedWaiter } = req.query;

    let whereConditions = ["restaurant_id = ?"];
    let params: any[] = [restaurantId];

    if (status) {
      whereConditions.push("status = ?");
      params.push(status);
    }

    if (assignedWaiter) {
      whereConditions.push("assigned_waiter = ?");
      params.push(assignedWaiter);
    }

    const whereClause = whereConditions.join(" AND ");

    const tables = db.query(
      `
      SELECT 
        t.*,
        s.username as assigned_waiter_name,
        COUNT(CASE WHEN sess.status = 'active' THEN 1 END) as active_sessions
      FROM tables t
      LEFT JOIN staff s ON t.assigned_waiter = s.id
      LEFT JOIN sessions sess ON t.id = sess.table_id AND sess.status = 'active'
      WHERE ${whereClause}
      GROUP BY t.id
      ORDER BY t.number
    `,
      params,
    );

    res.json({
      success: true,
      data: tables,
    } as ApiResponse);
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Get single table
export const handleGetTable: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    const table = db.queryOne(
      `
      SELECT 
        t.*,
        s.username as assigned_waiter_name,
        sess.id as current_session_id,
        sess.start_time,
        sess.customer_count,
        sess.total_amount
      FROM tables t
      LEFT JOIN staff s ON t.assigned_waiter = s.id
      LEFT JOIN sessions sess ON t.id = sess.table_id AND sess.status = 'active'
      WHERE t.id = ? AND t.restaurant_id = ?
    `,
      [parseInt(tableId), restaurantId],
    ) as any;

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      } as ApiResponse);
    }

    // Get recent orders for this table
    const recentOrders = db.query(
      `
      SELECT o.*, sess.start_time as session_start
      FROM orders o
      JOIN sessions sess ON o.session_id = sess.id
      WHERE o.table_id = ? AND o.restaurant_id = ?
      ORDER BY o.created_at DESC
      LIMIT 5
    `,
      [parseInt(tableId), restaurantId],
    );

    // Parse items in orders
    recentOrders.forEach((order: any) => {
      order.items = JSON.parse(order.items || "[]");
    });

    res.json({
      success: true,
      data: {
        ...table,
        recent_orders: recentOrders,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Get table error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Create new table
export const handleCreateTable: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const data = createTableSchema.parse(req.body);

    // Check if table number already exists
    const existingTable = db.queryOne(
      "SELECT id FROM tables WHERE restaurant_id = ? AND number = ?",
      [restaurantId, data.number],
    );

    if (existingTable) {
      return res.status(409).json({
        success: false,
        error: "Table number already exists",
      } as ApiResponse);
    }

    // Generate QR code
    const qrCode = `QR-${data.number}-${Date.now()}`;

    // Create table
    const result = db.execute(
      `
      INSERT INTO tables (
        restaurant_id, number, capacity, qr_code, position_x, position_y
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        restaurantId,
        data.number,
        data.capacity,
        qrCode,
        data.positionX || null,
        data.positionY || null,
      ],
    );

    // Get created table
    const newTable = db.queryOne("SELECT * FROM tables WHERE id = ?", [
      result.lastInsertRowid,
    ]) as Table;

    res.status(201).json({
      success: true,
      data: newTable,
      message: "Table created successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Create table error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: error.errors[0].message,
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Update table
export const handleUpdateTable: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;
    const data = updateTableSchema.parse(req.body);

    // Check if table exists
    const table = db.queryOne(
      "SELECT * FROM tables WHERE id = ? AND restaurant_id = ?",
      [parseInt(tableId), restaurantId],
    ) as Table | undefined;

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      } as ApiResponse);
    }

    // Check if new number conflicts with existing table
    if (data.number && data.number !== table.number) {
      const existingTable = db.queryOne(
        "SELECT id FROM tables WHERE restaurant_id = ? AND number = ? AND id != ?",
        [restaurantId, data.number, parseInt(tableId)],
      );

      if (existingTable) {
        return res.status(409).json({
          success: false,
          error: "Table number already exists",
        } as ApiResponse);
      }
    }

    // If assigning waiter, verify they exist and are active
    if (data.assignedWaiter) {
      const waiter = db.queryOne(
        "SELECT id FROM staff WHERE id = ? AND restaurant_id = ? AND role = ? AND status = ?",
        [data.assignedWaiter, restaurantId, "waiter", "active"],
      );

      if (!waiter) {
        return res.status(404).json({
          success: false,
          error: "Waiter not found or not active",
        } as ApiResponse);
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey =
          key === "assignedWaiter"
            ? "assigned_waiter"
            : key === "positionX"
              ? "position_x"
              : key === "positionY"
                ? "position_y"
                : key;

        updateFields.push(`${dbKey} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      } as ApiResponse);
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(parseInt(tableId));

    // Update table
    db.execute(
      `UPDATE tables SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );

    // Get updated table
    const updatedTable = db.queryOne("SELECT * FROM tables WHERE id = ?", [
      parseInt(tableId),
    ]) as Table;

    // Send WebSocket notification if status changed
    if (data.status && data.status !== table.status) {
      webSocketManager.notifyTableActivated(
        parseInt(tableId),
        updatedTable.number,
        restaurantId,
      );
    }

    res.json({
      success: true,
      data: updatedTable,
      message: "Table updated successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Update table error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: error.errors[0].message,
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Assign waiter to table
export const handleAssignWaiter: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { waiterId } = req.body;
    const restaurantId = (req as any).user?.restaurantId;
    const currentUserId = (req as any).user?.userId;

    // Verify table exists
    const table = db.queryOne(
      "SELECT * FROM tables WHERE id = ? AND restaurant_id = ?",
      [parseInt(tableId), restaurantId],
    ) as Table | undefined;

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      } as ApiResponse);
    }

    // If waiterId is provided, verify waiter exists
    if (waiterId) {
      const waiter = db.queryOne(
        "SELECT id FROM staff WHERE id = ? AND restaurant_id = ? AND role = ? AND status = ?",
        [waiterId, restaurantId, "waiter", "active"],
      );

      if (!waiter) {
        return res.status(404).json({
          success: false,
          error: "Waiter not found or not active",
        } as ApiResponse);
      }
    }

    // Update table assignment
    db.execute(
      "UPDATE tables SET assigned_waiter = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [waiterId || null, parseInt(tableId)],
    );

    // Get updated table
    const updatedTable = db.queryOne(
      `
      SELECT t.*, s.username as assigned_waiter_name
      FROM tables t
      LEFT JOIN staff s ON t.assigned_waiter = s.id
      WHERE t.id = ?
    `,
      [parseInt(tableId)],
    ) as any;

    res.json({
      success: true,
      data: updatedTable,
      message: waiterId
        ? "Waiter assigned successfully"
        : "Waiter unassigned successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Assign waiter error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Generate new QR code for table
export const handleGenerateQR: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    // Verify table exists
    const table = db.queryOne(
      "SELECT * FROM tables WHERE id = ? AND restaurant_id = ?",
      [parseInt(tableId), restaurantId],
    ) as Table | undefined;

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      } as ApiResponse);
    }

    // Generate new QR code
    const qrCode = `QR-${table.number}-${Date.now()}`;

    // Update table
    db.execute(
      "UPDATE tables SET qr_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [qrCode, parseInt(tableId)],
    );

    res.json({
      success: true,
      data: { qr_code: qrCode },
      message: "QR code generated successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Delete table
export const handleDeleteTable: RequestHandler = async (req, res) => {
  try {
    const { tableId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    // Check if table has active sessions
    const activeSessions = db.queryOne(
      "SELECT COUNT(*) as count FROM sessions WHERE table_id = ? AND status = ?",
      [parseInt(tableId), "active"],
    ) as { count: number };

    if (activeSessions.count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete table with active sessions",
      } as ApiResponse);
    }

    // Delete table
    const result = db.execute(
      "DELETE FROM tables WHERE id = ? AND restaurant_id = ?",
      [parseInt(tableId), restaurantId],
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: "Table deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Delete table error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Get table QR codes (for download)
export const handleGetTableQRCodes: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;

    const tables = db.query(
      "SELECT id, number, qr_code FROM tables WHERE restaurant_id = ? ORDER BY number",
      [restaurantId],
    );

    // In a real implementation, you would generate actual QR code images
    // For now, we'll return the data needed to generate them client-side
    const qrData = tables.map((table: any) => ({
      tableId: table.id,
      tableNumber: table.number,
      qrCode: table.qr_code,
      orderUrl: `${process.env.FRONTEND_URL || "http://localhost:8080"}/order?token=${table.qr_code}`,
    }));

    res.json({
      success: true,
      data: qrData,
    } as ApiResponse);
  } catch (error) {
    console.error("Get QR codes error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};
