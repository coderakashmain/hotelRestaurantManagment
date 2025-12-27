// services/company.ts
import { getDb } from "../db/database";
import { CompanyInfo, FinancialYear } from "../types";

const db = getDb();

/* ====================================
   COMPANY INFO
==================================== */
export const getCompanyInfo = (_payload?: any): CompanyInfo | undefined => {
  return db.prepare("SELECT * FROM company_info LIMIT 1").get() as CompanyInfo;
};

export const upsertCompanyInfo = (data: Partial<CompanyInfo>) => {
  const existing = getCompanyInfo();

  if (existing) {
    return db.prepare(
      `UPDATE company_info SET
        name = ?, address = ?,city = ?, contact_number = ?, email = ?,
        gst_number = ?, logo_url = ?, bank_account_name = ?,
        bank_account_number = ?, ifsc_code = ?, is_active = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      data.name,
      data.address || null,
      data.city || null,
      data.contact_number || null,
      data.email || null,
      data.gst_number || null,
      data.logo_url || null,
      data.bank_account_name || null,
      data.bank_account_number || null,
      data.ifsc_code || null,
      data.is_active ?? 1,
      existing.id
    );
  }

  return db.prepare(
    `INSERT INTO company_info
        (name,address,city,contact_number,email,gst_number,logo_url,
         bank_account_name,bank_account_number,ifsc_code,is_active,
         created_at,updated_at)
     VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).run(
    data.name,
    data.address || null,
    data.city || null,
    data.contact_number || null,
    data.email || null,
    data.gst_number || null,
    data.logo_url || null,
    data.bank_account_name || null,
    data.bank_account_number || null,
    data.ifsc_code || null,
    data.is_active ?? 1
  );
};

/* ====================================
   FINANCIAL YEAR
==================================== */
export const createFinancialYear = (
  year_name: string,
  start_date: string,
  end_date: string,
  prefix?: string,
  is_active = 0
) => {
  return db.prepare(
    `INSERT INTO financial_year
      (year_name, start_date, end_date, invoice_prefix, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`
  ).run(year_name, start_date, end_date, prefix ?? null, is_active);
};

export const getActiveFinancialYear = (): FinancialYear | undefined => {
  return db
    .prepare("SELECT * FROM financial_year WHERE is_active = 1 LIMIT 1")
    .get() as FinancialYear;
};

export const setActiveFinancialYear = (id: number) => {
  const trx = db.transaction(() => {
    db.prepare("UPDATE financial_year SET is_active = 0").run();
    db.prepare("UPDATE financial_year SET is_active = 1 WHERE id = ?").run(id);
  });

  return trx();
};
