export const restaurant_schema = `
PRAGMA foreign_keys = ON;

-- =========================
-- USERS / AUTH
-- =========================

-- =========================
-- CATEGORY MASTER
-- =========================
CREATE TABLE IF NOT EXISTS category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_code INTEGER UNIQUE NOT NULL,
  description TEXT NOT NULL,
  sub_description TEXT,
  short_name TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



-- =========================
-- DISH MASTER
-- =========================
CREATE TABLE IF NOT EXISTS dish (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dish_code INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  full_plate_rate NUMERIC DEFAULT 0,
  half_plate_rate NUMERIC DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES category(id)
);

-- =========================
-- TABLE MASTER
-- =========================
CREATE TABLE IF NOT EXISTS restaurant_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_code INTEGER UNIQUE NOT NULL,
  table_no TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1
);

-- =========================
-- EMPLOYEE MASTER
-- =========================
CREATE TABLE IF NOT EXISTS employee (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emp_code INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  father_name TEXT,
  location TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  country TEXT,
  nationality TEXT,
  aadhaar_no VARCHAR(12) DEFAULT NULL,
  mobile TEXT,
  designation TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- KOT (KITCHEN ORDER TOKEN)
-- =========================
CREATE TABLE IF NOT EXISTS kot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kot_no TEXT UNIQUE NOT NULL,
  kot_date DATE NOT NULL,
  table_id INTEGER NOT NULL,
  waiter_id INTEGER NOT NULL,
  status TEXT DEFAULT 'OPEN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES restaurant_table(id),
  FOREIGN KEY (waiter_id) REFERENCES employee(id)
);

-- =========================
-- KOT ITEMS
-- =========================
CREATE TABLE IF NOT EXISTS kot_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kot_id INTEGER NOT NULL,
  dish_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  rate NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  FOREIGN KEY (kot_id) REFERENCES kot(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dish(id)
);

-- =========================
-- SERVICE TAX MANAGEMENT
-- =========================
CREATE TABLE IF NOT EXISTS service_tax_management (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_tax_percent NUMERIC DEFAULT 0.00,
  effective_from DATE NULL,
  effective_to DATE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now'))
);

-- Default Service Tax (example: 5%)
INSERT INTO service_tax_management (service_tax_percent, is_active)
SELECT service_tax_percent, is_active FROM (
  SELECT 5 AS service_tax_percent, 1 AS is_active
)
WHERE NOT EXISTS (SELECT 1 FROM service_tax_management);

-- Ensure only ONE active service tax at a time
CREATE TRIGGER IF NOT EXISTS trg_service_tax_unique_active
BEFORE INSERT ON service_tax_management
WHEN NEW.is_active = 1
BEGIN
  UPDATE service_tax_management SET is_active = 0;
END;


-- =========================
-- BILLING (KOT BILLING)
-- =========================
CREATE TABLE IF NOT EXISTS restaurant_bill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_no TEXT UNIQUE NOT NULL,
  bill_date DATE NOT NULL,
  table_id INTEGER,
  waiter_id INTEGER,
  customer_name TEXT,
  basic_amount NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  service_tax_amount NUMERIC DEFAULT 0,
  gst_amount NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'UNPAID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES restaurant_table(id),
  FOREIGN KEY (waiter_id) REFERENCES employee(id)
);

-- =========================
-- BILL ITEMS
-- =========================
CREATE TABLE IF NOT EXISTS restaurant_bill_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  dish_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  rate NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
 FOREIGN KEY (bill_id) REFERENCES restaurant_bill(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dish(id)
);

-- 2) GST management (history)
CREATE TABLE IF NOT EXISTS gst_management (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gst_percent NUMERIC DEFAULT 0.00,
  cgst_percent NUMERIC DEFAULT 0.00,
  sgst_percent NUMERIC DEFAULT 0.00,
  igst_percent NUMERIC DEFAULT 0.00,
  effective_from DATE  NULL,
  effective_to DATE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now'))
);

INSERT INTO gst_management (gst_percent, cgst_percent, sgst_percent, is_active)
SELECT gst_percent, cgst_percent, sgst_percent, is_active FROM (
  SELECT 18 AS gst_percent, 9 AS cgst_percent, 9 AS sgst_percent, 1 AS is_active
)
WHERE NOT EXISTS (SELECT 1 FROM gst_management);

CREATE TRIGGER IF NOT EXISTS trg_gst_unique_active
BEFORE UPDATE ON gst_management
WHEN NEW.is_active = 1
BEGIN
  UPDATE gst_management SET is_active = 0 WHERE id != NEW.id;
END;
`;
