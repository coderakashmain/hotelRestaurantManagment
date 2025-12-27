import { getDb } from "../db/database";
const db = getDb();

export const GSTService = {
  list(_payload?: any) {
    return db.prepare(`SELECT * FROM gst_management ORDER BY id DESC`).all();
  },

  create(data: any) {
    return db.prepare(`
      INSERT INTO gst_management 
      (gst_percent, cgst_percent, sgst_percent, igst_percent, effective_from, effective_to, is_active)
      VALUES (?,?,?,?,?,?,?)
    `).run(
      data.gst_percent,
      data.cgst_percent,
      data.sgst_percent,
      data.igst_percent,
      data.effective_from,
      data.effective_to || null,
      data.is_active || 0
    );
  },

  update(data: any) {
    return db.prepare(`
      UPDATE gst_management SET 
        cgst_percent = ?, 
        sgst_percent = ?, 
        igst_percent = ?, 
        effective_from = ?, 
        effective_to = ?,
        is_active = ?
      WHERE id = ?
    `).run(
      data.cgst_percent,
      data.sgst_percent,
      data.igst_percent,
      data.effective_from,
      data.effective_to || null,
      data.is_active,
      data.id
    );
  },

  delete(payload: number | { id: number }) {
    const id = typeof payload === "number" ? payload : payload.id;
    return db.prepare(`DELETE FROM gst_management WHERE id = ?`).run(id);
  },

  setActive(payload: number | { id: number }) {
    const id = typeof payload === "number" ? payload : payload.id;
    return db.prepare(`
      UPDATE gst_management SET is_active = 1 WHERE id = ?
    `).run(id);
  }
};
