import { getDb } from "../../db/database";

const db = getDb();
import { KOT } from "../../types/restaurantType/KOT";
import { KOTItem } from "../../types/restaurantType/KOTItem";

/**
 * Create KOT
 */
export const createKOT = (data: {
  kot_no: string;
  kot_date: string;
  table_id: number;
  waiter_id: number;
}): KOT => {

  if (!data.kot_no) {
    throw new Error("KOT number is required");
  }

  if (!data.kot_date) {
    throw new Error("KOT date is required");
  }

  if (!data.table_id) {
    throw new Error("Table is required");
  }

  if (!data.waiter_id) {
    throw new Error("Waiter is required");
  }

  const tableExists = db.prepare(`
    SELECT id FROM restaurant_table WHERE id = ? AND is_active = 1
  `).get(data.table_id);

  if (!tableExists) {
    throw new Error("Invalid or inactive table");
  }

  const waiterExists = db.prepare(`
    SELECT id FROM employee WHERE id = ? AND is_active = 1
  `).get(data.waiter_id);

  if (!waiterExists) {
    throw new Error("Invalid or inactive waiter");
  }

  const result = db.prepare(`
    INSERT INTO kot
    (kot_no, kot_date, table_id, waiter_id)
    VALUES (?, ?, ?, ?)
  `).run(
    data.kot_no,
    data.kot_date,
    data.table_id,
    data.waiter_id
  );

  return db.prepare(`
    SELECT * FROM kot WHERE id = ?
  `).get(result.lastInsertRowid) as KOT;
};

/**
 * Add Item to KOT
 */
export const addKOTItem = (data: {
  kot_id: number;
  dish_id: number;
  quantity: number;
}): KOTItem => {

  if (!data.kot_id) {
    throw new Error("KOT id is required");
  }

  if (!data.dish_id) {
    throw new Error("Dish is required");
  }

  if (!data.quantity || data.quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  const kot = db.prepare(`
    SELECT id, status FROM kot WHERE id = ?
  `).get(data.kot_id) as KOT | undefined;

  if (!kot) {
    throw new Error("KOT not found");
  }

  if (kot.status !== "OPEN") {
    throw new Error("Cannot add items to closed KOT");
  }

  const dish = db.prepare(`
    SELECT id, full_plate_rate FROM dish WHERE id = ? AND is_active = 1
  `).get(data.dish_id) as any;

  if (!dish) {
    throw new Error("Invalid or inactive dish");

  }

  // validate quantity (only .0 or .5 allowed)
  const qty = data.quantity;

  if (qty <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (!Number.isInteger(qty * 2)) {
    throw new Error("Please enter a valid quantity (full or half plate only)");
  }

  // calculate quantities
  const fullQty = Math.floor(qty);        // 1.5 -> 1
  const hasHalf = qty % 1 === 0.5;         // true / false

  let rate: number;
  let total = 0;

  // full plates
  if (fullQty > 0) {
    total += fullQty * dish.full_plate_rate;
  }

  // half plate
  if (hasHalf) {
    total += dish.half_plate_rate;
  }

  // rate shown per unit (for UI / printing)
  rate = hasHalf && fullQty === 0
    ? dish.half_plate_rate
    : dish.full_plate_rate;




  const result = db.prepare(`
    INSERT INTO kot_item
    (kot_id, dish_id, quantity, rate, total)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    data.kot_id,
    data.dish_id,
    data.quantity,
    rate,
    total
  );

  return db.prepare(`
    SELECT * FROM kot_item WHERE id = ?
  `).get(result.lastInsertRowid) as KOTItem;
};

/**
 * Get KOT with Items
 */
export const getKOTDetails = (kot_id: number) => {
  if (!kot_id) {
    throw new Error("KOT id is required");
  }

  const kot = db.prepare(`
    SELECT k.*, rt.table_no, e.name AS waiter_name
    FROM kot k
    JOIN restaurant_table rt ON rt.id = k.table_id
    JOIN employee e ON e.id = k.waiter_id
    WHERE k.id = ?
  `).get(kot_id);

  if (!kot) {
    throw new Error("KOT not found");
  }

  const items = db.prepare(`
    SELECT ki.*, d.name AS dish_name,d.dish_code as dish_code
    FROM kot_item ki
    JOIN dish d ON d.id = ki.dish_id
    WHERE ki.kot_id = ?
  `).all(kot_id);

  return {
    kot,
    items
  };
};

/**
 * Close KOT
 */
export const closeKOT = (kot_id: number): void => {
  if (!kot_id) {
    throw new Error("KOT id is required");
  }

  const kot = db.prepare(`
    SELECT status FROM kot WHERE id = ?
  `).get(kot_id) as KOT | undefined;

  if (!kot) {
    throw new Error("KOT not found");
  }

  if (kot.status === "CLOSED") {
    throw new Error("KOT already closed");
  }

  db.prepare(`
    UPDATE kot SET status = 'CLOSED'
    WHERE id = ?
  `).run(kot_id);
};

export const listClosedKOTs = () => {
  return db.prepare(`
    SELECT 
      k.id,
      k.kot_no,
      k.table_id,
      rt.table_no,
      e.name AS waiter_name
    FROM kot k
    JOIN restaurant_table rt ON rt.id = k.table_id
    JOIN employee e ON e.id = k.waiter_id
    WHERE k.status = 'CLOSED'
    ORDER BY k.created_at DESC
  `).all();
};
