import fs from "fs";
import path from "path";
import { app } from "electron";
import Database from "better-sqlite3";

export function seedDishes(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  const seeded = db
    .prepare("SELECT value FROM app_meta WHERE key = 'dish_seeded'")
    .get() as any;

  if (seeded?.value === "1") return;

  const filePath = app.isPackaged
    ? path.join(process.resourcesPath, "dish_seed.json")
    : path.join(process.cwd(), "public", "dish_seed.json");



  if (!fs.existsSync(filePath)) {
    console.error("Seed file not found:", filePath);
    return;
  }

  const rows = JSON.parse(fs.readFileSync(filePath, "utf-8"));



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

  const tx = db.transaction(() => {
    for (const r of rows) {
      insert.run(
        r.DISH_CODE,
        r.DISH_NAME,
        r.CAT_CODE,
        r.DISH_PRICE_HALF,
        r.DISH_PRICE_FULL
      );
    }
  });

  tx();

  db.prepare(`
    INSERT INTO app_meta (key, value)
    VALUES ('dish_seeded', '1')
  `).run();


}


