import { getDb } from "../db/database";
import { FinancialYear } from "../types";



const db = getDb();

/* ============================================================
   1) GET ALL FINANCIAL YEARS
============================================================ */
export const getAllFinancialYears = (): FinancialYear[] => {
  return db
    .prepare("SELECT * FROM financial_year ORDER BY start_date DESC")
    .all() as FinancialYear[];
};

/* ============================================================
   2) GET ACTIVE YEAR
============================================================ */
export const getActiveFinancialYear = (_payload?: any): FinancialYear | undefined => {
  return db
    .prepare("SELECT * FROM financial_year WHERE is_active = 1 LIMIT 1")
    .get() as FinancialYear | undefined;
};

/* ============================================================
   3) CALCULATE FY: April 1 to March 31
============================================================ */
export const calculateFYDates = (year: number) => {
  const start_date = `${year}-04-01`;
  const end_date = `${year + 1}-03-31`;
  const year_name = `${year}-${year + 1}`;

  return { start_date, end_date, year_name };
};

/* ============================================================
   4) CREATE FY
============================================================ */
export const createFinancialYear = (data :{
  year: number,
  invoice_prefix?: string
}) => {
  const {year,invoice_prefix} = data;
  
  
  if(typeof year !== 'number'){
  
    throw new Error("Invalid year!")
  }
  const { start_date, end_date, year_name } = calculateFYDates(year);


  const exists = db
    .prepare("SELECT id FROM financial_year WHERE year_name = ?")
    .get(year_name);

  if (exists) throw new Error("Financial year already exists!");

  return db
    .prepare(
      `INSERT INTO financial_year 
       (year_name, start_date, end_date, current_invoice_no, invoice_prefix, is_active, created_at)
       VALUES (?, ?, ?, 0, ?, 0, datetime('now'))`
    )
    .run(year_name, start_date, end_date, invoice_prefix ?? null);
};

/* ============================================================
   5) SET ACTIVE FY
============================================================ */
export const setActiveFinancialYear = (payload: number | { id: number }) => {
  const id = typeof payload === "number" ? payload : payload.id;

  const trx = db.transaction(() => {
    db.prepare("UPDATE financial_year SET is_active = 0").run();
    db.prepare("UPDATE financial_year SET is_active = 1 WHERE id = ?").run(id);
  });

  trx();
  return { success: true };
};

/* ============================================================
   6) UPDATE FY DETAILS
============================================================ */
export const updateFinancialYear = (payload :  {
  id: number,
  data: { invoice_prefix?: string; year_name?: string }
}) => {
  const {id,data} = payload;
  const fy = db
    .prepare("SELECT * FROM financial_year WHERE id = ?")
    .get(id) as FinancialYear | undefined;

  if (!fy) throw new Error("Financial year not found");

  const newPrefix = data.invoice_prefix ?? fy.invoice_prefix;
  const newName = data.year_name ?? fy.year_name;

  db.prepare(
    `UPDATE financial_year 
     SET invoice_prefix = ?, year_name = ?
     WHERE id = ?`
  ).run(newPrefix, newName, id);

  return { success: true };
};

/* ============================================================
   7) DELETE FY (only if unused)
============================================================ */
export const deleteFinancialYear = (id: number) => {
  const used = db
    .prepare("SELECT id FROM bill WHERE financial_year_id = ? LIMIT 1")
    .get(id);

  if (used) throw new Error("Cannot delete: Year is used by bills.");

  db.prepare("DELETE FROM financial_year WHERE id = ?").run(id);

  return { success: true };
};

/* ============================================================
   8) GET NEXT INVOICE NUMBER (optional)
============================================================ */
export const getNextInvoiceNumber = (fyId: number) => {
  const fy = db
    .prepare("SELECT * FROM financial_year WHERE id = ?")
    .get(fyId) as FinancialYear | undefined;

  if (!fy) throw new Error("Financial year not found");

  const nextNo = fy.current_invoice_no + 1;

  const invoice = fy.invoice_prefix
    ? `${fy.invoice_prefix}-${String(nextNo).padStart(6, "0")}`
    : `${fyId}-${String(nextNo).padStart(6, "0")}`;

  return { invoice, nextNo };
};

/* ============================================================
   9) RESET INVOICE COUNTER
============================================================ */
export const resetInvoiceCounter = (fyId: number) => {
  db.prepare(
    "UPDATE financial_year SET current_invoice_no = 0 WHERE id = ?"
  ).run(fyId);

  return { success: true };
};
