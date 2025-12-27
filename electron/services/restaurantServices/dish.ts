import { getDb } from "../../db/database";

const db = getDb();
import { Dish } from "../../types/restaurantType/Dish";

/**
 * Add Dish
 */
export const addDish = (data: {
  dish_code: number;
  name: string;
  category_id: number;
  full_plate_rate?: number;
  half_plate_rate?: number;
  is_active?: number;
}): Dish => {

  if (!data.dish_code) {
    throw new Error("Dish code is required");
  }

  if (!data.name) {
    throw new Error("Dish name is required");
  }

  if (!data.category_id) {
    throw new Error("Category is required");
  }

  const exists = db.prepare(`
    SELECT id FROM dish WHERE dish_code = ?
  `).get(data.dish_code);

  if (exists) {
    throw new Error("Dish code already exists");
  }

  const categoryExists = db.prepare(`
    SELECT id FROM category WHERE id = ?
  `).get(data.category_id);

  if (!categoryExists) {
    throw new Error("Invalid category");
  }

  const result = db.prepare(`
    INSERT INTO dish
    (dish_code, name, category_id, full_plate_rate, half_plate_rate, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.dish_code,
    data.name,
    data.category_id,
    data.full_plate_rate ?? 0,
    data.half_plate_rate ?? 0,
    data.is_active ?? 1
  );

  return db.prepare(`
    SELECT * FROM dish WHERE id = ?
  `).get(result.lastInsertRowid) as Dish;
};

/**
 * Get All Dishes
 */
export const getAllDishes = (): Dish[] => {
  return db.prepare(`
    SELECT d.*, c.description AS category_name
    FROM dish d
    JOIN category c ON c.id = d.category_id
    ORDER BY d.dish_code ASC
  `).all() as Dish[];
};

/**
 * Get Dish by ID
 */
export const getDishById = (id: number): Dish => {
  if (!id) {
    throw new Error("Dish id is required");
  }

  const row = db.prepare(`
    SELECT * FROM dish WHERE id = ?
  `).get(id) as Dish | undefined;

  if (!row) {
    throw new Error("Dish not found");
  }

  return row;
};

/**
 * Update Dish
 */
export const updateDish = (payload :{
  id: number,
  data: {
    name?: string;
    category_id?: number;
    full_plate_rate?: number;
    half_plate_rate?: number;
    is_active?: number;
  }
}): Dish => {
    const {id,data} = payload;

  if (!id) {
    throw new Error("Dish id is required");
  }

  if (data.category_id) {
    const cat = db.prepare(`
      SELECT id FROM category WHERE id = ?
    `).get(data.category_id);

    if (!cat) {
      throw new Error("Invalid category");
    }
  }

  db.prepare(`
    UPDATE dish SET
      name = COALESCE(?, name),
      category_id = COALESCE(?, category_id),
      full_plate_rate = COALESCE(?, full_plate_rate),
      half_plate_rate = COALESCE(?, half_plate_rate),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    data.name ?? null,
    data.category_id ?? null,
    data.full_plate_rate ?? null,
    data.half_plate_rate ?? null,
    data.is_active ?? null,
    id
  );

  return getDishById(id);
};

/**
 * Delete Dish
 */
export const deleteDish = (id: number): void => {
  if (!id) {
    throw new Error("Dish id is required");
  }

  db.prepare(`
    DELETE FROM dish WHERE id = ?
  `).run(id);
};
