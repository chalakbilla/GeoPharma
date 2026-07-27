import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { pool } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf8");

const run = async () => {
  console.log("Applying schema to Neon...");
  await pool.query(sql);
  console.log("Done. Tables ready: users, prescriptions.");
  await pool.end();
};

run().catch((err) => {
  console.error("Schema setup failed:", err);
  process.exit(1);
});
