import { getDb } from "../db/database";

const db = getDb();

export const list = (filter?: { active_only?: boolean }) => {
  let sql = "SELECT * FROM bill_type WHERE 1=1";

  if (filter?.active_only) {
    sql += " AND is_active = 1";
  }

  sql += " ORDER BY name ASC";

  return db.prepare(sql).all();
};

export const create = (data: {
  name: string;
  code?: string;
  category?: string;
  gst_applicable?: number;
}) => {
  return db.prepare(
    `INSERT INTO bill_type
      (name, code, category, gst_applicable, is_active, created_at)
     VALUES (?, ?, ?, ?, 1, datetime('now'))`
  ).run(
    data.name,
    data.code ?? null,
    data.category ?? "EXTRA",
    data.gst_applicable ?? 1
  );
};

/* ============================
   UPDATE BILL TYPE  ✅ FIXED
============================ */
export const update = (payload: {
  id: number;
  data: any;
}) => {
  const { id, data } = payload;

  return db.prepare(
    `UPDATE bill_type SET 
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        category = COALESCE(?, category),
        gst_applicable = COALESCE(?, gst_applicable),
        is_active = COALESCE(?, is_active)
     WHERE id = ?`
  ).run(
    data.name ?? null,
    data.code ?? null,
    data.category ?? null,
    data.gst_applicable ?? null,
    data.is_active ?? null,
    id
  );
};

export const remove = (payload: number | { id: number }) => {
  const id = typeof payload === "number" ? payload : payload.id;
  return db.prepare(
    `UPDATE bill_type SET is_active = 0 WHERE id = ?`
  ).run(id);
};
