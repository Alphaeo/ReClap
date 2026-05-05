import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | undefined;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    _db = drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  return _db;
}

// Proxy so neon() is only called on first actual DB access, not at import time
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop: string | symbol) {
    return Reflect.get(getDb(), prop);
  },
});
