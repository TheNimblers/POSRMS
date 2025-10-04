import { RequestHandler } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getMongoDb } from "../mongo";
import { webSocketManager } from "../websocket";

const createMenuItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z
    .string()
    .trim()
    .max(800, "Description too long")
    .optional()
    .transform((value) => value || undefined),
  category: z.string().trim().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive"),
  currency: z
    .string()
    .trim()
    .min(1)
    .max(12)
    .optional()
    .transform((value) => value || undefined),
  available: z.boolean().optional(),
  special: z.boolean().optional(),
  preparationTime: z.number().min(1).max(480).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  imageUrl: z
    .string()
    .url("Image must be a valid URL")
    .optional()
    .transform((value) => value || undefined),
});

const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  price: z.number().min(0).optional(),
});

const normalizeTags = (tags?: string[]) => {
  if (!tags || tags.length === 0) return [] as string[];
  const unique = new Set<string>();
  tags.forEach((tag) => {
    const trimmed = tag.trim();
    if (trimmed) {
      unique.add(trimmed);
    }
  });
  return Array.from(unique);
};

const mapMenuItem = (doc: any) => {
  if (!doc) return doc;
  return {
    id: doc.id,
    restaurantId: doc.restaurant_id,
    name: doc.name,
    description: doc.description ?? null,
    category: doc.category,
    price: doc.price,
    currency: doc.currency,
    available: doc.available,
    special: doc.special ?? false,
    preparationTime: doc.preparation_time ?? null,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    imageUrl: doc.image_url ?? null,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    lastUpdatedBy: doc.last_updated_by ?? null,
  };
};

export const handleGetMenuItems: RequestHandler = async (req, res) => {
  try {
    const db = getMongoDb();
    const restaurantId = (req as any).user?.restaurantId;
    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });
    if (!restaurantId)
      return res
        .status(400)
        .json({ success: false, error: "Missing restaurant context" });

    const {
      category,
      available,
      special,
      search,
      tag,
      limit = "100",
      offset = "0",
    } = req.query;

    const query: Record<string, any> = { restaurant_id: restaurantId };

    if (typeof category === "string" && category.trim()) {
      query.category = category.trim();
    }

    if (typeof available === "string") {
      query.available = available === "true";
    }

    if (typeof special === "string") {
      query.special = special === "true";
    }

    if (typeof tag === "string" && tag.trim()) {
      query.tags = tag.trim();
    }

    if (typeof search === "string" && search.trim()) {
      const pattern = new RegExp(search.trim(), "i");
      query.$or = [
        { name: { $regex: pattern } },
        { description: { $regex: pattern } },
        { tags: { $regex: pattern } },
      ];
    }

    const numericLimit = Math.max(1, Math.min(500, parseInt(limit as string, 10) || 100));
    const numericOffset = Math.max(0, parseInt(offset as string, 10) || 0);

    const collection = db.collection("menu_items");

    const [items, total] = await Promise.all([
      collection
        .find(query)
        .sort({ category: 1, name: 1 })
        .skip(numericOffset)
        .limit(numericLimit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items.map(mapMenuItem),
      pagination: {
        total,
        limit: numericLimit,
        offset: numericOffset,
        hasMore: total > numericOffset + numericLimit,
      },
    });
  } catch (error) {
    console.error("Mongo get menu items error", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleCreateMenuItem: RequestHandler = async (req, res) => {
  try {
    const db = getMongoDb();
    const restaurantId = (req as any).user?.restaurantId;
    const userId = (req as any).user?.userId ?? null;
    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });
    if (!restaurantId)
      return res
        .status(400)
        .json({ success: false, error: "Missing restaurant context" });

    const parsed = createMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: parsed.error.errors[0]?.message,
      });
    }

    const payload = parsed.data;
    const collection = db.collection("menu_items");

    const existing = await collection.findOne({
      restaurant_id: restaurantId,
      name: payload.name,
      category: payload.category,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Menu item with this name already exists in this category",
      });
    }

    const restaurant = await db
      .collection("restaurants")
      .findOne({ id: restaurantId }, { projection: { currency: 1 } });

    const now = new Date().toISOString();
    const document = {
      id: uuidv4(),
      restaurant_id: restaurantId,
      name: payload.name,
      description: payload.description ?? null,
      category: payload.category,
      price: payload.price,
      currency: payload.currency ?? restaurant?.currency ?? "USD",
      available: payload.available ?? true,
      special: payload.special ?? false,
      preparation_time: payload.preparationTime ?? null,
      tags: normalizeTags(payload.tags),
      image_url: payload.imageUrl ?? null,
      created_at: now,
      updated_at: now,
      last_updated_by: userId,
    };

    await collection.insertOne(document);

    webSocketManager.notifyMenuUpdate(
      {
        action: "item_added",
        item: document,
      },
      restaurantId,
    );

    res.status(201).json({
      success: true,
      data: mapMenuItem(document),
      message: "Menu item created successfully",
    });
  } catch (error) {
    console.error("Mongo create menu item error", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleUpdateMenuItem: RequestHandler = async (req, res) => {
  try {
    const db = getMongoDb();
    const restaurantId = (req as any).user?.restaurantId;
    const userId = (req as any).user?.userId ?? null;
    const { itemId } = req.params;

    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });
    if (!restaurantId)
      return res
        .status(400)
        .json({ success: false, error: "Missing restaurant context" });

    const parsed = updateMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: parsed.error.errors[0]?.message,
      });
    }

    const payload = parsed.data;
    const collection = db.collection("menu_items");

    const existing = await collection.findOne({
      id: itemId,
      restaurant_id: restaurantId,
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    if (
      payload.name &&
      payload.name !== existing.name &&
      (await collection.findOne({
        restaurant_id: restaurantId,
        name: payload.name,
        category: payload.category ?? existing.category,
        id: { $ne: itemId },
      }))
    ) {
      return res.status(409).json({
        success: false,
        error: "Menu item with this name already exists in this category",
      });
    }

    const updateDoc: Record<string, any> = {
      updated_at: new Date().toISOString(),
      last_updated_by: userId,
    };

    if (payload.name !== undefined) updateDoc.name = payload.name;
    if (payload.description !== undefined)
      updateDoc.description = payload.description ?? null;
    if (payload.category !== undefined) updateDoc.category = payload.category;
    if (payload.price !== undefined) updateDoc.price = payload.price;
    if (payload.currency !== undefined)
      updateDoc.currency = payload.currency || existing.currency;
    if (payload.available !== undefined) updateDoc.available = payload.available;
    if (payload.special !== undefined) updateDoc.special = payload.special;
    if (payload.preparationTime !== undefined)
      updateDoc.preparation_time = payload.preparationTime ?? null;
    if (payload.tags !== undefined)
      updateDoc.tags = normalizeTags(payload.tags);
    if (payload.imageUrl !== undefined)
      updateDoc.image_url = payload.imageUrl ?? null;

    const result = await collection.findOneAndUpdate(
      { id: itemId, restaurant_id: restaurantId },
      { $set: updateDoc },
      { returnDocument: "after" },
    );

    const updated = result.value;
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    webSocketManager.notifyMenuUpdate(
      {
        action: "item_updated",
        item: updated,
      },
      restaurantId,
    );

    res.json({
      success: true,
      data: mapMenuItem(updated),
      message: "Menu item updated successfully",
    });
  } catch (error) {
    console.error("Mongo update menu item error", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleToggleAvailability: RequestHandler = async (req, res) => {
  try {
    const db = getMongoDb();
    const restaurantId = (req as any).user?.restaurantId;
    const userId = (req as any).user?.userId ?? null;
    const { itemId } = req.params;

    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });
    if (!restaurantId)
      return res
        .status(400)
        .json({ success: false, error: "Missing restaurant context" });

    const collection = db.collection("menu_items");
    const existing = await collection.findOne({
      id: itemId,
      restaurant_id: restaurantId,
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    const updated = {
      available: !existing.available,
      updated_at: new Date().toISOString(),
      last_updated_by: userId,
    };

    await collection.updateOne(
      { id: itemId, restaurant_id: restaurantId },
      { $set: updated },
    );

    webSocketManager.notifyMenuUpdate(
      {
        action: "item_toggled",
        item: { ...existing, ...updated },
      },
      restaurantId,
    );

    res.json({
      success: true,
      data: { ...mapMenuItem(existing), ...updated },
      message: `Menu item ${updated.available ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    console.error("Mongo toggle menu item error", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleDeleteMenuItem: RequestHandler = async (req, res) => {
  try {
    const db = getMongoDb();
    const restaurantId = (req as any).user?.restaurantId;
    const { itemId } = req.params;

    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });
    if (!restaurantId)
      return res
        .status(400)
        .json({ success: false, error: "Missing restaurant context" });

    const collection = db.collection("menu_items");

    const existing = await collection.findOne({
      id: itemId,
      restaurant_id: restaurantId,
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not found" });
    }

    await collection.deleteOne({ id: itemId, restaurant_id: restaurantId });

    webSocketManager.notifyMenuUpdate(
      {
        action: "item_deleted",
        item: existing,
      },
      restaurantId,
    );

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Mongo delete menu item error", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleGetCategories: RequestHandler = async (req, res) => {
  try {
    const db = getMongoDb();
    const restaurantId = (req as any).user?.restaurantId;
    if (!db)
      return res.status(500).json({ success: false, error: "DB not ready" });
    if (!restaurantId)
      return res
        .status(400)
        .json({ success: false, error: "Missing restaurant context" });

    const collection = db.collection("menu_items");
    const categories = await collection
      .aggregate([
        { $match: { restaurant_id: restaurantId } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    res.json({
      success: true,
      data: categories.map((cat) => ({
        category: cat._id,
        count: cat.count,
      })),
    });
  } catch (error) {
    console.error("Mongo get menu categories error", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
