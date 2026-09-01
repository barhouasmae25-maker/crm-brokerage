import fs from "fs";
import path from "path";
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DB_URL,
});

async function migrate() {
  await client.connect();

  console.log("Connected to database");

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsPath = path.resolve(
    process.cwd(),
    "../database/migrations"
  );

  const files = fs
    .readdirSync(migrationsPath)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const result = await client.query(
      `
      SELECT id
      FROM schema_migrations
      WHERE filename = $1
      `,
      [file]
    );

    if (result.rows.length > 0) {
      console.log(`Already executed: ${file}`);
      continue;
    }

    console.log(`Running migration: ${file}`);

    const sql = fs.readFileSync(
      path.join(migrationsPath, file),
      "utf8"
    );

    try {
      await client.query("BEGIN");

      await client.query(sql);

      await client.query(
        `
        INSERT INTO schema_migrations (filename)
        VALUES ($1)
        `,
        [file]
      );

      await client.query("COMMIT");

      console.log(`Migration completed: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(`Migration failed: ${file}`);

      throw error;
    }
  }

  await client.end();

  console.log("All migrations completed");
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});