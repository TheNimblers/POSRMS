import { MongoClient, Db } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

type StaffRole = "waiter" | "kitchen" | "bar" | "manager" | "admin" | "team";

interface RestaurantSeed {
  slug: string;
  name: string;
  subscription_status: string;
  subscription_plan: string;
  admins: string[];
  contact_email: string;
  timezone: string;
  currency: string;
  tax_rate: number;
  service_charge: number;
}

interface StaffSeed {
  id: string;
  username: string;
  password: string;
  role: StaffRole;
  restaurant_id?: string;
  name: string;
  permissions: string[];
  status?: "active" | "inactive";
}

const SALT_ROUNDS = 10;

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<{
  client: MongoClient;
  db: Db;
} | null> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "posrms";
  if (!uri) return null;
  try {
    client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();
    db = client.db(dbName);
    console.log(`🗄️ MongoDB connected to db: ${dbName}`);

    await seedCoreData(db);

    return { client, db };
  } catch (e) {
    console.error("MongoDB connection failed:", e);
    client = null;
    db = null;
    return null;
  }
}

async function seedCoreData(database: Db) {
  await ensureIndexes(database);

  const demoRestaurantId = await ensureRestaurant(database, {
    slug: "demo-restaurant",
    name: "Demo Restaurant",
    subscription_status: "active",
    subscription_plan: "monthly",
    admins: ["admin1"],
    contact_email: "admin@demo-restaurant.com",
    timezone: "America/New_York",
    currency: "USD",
    tax_rate: 8.5,
    service_charge: 15,
  });

  await ensureStaffAccount(database, {
    id: "waiter1",
    username: "waiter1",
    password: "password",
    role: "waiter",
    restaurant_id: demoRestaurantId,
    name: "John Doe",
    permissions: ["view_tables", "manage_orders", "update_order_status"],
  });

  await ensureStaffAccount(database, {
    id: "manager1",
    username: "manager1",
    password: "password",
    role: "manager",
    restaurant_id: demoRestaurantId,
    name: "Alice Johnson",
    permissions: [
      "view_tables",
      "manage_orders",
      "manage_menu",
      "manage_staff",
      "view_analytics",
    ],
  });

  await ensureStaffAccount(database, {
    id: "admin1",
    username: "admin1",
    password: "password",
    role: "admin",
    restaurant_id: demoRestaurantId,
    name: "Bob Wilson",
    permissions: ["full_access"],
  });

  const bajwaRestaurantId = await ensureRestaurant(database, {
    slug: "bajwa-dhaba",
    name: "Bajwa Dhaba",
    subscription_status: "active",
    subscription_plan: "annual",
    admins: ["BajwaManager"],
    contact_email: "info@bajwadhaba.com",
    timezone: "Asia/Karachi",
    currency: "PKR",
    tax_rate: 5,
    service_charge: 10,
  });

  await ensureStaffAccount(database, {
    id: "bajwa-waiter-1001",
    username: "BW1001",
    password: "BW1001",
    role: "waiter",
    restaurant_id: bajwaRestaurantId,
    name: "Bajwa Dhaba Waiter",
    permissions: ["view_tables", "manage_orders", "update_order_status"],
  });

  await ensureStaffAccount(database, {
    id: "bajwa-kitchen",
    username: "BajwaKitchen",
    password: "BK-2025",
    role: "kitchen",
    restaurant_id: bajwaRestaurantId,
    name: "Bajwa Dhaba Kitchen",
    permissions: ["view_food_orders", "update_food_status"],
  });

  await ensureStaffAccount(database, {
    id: "bajwa-manager",
    username: "BajwaManager",
    password: "BM-2025",
    role: "manager",
    restaurant_id: bajwaRestaurantId,
    name: "Bajwa Dhaba Manager",
    permissions: [
      "view_tables",
      "manage_orders",
      "manage_menu",
      "manage_staff",
      "view_analytics",
    ],
  });
}

async function ensureRestaurant(database: Db, seed: RestaurantSeed): Promise<string> {
  const restaurants = database.collection("restaurants");
  const existing = await restaurants.findOne<{ id: string }>({ slug: seed.slug });
  if (existing?.id) {
    return existing.id;
  }

  const now = new Date().toISOString();
  const restaurant = {
    id: uuidv4(),
    ...seed,
    created_at: now,
    updated_at: now,
  };

  await restaurants.insertOne(restaurant);
  return restaurant.id;
}

async function ensureStaffAccount(database: Db, seed: StaffSeed): Promise<string> {
  const staff = database.collection("staff");
  const existing = await staff.findOne<{ id: string }>({ username: seed.username });
  if (existing?.id) {
    return existing.id;
  }

  const now = new Date().toISOString();
  const password_hash = bcrypt.hashSync(seed.password, SALT_ROUNDS);
  const status = seed.status ?? "active";

  const staffMember = {
    id: seed.id,
    username: seed.username,
    password_hash,
    role: seed.role,
    restaurant_id: seed.restaurant_id,
    name: seed.name,
    status,
    permissions: seed.permissions,
    created_at: now,
    updated_at: now,
  };

  await staff.insertOne(staffMember);
  return staffMember.id;
}

async function ensureIndexes(database: Db) {
  await Promise.all([
    database.collection("sessions").createIndex({ id: 1 }, { unique: true }),
    database.collection("orders").createIndex({ id: 1 }, { unique: true }),
    database.collection("staff").createIndex({ username: 1 }, { unique: true }),
    database.collection("restaurants").createIndex({ slug: 1 }, { unique: true }),
  ]);
}

export function getMongoDb(): Db | null {
  return db;
}

export async function closeMongo(): Promise<void> {
  try {
    await client?.close();
  } catch {}
  client = null;
  db = null;
}
