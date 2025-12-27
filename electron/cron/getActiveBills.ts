import { getDb } from "../db/database";

const db = getDb();

export const getActiveBills = () => {
  return db.prepare(`
    SELECT b.id AS bill_id
    FROM check_in ci
    JOIN bill b ON b.check_in_id = ci.id
    WHERE ci.status = 'ACTIVE'
  `).all() as { bill_id: number }[];
};
