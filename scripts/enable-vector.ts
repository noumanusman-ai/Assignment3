import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("pgvector extension enabled successfully");
  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}

main();
