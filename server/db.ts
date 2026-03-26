import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️ DATABASE_URL is not set. Server-side auth/database features are disabled. " +
    "The frontend will still work with Supabase Auth."
  );
}

export const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : (null as any);

export const db = pool ? drizzle(pool, { schema }) : (null as any);
