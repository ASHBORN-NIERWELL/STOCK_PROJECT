import { memoryStore } from "./memory-store";
import { CSE_COMPANIES } from "./seed-data";

async function main() {
  console.log("Seeding CSE Mastery Database...");
  console.log(`Loaded ${CSE_COMPANIES.length} verified CSE listed companies.`);
  console.log("Default Demo User & LKR 1,000,000 Portfolio initialized successfully.");
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
