import { getDb } from "../../db/database";

const db = getDb();
import { RestaurantTable } from "../../types/restaurantType/RestaurantTable";

/**
 * Add Restaurant Table
 */
export const addRestaurantTable = (data: {
  table_code: number;
  table_no: string;
  description?: string;
  is_active?: number;
}): RestaurantTable => {

  if (!data.table_code) {
    throw new Error("Table code is required");
  }

  if (!data.table_no) {
    throw new Error("Table number is required");
  }

  const exists = db.prepare(`
    SELECT id FROM restaurant_table WHERE table_code = ?
  `).get(data.table_code);

  if (exists) {
    throw new Error("Table code already exists");
  }

  const result = db.prepare(`
    INSERT INTO restaurant_table
    (table_code, table_no, description, is_active)
    VALUES (?, ?, ?, ?)
  `).run(
    data.table_code,
    data.table_no,
    data.description ?? null,
    data.is_active ?? 1
  );

  return db.prepare(`
    SELECT * FROM restaurant_table WHERE id = ?
  `).get(result.lastInsertRowid) as RestaurantTable;
};

/**
 * Get All Tables
 */
export const getAllRestaurantTables = (): RestaurantTable[] => {
  return db.prepare(`
    SELECT * FROM restaurant_table
    ORDER BY table_code ASC
  `).all() as RestaurantTable[];
};

/**
 * Get Table by ID
 */
export const getRestaurantTableById = (id: number): RestaurantTable => {
  if (!id) {
    throw new Error("Table id is required");
  }

  const row = db.prepare(`
    SELECT * FROM restaurant_table WHERE id = ?
  `).get(id) as RestaurantTable | undefined;

  if (!row) {
    throw new Error("Table not found");
  }

  return row;
};

/**
 * Update Restaurant Table
 */
export const updateRestaurantTable = (payload :{
  id: number,
  data: {
    table_no?: string;
    description?: string;
    is_active?: number;
  }
}): RestaurantTable => {
const {id,data} = payload;
  if (!id) {
    throw new Error("Table id is required");
  }

  db.prepare(`
    UPDATE restaurant_table SET
      table_no = COALESCE(?, table_no),
      description = COALESCE(?, description),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    data.table_no ?? null,
    data.description ?? null,
    data.is_active ?? null,
    id
  );

  return getRestaurantTableById(id);
};

/**
 * Delete Restaurant Table
 */
export const deleteRestaurantTable = (id: number): void => {
  if (!id) {
    throw new Error("Table id is required");
  }

  const inUse = db.prepare(`
    SELECT id FROM kot WHERE table_id = ? AND status = 'OPEN'
  `).get(id);

  if (inUse) {
    throw new Error("Table has open KOTs, cannot delete");
  }

  db.prepare(`
    DELETE FROM restaurant_table WHERE id = ?
  `).run(id);
};
