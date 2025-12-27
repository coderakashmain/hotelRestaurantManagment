import { getDb } from "../../db/database";

const db = getDb();
import { GST } from "../../types/gst";

/**
 * Add GST (history based)
 */
export const addGST = (data: {
  gst_percent: number;
  cgst_percent?: number;
  sgst_percent?: number;
  igst_percent?: number;
  effective_from?: string;
  effective_to?: string;
  is_active?: number;
}): GST => {

  if (data.gst_percent === undefined) {
    throw new Error("GST percent is required");
  }

  const result = db.prepare(`
    INSERT INTO gst_management
    (
      gst_percent,
      cgst_percent,
      sgst_percent,
      igst_percent,
      effective_from,
      effective_to,
      is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.gst_percent,
    data.cgst_percent ?? 0,
    data.sgst_percent ?? 0,
    data.igst_percent ?? 0,
    data.effective_from ?? null,
    data.effective_to ?? null,
    data.is_active ?? 1
  );

  return db.prepare(`
    SELECT * FROM gst_management WHERE id = ?
  `).get(result.lastInsertRowid) as GST;
};

/**
 * Get all GST records
 */
export const getAllGST = (): GST[] => {
  return db.prepare(`
    SELECT * FROM gst_management
    ORDER BY created_at DESC
  `).all() as GST[];
};

/**
 * Get active GST
 */
export const getActiveGST = (): GST => {
  const row = db.prepare(`
    SELECT * FROM gst_management
    WHERE is_active = 1
    LIMIT 1
  `).get() as GST | undefined;

  if (!row) {
    throw new Error("Active GST not found");
  }

  return row;
};

/**
 * Update GST (activate / deactivate)
 */
export const updateGST = (
  id: number,
  data: {
    gst_percent?: number;
    cgst_percent?: number;
    sgst_percent?: number;
    igst_percent?: number;
    effective_from?: string;
    effective_to?: string;
    is_active?: number;
  }
): GST => {

  if (!id) {
    throw new Error("GST id is required");
  }

  db.prepare(`
    UPDATE gst_management SET
      gst_percent = COALESCE(?, gst_percent),
      cgst_percent = COALESCE(?, cgst_percent),
      sgst_percent = COALESCE(?, sgst_percent),
      igst_percent = COALESCE(?, igst_percent),
      effective_from = COALESCE(?, effective_from),
      effective_to = COALESCE(?, effective_to),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(
    data.gst_percent ?? null,
    data.cgst_percent ?? null,
    data.sgst_percent ?? null,
    data.igst_percent ?? null,
    data.effective_from ?? null,
    data.effective_to ?? null,
    data.is_active ?? null,
    id
  );

  return db.prepare(`
    SELECT * FROM gst_management WHERE id = ?
  `).get(id) as GST;
};
