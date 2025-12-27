import { getDb } from "../../db/database";

const db = getDb();
import { Category } from "../../types/restaurantType/Category";

/**
 * Add Category
 */
export const addCategory = (data: {
  category_code: number;
  description: string;
  sub_description?: string;
  short_name?: string;
  is_active?: number;
}): Category => {

  if (!data.category_code) {
    throw new Error("Category code is required");
  }

  if (!data.description) {
    throw new Error("Category description is required");
  }

  const exists = db.prepare(`
    SELECT id FROM category WHERE category_code = ?
  `).get(data.category_code);

  if (exists) {
    throw new Error("Category code already exists");
  }

  const result = db.prepare(`
    INSERT INTO category 
    (category_code, description, sub_description, short_name, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    data.category_code,
    data.description,
    data.sub_description ?? null,
    data.short_name ?? null,
    data.is_active ?? 1
  );

  return db.prepare(`
    SELECT * FROM category WHERE id = ?
  `).get(result.lastInsertRowid) as Category;
};

/**
 * Get All Categories
 */
export const getAllCategories = (): Category[] => {
  return db.prepare(`
    SELECT * FROM category
    ORDER BY category_code ASC
  `).all() as Category[];
};

/**
 * Get Single Category
 */
export const getCategoryById = (id: number): Category => {
  if (!id) {
    throw new Error("Category id is required");
  }

  const row = db.prepare(`
    SELECT * FROM category WHERE id = ?
  `).get(id) as Category | undefined;

  if (!row) {
    throw new Error("Category not found");
  }

  return row;
};

/**
 * Update Category
 */
export const updateCategory = (payload :{
  id: number,
  data: {
    description?: string;
    sub_description?: string;
    short_name?: string;
    is_active?: number;
  }
}): Category => {
    const {id,data} = payload;

  if (!id) {
    throw new Error("Category id is required");
  }

  db.prepare(`
    UPDATE category SET
      description = COALESCE(?, description),
      sub_description = COALESCE(?, sub_description),
      short_name = COALESCE(?, short_name),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    data.description ?? null,
    data.sub_description ?? null,
    data.short_name ?? null,
    data.is_active ?? null,
    id
  );

  return getCategoryById(id);
};

/**
 * Delete Category
 */
export const deleteCategory = (id: number): void => {
  if (!id) {
    throw new Error("Category id is required");
  }

  db.prepare(`
    DELETE FROM category WHERE id = ?
  `).run(id);
};
