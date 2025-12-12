export const schema = `
PRAGMA foreign_keys = ON;

-- 1) Company info
CREATE TABLE IF NOT EXISTS company_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  contact_number TEXT,
  email TEXT,
  gst_number TEXT,
  logo_url TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  ifsc_code TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

-- 2) GST management (history)
CREATE TABLE IF NOT EXISTS gst_management (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gst_percent NUMERIC DEFAULT 0.00,
  cgst_percent NUMERIC DEFAULT 0.00,
  sgst_percent NUMERIC DEFAULT 0.00,
  igst_percent NUMERIC DEFAULT 0.00,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS trg_gst_unique_active
BEFORE UPDATE ON gst_management
WHEN NEW.is_active = 1
BEGIN
  UPDATE gst_management SET is_active = 0 WHERE id != NEW.id;
END;


-- 3) Financial year and invoice counter
CREATE TABLE IF NOT EXISTS financial_year (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year_name TEXT NOT NULL, -- e.g. '2024-2025'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  current_invoice_no INTEGER NOT NULL DEFAULT 0,
  invoice_prefix TEXT DEFAULT NULL,
  is_active INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now'))
);

-- 4) Floor
CREATE TABLE IF NOT EXISTS floor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  floor_name TEXT,
  floor_number INTEGER,
  created_at DATETIME DEFAULT (datetime('now'))
);

-- 5) Room
CREATE TABLE IF NOT EXISTS room (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  floor_id INTEGER,
  room_number TEXT NOT NULL,
  room_type_id INTEGER DEFAULT 3,
  status TEXT DEFAULT 'AVAILABLE',
  is_active INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT (datetime('now')),
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (floor_id) REFERENCES floor(id) ON DELETE SET NULL,
  FOREIGN KEY (room_type_id) REFERENCES room_type(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_room_number ON room(room_number);

CREATE TABLE IF NOT EXISTS room_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_name TEXT NOT NULL UNIQUE,
  full_rate NUMERIC NOT NULL DEFAULT 0.00,     -- 24H main price
  hourly_rate NUMERIC DEFAULT 0.00,            -- optional
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

INSERT INTO room_type (type_name, full_rate, hourly_rate, is_active)
SELECT type_name, full_rate, hourly_rate, is_active FROM (
  SELECT 'Suite Room' AS type_name, 2500 AS full_rate, 0 AS hourly_rate, 1 AS is_active
  UNION ALL SELECT 'Deluxe Room', 2200, 0, 1
  UNION ALL SELECT 'Ac Double', 1800, 0, 1
  UNION ALL SELECT 'Non Ac Double', 1200, 0, 1
  UNION ALL SELECT 'Non Ac Single', 800, 0, 1
)
WHERE NOT EXISTS (SELECT 1 FROM room_type);




CREATE TABLE IF NOT EXISTS check_out_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,          -- 24 Hrs / 12 Noon / 08 AM etc.
  hours INTEGER,                -- total hours for calculation (optional)
  time TEXT,                    -- stored exact time if fixed time checkout
  is_default INTEGER DEFAULT 0, -- only one allowed default
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);
CREATE TRIGGER IF NOT EXISTS trg_unique_default_checkout
BEFORE UPDATE ON check_out_settings
WHEN NEW.is_default = 1
BEGIN
  UPDATE check_out_settings SET is_default = 0 WHERE id != NEW.id;
END;

INSERT INTO check_out_settings (label, hours, time, is_default)
SELECT label, hours, time, is_default FROM (
  SELECT '24 Hrs' AS label, 24 AS hours, NULL AS time, 1 AS is_default
  UNION ALL SELECT '12:00 noon', NULL, '12:00 ', 0
  UNION ALL SELECT '08:00 AM', NULL, '8:00 ', 0
  UNION ALL SELECT '06:00 PM', NULL, '6:00', 0
  UNION ALL SELECT 'Hourly', 1, NULL, 0
  UNION ALL SELECT '12 Hrs', 12, NULL, 0
)
WHERE NOT EXISTS (SELECT 1 FROM check_out_settings);


CREATE TABLE IF NOT EXISTS money_receipt (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mr_no TEXT UNIQUE,
  bill_id INTEGER NOT NULL,
  GUID TEXT  NOT NULL,
  guest_id INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT,
  reference_no TEXT,
  payment_type TEXT,      -- ADVANCE / FINAL / REFUND
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE CASCADE
);

-- Auto generate MR No
CREATE TABLE IF NOT EXISTS mr_counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  current_no INTEGER DEFAULT 0
);

INSERT OR IGNORE INTO mr_counter (id, current_no) VALUES (1, 0);

CREATE TRIGGER IF NOT EXISTS trg_mr_increment
AFTER INSERT ON money_receipt
BEGIN
  UPDATE mr_counter SET current_no = current_no + 1 WHERE id = 1;
  UPDATE money_receipt
  SET mr_no = printf('MR-%06d', (SELECT current_no FROM mr_counter WHERE id = 1))
  WHERE id = NEW.id;
END;



-- 6) Guest
CREATE TABLE IF NOT EXISTS guest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  id_proof_image TEXT,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_guest_phone ON guest(phone);

-- 7) check_in (stay)
CREATE TABLE IF NOT EXISTS check_in (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Custom formatted ID e.g. 2526N1
  checkin_id VARCHAR(50) NOT NULL,

  guest_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,

  check_in_time DATETIME NOT NULL,
  expected_check_out_time DATETIME,
  check_out_time DATETIME,

  stay_type INTEGER NOT NULL,
  extra_time INTEGER DEFAULT 0,
  rate_applied NUMERIC DEFAULT 0.00,
  no_of_guests INTEGER DEFAULT 1,

  -- Link to FY table
  financial_year_id INTEGER,

  status TEXT DEFAULT 'ACTIVE',

  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),

  FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE RESTRICT,
  FOREIGN KEY (financial_year_id) REFERENCES financial_year(id) ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_checkin_room_id ON check_in(room_id);
CREATE INDEX IF NOT EXISTS idx_checkin_guest_id ON check_in(guest_id);

-- 8) bill_type (master list)
CREATE TABLE IF NOT EXISTS bill_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT,
  category TEXT DEFAULT 'EXTRA',
  gst_applicable INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now'))
);

INSERT INTO bill_type (name, code, category, gst_applicable)
SELECT name, code, category, gst_applicable FROM (
  SELECT 'Extra Person' AS name, NULL AS code, 'EXTRA' AS category, 1 AS gst_applicable
  UNION ALL SELECT 'Food', NULL, 'EXTRA', 1
  UNION ALL SELECT 'Laundry', NULL, 'EXTRA', 1
  UNION ALL SELECT 'Misc', NULL, 'EXTRA', 1
)
WHERE NOT EXISTS (SELECT 1 FROM bill_type);



-- 9) bill (master bill per check_in)
CREATE TABLE IF NOT EXISTS bill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  check_in_id INTEGER NOT NULL,
  guest_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  financial_year_id INTEGER,
  invoice_no TEXT,
  room_charge_total NUMERIC DEFAULT 0.00,
  extra_charge_total NUMERIC DEFAULT 0.00,
  discount NUMERIC DEFAULT 0.00,
  tax_total NUMERIC DEFAULT 0.00,
  final_amount NUMERIC DEFAULT 0.00,
  total_advance NUMERIC DEFAULT 0.00,
  total_paid NUMERIC DEFAULT 0.00,
  balance_amount NUMERIC DEFAULT 0.00,
  payment_status TEXT DEFAULT 'UNPAID',
  notes TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (check_in_id) REFERENCES check_in(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE RESTRICT,
  FOREIGN KEY (financial_year_id) REFERENCES financial_year(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bill_checkin ON bill(check_in_id);
CREATE INDEX IF NOT EXISTS idx_bill_invoice_no ON bill(invoice_no);

-- 10) extra_bill (line items)
CREATE TABLE IF NOT EXISTS extra_bill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  bill_type_id INTEGER NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0.00,
  quantity NUMERIC DEFAULT 1,
  total NUMERIC DEFAULT 0.00,
  added_by INTEGER,
  added_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE,
  FOREIGN KEY (bill_type_id) REFERENCES bill_type(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_extra_bill_billid ON extra_bill(bill_id);

-- 11) payment (advances, final, refund)
CREATE TABLE IF NOT EXISTS payment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  guest_id INTEGER NOT NULL,
  payment_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT DEFAULT 'CASH',
  reference_no TEXT,
  note TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_payment_billid ON payment(bill_id);

-- 12) user (system user)
CREATE TABLE IF NOT EXISTS user_account (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'RECEPTION',
  phone TEXT,
  email TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now'))
);

-- 13) audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data TEXT,
  new_data TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE SET NULL
);

-- OPTIONAL: booking table (reservations)
CREATE TABLE IF NOT EXISTS booking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER NOT NULL,
  room_id INTEGER,
  booking_from DATETIME NOT NULL,
  booking_to DATETIME,
  status TEXT DEFAULT 'REQUESTED',
  advance_amount NUMERIC DEFAULT 0.00,
  notes TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE SET NULL
);

-- OPTIONAL: room_cleaning
CREATE TABLE IF NOT EXISTS room_cleaning (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  cleaned_by INTEGER,
  cleaned_at DATETIME DEFAULT (datetime('now')),
  remarks TEXT,
  FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE,
  FOREIGN KEY (cleaned_by) REFERENCES user_account(id) ON DELETE SET NULL
);

-- OPTIONAL: shift_log (cash in/out)
CREATE TABLE IF NOT EXISTS shift_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  shift_date DATE NOT NULL,
  opening_cash NUMERIC DEFAULT 0.00,
  closing_cash NUMERIC DEFAULT 0.00,
  cash_collected NUMERIC DEFAULT 0.00,
  notes TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE
);

-- OPTIONAL: item_stock (for snacks/water)
CREATE TABLE IF NOT EXISTS item_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  unit_price NUMERIC DEFAULT 0.00,
  last_updated DATETIME DEFAULT (datetime('now'))
);

-- OPTIONAL: notification_log
CREATE TABLE IF NOT EXISTS notification_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER,
  bill_id INTEGER,
  medium TEXT DEFAULT 'SMS',
  message TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (guest_id) REFERENCES guest(id) ON DELETE SET NULL,
  FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE SET NULL
);

-- ============================================================
-- TRIGGERS: invoice generation and automatic recalculations
-- ============================================================

-- 1) AFTER INSERT on bill -> increment financial_year.current_invoice_no and set invoice_no
CREATE TRIGGER IF NOT EXISTS trg_after_insert_bill
AFTER INSERT ON bill
BEGIN
  -- increment invoice counter
  UPDATE financial_year
    SET current_invoice_no = current_invoice_no + 1
    WHERE id = NEW.financial_year_id;

  -- update invoice_no using prefix and the new counter (if financial_year_id provided)
  UPDATE bill
    SET invoice_no = (
      SELECT
        CASE
          WHEN invoice_prefix IS NULL OR invoice_prefix = ''
            THEN printf('%d-%06d', NEW.financial_year_id, (SELECT current_invoice_no FROM financial_year WHERE id = NEW.financial_year_id))
            ELSE printf('%s-%06d', invoice_prefix, (SELECT current_invoice_no FROM financial_year WHERE id = NEW.financial_year_id))
        END
      FROM financial_year WHERE id = NEW.financial_year_id
    )
    WHERE id = NEW.id AND NEW.financial_year_id IS NOT NULL;
END;

-- 2) When extra_bill inserted/updated/deleted -> update extra_charge_total on bill and ensure extra_bill.total is set
CREATE TRIGGER IF NOT EXISTS trg_after_insert_extra_bill
AFTER INSERT ON extra_bill
BEGIN
  -- compute total for the inserted row if not provided
  UPDATE extra_bill SET total = (amount * quantity) WHERE id = NEW.id;

  -- update bill.extra_charge_total
  UPDATE bill
    SET extra_charge_total = COALESCE((SELECT SUM(COALESCE(total, amount*quantity)) FROM extra_bill WHERE bill_id = NEW.bill_id), 0)
    WHERE id = NEW.bill_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_after_update_extra_bill
AFTER UPDATE ON extra_bill
BEGIN
  UPDATE extra_bill SET total = (amount * quantity) WHERE id = NEW.id;
  UPDATE bill
    SET extra_charge_total = COALESCE((SELECT SUM(COALESCE(total, amount*quantity)) FROM extra_bill WHERE bill_id = NEW.bill_id), 0)
    WHERE id = NEW.bill_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_after_delete_extra_bill
AFTER DELETE ON extra_bill
BEGIN
  UPDATE bill
    SET extra_charge_total = COALESCE((SELECT SUM(COALESCE(total, amount*quantity)) FROM extra_bill WHERE bill_id = OLD.bill_id), 0)
    WHERE id = OLD.bill_id;
END;

-- 3) When payments change -> update totals and payment_status
CREATE TRIGGER IF NOT EXISTS trg_after_insert_payment
AFTER INSERT ON payment
BEGIN
  UPDATE bill
    SET total_paid = COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')), 0),
        total_advance = COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND payment_type='ADVANCE'), 0)
    WHERE id = NEW.bill_id;

  -- update payment_status based on current totals and final_amount
  UPDATE bill
    SET payment_status =
      CASE
        WHEN COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')),0) >= COALESCE(final_amount,0) THEN 'PAID'
        WHEN COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')),0) > 0 THEN 'PARTIAL'
        ELSE 'UNPAID'
      END
    WHERE id = NEW.bill_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_after_update_payment
AFTER UPDATE ON payment
BEGIN
  UPDATE bill
    SET total_paid = COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')), 0),
        total_advance = COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND payment_type='ADVANCE'), 0)
    WHERE id = NEW.bill_id;

  UPDATE bill
    SET payment_status =
      CASE
        WHEN COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')),0) >= COALESCE(final_amount,0) THEN 'PAID'
        WHEN COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = NEW.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')),0) > 0 THEN 'PARTIAL'
        ELSE 'UNPAID'
      END
    WHERE id = NEW.bill_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_after_delete_payment
AFTER DELETE ON payment
BEGIN
  UPDATE bill
    SET total_paid = COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = OLD.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')), 0),
        total_advance = COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = OLD.bill_id AND payment_type='ADVANCE'), 0)
    WHERE id = OLD.bill_id;

  UPDATE bill
    SET payment_status =
      CASE
        WHEN COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = OLD.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')),0) >= COALESCE(final_amount,0) THEN 'PAID'
        WHEN COALESCE((SELECT SUM(amount) FROM payment WHERE bill_id = OLD.bill_id AND (payment_type='ADVANCE' OR payment_type='FINAL')),0) > 0 THEN 'PARTIAL'
        ELSE 'UNPAID'
      END
    WHERE id = OLD.bill_id;
END;
`;
