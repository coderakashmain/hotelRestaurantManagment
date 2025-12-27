// services/guests.ts
import { getDb } from "../db/database";
import { Guest } from "../types";

const db = getDb();

/* ==================================================
   ADD GUEST  ✅ UPDATED (OBJECT-BASED)
================================================== */
export const addGuest = (data: {
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  id_proof_image?: string;
}) => {
  return db
    .prepare(
      `INSERT INTO guest 
       (full_name, phone, email, address, id_proof_type, id_proof_number, id_proof_image, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(
      data.full_name,
      data.phone ?? null,
      data.email ?? null,
      data.address ?? null,
      data.id_proof_type ?? null,
      data.id_proof_number ?? null,
      data.id_proof_image ?? null
    );
};

/* ==================================================
   LIST GUESTS
================================================== */
export const getAllGuests = (_payload?: any): Guest[] => {
  return db
    .prepare("SELECT * FROM guest ORDER BY created_at DESC")
    .all() as Guest[];
};

/* ==================================================
   GET ONE GUEST
================================================== */
export const getGuestById = (payload: number | { id: number }): Guest | undefined => {
  const id = typeof payload === "number" ? payload : payload.id;
  return db.prepare("SELECT * FROM guest WHERE id = ?").get(id) as Guest;
};

export const getGuestByPhone = ( payload: string | { phone: string }): Guest | undefined => {
  const phone = typeof payload === "string" ? payload : payload.phone;
  return db.prepare("SELECT * FROM guest WHERE phone = ?").get(phone) as Guest;
};

/* ==================================================
   SEARCH GUEST (for check-in search box)
================================================== */
export const searchGuests = (  payload: string | { query: string }): Guest[] => {
  const query = typeof payload === "string" ? payload : payload.query;
  return db
    .prepare(
      `SELECT * FROM guest 
       WHERE full_name LIKE ? OR phone LIKE ?
       ORDER BY created_at DESC`
    )
    .all(`%${query}%`, `%${query}%`) as Guest[];
};

/* ==================================================
   UPDATE GUEST
================================================== */
export const updateGuest = (data: {
  id: number;
  payload: Partial<Guest>;
}) => {
  const { id, payload } = data;
  const fields = Object.keys(payload);
  if (!fields.length) return;

  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => (data as any)[f]);

  return db
    .prepare(
      `UPDATE guest SET ${setClause}
       WHERE id = ?`
    )
    .run(...values, id);
};

/* ==================================================
   DELETE GUEST
================================================== */
export const deleteGuest = (payload: number | { id: number }) => {
  const id = typeof payload === "number" ? payload : payload.id;
  return db.prepare("DELETE FROM guest WHERE id = ?").run(id);
};
