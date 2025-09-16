import { MongoClient, Db } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<{ client: MongoClient; db: Db } | null> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "posrms";
  if (!uri) return null;
  try {
    client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();
    db = client.db(dbName);
    console.log(`🗄️ MongoDB connected to db: ${dbName}`);

    await seedIfNeeded(db);

    return { client, db };
  } catch (e) {
    console.error("MongoDB connection failed:", e);
    client = null;
    db = null;
    return null;
  }
}

async function seedIfNeeded(db: Db) {
  const restaurants = db.collection("restaurants");
  const count = await restaurants.countDocuments();
  if (count > 0) return;

  const restaurantId = uuidv4();
  await restaurants.insertOne({
    id: restaurantId,
    name: "Demo Restaurant",
    slug: "demo-restaurant",
    subscription_status: "active",
    subscription_plan: "monthly",
    admins: ["admin1"],
    contact_email: "admin@demo-restaurant.com",
    timezone: "America/New_York",
    currency: "USD",
    tax_rate: 8.5,
    service_charge: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const tables = db.collection("tables");
  const tableDefs = [
    { number: "T1", capacity: 4, qr_code: "QR-T1" },
    { number: "T2", capacity: 2, qr_code: "QR-T2" },
    { number: "T3", capacity: 6, qr_code: "QR-T3" },
  ];
  for (const t of tableDefs) {
    await tables.insertOne({
      id: uuidv4(),
      restaurant_id: restaurantId,
      number: t.number,
      capacity: t.capacity,
      status: "available",
      qr_code: t.qr_code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const staff = db.collection("staff");
  const hash = bcrypt.hashSync("password", 10);
  await staff.insertMany([
    { id: "waiter1", username: "waiter1", password_hash: hash, role: "waiter", restaurant_id: restaurantId, name: "John Doe", status: "active", permissions: ["view_tables","manage_orders","update_order_status"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "manager1", username: "manager1", password_hash: hash, role: "manager", restaurant_id: restaurantId, name: "Alice Johnson", status: "active", permissions: ["view_tables","manage_orders","manage_menu","manage_staff","view_analytics"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "admin1", username: "admin1", password_hash: hash, role: "admin", restaurant_id: restaurantId, name: "Bob Wilson", status: "active", permissions: ["full_access"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const menu = db.collection("menu_items");
  await menu.insertMany([
    { id: uuidv4(), restaurant_id: restaurantId, name: "Grilled Salmon", description: "Fresh Atlantic salmon", category: "main", price_eur: 24.5, price_usd: 26.5, available: true, special: false, preparation_time: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuidv4(), restaurant_id: restaurantId, name: "Truffle Pasta", description: "Black truffle and parmesan", category: "main", price_eur: 28.0, price_usd: 30.5, available: true, special: true, preparation_time: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuidv4(), restaurant_id: restaurantId, name: "Caesar Salad", description: "Classic Caesar", category: "starter", price_eur: 14.5, price_usd: 16.0, available: true, special: false, preparation_time: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuidv4(), restaurant_id: restaurantId, name: "Signature Cocktail", description: "Chef's cocktail", category: "cocktail", price_eur: 12.0, price_usd: 13.5, available: true, special: true, preparation_time: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  await db.collection("sessions").createIndex({ id: 1 }, { unique: true });
  await db.collection("orders").createIndex({ id: 1 }, { unique: true });
  await db.collection("staff").createIndex({ username: 1 }, { unique: true });
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
