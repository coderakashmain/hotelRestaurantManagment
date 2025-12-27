import { getDb } from "../../db/database";

const db = getDb();
import { RestaurantBill } from "../../types/restaurantType/RestaurantBill";

/**
 * Create Bill from Table (OPEN KOTs)
 * 
 * 

 */


export const previewBillFromKOTs = (data: {
  kotIds: number[];
}) => {
  console.log(data.kotIds, "tbis is ");
  if (!data.kotIds || !data.kotIds.length) {
    throw new Error("No KOT selected");
  }

  // 🔹 HEADER INFO (use first KOT)
  const header = db.prepare(`
    SELECT 
      rt.table_no,
      e.name AS waiter_name
    FROM kot k
    JOIN restaurant_table rt ON rt.id = k.table_id
    JOIN employee e ON e.id = k.waiter_id
    WHERE k.id = ?
  `).get(data.kotIds[0]) as any;

  // 🔹 MERGE ITEMS
  const items = db.prepare(`
    SELECT
      d.dish_code,
      d.name AS dish_name,
      SUM(ki.quantity) AS quantity,
      ki.rate,
      SUM(ki.total) AS total
    FROM kot_item ki
    JOIN dish d ON d.id = ki.dish_id
    WHERE ki.kot_id IN (${data.kotIds.map(() => "?").join(",")})
    GROUP BY ki.dish_id, ki.rate
  `).all(...data.kotIds);

  const basicAmount = items.reduce(
    (sum: number, i: any) => sum + i.total,
    0
  );

  // 🔹 GST
  type GSTRow = { gst_percent: number };
  const gst = db.prepare(`
    SELECT gst_percent FROM gst_management WHERE is_active = 1
  `).get() as GSTRow | undefined;

  const gstAmount = gst
    ? (basicAmount * gst.gst_percent) / 100
    : 0;

  // 🔹 SERVICE TAX
  type ServiceTaxRow = { service_tax_percent: number };
  const serviceTax = db.prepare(`
    SELECT service_tax_percent FROM service_tax_management WHERE is_active = 1
  `).get() as ServiceTaxRow | undefined;

  const serviceTaxAmount = serviceTax
    ? (basicAmount * serviceTax.service_tax_percent) / 100
    : 0;

  return {
    table_no: header?.table_no,
    waiter_name: header?.waiter_name,
    items,
    basicAmount,
    gstAmount,
    serviceTaxAmount,
  };
};


export const createRestaurantBill = (data: {
  bill_no: string;
  bill_date: string;
  table_id: number;
  waiter_id?: number;
  customer_name?: string;
}): RestaurantBill => {

  if (!data.bill_no) {
    throw new Error("Bill number is required");
  }

  if (!data.bill_date) {
    throw new Error("Bill date is required");
  }

  if (!data.table_id) {
    throw new Error("Table is required");
  }

  const openKOTs = db.prepare(`
    SELECT id FROM kot
    WHERE table_id = ? AND status = 'OPEN'
  `).all(data.table_id);

  if (openKOTs.length === 0) {
    throw new Error("No open KOTs found for this table");
  }

  // 🔹 Calculate basic amount from all KOT items
  const basicAmountRow = db.prepare(`
    SELECT SUM(ki.total) AS total
    FROM kot_item ki
    JOIN kot k ON k.id = ki.kot_id
    WHERE k.table_id = ? AND k.status = 'OPEN'
  `).get(data.table_id) as any;

  const basicAmount = basicAmountRow?.total ?? 0;

  // 🔹 Get active Service Tax
  const serviceTax = db.prepare(`
    SELECT service_tax_percent
    FROM service_tax_management
    WHERE is_active = 1
    LIMIT 1
  `).get() as any;

  const serviceTaxAmount =
    (basicAmount * (serviceTax?.service_tax_percent ?? 0)) / 100;

  // 🔹 Get active GST
  const gst = db.prepare(`
    SELECT gst_percent
    FROM gst_management
    WHERE is_active = 1
    LIMIT 1
  `).get() as any;

  const gstAmount =
    (basicAmount * (gst?.gst_percent ?? 0)) / 100;

  const netAmount =
    basicAmount + serviceTaxAmount + gstAmount;

  const result = db.prepare(`
    INSERT INTO restaurant_bill
    (
      bill_no,
      bill_date,
      table_id,
      waiter_id,
      customer_name,
      basic_amount,
      service_tax_amount,
      gst_amount,
      net_amount,
      payment_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID')
  `).run(
    data.bill_no,
    data.bill_date,
    data.table_id,
    data.waiter_id ?? null,
    data.customer_name ?? null,
    basicAmount,
    serviceTaxAmount,
    gstAmount,
    netAmount
  );

  return db.prepare(`
    SELECT * FROM restaurant_bill WHERE id = ?
  `).get(result.lastInsertRowid) as RestaurantBill;
};

/**
 * Move KOT items into Bill Items
 */
export const addBillItemsFromKOT = (bill_id: number): void => {

    if (!bill_id) {
      throw new Error("Bill id is required");
    }
  
    const bill = db.prepare(`
      SELECT table_id FROM restaurant_bill WHERE id = ?
    `).get(bill_id) as any;
  
    if (!bill) {
      throw new Error("Bill not found");
    }
  
    db.prepare(`
      INSERT INTO restaurant_bill_item
      (bill_id, dish_id, quantity, rate, total)
      SELECT ?, ki.dish_id, ki.quantity, ki.rate, ki.total
      FROM kot_item ki
      JOIN kot k ON k.id = ki.kot_id
      WHERE k.table_id = ? AND k.status = 'OPEN'
    `).run(bill_id, bill.table_id);
  };

  
  /**
 * Checkout Bill
 */
export const checkoutRestaurantBill = (params: {
    bill_id: number;
    discount?: number;
  }): RestaurantBill => {
  
    if (!params.bill_id) {
      throw new Error("Bill id is required");
    }
  
    const bill = db.prepare(`
      SELECT * FROM restaurant_bill WHERE id = ?
    `).get(params.bill_id) as RestaurantBill | undefined;
  
    if (!bill) {
      throw new Error("Bill not found");
    }
  
    if (bill.payment_status === "PAID") {
      throw new Error("Bill already paid");
    }
  
    const discount = params.discount ?? 0;
    const netAmount = bill.net_amount - discount;
  
    if (netAmount < 0) {
      throw new Error("Discount exceeds bill amount");
    }
  
    db.prepare(`
      UPDATE restaurant_bill SET
        discount = ?,
        net_amount = ?,
        payment_status = 'PAID'
      WHERE id = ?
    `).run(
      discount,
      netAmount,
      params.bill_id
    );
  
    // 🔹 Close all related KOTs
    db.prepare(`
      UPDATE kot
      SET status = 'CLOSED'
      WHERE table_id = ? AND status = 'OPEN'
    `).run(bill.table_id);
  
    return db.prepare(`
      SELECT * FROM restaurant_bill WHERE id = ?
    `).get(params.bill_id) as RestaurantBill;
  };
  
  // export const createBillFromKOTs = (data: {
  //   kotIds: number[];
  //   discount?: number;
  // }) => {
  //   if (!data.kotIds.length) {
  //     throw new Error("Select at least one KOT");
  //   }
  
  //   const items = db.prepare(`
  //     SELECT 
  //       ki.dish_id,
  //       d.name AS dish_name,
  //       SUM(ki.quantity) AS quantity,
  //       ki.rate,
  //       SUM(ki.total) AS total
  //     FROM kot_item ki
  //     JOIN dish d ON d.id = ki.dish_id
  //     WHERE ki.kot_id IN (${data.kotIds.map(() => "?").join(",")})
  //     GROUP BY ki.dish_id, ki.rate
  //   `).all(...data.kotIds);
  
  //   const basicAmount  = items.reduce(
  //     (sum, i : any ) => sum + i.total,
  //     0
  //   );
  
  //   const discount = data.discount || 0;
  //   const netAmount = basicAmount - discount;
  
  //   const result = db.prepare(`
  //     INSERT INTO restaurant_bill
  //     (bill_no, bill_date, basic_amount, discount, net_amount)
  //     VALUES (?, DATE('now'), ?, ?, ?)
  //   `).run(
  //     `BILL-${Date.now()}`,
  //     basicAmount,
  //     discount,
  //     netAmount
  //   );
  
  //   const billId = result.lastInsertRowid as number;
  
  //   for (const i of items) {
  //     db.prepare(`
  //       INSERT INTO restaurant_bill_item
  //       (bill_id, dish_id, quantity, rate, total)
  //       VALUES (?, ?, ?, ?, ?)
  //     `).run(billId, i.dish_id, i.quantity, i.rate, i.total);
  //   }
  
  //   // mark KOTs as billed
  //   db.prepare(`
  //     UPDATE kot SET status = 'BILLED'
  //     WHERE id IN (${data.kotIds.map(() => "?").join(",")})
  //   `).run(...data.kotIds);
  
  //   return { billId, basicAmount, netAmount };
  // };
  
