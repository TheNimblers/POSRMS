import { RequestHandler } from "express";
import { db } from "../database";
import { z } from "zod";
import { ApiResponse, MenuItem } from "../../shared/database";
import { webSocketManager } from "../websocket";

// Validation schemas
const createMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum([
    "starter",
    "main",
    "dessert",
    "drink",
    "wine",
    "beer",
    "cocktail",
    "special",
  ]),
  priceEur: z.number().min(0, "Price must be positive"),
  priceUsd: z.number().min(0, "Price must be positive"),
  preparationTime: z
    .number()
    .min(1, "Preparation time must be at least 1 minute")
    .max(180, "Preparation time cannot exceed 3 hours"),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
});

const updateMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  category: z
    .enum([
      "starter",
      "main",
      "dessert",
      "drink",
      "wine",
      "beer",
      "cocktail",
      "special",
    ])
    .optional(),
  priceEur: z.number().min(0, "Price must be positive").optional(),
  priceUsd: z.number().min(0, "Price must be positive").optional(),
  available: z.boolean().optional(),
  special: z.boolean().optional(),
  preparationTime: z.number().min(1).max(180).optional(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
});

// Get all menu items
export const handleGetMenuItems: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const {
      category,
      available,
      special,
      search,
      limit = "100",
      offset = "0",
    } = req.query;

    let whereConditions = ["restaurant_id = ?"];
    let params: any[] = [restaurantId];

    if (category) {
      whereConditions.push("category = ?");
      params.push(category);
    }

    if (available !== undefined) {
      whereConditions.push("available = ?");
      params.push(available === "true");
    }

    if (special !== undefined) {
      whereConditions.push("special = ?");
      params.push(special === "true");
    }

    if (search) {
      whereConditions.push("(name LIKE ? OR description LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.join(" AND ");

    const menuItems = db.query(
      `
      SELECT * FROM menu_items 
      WHERE ${whereClause}
      ORDER BY category, name
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit as string), parseInt(offset as string)],
    );

    // Parse JSON fields
    menuItems.forEach((item: any) => {
      item.allergens = JSON.parse(item.allergens || "[]");
      item.ingredients = JSON.parse(item.ingredients || "[]");
    });

    // Get total count
    const totalResult = db.queryOne(
      `SELECT COUNT(*) as count FROM menu_items WHERE ${whereClause}`,
      params,
    ) as { count: number };

    res.json({
      success: true,
      data: menuItems,
      pagination: {
        total: totalResult.count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore:
          totalResult.count >
          parseInt(offset as string) + parseInt(limit as string),
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Get public menu (for customers)
export const handleGetPublicMenu: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Table token is required",
      } as ApiResponse);
    }

    // Find table by QR code token
    const table = db.queryOne("SELECT * FROM tables WHERE qr_code = ?", [
      token,
    ]) as any;

    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Invalid table token",
      } as ApiResponse);
    }

    // Get available menu items for this restaurant
    const menuItems = db.query(
      "SELECT * FROM menu_items WHERE restaurant_id = ? AND available = true ORDER BY category, name",
      [table.restaurant_id],
    );

    // Parse JSON fields and group by category
    const menuByCategory: Record<string, any[]> = {};

    menuItems.forEach((item: any) => {
      item.allergens = JSON.parse(item.allergens || "[]");
      item.ingredients = JSON.parse(item.ingredients || "[]");

      if (!menuByCategory[item.category]) {
        menuByCategory[item.category] = [];
      }
      menuByCategory[item.category].push(item);
    });

    // Get restaurant info for currency settings
    const restaurant = db.queryOne(
      "SELECT name, currency, tax_rate FROM restaurants WHERE id = ?",
      [table.restaurant_id],
    ) as any;

    res.json({
      success: true,
      data: {
        restaurant: {
          name: restaurant.name,
          currency: restaurant.currency,
          taxRate: restaurant.tax_rate,
        },
        table: {
          id: table.id,
          number: table.number,
          capacity: table.capacity,
        },
        menu: menuByCategory,
        categories: Object.keys(menuByCategory),
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Get public menu error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Get single menu item
export const handleGetMenuItem: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    const menuItem = db.queryOne(
      "SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ?",
      [itemId, restaurantId],
    ) as any;

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      } as ApiResponse);
    }

    // Parse JSON fields
    menuItem.allergens = JSON.parse(menuItem.allergens || "[]");
    menuItem.ingredients = JSON.parse(menuItem.ingredients || "[]");

    res.json({
      success: true,
      data: menuItem,
    } as ApiResponse);
  } catch (error) {
    console.error("Get menu item error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Create new menu item
export const handleCreateMenuItem: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const data = createMenuItemSchema.parse(req.body);

    // Check if item name already exists in this category
    const existingItem = db.queryOne(
      "SELECT id FROM menu_items WHERE restaurant_id = ? AND name = ? AND category = ?",
      [restaurantId, data.name, data.category],
    );

    if (existingItem) {
      return res.status(409).json({
        success: false,
        error: "Menu item with this name already exists in this category",
      } as ApiResponse);
    }

    // Create menu item
    const itemId = db.generateId();
    db.execute(
      `
      INSERT INTO menu_items (
        id, restaurant_id, name, description, category, price_eur, price_usd,
        preparation_time, allergens, ingredients, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        itemId,
        restaurantId,
        data.name,
        data.description || null,
        data.category,
        data.priceEur,
        data.priceUsd,
        data.preparationTime,
        JSON.stringify(data.allergens || []),
        JSON.stringify(data.ingredients || []),
        data.imageUrl || null,
      ],
    );

    // Get created item
    const newItem = db.queryOne("SELECT * FROM menu_items WHERE id = ?", [
      itemId,
    ]) as any;

    // Parse JSON fields
    newItem.allergens = JSON.parse(newItem.allergens || "[]");
    newItem.ingredients = JSON.parse(newItem.ingredients || "[]");

    // Notify staff about menu update
    webSocketManager.notifyMenuUpdate(
      {
        action: "item_added",
        item: newItem,
      },
      restaurantId,
    );

    res.status(201).json({
      success: true,
      data: newItem,
      message: "Menu item created successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Create menu item error:", error);

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

// Update menu item
export const handleUpdateMenuItem: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;
    const data = updateMenuItemSchema.parse(req.body);

    // Check if item exists
    const item = db.queryOne(
      "SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ?",
      [itemId, restaurantId],
    ) as MenuItem | undefined;

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      } as ApiResponse);
    }

    // Check for name conflicts if name is being changed
    if (data.name && data.name !== item.name) {
      const existingItem = db.queryOne(
        "SELECT id FROM menu_items WHERE restaurant_id = ? AND name = ? AND category = ? AND id != ?",
        [restaurantId, data.name, data.category || item.category, itemId],
      );

      if (existingItem) {
        return res.status(409).json({
          success: false,
          error: "Menu item with this name already exists in this category",
        } as ApiResponse);
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey =
          key === "priceEur"
            ? "price_eur"
            : key === "priceUsd"
              ? "price_usd"
              : key === "preparationTime"
                ? "preparation_time"
                : key === "imageUrl"
                  ? "image_url"
                  : key;

        updateFields.push(`${dbKey} = ?`);

        // Handle JSON fields
        if (key === "allergens" || key === "ingredients") {
          updateValues.push(JSON.stringify(value));
        } else {
          updateValues.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      } as ApiResponse);
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(itemId);

    // Update item
    db.execute(
      `UPDATE menu_items SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );

    // Get updated item
    const updatedItem = db.queryOne("SELECT * FROM menu_items WHERE id = ?", [
      itemId,
    ]) as any;

    // Parse JSON fields
    updatedItem.allergens = JSON.parse(updatedItem.allergens || "[]");
    updatedItem.ingredients = JSON.parse(updatedItem.ingredients || "[]");

    // Notify staff about menu update
    webSocketManager.notifyMenuUpdate(
      {
        action: "item_updated",
        item: updatedItem,
      },
      restaurantId,
    );

    res.json({
      success: true,
      data: updatedItem,
      message: "Menu item updated successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Update menu item error:", error);

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

// Toggle menu item availability
export const handleToggleAvailability: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    // Get current item
    const item = db.queryOne(
      "SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ?",
      [itemId, restaurantId],
    ) as any;

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      } as ApiResponse);
    }

    // Toggle availability
    const newAvailability = !item.available;
    db.execute(
      "UPDATE menu_items SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newAvailability, itemId],
    );

    // Get updated item
    const updatedItem = db.queryOne("SELECT * FROM menu_items WHERE id = ?", [
      itemId,
    ]) as any;

    updatedItem.allergens = JSON.parse(updatedItem.allergens || "[]");
    updatedItem.ingredients = JSON.parse(updatedItem.ingredients || "[]");

    // Notify staff about availability change
    webSocketManager.notifyMenuUpdate(
      {
        action: "availability_changed",
        item: updatedItem,
      },
      restaurantId,
    );

    res.json({
      success: true,
      data: updatedItem,
      message: `Menu item ${newAvailability ? "enabled" : "disabled"} successfully`,
    } as ApiResponse);
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Delete menu item
export const handleDeleteMenuItem: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const restaurantId = (req as any).user?.restaurantId;

    // Check if item is used in any active orders
    const activeOrders = db.query(
      `
      SELECT o.id 
      FROM orders o
      WHERE o.restaurant_id = ? 
        AND o.status IN ('new', 'preparing', 'ready')
        AND JSON_EXTRACT(o.items, '$[*].menu_item_id') LIKE '%${itemId}%'
    `,
      [restaurantId],
    );

    if (activeOrders.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete menu item with active orders",
      } as ApiResponse);
    }

    // Delete item
    const result = db.execute(
      "DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?",
      [itemId, restaurantId],
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      } as ApiResponse);
    }

    // Notify staff about menu update
    webSocketManager.notifyMenuUpdate(
      {
        action: "item_deleted",
        itemId,
      },
      restaurantId,
    );

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Get menu categories
export const handleGetCategories: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;

    const categories = db.query(
      `
      SELECT 
        category,
        COUNT(*) as item_count,
        COUNT(CASE WHEN available = true THEN 1 END) as available_count,
        AVG(price_usd) as avg_price
      FROM menu_items 
      WHERE restaurant_id = ?
      GROUP BY category
      ORDER BY category
    `,
      [restaurantId],
    );

    res.json({
      success: true,
      data: categories,
    } as ApiResponse);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};
