import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// Check if a real DATABASE_URL is configured
const connectionString = process.env.DATABASE_URL;
const isDemoMode = process.env.USE_DEMO_DATA === "true" || !connectionString || connectionString.includes("sample");

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  if (!isDemoMode && connectionString) {
    try {
      const pool = new Pool({ connectionString });
      dbInstance = drizzle(pool, { schema });
      return dbInstance;
    } catch (err) {
      console.warn("Neon Database connection failed, falling back to in-memory demo store:", err);
    }
  }

  // Demo / In-Memory Mock Store for Zero-Setup Development
  return null;
}

export const db = getDb();
export { schema };
