import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getMongoDb } from "../mongo";

const JWT_SECRET = process.env.JWT_SECRET || "posrms-demo-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const db = getMongoDb();
    if (!db) return res.status(500).json({ success: false, error: "DB not ready" });

    const user = await db.collection("staff").findOne({ username, status: "active" });
    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ success: false, error: "Invalid credentials" });

    await db.collection("staff").updateOne({ _id: user._id }, { $set: { last_login: new Date().toISOString() } });

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
  if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: "Forbidden" });
    (req as any).user = user;
    next();
  });
};

export const handleProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const db = getMongoDb();
    if (!db) return res.status(500).json({ success: false, error: "DB not ready" });

    const user = await db.collection("staff").findOne({ id: userId, status: "active" }, { projection: { password_hash: 0 } });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, data: user });
  } catch (e) {
    console.error("Mongo profile error", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
