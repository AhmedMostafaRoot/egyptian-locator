import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import path from "path";

// ضمان مسار ملف SQLite المحلي إذا لم يتوفر DATABASE_URL
const dbPath = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), "local.db")}`;

const client = createClient({
  url: dbPath,
});

export const db = drizzle(client, { schema });

