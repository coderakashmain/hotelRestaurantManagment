// services/checkin.ts
import { getDb } from "../db/database";
import { CheckIn, FinancialYear } from "../types";
import { createBillForCheckin } from "./billing";

const db = getDb();

/* get active FY */
function getActiveFY(): FinancialYear {
  const fy = db.prepare(`SELECT * FROM financial_year WHERE is_active = 1 LIMIT 1`).get() as FinancialYear;
  if (!fy) throw new Error("No active financial year found!");
  const today = new Date();
  if (new Date(fy.start_date) > today || new Date(fy.end_date) < today) {
    throw new Error("Today is outside the financial year range!");
  }
  return fy;
}

/* generate checkin id (reset per FY) */
function generateCheckInId(fy: FinancialYear) {
  const fyStart = new Date(fy.start_date);
  const yr1 = String(fyStart.getFullYear()).slice(2);
  const yr2 = String(fyStart.getFullYear() + 1).slice(2);
  const range = `${yr1}${yr2}`; // e.g. 2526

  const row = db.prepare("SELECT COUNT(*) AS c FROM check_in WHERE financial_year_id = ?").get(fy.id) as { c: number };
  const serial = row?.c ? row.c + 1 : 1;
  return `${range}N${serial}`;
}

/* create checkin and bill */
export const createCheckIn = (data: {
  guest_id: number;
  room_id: number;
  check_in_time: string;
  expected_check_out_time?: string | null;
  stay_type?: number;
  rate_applied?: number;
  hour_count?:number;
  no_of_guests?: number;
  extra_time : number;
}) => {

    
  const trx = db.transaction((d) => {
    const fy = getActiveFY();
    const checkinIdString = generateCheckInId(fy);

 
  

    const res = db.prepare(`
      INSERT INTO check_in
        (checkin_id, guest_id, room_id, check_in_time, expected_check_out_time,
         stay_type, rate_applied,hour_count, no_of_guests, financial_year_id,
         status, created_at, updated_at,extra_time)
      VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'), ?)
    `).run(
      checkinIdString,
      d.guest_id,
      d.room_id,
      d.check_in_time,
      d.expected_check_out_time ?? null,
     d.stay_type ?? null,  
      d.rate_applied ?? 0,
      d.hour_count ?? 1,
      d.no_of_guests ?? 1,
      fy.id,
      d.extra_time
    );

    const checkInId = Number(res.lastInsertRowid);

    db.prepare("UPDATE room SET status = 'OCCUPIED', created_at = datetime('now') WHERE id = ?").run(d.room_id);

    // create bill (clean) and recalc inside createBillForCheckin
    const billId = createBillForCheckin({
      check_in_id: checkInId,
      guest_id: d.guest_id,
      room_id: d.room_id,
      financial_year_id: fy.id
    });

      const today = new Date().toISOString().slice(0, 10);
       db.prepare(`
         INSERT INTO daily_summary 
           (bill_id, summary_date, room_charge)
         VALUES (?, ?, ?);
       `).run(
         billId,
         today,
         d.rate_applied
       );
    

    return { checkin_id: checkInId, bill_id: billId };
  });

  return trx(data);
};

/* get active checkins */
export const getActiveCheckins = (_payload?: any): CheckIn[] => {
  return db.prepare(`SELECT * FROM check_in WHERE status = 'ACTIVE' ORDER BY check_in_time DESC`).all() as CheckIn[];
};
