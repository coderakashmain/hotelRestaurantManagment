// services/guests.ts
import { getDb } from "../db/database";
import { Guest } from "../types";

const db = getDb();

/* ==================================================
   ADD GUEST
================================================== */
export const addGuest = (
  full_name: string,
  phone?: string,
  email?: string,
  address?: string,
  id_proof_type?: string,
  id_proof_number?: string,
  id_proof_image?: string
) => {
  return db
    .prepare(
      `INSERT INTO guest 
       (full_name, phone, email, address, id_proof_type, id_proof_number, id_proof_image, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(
      full_name,
      phone ?? null,
      email ?? null,
      address ?? null,
      id_proof_type ?? null,
      id_proof_number ?? null,
      id_proof_image ?? null
    );
};

/* ==================================================
   LIST GUESTS
================================================== */
export const getAllGuests = (): Guest[] => {
  return db
    .prepare("SELECT * FROM guest ORDER BY created_at DESC")
    .all() as Guest[];
};

/* ==================================================
   GET ONE GUEST
================================================== */
export const getGuestById = (id: number): Guest | undefined => {
  return db.prepare("SELECT * FROM guest WHERE id = ?").get(id) as Guest;
};

export const getGuestByPhone = (phone: string): Guest | undefined => {
  return db.prepare("SELECT * FROM guest WHERE phone = ?").get(phone) as Guest;
}
/* ==================================================
   SEARCH GUEST (for check-in search box)
================================================== */
export const searchGuests = (query: string): Guest[] => {
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
export const updateGuest = (id: number, data: Partial<Guest>) => {
  const fields = Object.keys(data);
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
export const deleteGuest = (id: number) => {
  return db.prepare("DELETE FROM guest WHERE id = ?").run(id);
};
