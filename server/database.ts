import { createTableQueries, createIndexQueries } from "../shared/database";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

// Database configuration
const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "data", "posrms.db");
const SALT_ROUNDS = 10;

class DatabaseService {
  private db: Database.Database | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Initialize SQLite database
      this.db = new Database(DB_PATH);
      this.db.pragma("journal_mode = WAL");
      this.db.pragma("foreign_keys = ON");

      // Create tables
      this.createTables();
      this.createIndexes();
      this.seedDatabase();

      console.log(`📦 Database initialized at: ${DB_PATH}`);
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  private createTables() {
    if (!this.db) throw new Error("Database not initialized");

    for (const [tableName, query] of Object.entries(createTableQueries)) {
      try {
        this.db.exec(query);
        console.log(`✅ Table created: ${tableName}`);
      } catch (error) {
        console.error(`❌ Failed to create table ${tableName}:`, error);
        throw error;
      }
    }
  }

  private createIndexes() {
    if (!this.db) throw new Error("Database not initialized");

    for (const query of createIndexQueries) {
      try {
        this.db.exec(query);
      } catch (error) {
        console.error("❌ Failed to create index:", error);
      }
    }
    console.log("✅ Database indexes created");
  }

  private async seedDatabase() {
    if (!this.db) throw new Error("Database not initialized");

    // Check if already seeded
    const restaurantCount = this.db
      .prepare("SELECT COUNT(*) as count FROM restaurants")
      .get() as { count: number };
    if (restaurantCount.count > 0) {
      console.log("📊 Database already seeded");
      return;
    }

    try {
      console.log("🌱 Seeding database with initial data...");

      // Create demo restaurant
      const restaurantId = uuidv4();
      const restaurant = {
        id: restaurantId,
        name: "Demo Restaurant",
        slug: "demo-restaurant",
        subscription_status: "active",
        subscription_plan: "monthly",
        admins: JSON.stringify(["admin1"]),
        contact_email: "admin@demo-restaurant.com",
        address: "123 Demo Street, Demo City",
        phone: "+1234567890",
        timezone: "America/New_York",
        currency: "USD",
        tax_rate: 8.5,
        service_charge: 15.0,
        settings: JSON.stringify({
          allow_guest_orders: true,
          max_table_capacity: 12,
          order_timeout_minutes: 30,
          auto_assign_waiters: false,
          require_payment_confirmation: true,
          enable_tips: true,
          enable_reviews: true,
          kitchen_display_timeout: 45,
          bar_display_timeout: 30,
        }),
      };

      this.db
        .prepare(
          `
        INSERT INTO restaurants (
          id, name, slug, subscription_status, subscription_plan, admins,
          contact_email, address, phone, timezone, currency, tax_rate,
          service_charge, settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          restaurant.id,
          restaurant.name,
          restaurant.slug,
          restaurant.subscription_status,
          restaurant.subscription_plan,
          restaurant.admins,
          restaurant.contact_email,
          restaurant.address,
          restaurant.phone,
          restaurant.timezone,
          restaurant.currency,
          restaurant.tax_rate,
          restaurant.service_charge,
          restaurant.settings,
        );

      // Create demo staff
      const staff = [
        {
          id: "waiter1",
          username: "waiter1",
          password: "password",
          role: "waiter",
          name: "John Doe",
          email: "john@demo.com",
          permissions: JSON.stringify([
            "view_tables",
            "manage_orders",
            "update_order_status",
          ]),
          shift: "evening",
        },
        {
          id: "waiter2",
          username: "waiter2",
          password: "password",
          role: "waiter",
          name: "Jane Smith",
          email: "jane@demo.com",
          permissions: JSON.stringify([
            "view_tables",
            "manage_orders",
            "update_order_status",
          ]),
          shift: "day",
        },
        {
          id: "kitchen1",
          username: "kitchen1",
          password: "password",
          role: "kitchen",
          name: "Mike Johnson",
          email: "mike@demo.com",
          permissions: JSON.stringify([
            "view_food_orders",
            "update_food_status",
          ]),
          shift: "evening",
        },
        {
          id: "bar1",
          username: "bar1",
          password: "password",
          role: "bar",
          name: "Sarah Wilson",
          email: "sarah@demo.com",
          permissions: JSON.stringify([
            "view_drink_orders",
            "update_drink_status",
          ]),
          shift: "day",
        },
        {
          id: "manager1",
          username: "manager1",
          password: "password",
          role: "manager",
          name: "Alice Johnson",
          email: "alice@demo.com",
          permissions: JSON.stringify([
            "view_tables",
            "manage_orders",
            "manage_menu",
            "manage_staff",
            "view_analytics",
          ]),
          shift: "day",
        },
        {
          id: "admin1",
          username: "admin1",
          password: "password",
          role: "admin",
          name: "Bob Wilson",
          email: "bob@demo.com",
          permissions: JSON.stringify(["full_access"]),
          shift: "day",
        },
        {
          id: "team1",
          username: "team1",
          password: "password",
          role: "team",
          name: "POSRMS Team Member",
          email: "team@posrms.com",
          permissions: JSON.stringify([
            "manage_restaurants",
            "manage_subscriptions",
            "view_global_analytics",
          ]),
        },
      ];

      for (const member of staff) {
        const passwordHash = bcrypt.hashSync(member.password, SALT_ROUNDS);
        this.db
          .prepare(
            `
          INSERT INTO staff (
            id, username, password_hash, role, restaurant_id, name, email,
            permissions, shift
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          )
          .run(
            member.id,
            member.username,
            passwordHash,
            member.role,
            member.role === "team" ? null : restaurantId,
            member.name,
            member.email,
            member.permissions,
            member.shift || null,
          );
      }

      // Create demo tables
      const tables = [
        { number: "T1", capacity: 4, qr_code: "QR-T1" },
        { number: "T2", capacity: 2, qr_code: "QR-T2" },
        { number: "T3", capacity: 6, qr_code: "QR-T3" },
        { number: "T4", capacity: 4, qr_code: "QR-T4" },
        { number: "T5", capacity: 8, qr_code: "QR-T5" },
      ];

      for (const table of tables) {
        this.db
          .prepare(
            `
          INSERT INTO tables (restaurant_id, number, capacity, qr_code)
          VALUES (?, ?, ?, ?)
        `,
          )
          .run(restaurantId, table.number, table.capacity, table.qr_code);
      }

      // Create demo menu items
      const menuItems = [
        {
          id: uuidv4(),
          name: "Grilled Salmon",
          description: "Fresh Atlantic salmon with herbs and lemon",
          category: "main",
          price_eur: 24.5,
          price_usd: 26.5,
          preparation_time: 25,
        },
        {
          id: uuidv4(),
          name: "Beef Tenderloin",
          description: "Premium beef with seasonal vegetables",
          category: "main",
          price_eur: 32.0,
          price_usd: 35.0,
          special: true,
          preparation_time: 30,
        },
        {
          id: uuidv4(),
          name: "Truffle Pasta",
          description: "Handmade pasta with black truffle and parmesan",
          category: "main",
          price_eur: 28.0,
          price_usd: 30.5,
          special: true,
          preparation_time: 20,
        },
        {
          id: uuidv4(),
          name: "Caesar Salad",
          description: "Classic Caesar with crispy croutons and parmesan",
          category: "starter",
          price_eur: 14.5,
          price_usd: 16.0,
          preparation_time: 10,
        },
        {
          id: uuidv4(),
          name: "House Wine Red",
          description: "Smooth red wine from local vineyard",
          category: "wine",
          price_eur: 8.5,
          price_usd: 9.5,
          preparation_time: 2,
        },
        {
          id: uuidv4(),
          name: "Craft Beer IPA",
          description: "Local brewery hoppy IPA",
          category: "beer",
          price_eur: 6.5,
          price_usd: 7.0,
          preparation_time: 2,
        },
        {
          id: uuidv4(),
          name: "Signature Cocktail",
          description: "Chef's special cocktail with premium spirits",
          category: "cocktail",
          price_eur: 12.0,
          price_usd: 13.5,
          special: true,
          preparation_time: 8,
        },
      ];

      for (const item of menuItems) {
        this.db
          .prepare(
            `
          INSERT INTO menu_items (
            id, restaurant_id, name, description, category, price_eur, price_usd,
            special, preparation_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          )
          .run(
            item.id,
            restaurantId,
            item.name,
            item.description,
            item.category,
            item.price_eur,
            item.price_usd,
            item.special || false,
            item.preparation_time,
          );
      }

      console.log("✅ Database seeded successfully");
    } catch (error) {
      console.error("❌ Database seeding failed:", error);
      throw error;
    }
  }

  // Query methods
  public query(sql: string, params: any[] = []) {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.prepare(sql).all(...params);
  }

  public queryOne(sql: string, params: any[] = []) {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.prepare(sql).get(...params);
  }

  public execute(sql: string, params: any[] = []) {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.prepare(sql).run(...params);
  }

  public transaction(fn: () => void) {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.transaction(fn)();
  }

  public close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log("📦 Database connection closed");
    }
  }

  // Helper methods for common operations
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hashSync(password, SALT_ROUNDS);
  }

  public async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(password, hash);
  }

  public generateId(): string {
    return uuidv4();
  }

  public generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}

export const db = new DatabaseService();

// Graceful shutdown
process.on("SIGTERM", () => {
  db.close();
});

process.on("SIGINT", () => {
  db.close();
});
