import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closeDatabaseConnection, db } from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.join(__dirname, "migrations");

async function ensureMigrationHistoryTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migration_history (
      id BIGSERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getMigrationFiles() {
  const entries = await fs.readdir(migrationsDirectory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

async function getExecutedMigrations() {
  const result = await db.query<{ filename: string }>(
    "SELECT filename FROM migration_history ORDER BY filename ASC"
  );

  return new Set(result.rows.map((row) => row.filename));
}

async function run() {
  await ensureMigrationHistoryTable();

  const files = await getMigrationFiles();
  const executedMigrations = await getExecutedMigrations();

  for (const filename of files) {
    if (executedMigrations.has(filename)) {
      console.log(`Skipping already executed migration: ${filename}`);
      continue;
    }

    const migrationPath = path.join(migrationsDirectory, filename);
    const sql = await fs.readFile(migrationPath, "utf8");
    const client = await db.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO migration_history (filename) VALUES ($1)", [filename]);
      await client.query("COMMIT");
      console.log(`Executed migration: ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Failed migration: ${filename}`);
      throw error;
    } finally {
      client.release();
    }
  }
}

run()
  .then(async () => {
    console.log("Migrations completed successfully.");
    await closeDatabaseConnection();
  })
  .catch(async (error) => {
    console.error("Migration runner failed.", error);
    await closeDatabaseConnection();
    process.exitCode = 1;
  });
