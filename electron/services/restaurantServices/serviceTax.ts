import { getDb } from "../../db/database";

const db = getDb();
import { ServiceTax } from "../../types/restaurantType/ServiceTax";

/**
 * Add Service Tax (history based)
 */
export const addServiceTax = (data: {
  service_tax_percent: number;
  effective_from?: string;
  effective_to?: string;
  is_active?: number;
}): ServiceTax => {

  if (data.service_tax_percent === undefined) {
    throw new Error("Service tax percent is required");
  }

  const result = db.prepare(`
    INSERT INTO service_tax_management
    (
      service_tax_percent,
      effective_from,
      effective_to,
      is_active
    )
    VALUES (?, ?, ?, ?)
  `).run(
    data.service_tax_percent,
    data.effective_from ?? null,
    data.effective_to ?? null,
    data.is_active ?? 1
  );

  return db.prepare(`
    SELECT * FROM service_tax_management WHERE id = ?
  `).get(result.lastInsertRowid) as ServiceTax;
};

/**
 * Get all Service Tax records
 */
export const getAllServiceTaxes = (): ServiceTax[] => {
  return db.prepare(`
    SELECT * FROM service_tax_management
    ORDER BY created_at DESC
  `).all() as ServiceTax[];
};

/**
 * Get active Service Tax
 */
export const getActiveServiceTax = (): ServiceTax => {
  const row = db.prepare(`
    SELECT * FROM service_tax_management
    WHERE is_active = 1
    LIMIT 1
  `).get() as ServiceTax | undefined;

  if (!row) {
    throw new Error("Active service tax not found");
  }

  return row;
};

/**
 * Update Service Tax (activate / deactivate)
 */
export const updateServiceTax = (payload :{
  id: number,
  data: {
    service_tax_percent?: number;
    effective_from?: string;
    effective_to?: string;
    is_active?: number;
  }
}): ServiceTax => {
const {id,data} = payload;
  if (!id) {
    throw new Error("Service tax id is required");
  }

  db.prepare(`
    UPDATE service_tax_management SET
      service_tax_percent = COALESCE(?, service_tax_percent),
      effective_from = COALESCE(?, effective_from),
      effective_to = COALESCE(?, effective_to),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    data.service_tax_percent ?? null,
    data.effective_from ?? null,
    data.effective_to ?? null,
    data.is_active ?? null,
    id
  );

  return db.prepare(`
    SELECT * FROM service_tax_management WHERE id = ?
  `).get(id) as ServiceTax;
};
