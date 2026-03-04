import { db } from "../src/lib/db";

async function seed() {
  console.log("Seeding database...");

  // Seed logic will be added after schema is defined in Phase 1

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
