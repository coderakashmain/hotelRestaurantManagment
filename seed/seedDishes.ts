import fs from "fs";
import path from "path";
import { app } from "electron";
import Database from "better-sqlite3";

export function seedDishes(db: Database.Database) {
  // 1️⃣ Ensure app_meta exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  console.log('sdfksldkfklsdfllsdflskfsldfkr..........................')

  // 2️⃣ Check seed flag
  const seeded = db
    .prepare("SELECT value FROM app_meta WHERE key = 'dish_seeded'")
    .get() as any;

  if (seeded?.value === "1") {
    console.log("ℹ️ Dishes already seeded");
    return;
  }

  // 3️⃣ Resolve path
  const basePath = app.isPackaged
    ? process.resourcesPath
    : process.cwd();

  const filePath = path.join(basePath, "seed", "dish_seed.json");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Seed file not found:", filePath);
    return;
  }

  const rows = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // 4️⃣ Prepare insert
  const insert = db.prepare(`
    INSERT INTO dish (
      dish_code,
      name,
      category_id,
      half_plate_rate,
      full_plate_rate
    ) VALUES (
      ?, ?,
      (SELECT id FROM category WHERE category_code = ?),
      ?, ?
    )
  `);

  // 5️⃣ Transaction
  const tx = db.transaction(() => {
    for (const r of rows) {
      insert.run(
        r.DISH_CODE,         // ✅ FIXED
        r.DISH_NAME,         // ✅ FIXED
        r.CAT_CODE,          // ✅ OK
        r.DISH_PRICE_HALF,   // ✅ FIXED
        r.DISH_PRICE_FULL    // ✅ FIXED
      );
    }
  });

  tx();

  // 6️⃣ Mark as seeded (ONLY ONCE)
  db.prepare(`
    INSERT INTO app_meta (key, value)
    VALUES ('dish_seeded', '1')
  `).run();

  console.log("✅ Dish seeded & app_meta updated");
}
