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
export const getBillById = (payload: number | { id: number }): BillDetails | undefined => {
  const id = typeof payload === "number" ? payload : payload.id;
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
           c.hour_count,
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
    hour_count?: number | null;
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
      COALESCE(eb.total, 0) AS total,
      eb.added_at
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

  const detaildatewise = db.prepare(`
    SELECT id, summary_date, room_charge, extra_charge, advance_total
    FROM daily_summary
    WHERE bill_id = ?
    ORDER BY summary_date ASC
  `).all(id) as BillDetails["detaildatewise"];
  // -------------------- FETCH EXTRA DATEWISE --------------------
  const extraDatewise = db.prepare(`
  SELECT 
    eb.bill_id,
    eb.bill_type_id,
    bt.name AS type_name,
    DATE(eb.added_at) AS summary_date,
    COALESCE(eb.total, 0) AS total
  FROM extra_bill eb
  JOIN bill_type bt ON bt.id = eb.bill_type_id
  WHERE eb.bill_id = ?
  ORDER BY summary_date ASC
`).all(id);

  // -------------------- FETCH ADVANCE DATEWISE --------------------
  const advanceDatewise = db.prepare(`
  SELECT 
    DATE(created_at) AS summary_date,
    SUM(amount) AS total_advance
  FROM payment
  WHERE bill_id = ? AND payment_type = 'ADVANCE'
  GROUP BY DATE(created_at)
`).all(id);


  // -------------------- START BUILDING TABLE --------------------
  const tableRows: any = {};

  // Normalize daily summary (room + extra total)
  detaildatewise?.forEach(row => {
    const dateKey = row.summary_date.slice(0, 10); // "YYYY-MM-DD"

    tableRows[dateKey] = {
      date: dateKey,
      room_fee: row.room_charge,
      extra: {},
      total: row.room_charge + row.extra_charge,
      advance: 0 // override later using payment table
    };
  });

  // -------------------- MERGE EXTRA CHARGES --------------------
  extraDatewise.forEach((e: any) => {
    const dateKey = e.summary_date;

    if (!tableRows[dateKey]) {
      tableRows[dateKey] = {
        date: dateKey,
        room_fee: 0,
        extra: {},
        total: 0,
        advance: 0
      };
    }

    tableRows[dateKey].extra[e.type_name] =
      (tableRows[dateKey].extra[e.type_name] || 0) + e.total;

  });


  // -------------------- MERGE ADVANCE CHARGES --------------------
  advanceDatewise.forEach((a: any) => {
    const dateKey = a.summary_date;

    if (!tableRows[dateKey]) {
      tableRows[dateKey] = {
        date: dateKey,
        room_fee: 0,
        extra: {},
        total: 0,
        advance: a.total_advance
      };
    } else {
      tableRows[dateKey].advance = a.total_advance;
    }
  });


  // -------------------- FINAL TABLE --------------------
  const finalTable = Object.values(tableRows);




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
      hour_count: bill.hour_count,
    },
    extraSummary,
    payments,
    latestPayment,
    detaildatewise,
    finalTable
  };
};
//Update discount 

export const updateDiscount = (data: {
  bill_id: number;
  value: number;
  type: "FLAT" | "PERCENT";
}) => {

  const { bill_id, value, type } = data;

  const bill = db.prepare(`
    SELECT room_charge_total, extra_charge_total, final_amount
    FROM bill WHERE id = ?
  `).get(bill_id) as {
    final_amount: number;
    room_charge_total: number;
    extra_charge_total: number;
  } | undefined;

  if (!bill) return;

  const total_amount = bill.room_charge_total + bill.extra_charge_total;
  let discountAmount = 0;

  if (type === "PERCENT") {
    discountAmount = (total_amount * value) / 100;
  }

  if (type === "FLAT") {
    discountAmount = value;
  }

  db.prepare(`
    UPDATE bill 
    SET discount = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(discountAmount, bill_id);

  return recalcBillTotals(bill_id);
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
export const addExtraCharge = async (data: {
  bill_id: number;
  bill_type_id: number;
  description: string;
  amount: number;
  quantity?: number;
  added_by?: number;
}): Promise<Bill> => {

  const {
    bill_id,
    bill_type_id,
    description,
    amount,
    quantity = 1,
    added_by
  } = data;

  const trx = db.transaction(() => {
    db.prepare(`
      INSERT INTO extra_bill
        (bill_id, bill_type_id, description, amount, quantity, total, added_by, added_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      bill_id,
      bill_type_id,
      description || null,
      amount,
      quantity,
      amount * quantity,
      added_by ?? null
    );

    const checkIn = db.prepare(`
      SELECT rate_applied FROM check_in
      WHERE id = (SELECT check_in_id FROM bill WHERE id = ?)
    `).get(bill_id) as { rate_applied: number };

    const today = new Date().toISOString().slice(0, 10);

    db.prepare(`
      INSERT INTO daily_summary 
        (bill_id, summary_date, extra_charge, room_charge)
      VALUES (?, ?, ?, ?)
    `).run(
      bill_id,
      today,
      amount * quantity,
      checkIn.rate_applied
    );

    return bill_id;
  });

  const savedBillId = trx();
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

export const addPayment = async (data: {
  bill_id: number;
  guest_id: number;
  payment_type: "ADVANCE" | "FINAL" | "REFUND";
  amount: number;
  method?: string;
  reference_no?: string;
  note?: string;
}): Promise<any> => {

  const {
    bill_id,
    guest_id,
    payment_type,
    amount,
    method = "CASH",
    reference_no,
    note
  } = data;

  if (amount <= 0) throw new Error("Amount must be > 0");

  const trx = db.transaction(() => {

    const checkIn = db.prepare(`
      SELECT checkin_id, rate_applied
      FROM check_in
      WHERE id = (SELECT check_in_id FROM bill WHERE id = ?)
    `).get(bill_id) as { checkin_id: string; rate_applied: number };

    if (!checkIn) throw new Error("CheckIn not found for bill");

    db.prepare(`
      INSERT INTO payment
        (bill_id, guest_id, payment_type, amount, method, reference_no, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      bill_id,
      guest_id,
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
      bill_id,
      checkIn.checkin_id,
      guest_id,
      amount,
      method,
      reference_no ?? null,
      payment_type
    );

    const mrId = Number(res.lastInsertRowid);
    const today = new Date().toISOString().slice(0, 10);

    db.prepare(`
      INSERT INTO daily_summary 
        (bill_id, summary_date, advance_total, room_charge)
      VALUES (?, ?, ?, ?)
    `).run(
      bill_id,
      today,
      amount,
      checkIn.rate_applied
    );

    return { savedBillId: bill_id, mrId };
  });

  const { savedBillId, mrId } = trx();

  await recalcBillTotals(savedBillId);
  return getMoneyReceipt(mrId);
};




export const calculateStayCharge = async (checkIn: any, room: any, stayRule: any): Promise<number> => {
  if (!checkIn || !room || !stayRule) return 0;

  const checkInTime = new Date(checkIn.check_in_time);
  const actualOut = checkIn.check_out_time ? new Date(checkIn.check_out_time) : new Date();


  const appliedRate = Number(checkIn.rate_applied || 0);
  const allowedExtraMinutes = Number(checkIn.extra_time || 0);

  const hours = stayRule.hours;        // 24, 12, 1, null
  const fixedTime = stayRule.time;     // "12:00", "08:00", null

  let baseRate = appliedRate;
  let rate = appliedRate;

  if (hours === 1) {
    const stayMinutes =
      (actualOut.getTime() - checkInTime.getTime()) / 60000;

    const hourCount = Number(checkIn.hour_count || 1);
    const bundleMinutes = hourCount * 60;
    const extraMinutes = allowedExtraMinutes || 0;

    // Calculate how many bundles are needed
    let bundles = Math.floor(stayMinutes / bundleMinutes);
    if (bundles < 1) bundles = 1;

    // Max minutes allowed for these bundles
    const maxAllowed =
      bundles * bundleMinutes + extraMinutes;

    // If crossed grace → move to next bundle
    if (stayMinutes > maxAllowed) {
      bundles += 1;
    }

    const totalCharge = bundles * appliedRate;


    await updateSummaryTable(checkIn.id, totalCharge)

    return totalCharge;
  }
  const isSameDay =
    actualOut.toDateString() === checkInTime.toDateString();



  if (hours === 24 || hours === 12) {
    const baseBlockMinutes = hours * 60;               // 1440 or 720
    const extraMinutes = allowedExtraMinutes || 0;     // your extra time
    const stayMinutes =
      (actualOut.getTime() - checkInTime.getTime()) / 60000;



    if (stayMinutes <= 0) {
      await updateSummaryTable(checkIn.id, rate)
      return baseRate;
    }

    // 2️ First block includes extraMinutes
    const firstBlockLimit = baseBlockMinutes + extraMinutes;

    // 3️ If stay fits in first block -> 1 day charge

    if (stayMinutes <= firstBlockLimit) {

      if (isSameDay) {
        await updateSummaryTable(checkIn.id, appliedRate);
      } else {
        await updateSummaryTable(checkIn.id, 0);
      }
      return baseRate;
    }
    const blocksPassed = Math.floor(stayMinutes / baseBlockMinutes);

    const todayBlockStart = new Date(checkInTime);
    todayBlockStart.setMinutes(
      todayBlockStart.getMinutes() + blocksPassed * baseBlockMinutes
    );

    const todayBlockEnd = new Date(todayBlockStart);
    todayBlockEnd.setMinutes(
      todayBlockEnd.getMinutes() + baseBlockMinutes + extraMinutes
    );
    const chargeStartTime = new Date(todayBlockStart);
    chargeStartTime.setMinutes(
      chargeStartTime.getMinutes() + extraMinutes
    );

    if (actualOut < chargeStartTime) {
      // before block start + grace
      await updateSummaryTable(checkIn.id, 0);
    } else {
      // crossed today's block
      await updateSummaryTable(checkIn.id, appliedRate);
    }

    // 4️ Beyond first block: only pure baseBlockMinutes are charged
    const remainingMinutes = stayMinutes - firstBlockLimit;
    const additionalBlocks = Math.ceil(remainingMinutes / baseBlockMinutes);

    const totalBlocks = 1 + additionalBlocks;
    return totalBlocks * baseRate;
  }


  if (!hours && fixedTime) {

    let expectedOut = new Date(checkInTime);
    const [fh, fm] = fixedTime.split(":").map(Number);
    expectedOut.setHours(fh, fm || 0, 0, 0);

    // checkout must be next day if fixed time already passed
    if (expectedOut <= checkInTime) {
      expectedOut.setDate(expectedOut.getDate() + 1);
    }

    const stayMinutes =
      (actualOut.getTime() - expectedOut.getTime()) / 60000;

    // 1️ Left before or on time
    if (stayMinutes <= 0) {

      updateSummaryTable(checkIn.id, appliedRate);
      return appliedRate;
    }

    // 2️ Grace period
    if (stayMinutes <= allowedExtraMinutes) {
      updateSummaryTable(checkIn.id, 0);
      return appliedRate;
    }

    // 3️ FIXED TIME CROSSING → FULL DAY CHARGED
    const extraDays =
      Math.ceil((stayMinutes - allowedExtraMinutes) / (24 * 60));

    updateSummaryTable(checkIn.id, appliedRate);


    const finalrate = appliedRate * (1 + extraDays);


    return finalrate;
  }

  await updateSummaryTable(checkIn.id, appliedRate);
  return appliedRate;
}


export const updateSummaryTable = async (checkin_id: number, appliedRate: number) => {



  const bill = db.prepare("SELECT id FROM bill WHERE check_in_id = ?").get(checkin_id) as { id: number };
  // const todayData = new Date().toISOString().slice(0, 10);
  const date = new Date().toLocaleDateString("en-CA");


  const summary_data = db.prepare(`select id from daily_summary where bill_id = ? and summary_date = ?`).get(bill.id, date) as any;

  if (!summary_data) {
    db.prepare(`
      INSERT INTO daily_summary (bill_id, summary_date, room_charge)
      VALUES (?, ?, ?)
    `).run(bill.id, date, appliedRate);
  } else {

    db.prepare(`
      UPDATE daily_summary set room_charge = ? WHERE id = ?;
      `).run(appliedRate, summary_data.id)
  }

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
  if (gst_value) {
    tax = Number(roomCharge + extraChargeTotal - discount) * (Number(gst_value?.gst_percent || 0) / 100);
  } else {
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
    `).run(roomCharge, extraChargeTotal, final_amount, tax, paid, adv, balance, status, billId);

    return db.prepare("SELECT * FROM bill WHERE id = ?").get(billId) as Bill;
  });

  return trx();
};

//Daily Bill Summary





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
