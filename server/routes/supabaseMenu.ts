import { RequestHandler } from "express";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";

// Get all menu items
export const handleGetMenuItems: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const { category } = req.query;

    if (!restaurantId) {
      return res
        .status(400)
        .json({ success: false, error: "Restaurant ID required" });
    }

    let query = supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("name", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get single menu item
export const handleGetMenuItem: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (error) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get menu item error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create menu item
export const handleCreateMenuItem: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const {
      name,
      category,
      price,
      description,
      preparation_time,
      tags,
      special,
    } = req.body;

    if (!name || !category || !price) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert([
        {
          id: uuidv4(),
          restaurant_id: restaurantId,
          name,
          category,
          price,
          currency: "EUR",
          description,
          preparation_time,
          tags,
          special: special || false,
          available: true,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Create menu item error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update menu item
export const handleUpdateMenuItem: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, price, description, preparation_time, tags, special } =
      req.body;

    const { data, error } = await supabase
      .from("menu_items")
      .update({
        ...(name && { name }),
        ...(price && { price }),
        ...(description && { description }),
        ...(preparation_time && { preparation_time }),
        ...(tags && { tags }),
        ...(special !== undefined && { special }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Toggle menu item availability
export const handleToggleAvailability: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;

    // First get the current item
    const { data: item, error: getError } = await supabase
      .from("menu_items")
      .select("available")
      .eq("id", itemId)
      .single();

    if (getError) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    const newAvailable = !item.available;

    const { data, error } = await supabase
      .from("menu_items")
      .update({ available: newAvailable, updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .select();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data: data?.[0] });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete menu item
export const handleDeleteMenuItem: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get menu categories
export const handleGetCategories: RequestHandler = async (req, res) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;

    const { data, error } = await supabase
      .from("menu_items")
      .select("category")
      .eq("restaurant_id", restaurantId)
      .distinct();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const categories = data?.map((item: any) => item.category) || [];
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get public menu (no auth required)
export const handleGetPublicMenu: RequestHandler = async (req, res) => {
  try {
    const { qr_code } = req.query;

    if (!qr_code) {
      return res
        .status(400)
        .json({ success: false, error: "QR code required" });
    }

    // Get table from QR code
    const { data: table, error: tableError } = await supabase
      .from("tables")
      .select("restaurant_id")
      .eq("qr_code", qr_code)
      .single();

    if (tableError || !table) {
      return res.status(404).json({ success: false, error: "Invalid QR code" });
    }

    // Get menu items for that restaurant
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", table.restaurant_id)
      .eq("available", true)
      .order("category", { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get public menu error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
