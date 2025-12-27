// services/reports.ts
import { getDb } from "../db/database";

const db = getDb();

export const getDailyRevenue = (payload: string | { date: string }) => {
  const date = typeof payload === "string" ? payload : payload.date;
  return db
    .prepare(
      `SELECT
         DATE(created_at) as date,
         SUM(CASE WHEN payment_type IN ('ADVANCE','FINAL') THEN amount ELSE 0 END) as receipts,
         SUM(CASE WHEN payment_type = 'REFUND' THEN amount ELSE 0 END) as refunds,
         SUM(CASE WHEN payment_type IN ('ADVANCE','FINAL') THEN amount ELSE 0 END)
           - SUM(CASE WHEN payment_type = 'REFUND' THEN amount ELSE 0 END)
         AS net
       FROM payment
       WHERE DATE(created_at) = ?
       GROUP BY DATE(created_at)`
    )
    .get(date);
};

export const getOutstandingBills = (_payload?: any) => {
  return db
    .prepare(
      `SELECT b.*, g.full_name AS guest_name, r.room_number
       FROM bill b
       JOIN guest g ON b.guest_id = g.id
       JOIN room r ON b.room_id = r.id
       WHERE b.payment_status != 'PAID'
       ORDER BY (b.final_amount - b.total_paid) DESC`
    )
    .all();
};

export const getOccupancyReport = (data: {
  from: string;
  to: string;
}) => {
  const {from,to} = data;
  return db
    .prepare(
      `SELECT r.room_number,
              COUNT(c.id) as stays
       FROM room r
       LEFT JOIN check_in c ON c.room_id = r.id
         AND c.status = 'COMPLETED'
         AND DATE(check_in_time) BETWEEN DATE(?) AND DATE(?)
       GROUP BY r.id`
    )
    .all(from, to);
};
