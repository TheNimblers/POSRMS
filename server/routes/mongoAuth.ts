import { RequestHandler } from "express";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getMongoDb } from "../mongo";

const JWT_SECRET = process.env.JWT_SECRET || "posrms-demo-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Demo accounts for fallback when database is unavailable
const DEMO_ACCOUNTS = [
  {
    id: "waiter1",
    username: "waiter1",
    password: "password",
    role: "waiter",
    name: "John Doe",
    restaurant_id: "demo-restaurant",
    permissions: ["view_tables", "manage_orders", "update_order_status"],
    status: "active",
  },
  {
    id: "kitchen1",
    username: "kitchen1",
    password: "password",
    role: "kitchen",
    name: "Kitchen Team",
    restaurant_id: "demo-restaurant",
    permissions: ["view_food_orders", "update_food_status"],
    status: "active",
  },
  {
    id: "bar1",
    username: "bar1",
    password: "password",
    role: "bar",
    name: "Bar Team",
    restaurant_id: "demo-restaurant",
    permissions: ["view_drink_orders", "update_drink_status"],
    status: "active",
  },
  {
    id: "manager1",
    username: "manager1",
    password: "password",
    role: "manager",
    name: "Alice Johnson",
    restaurant_id: "demo-restaurant",
    permissions: ["view_tables", "manage_orders", "manage_menu", "manage_staff", "view_analytics"],
    status: "active",
  },
  {
    id: "admin1",
    username: "admin1",
    password: "password",
    role: "admin",
    name: "Bob Wilson",
    restaurant_id: "demo-restaurant",
    permissions: ["full_access"],
    status: "active",
  },
  {
    id: "team1",
    username: "team1",
    password: "password",
    role: "team",
    name: "POSRMS Team Member",
    permissions: ["manage_restaurants", "manage_subscriptions", "view_global_analytics"],
    status: "active",
  },
];

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };
    const db = getMongoDb();

    // If database is not available, use demo accounts
    if (!db) {
      const demoUser = DEMO_ACCOUNTS.find((u) => u.username === username);
      if (!demoUser || demoUser.password !== password) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          userId: demoUser.id,
          username: demoUser.username,
          role: demoUser.role,
          restaurantId: demoUser.restaurant_id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      const { password: _, ...userWithoutPassword } = demoUser;
      return res.json({ success: true, data: { user: userWithoutPassword, token } });
    }

    const user = await db
      .collection("staff")
      .findOne({ username, status: "active" });
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    await db
      .collection("staff")
      .updateOne(
        { _id: user._id },
        { $set: { last_login: new Date().toISOString() } },
      );

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        restaurantId: user.restaurant_id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ success: true, data: { user: userWithoutPassword, token } });
  } catch (e) {
    console.error("Mongo login error", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleLogout: RequestHandler = async (_req, res) => {
  res.json({ success: true, message: "Logged out" });
};

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ success: false, error: "Forbidden" });
    (req as any).user = user;
    next();
  });
};

export const handleProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const db = getMongoDb();

    // If database is not available, use demo accounts
    if (!db) {
      const demoUser = DEMO_ACCOUNTS.find((u) => u.id === userId);
      if (!demoUser)
        return res.status(404).json({ success: false, error: "User not found" });

      const { password: _, ...userWithoutPassword } = demoUser;
      return res.json({ success: true, data: userWithoutPassword });
    }

    const user = await db
      .collection("staff")
      .findOne(
        { id: userId, status: "active" },
        { projection: { password_hash: 0 } },
      );
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, data: user });
  } catch (e) {
    console.error("Mongo profile error", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const requirePermission = (permission: string): RequestHandler => {
  return async (req, res, next) => {
    const authUser = (req as any).user;
    if (!authUser) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = getMongoDb();

    // If database is not available, use demo accounts
    if (!db) {
      const demoUser = DEMO_ACCOUNTS.find((u) => u.id === authUser.userId);
      if (!demoUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const permissions = demoUser.permissions || [];
      if (
        permissions.includes("full_access") ||
        permissions.includes(permission)
      ) {
        return next();
      }

      return res
        .status(403)
        .json({ success: false, error: "Insufficient permissions" });
    }

    const staff = await db.collection("staff").findOne(
      { id: authUser.userId, status: "active" },
      { projection: { permissions: 1 } },
    );

    if (!staff) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const permissions = Array.isArray(staff.permissions) ? staff.permissions : [];
    if (
      permissions.includes("full_access") ||
      permissions.includes(permission)
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, error: "Insufficient permissions" });
  };
};
