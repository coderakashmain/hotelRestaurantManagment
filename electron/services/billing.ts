// services/billing.ts
import { getDb } from "../db/database";
import { Bill, BillDetails } from "../types/bill";
import { CheckIn } from "../types/checkin";
const db = getDb();

/* ============================
   CREATE BILL FOR CHECKIN
   (create clean bill with zeroed totals,
    then call recalc to compute everything)
   Returns billId (number)
   ============================ */
export const createBillForCheckin = (data: {
  check_in_id: number;
  guest_id: number;
  room_id: number;
  financial_year_id?: number | null;
}) => {
  const res = db.prepare(`
    INSERT INTO bill
      (check_in_id, guest_id, room_id, financial_year_id,
       invoice_no, room_charge_total, extra_charge_total, discount, tax_total,
       final_amount, total_advance, total_paid, balance_amount,
       payment_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 'UNPAID', datetime('now'), datetime('now'))
  `).run(
    data.check_in_id,
    data.guest_id,
    data.room_id,
    data.financial_year_id ?? null
  );

  const billId = Number(res.lastInsertRowid);
  // compute proper totals immediately



  recalcBillTotals(billId);
  return billId;
};



/* ============================
   GET BILL WITH FULL DETAILS
   ============================ */
export const getBillById = (id: number): BillDetails | undefined => {
  recalcBillTotals(id);

  const bill = db.prepare(`
    SELECT b.*,
           g.full_name AS guest_name, 
           g.phone AS guest_phone, 
           g.address AS guest_address,
           r.room_number, 
           c.checkin_id AS guid,
           c.check_in_time AS check_in_time,
           c.expected_check_out_time AS expected_check_out_time,
           c.check_out_time AS check_out_time,
           c.stay_type,
           c.rate_applied,
           c.extra_time,
           co.label AS stay_label,
           co.hours AS stay_hours,
           co.time AS fixed_time
    FROM bill b
    JOIN guest g ON b.guest_id = g.id
    JOIN room r ON b.room_id = r.id
    JOIN check_in c ON b.check_in_id = c.id
    LEFT JOIN check_out_settings co ON co.id = c.stay_type
    WHERE b.id = ?
  `).get(id) as (Bill & {
    guest_name: string;
    guest_phone: string | null;
    guest_address: string | null;
    room_number: string;
    check_in_time: string;
    check_out_time: string | null;
    stay_label?: string;
    stay_hours?: number | null;
    fixed_time?: string | null;
    rate_applied?: number | null;
    extra_time?: number | null;
  });

  if (!bill) return undefined;

  /** properly typed extra summary **/
  const extraSummary = db.prepare(`
    SELECT 
      bt.id,
      bt.name,
      bt.gst_applicable,
      COALESCE(eb.amount, 0) AS amount,
      COALESCE(eb.quantity, 0) AS quantity,
      COALESCE(eb.total, 0) AS total
    FROM bill_type bt
    LEFT JOIN extra_bill eb 
      ON bt.id = eb.bill_type_id AND eb.bill_id = ?
    WHERE bt.is_active = 1
  `).all(id) as BillDetails["extraSummary"];

  /** typed payments list **/
  const payments = db.prepare(`
    SELECT id, amount, payment_type, method, reference_no, created_at
    FROM payment
    WHERE bill_id = ?
    ORDER BY created_at ASC
  `).all(id) as BillDetails["payments"];

  /** typed latest payment **/
  const latestPayment = db.prepare(`
    SELECT id, amount, payment_type, method, reference_no, created_at
    FROM payment
    WHERE bill_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(id) as BillDetails["latestPayment"];

  return {
    bill,
    guest: {
      name: bill.guest_name,
      phone: bill.guest_phone,
      address: bill.guest_address,
    },
    room: {
      number: bill.room_number,
    },
    stay: {
      check_in: bill.check_in_time,
      check_out: bill.check_out_time,
      stay_type_label: bill.stay_label,
      hours: bill.stay_hours,
      fixed_time: bill.fixed_time,
      rate_applied: bill.rate_applied,
      extra_time: bill.extra_time,
    },
    extraSummary,
    payments,
    latestPayment,
  };
};
//Update discount 

export const updateDiscount = (
  billId: number,
  value: number,
  type: "FLAT" | "PERCENT"
) => {

  const bill = db.prepare(`
    SELECT room_charge_total, extra_charge_total, final_amount
    FROM bill WHERE id = ?
  `).get(billId) as {
    final_amount: number;
    room_charge_total: number;
    extra_charge_total: number;
  } | undefined;

  if (!bill) return;
  const total_amount = bill.room_charge_total + bill.extra_charge_total;

  let discountAmount;

  if (type === "PERCENT") {
    discountAmount =
      ((total_amount) * value) / 100;
  }
  if (type === "FLAT") {
    discountAmount = value;
  }

  db.prepare(`
    UPDATE bill 
    SET discount = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(discountAmount, billId);

  return recalcBillTotals(billId);
};






/* Get the active bill for a room (find active checkin -> its bill) */
export const getBillByRoomId = (roomId: number): any | undefined => {
  const bill = db.prepare(`
    SELECT b.* FROM bill b
    JOIN check_in c ON c.id = b.check_in_id
    WHERE c.room_id = ? AND c.status = 'ACTIVE'
    ORDER BY b.id DESC
    LIMIT 1
  `).get(roomId) as Bill | undefined;

  if (!bill) return undefined;

  // get fully recalculated (fresh) totals
  const updatedBill = recalcBillTotals(bill.id);

  return updatedBill;
};

/* ============================
   ADD EXTRA CHARGE
   (returns recalculated bill)
   ============================ */
export const addExtraCharge = async (
  billId: number,
  billTypeId: number,
  description: string,
  amount: number,
  quantity = 1,
  added_by?: number
): Promise<Bill> => {
  const trx = db.transaction(() => {
    db.prepare(`
      INSERT INTO extra_bill
        (bill_id, bill_type_id, description, amount, quantity, total, added_by, added_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      billId,
      billTypeId,
      description || null,
      amount,
      quantity,
      amount * quantity,
      added_by ?? null
    );


    // trigger will update extra_charge_total, but ensure final totals are recalculated
    return billId;
  });

  const savedBillId = trx(); //  synchronous insert success

  //  recalc AFTER transaction, async safe
  return await recalcBillTotals(savedBillId);
};

/* ============================
   ADD PAYMENT (ADVANCE / FINAL / REFUND)
   returns recalculated bill
   ============================ */

export const getMoneyReceipt = (mrId: number) => {
  return db.prepare(`
    SELECT 
      mr.*,
      b.invoice_no,
      c.checkin_id AS guid,
      g.full_name AS guest_name,
      r.room_number,
      ci.name AS company_name,
      ci.address AS company_address,
      ci.contact_number AS company_phone
    FROM money_receipt mr
    JOIN bill b ON mr.bill_id = b.id
    JOIN check_in c ON b.check_in_id = c.id
    JOIN guest g ON mr.guest_id = g.id
    JOIN room r ON b.room_id = r.id
    LEFT JOIN company_info ci ON ci.is_active = 1
    WHERE mr.id = ?
  `).get(mrId);
};

export const addPayment = async (
  billId: number,
  guestId: number,
  payment_type: "ADVANCE" | "FINAL" | "REFUND",
  amount: number,
  method = "CASH",
  reference_no?: string,
  note?: string
): Promise<any> => {
  if (amount <= 0) throw new Error("Amount must be > 0");

  const trx = db.transaction(() => {

    const checkIn = db.prepare(`
      SELECT checkin_id FROM check_in WHERE id = (SELECT check_in_id FROM bill WHERE id = ?)
    `).get(billId) as { checkin_id: string };

    if (!checkIn) throw new Error("CheckIn not found for bill");

    db.prepare(`
      INSERT INTO payment
        (bill_id, guest_id, payment_type, amount, method, reference_no, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      billId,
      guestId,
      payment_type,
      amount,
      method,
      reference_no ?? null,
      note ?? null
    );

    const res = db.prepare(`
      INSERT INTO money_receipt
        (bill_id, GUID, guest_id, amount, method, reference_no, payment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      billId,
      checkIn.checkin_id,
      guestId,
      amount,
      method,
      reference_no ?? null,
      payment_type
    );
    const mrId = Number(res.lastInsertRowid);


    return { savedBillId: billId, mrId };
  });

  const { savedBillId, mrId } = trx();

  await recalcBillTotals(savedBillId);


  return getMoneyReceipt(mrId);
};



function calculateStayCharge(checkIn: any, room: any, stayRule: any): number {
  if (!checkIn || !room || !stayRule) return 0;

  const checkInTime = new Date(checkIn.check_in_time);
  const actualOut = checkIn.check_out_time ? new Date(checkIn.check_out_time) : new Date();

  const appliedRate = Number(checkIn.rate_applied || 0);
  const allowedExtraMinutes = Number(checkIn.extra_time || 0);

  const hours = stayRule.hours;        // 24, 12, 1, null
  const fixedTime = stayRule.time;     // "12:00", "08:00", null

  let baseRate = appliedRate;


  if (hours === 1) {
    const stayMinutes =
      (actualOut.getTime() - checkInTime.getTime()) / 60000;

    // 1️ Base hours from pure 60-min blocks
    let slots = Math.floor(stayMinutes / 60);

    // Minimum 1 hour charge
    if (slots < 1) slots = 1;

    // 2️ Max minutes allowed for these slots (with extraMinutes)
    const maxMinutesForSlots = slots * 60 + allowedExtraMinutes;

    // 3️ If guest crosses allowed time, charge next hour
    if (stayMinutes > maxMinutesForSlots) {
      slots += 1;
    }

    return slots * Number(room.hourly_rate);
  }


  if (hours === 24 || hours === 12) {
    const baseBlockMinutes = hours * 60;               // 1440 or 720
    const extraMinutes = allowedExtraMinutes || 0;     // your extra time
    const stayMinutes =
      (actualOut.getTime() - checkInTime.getTime()) / 60000;



    if (stayMinutes <= 0) return baseRate;

    // 2️ First block includes extraMinutes
    const firstBlockLimit = baseBlockMinutes + extraMinutes;
    // 3️ If stay fits in first block -> 1 day charge
    if (stayMinutes <= firstBlockLimit) {
      return baseRate;
    }

    // 4️ Beyond first block: only pure baseBlockMinutes are charged
    const remainingMinutes = stayMinutes - firstBlockLimit;
    const additionalBlocks = Math.ceil(remainingMinutes / baseBlockMinutes);

    const totalBlocks = 1 + additionalBlocks;
    return totalBlocks * baseRate;
  }


  if (!hours && fixedTime) {
    const expectedOut = new Date(checkInTime);
    const [fh, fm] = fixedTime.split(":").map(Number);
    expectedOut.setHours(fh, fm || 0, 0, 0);

    // Next day handling
    if (expectedOut <= checkInTime) {
      expectedOut.setDate(expectedOut.getDate() + 1);
    }

    const stayMinutes = (actualOut.getTime() - expectedOut.getTime()) / 60000;

    // 1️ If they leave on/before scheduled time → always 1 day
    if (stayMinutes <= 0) {
      return baseRate;
    }

    // 2️ If they leave within extra minutes → still no extra block
    if (stayMinutes <= allowedExtraMinutes) {
      return baseRate;
    }

    // 3️ Beyond extended checkout → calculate extra blocks just like 24/12
    // Each extra block = full baseRate
    let slots = Math.ceil((stayMinutes - allowedExtraMinutes) / (60 * 24));
    // But since first day already charged:
    return baseRate * (1 + slots);
  }


  return baseRate;
}




export const recalcBillTotals = async (billId: number): Promise<Bill> => {
  //  compute roomCharge outside transaction
  const bill = db.prepare("SELECT * FROM bill WHERE id = ?").get(billId) as Bill;
  if (!bill) throw new Error("Bill not found");

  const checkIn = db.prepare("SELECT * FROM check_in WHERE id = ?").get(bill.check_in_id) as CheckIn;
  if (!checkIn) throw new Error("CheckIn not found");

  const room = db.prepare("SELECT * FROM room WHERE id = ?").get(bill.room_id);

  let stayTypeRule = null;
  if (checkIn.stay_type != null && !isNaN(Number(checkIn.stay_type))) {
    stayTypeRule = db.prepare("SELECT * FROM check_out_settings WHERE id = ?")
      .get(Number(checkIn.stay_type));
  }

  //  async, so MUST await
  const roomCharge = await calculateStayCharge(checkIn, room, stayTypeRule);

  const extraRow = db.prepare("SELECT COALESCE(SUM(COALESCE(total, amount*quantity)),0) AS extras FROM extra_bill WHERE bill_id = ?").get(billId) as { extras: number };
  const extraChargeTotal = extraRow?.extras ?? 0;

  const discount = Number(bill.discount || 0);
  const gst_value = db.prepare("SELECT * FROM gst_management WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get() as any;
  let tax = 0;
  if(gst_value){
    tax = Number(roomCharge + extraChargeTotal - discount) * (Number(gst_value?.gst_percent || 0) / 100) ;
  }else{
    tax = bill.tax_total || 0;
  }
  


  const final_amount = Number(roomCharge || 0) + Number(extraChargeTotal || 0) - discount + tax;

  const paidRow = db.prepare(`
    SELECT COALESCE(SUM(amount),0) AS paid_sum
    FROM payment
    WHERE bill_id = ? AND (payment_type='ADVANCE' OR payment_type='FINAL')
  `).get(billId) as { paid_sum: number };

  const advRow = db.prepare(`
    SELECT COALESCE(SUM(amount),0) AS adv_sum
    FROM payment
    WHERE bill_id = ? AND payment_type='ADVANCE'
  `).get(billId) as { adv_sum: number };

  const paid = Number(paidRow?.paid_sum || 0);
  const adv = Number(advRow?.adv_sum || 0);

  const balance = final_amount - paid;
  const status = paid >= final_amount ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";


  const trx = db.transaction(() => {
    db.prepare(`
      UPDATE bill
      SET room_charge_total = ?,
          extra_charge_total = ?,
          final_amount = ?,
          tax_total = ?,
          total_paid = ?,
          total_advance = ?,
          balance_amount = ?,
          payment_status = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(roomCharge, extraChargeTotal, final_amount, tax,paid, adv, balance, status, billId);

    return db.prepare("SELECT * FROM bill WHERE id = ?").get(billId) as Bill;
  });

  return trx();
};


/* ============================
   CHECKOUT
   ============================ */
export const checkout = async (params: {
  billId: number;
  finalPaymentAmount?: number;
  finalPaymentMethod?: string;
  doRefundIfOverpaid?: boolean;
  userId?: number;
}): Promise<Bill> => {

  const trx = db.transaction((p) => {
    const bill = db.prepare("SELECT * FROM bill WHERE id = ?").get(p.billId) as Bill;
    if (!bill) throw new Error("Bill not found");

    // final payment if any
    if (p.finalPaymentAmount && Number(p.finalPaymentAmount) > 0) {
      db.prepare(`
        INSERT INTO payment
          (bill_id, guest_id, payment_type, amount, method, created_at)
        VALUES (?, ?, 'FINAL', ?, ?, datetime('now'))
      `).run(
        bill.id,
        bill.guest_id,
        Number(p.finalPaymentAmount),
        p.finalPaymentMethod ?? "CASH"
      );
    }

    // do not recalc inside transaction
    return bill.id;  // ✔ just return id
  });

  const billId = trx(params);

  // recalc after commit (async safe)
  let updatedBill = await recalcBillTotals(billId);

  // refund only after recalc
  if (params.doRefundIfOverpaid) {
    const overpay = Number(updatedBill.total_paid) - Number(updatedBill.final_amount);

    if (overpay > 0) {
      db.prepare(`
        INSERT INTO payment (bill_id, guest_id, payment_type, amount, method, note, created_at)
        VALUES (?, ?, 'REFUND', ?, 'CASH', 'Auto refund at checkout', datetime('now'))
      `).run(billId, updatedBill.guest_id, overpay);

      // recalc after refund too
      updatedBill = await recalcBillTotals(billId);
    }
  }

  // mark checkout + free room AFTER everything else
  db.prepare(`UPDATE check_in
SET check_out_time = datetime('now', 'localtime'),
    status = 'COMPLETED',
    updated_at = datetime('now', 'localtime')
WHERE id = ?`)
    .run(updatedBill.check_in_id);

  db.prepare("UPDATE room SET status = 'AVAILABLE', updated_at = datetime('now') WHERE id = ?")
    .run(updatedBill.room_id);

  return updatedBill
    ;
};


/* ============================
   LIST / FILTER BILLS
   ============================ */
export const getBills = (filter?: { status?: string }): Bill[] => {
  let sql = `
    SELECT b.*, g.full_name AS guest_name, r.room_number
    FROM bill b
    JOIN guest g ON b.guest_id = g.id
    JOIN room r ON b.room_id = r.id
  `;
  if (filter?.status) {
    sql += " WHERE b.payment_status = ? ORDER BY b.created_at DESC";
    return db.prepare(sql).all(filter.status) as Bill[];
  }
  sql += " ORDER BY b.created_at DESC";
  return db.prepare(sql).all() as Bill[];
};
