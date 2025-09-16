import { RequestHandler } from "express";
import { db } from "../database";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { ApiResponse, Staff } from "@shared/database";

const JWT_SECRET = process.env.JWT_SECRET || "posrms-demo-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["waiter", "kitchen", "bar", "manager", "admin"]),
  restaurantId: z.string().uuid("Valid restaurant ID is required"),
  shift: z.enum(["day", "evening", "night"]).optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Login endpoint
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find user in database
    const user = db.queryOne(
      "SELECT * FROM staff WHERE username = ? AND status = ?",
      [username, "active"],
    ) as Staff | undefined;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      } as ApiResponse);
    }

    // Verify password
    const isPasswordValid = await db.comparePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      } as ApiResponse);
    }

    // Update last login
    db.execute("UPDATE staff SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [
      user.id,
    ]);

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
      data: {
        user: userWithoutPassword,
        token,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Login error:", error);

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

// Register endpoint (for managers/admins to create staff)
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if username already exists
    const existingUser = db.queryOne(
      "SELECT id FROM staff WHERE username = ?",
      [data.username],
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Username already exists",
      } as ApiResponse);
    }

    // Check if restaurant exists
    const restaurant = db.queryOne("SELECT id FROM restaurants WHERE id = ?", [
      data.restaurantId,
    ]);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      } as ApiResponse);
    }

    // Hash password
    const passwordHash = await db.hashPassword(data.password);

    // Set permissions based on role
    const permissions = getPermissionsByRole(data.role);

    // Create user
    const userId = db.generateId();
    db.execute(
      `
      INSERT INTO staff (
        id, username, password_hash, role, restaurant_id, name, email,
        permissions, shift, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        userId,
        data.username,
        passwordHash,
        data.role,
        data.restaurantId,
        data.name,
        data.email,
        JSON.stringify(permissions),
        data.shift || null,
        "active",
      ],
    );

    // Get created user
    const newUser = db.queryOne("SELECT * FROM staff WHERE id = ?", [
      userId,
    ]) as Staff;

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: "Staff member created successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Registration error:", error);

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

// Get current user profile
export const handleProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      } as ApiResponse);
    }

    const user = db.queryOne(
      "SELECT * FROM staff WHERE id = ? AND status = ?",
      [userId, "active"],
    ) as Staff | undefined;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    } as ApiResponse);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    } as ApiResponse);
  }
};

// Update password
export const handleUpdatePassword: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = updatePasswordSchema.parse(
      req.body,
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      } as ApiResponse);
    }

    // Get current user
    const user = db.queryOne(
      "SELECT password_hash FROM staff WHERE id = ? AND status = ?",
      [userId, "active"],
    ) as { password_hash: string } | undefined;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    // Verify current password
    const isCurrentPasswordValid = await db.comparePassword(
      currentPassword,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      } as ApiResponse);
    }

    // Hash new password
    const newPasswordHash = await db.hashPassword(newPassword);

    // Update password
    db.execute(
      "UPDATE staff SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newPasswordHash, userId],
    );

    res.json({
      success: true,
      message: "Password updated successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Update password error:", error);

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

// Logout endpoint (client-side token removal)
export const handleLogout: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  } as ApiResponse);
};

// JWT middleware for protected routes
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    } as ApiResponse);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      } as ApiResponse);
    }

    (req as any).user = user;
    next();
  });
};

// Helper function to get permissions by role
function getPermissionsByRole(role: string): string[] {
  switch (role) {
    case "waiter":
      return ["view_tables", "manage_orders", "update_order_status"];
    case "kitchen":
      return ["view_food_orders", "update_food_status"];
    case "bar":
      return ["view_drink_orders", "update_drink_status"];
    case "manager":
      return [
        "view_tables",
        "manage_orders",
        "manage_menu",
        "manage_staff",
        "view_analytics",
      ];
    case "admin":
      return ["full_access"];
    case "team":
      return [
        "manage_restaurants",
        "manage_subscriptions",
        "view_global_analytics",
      ];
    default:
      return [];
  }
}

// Middleware to check permissions
export const requirePermission = (permission: string): RequestHandler => {
  return (req, res, next) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      } as ApiResponse);
    }

    // Get user permissions from database
    const userData = db.queryOne(
      "SELECT permissions FROM staff WHERE id = ? AND status = ?",
      [user.userId, "active"],
    ) as { permissions: string } | undefined;

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    const permissions = JSON.parse(userData.permissions || "[]");

    if (
      permissions.includes("full_access") ||
      permissions.includes(permission)
    ) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      } as ApiResponse);
    }
  };
};
