import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../models/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("Connected to database");

    // Create migration tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrations are in the same folder as migrate.ts
    const migrationsDir = __dirname;

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log("Migration files:", files);

    for (const file of files) {
      const result = await client.query(
        `SELECT 1 FROM schema_migrations WHERE filename = $1`,
        [file]
      );

      if (result.rows.length > 0) {
        console.log(`Already applied: ${file}`);
        continue;
      }

      console.log(`Applying migration: ${file}`);

      const sql = fs.readFileSync(
        path.join(migrationsDir, file),
        "utf8"
      );

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          `INSERT INTO schema_migrations (filename)
           VALUES ($1)`,
          [file]
        );

        await client.query("COMMIT");

        console.log(`Migration applied successfully: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration error:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();