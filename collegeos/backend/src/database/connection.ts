import { Pool, type PoolConfig } from "pg";
import { env } from "../config/env.js";

function shouldEnableSsl(connectionString: string) {
  return /neon\.tech/i.test(connectionString) || /sslmode=require/i.test(connectionString);
}

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
};

if (shouldEnableSsl(env.DATABASE_URL)) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

export const db = new Pool(poolConfig);

export async function verifyDatabaseConnection() {
  const client = await db.connect();

  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export async function closeDatabaseConnection() {
  await db.end();
}
