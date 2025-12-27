import { getDb } from "../db/database";

const db = getDb();

/* ================================
   CREATE ENTRY
================================ */
export const addDailyEntry = (data: any) => {
  if (!data.report_date) {
    throw new Error("Report date is required");
  }

  return db.prepare(`
    INSERT INTO daily_collection_register (
      report_date,
      entry_type,
      reference_no,
      room_id,
      base_amount,
      payment_amount,
      payment_mode,
      particulars,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.report_date,
    data.entry_type,
    data.reference_no || "",
    data.room_id || null,
    data.base_amount || 0,
    data.payment_amount || 0,
    data.payment_mode || "CASH",
    data.particulars || "",
    data.created_by || null
  );
};

/* ================================
   GET BY DATE
================================ */
export const getDailyRegister = (payload: string | { date: string }) => {
  const date = typeof payload === "string" ? payload : payload.date;

  return db.prepare(`
    SELECT 
      dcr.*,
      r.room_number,
      u.name AS created_by_name
    FROM daily_collection_register dcr
    LEFT JOIN room r ON r.id = dcr.room_id
    LEFT JOIN user_account u ON u.id = dcr.created_by
    WHERE dcr.report_date = ?
    ORDER BY dcr.created_at ASC
  `).all(date);
};

/* ================================
   DELETE ENTRY (optional)
================================ */
export const deleteDailyEntry = (payload: number | { id: number }) => {
  const id = typeof payload === "number" ? payload : payload.id;

  return db.prepare(`
    DELETE FROM daily_collection_register WHERE id = ?
  `).run(id);
};
