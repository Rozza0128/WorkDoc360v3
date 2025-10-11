import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Exported variables (assigned below). We export top-level so bundlers
// don't encounter 'export' keywords in nested blocks which breaks esbuild.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let pool: any = undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let db: any = undefined;

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DATABASE_URL not set — starting in development mode without a real database. DB operations will throw if called.');

    const missingDbError = () => {
      throw new Error('DATABASE_URL is not set. Set DATABASE_URL to a Postgres connection string to enable DB operations.');
    };

    // Provide proxies that throw when used.
    pool = new Proxy({}, { get: () => missingDbError });
    db = new Proxy({}, { get: () => (() => missingDbError()) });
  } else {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
  }
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}