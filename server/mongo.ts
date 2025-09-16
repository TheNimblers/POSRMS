import { MongoClient, Db } from "mongodb";

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
    return { client, db };
  } catch (e) {
    console.error("MongoDB connection failed:", e);
    client = null;
    db = null;
    return null;
  }
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
