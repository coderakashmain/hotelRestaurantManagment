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

INSERT INTO category (
  category_code,
  description,
  sub_description,
  short_name,
  is_active
)
SELECT category_code, description, sub_description, short_name, is_active
FROM (
  SELECT 1  AS category_code, 'JUICE'           AS description, 'JUICE'           AS sub_description, 'JUC'  AS short_name, 1 AS is_active UNION ALL
  SELECT 2, 'SOUP',            'SOUP',            'SUP',  1 UNION ALL
  SELECT 3, 'CONTINENTAL',     'CONTINENTAL',     'CONT', 1 UNION ALL
  SELECT 4, 'IND DELICIOUS',   'IND DELICIOUS',   'DELI', 1 UNION ALL
  SELECT 5, 'FISH AND PRAWN',  'FISH AND PRAWN',  'FP',   1 UNION ALL
  SELECT 6, 'CHICKEN',         'CHICKEN',         'CHK',  1 UNION ALL
  SELECT 7, 'MUTTON',          'MUTTON',          'MTN',  1 UNION ALL
  SELECT 8, 'TANDOOR',         'TANDOOR',         'TDR',  1 UNION ALL
  SELECT 9, 'BAKED BREAD',     'BAKED BREAD',     'BRD',  1 UNION ALL
  SELECT 10,'RAITA',           'RAITA',           'RT',   1 UNION ALL
  SELECT 11,'PADDY FIELD',     'PADDY FIELD',     'PF',   1 UNION ALL
  SELECT 12,'CHINESE',         'CHINESE',         'CHN',  1 UNION ALL
  SELECT 13,'DESERT',          'DESERT',          'DRT',  1 UNION ALL
  SELECT 14,'TIT BITS',        'TIT BITS',        'TIBT', 1 UNION ALL
  SELECT 15,'BEVERAGES',       'BEVERAGES',       'BVRGS',1
)
WHERE NOT EXISTS (SELECT 1 FROM category);



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

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT
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
INSERT INTO restaurant_table (table_code, table_no, description)
SELECT * FROM (
  SELECT 1,  '1',  'VIP' UNION ALL
  SELECT 2,  '2',  'GEN' UNION ALL
  SELECT 3,  '3',  'GHJ' UNION ALL
  SELECT 4,  '4',  'G' UNION ALL
  SELECT 5,  '5',  'G' UNION ALL
  SELECT 6,  '6',  'G' UNION ALL
  SELECT 7,  '7',  'G' UNION ALL
  SELECT 8,  '8',  'G' UNION ALL
  SELECT 9,  '9',  'G' UNION ALL
  SELECT 10, '10', 'G' UNION ALL
  SELECT 11, '11', 'G' UNION ALL
  SELECT 12, '12', 'G' UNION ALL
  SELECT 13, '13', 'G' UNION ALL
  SELECT 14, '14', 'G' UNION ALL
  SELECT 15, '15', 'G' UNION ALL
  SELECT 16, '16', 'G' UNION ALL
  SELECT 17, '17', 'G' UNION ALL
  SELECT 18, '18', 'G' UNION ALL
  SELECT 19, '19', 'G' UNION ALL
  SELECT 20, '20', 'G'
)
WHERE NOT EXISTS (SELECT 1 FROM restaurant_table);


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
  is_deleted INTEGER DEFAULT 0,
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
CREATE TABLE IF NOT EXISTS restaurent_gst_management (
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

INSERT INTO restaurent_gst_management (gst_percent, cgst_percent, sgst_percent, is_active)
SELECT gst_percent, cgst_percent, sgst_percent, is_active FROM (
  SELECT 5 AS gst_percent, 2.5 AS cgst_percent, 2.5 AS sgst_percent, 1 AS is_active
)
WHERE NOT EXISTS (SELECT 1 FROM restaurent_gst_management);

CREATE TRIGGER IF NOT EXISTS trg_res_gst_unique_active
BEFORE UPDATE ON restaurent_gst_management
WHEN NEW.is_active = 1
BEGIN
  UPDATE restaurent_gst_management SET is_active = 0 WHERE id != NEW.id;
END;
`;
