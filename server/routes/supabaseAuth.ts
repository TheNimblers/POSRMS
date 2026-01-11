import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../supabase";

const JWT_SECRET = process.env.JWT_SECRET || "posrms-demo-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const SALT_ROUNDS = 10;

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    // Query staff table
    const { data: user, error } = await supabase
      .from("staff")
      .select("*")
      .eq("username", username)
      .eq("status", "active")
      .single();

    if (error || !user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Update last login
    await supabase
      .from("staff")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Generate JWT token
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

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    console.error("Supabase login error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const handleLogout: RequestHandler = async (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    (req as any).user = user;
    next();
  });
};

export const handleProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId;

    const { data: user, error } = await supabase
      .from("staff")
      .select(
        "id, username, role, name, email, restaurant_id, permissions, status, created_at",
      )
      .eq("id", userId)
      .eq("status", "active")
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Supabase profile error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const requirePermission = (permission: string): RequestHandler => {
  return async (req, res, next) => {
    const authUser = (req as any).user;

    if (!authUser) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const { data: staff, error } = await supabase
        .from("staff")
        .select("permissions")
        .eq("id", authUser.userId)
        .eq("status", "active")
        .single();

      if (error || !staff) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      const permissions = Array.isArray(staff.permissions)
        ? staff.permissions
        : [];

      if (
        permissions.includes("full_access") ||
        permissions.includes(permission)
      ) {
        return next();
      }

      return res
        .status(403)
        .json({ success: false, error: "Insufficient permissions" });
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compareSync(password, hash);
}
