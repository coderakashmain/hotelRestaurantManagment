import { getDb } from "../db/database";

const db = getDb();

type DailyEntryInput = {
  report_date: string;

  entry_type: "BILL" | "ADVANCE" | "MR" | "REFUND" | "ADJUSTMENT";

  reference_no: string;

  room_id?: number;

  base_amount?: number;
  tax_amount?: number;

  payment_amount: number;

  direction: "CR" | "DR"; // 🔑 very important

  payment_mode?: "CASH" | "UPI" | "CARD" | "BANK";

  source_type?: "BILL" | "MR" | "REFUND";
  source_id?: number;

  particulars?: string;

  created_by?: number;
};


/* ================================
   CREATE ENTRY
================================ */
export const addDailyEntry = (data: DailyEntryInput) => {
  if (!data.report_date) {
    throw new Error("Report date is required");
  }

  if (!data.payment_amount || data.payment_amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  if (!data.direction) {
    throw new Error("CR / DR direction is required");
  }

  // 🔒 Block entry if day is closed
  const locked = db.prepare(`
    SELECT 1 FROM daily_report
    WHERE report_date = ?
      AND status = 'CLOSED'
  `).get(data.report_date);

  if (locked) {
    throw new Error("Day is closed. Cannot add entry.");
  }

  return db.prepare(`
    INSERT INTO daily_collection_register (
      report_date,
      entry_type,
      source_type,
      source_id,
      reference_no,
      room_id,
      base_amount,
      tax_amount,
      payment_amount,
      direction,
      payment_mode,
      particulars,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.report_date,
    data.entry_type,
    data.source_type || null,
    data.source_id || null,
    data.reference_no,
    data.room_id || null,
    data.base_amount || 0,
    data.tax_amount || 0,
    data.payment_amount,
    data.direction,
    data.payment_mode || "CASH",
    data.particulars || "",
    data.created_by || null
  );
};


/* ================================
   GET DAILY REGISTER + SUMMARY
================================ */
export const getDailyRegister = (payload: string | { date: string }) => {
  const date = typeof payload === "string" ? payload : payload.date;

  const entries = db.prepare(`
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

  const summary = db.prepare(`
    SELECT
      SUM(CASE WHEN direction = 'CR' THEN payment_amount ELSE 0 END) AS total_receipt,
      SUM(CASE WHEN direction = 'DR' THEN payment_amount ELSE 0 END) AS total_payment,

      SUM(CASE WHEN payment_mode = 'CASH' AND direction = 'CR' THEN payment_amount ELSE 0 END) AS cash_in,
      SUM(CASE WHEN payment_mode = 'CASH' AND direction = 'DR' THEN payment_amount ELSE 0 END) AS cash_out,

      SUM(CASE WHEN payment_mode = 'UPI' AND direction = 'CR' THEN payment_amount ELSE 0 END) AS upi_total,
      SUM(CASE WHEN payment_mode = 'CARD' AND direction = 'CR' THEN payment_amount ELSE 0 END) AS card_total
    FROM daily_collection_register
    WHERE report_date = ?
  `).get(date);

  return { entries, summary };
};

/* ================================
   REVERSE ENTRY (AUDIT SAFE)
================================ */
export const reverseDailyEntry = (data :{id: number, userId: number}) => {
  const {id,userId} = data;
  const entry = db.prepare(`
    SELECT * FROM daily_collection_register WHERE id = ?
  `).get(id) as any;

  if (!entry) {
    throw new Error("Entry not found");
  }

  return addDailyEntry({
    report_date: entry.report_date,
    entry_type: "ADJUSTMENT",
    reference_no: `REV-${entry.reference_no}`,
    room_id: entry.room_id,
    payment_amount: entry.payment_amount,
    direction: entry.direction === "CR" ? "DR" : "CR",
    payment_mode: entry.payment_mode,
    particulars: "Reversal entry",
    created_by: userId,
  });
};
