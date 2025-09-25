import { createTableQueries, createIndexQueries } from "../shared/database";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// Database configuration
const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "data", "posrms.db");
const SALT_ROUNDS = 10;
const useMongoOnly = process.env.USE_MONGODB_ONLY === "true";

if (useMongoOnly) {
  console.log("SQLite disabled: running in Mongo-only mode");

  class StubDatabaseService {
    public query(): any {
      throw new Error("SQLite is disabled in Mongo-only mode");
    }
    public queryOne(): any {
      throw new Error("SQLite is disabled in Mongo-only mode");
    }
    public execute(): any {
      throw new Error("SQLite is disabled in Mongo-only mode");
    }
    public transaction(): any {
      throw new Error("SQLite is disabled in Mongo-only mode");
    }
    public close(): void {
      // noop
    }
    public async hashPassword(password: string): Promise<string> {
      return bcrypt.hashSync(password, SALT_ROUNDS);
    }
    public async comparePassword(password: string, hash: string) {
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

  export const db = new StubDatabaseService();
} else {
  // Dynamically import better-sqlite3 so native bindings are only required when actually using SQLite
  const { default: Database } = await import("better-sqlite3");

  class DatabaseService {
    private db: any | null = null;

    constructor() {
      this.initialize();
    }

    private initialize() {
      try {
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = new Database(DB_PATH);
        this.db.pragma("journal_mode = WAL");
        this.db.pragma("foreign_keys = ON");

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

      const restaurantCount = this.db
        .prepare("SELECT COUNT(*) as count FROM restaurants")
        .get() as { count: number };
      if (restaurantCount.count > 0) {
        console.log("📊 Database already seeded");
        return;
      }

      try {
        console.log("🌱 Seeding database with initial data...");

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