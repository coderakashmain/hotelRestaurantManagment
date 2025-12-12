import { app } from "electron";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { schema } from "./schema";

let db: Database.Database;

export function initDatabase() {
  const dbFolder = path.join(app.getPath("userData"), "hotelrestaurentmanagment");

  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  } 

  const DB_PATH = path.join(dbFolder, "hotelmanagment.db");

  db = new Database(DB_PATH);

  db.exec(`PRAGMA foreign_keys = ON;`);
  db.exec(schema);
console.log("This is tha path : ",DB_PATH)

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

