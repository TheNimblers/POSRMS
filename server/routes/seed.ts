import { RequestHandler } from "express";
import { supabase } from "../supabase";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10;

export const handleSeedDemo: RequestHandler = async (req, res) => {
  try {
    // Security check - allow only from localhost or with a secret token
    const seedToken = process.env.SEED_TOKEN || "demo-seed-secret";
    const authToken = req.headers["x-seed-token"] as string;

    if (!authToken || authToken !== seedToken) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized seed request",
      });
    }

    console.log("🌱 Starting demo data seed...");

    // Check Supabase connection
    const { error: testError } = await supabase
      .from("restaurants")
      .select("id")
      .limit(1);

    if (testError) {
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }

    // Create demo restaurant
    const demoRestaurantId = uuidv4();
    const { error: restaurantError } = await supabase
      .from("restaurants")
      .upsert(
        {
          id: demoRestaurantId,
          slug: "demo-restaurant",
          name: "Demo Restaurant",
          subscription_status: "active",
          subscription_plan: "monthly",
          admins: ["admin1"],
          contact_email: "admin@demo-restaurant.com",
          timezone: "Europe/Amsterdam",
          currency: "EUR",
          tax_rate: 8.5,
          service_charge: 15,
        },
        { onConflict: "slug" },
      );

    if (restaurantError) {
      console.error("❌ Error inserting restaurant:", restaurantError);
      throw restaurantError;
    }

    // Create demo staff accounts
    const staffAccounts = [
      {
        id: uuidv4(),
        username: "waiter1",
        password: "password",
        role: "waiter",
        restaurant_id: demoRestaurantId,
        name: "John Doe",
        email: "waiter1@demo.com",
        permissions: ["view_tables", "manage_orders", "update_order_status"],
      },
      {
        id: uuidv4(),
        username: "kitchen1",
        password: "password",
        role: "kitchen",
        restaurant_id: demoRestaurantId,
        name: "Kitchen Team",
        email: "kitchen1@demo.com",
        permissions: ["view_food_orders", "update_food_status"],
      },
      {
        id: uuidv4(),
        username: "bar1",
        password: "password",
        role: "bar",
        restaurant_id: demoRestaurantId,
        name: "Bar Team",
        email: "bar1@demo.com",
        permissions: ["view_drink_orders", "update_drink_status"],
      },
      {
        id: uuidv4(),
        username: "manager1",
        password: "password",
        role: "manager",
        restaurant_id: demoRestaurantId,
        name: "Alice Johnson",
        email: "manager1@demo.com",
        permissions: [
          "view_tables",
          "manage_orders",
          "manage_menu",
          "manage_staff",
          "view_analytics",
        ],
      },
      {
        id: uuidv4(),
        username: "admin1",
        password: "password",
        role: "admin",
        restaurant_id: demoRestaurantId,
        name: "Bob Wilson",
        email: "admin1@demo.com",
        permissions: ["full_access"],
      },
      {
        id: uuidv4(),
        username: "team1",
        password: "password",
        role: "team",
        name: "POSRMS Team Member",
        email: "team1@posrms.com",
        permissions: [
          "manage_restaurants",
          "manage_subscriptions",
          "view_global_analytics",
        ],
      },
    ];

    // Hash passwords and insert staff
    const staffWithHashes = staffAccounts.map((staff) => ({
      id: staff.id,
      username: staff.username,
      password_hash: bcrypt.hashSync(staff.password, SALT_ROUNDS),
      role: staff.role,
      restaurant_id: staff.restaurant_id,
      name: staff.name,
      email: staff.email,
      permissions: staff.permissions,
      status: "active",
    }));

    const { error: staffError } = await supabase
      .from("staff")
      .upsert(staffWithHashes, { onConflict: "username" });

    if (staffError) {
      console.error("❌ Error inserting staff:", staffError);
      throw staffError;
    }

    // Create demo tables
    const tables = [
      { number: "T1", capacity: 4, qr_code: "QR-T1" },
      { number: "T2", capacity: 2, qr_code: "QR-T2" },
      { number: "T3", capacity: 6, qr_code: "QR-T3" },
      { number: "T4", capacity: 4, qr_code: "QR-T4" },
    ];

    const tablesWithIds = tables.map((table) => ({
      id: uuidv4(),
      restaurant_id: demoRestaurantId,
      ...table,
    }));

    const { error: tablesError } = await supabase
      .from("tables")
      .upsert(tablesWithIds, { onConflict: "qr_code" });

    if (tablesError) {
      console.error("❌ Error inserting tables:", tablesError);
      throw tablesError;
    }

    console.log("✅ Demo data seeded successfully!");

    res.json({
      success: true,
      message: "Demo data seeded successfully!",
      data: {
        restaurant: demoRestaurantId,
        staffCount: staffWithHashes.length,
        tableCount: tables.length,
        demoAccounts: [
          { username: "waiter1", password: "password", role: "waiter" },
          { username: "kitchen1", password: "password", role: "kitchen" },
          { username: "bar1", password: "password", role: "bar" },
          { username: "manager1", password: "password", role: "manager" },
          { username: "admin1", password: "password", role: "admin" },
          { username: "team1", password: "password", role: "team" },
        ],
      },
    });
  } catch (error) {
    console.error("❌ Seed error:", error);
    res.status(500).json({
      success: false,
      error: "Seed failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
