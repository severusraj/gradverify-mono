import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5432/gradverify";
console.log("Connecting to DB:", DATABASE_URL);

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
