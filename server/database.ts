import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// When running in Mongo-only mode we avoid loading better-sqlite3 (native bindings)
const useMongoOnly = process.env.USE_MONGODB_ONLY === "true";
const SALT_ROUNDS = 10;

if (!useMongoOnly) {
  console.warn(
    "WARNING: SQLite support is disabled in this build. To enable SQLite, unset USE_MONGODB_ONLY and ensure better-sqlite3 native bindings are available.",
  );
}

class StubDatabaseService {
  public query(): any {
    throw new Error(
      "SQLite is disabled in this deployment (USE_MONGODB_ONLY=true)",
    );
  }
  public queryOne(): any {
    throw new Error(
      "SQLite is disabled in this deployment (USE_MONGODB_ONLY=true)",
    );
  }
  public execute(): any {
    throw new Error(
      "SQLite is disabled in this deployment (USE_MONGODB_ONLY=true)",
    );
  }
  public transaction(): any {
    throw new Error(
      "SQLite is disabled in this deployment (USE_MONGODB_ONLY=true)",
    );
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

// Graceful shutdown hook (no-op for stub)
process.on("SIGTERM", () => {
  try {
    db.close();
  } catch {}
});
process.on("SIGINT", () => {
  try {
    db.close();
  } catch {}
});
