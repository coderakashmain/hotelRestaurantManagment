import { getDb } from "../db/database";
import { CheckOutSetting } from "../types";

const db = getDb();

export const getCheckOutSettings = (): CheckOutSetting[] => {
  return db.prepare("SELECT * FROM check_out_settings ORDER BY id").all() as CheckOutSetting[];
};

export const createCheckOutSetting = (data: {
  label: string;
  hours?: number;
  time?: string;
}) => {
  return db.prepare(`
    INSERT INTO check_out_settings (label, hours, time)
    VALUES (?, ?, ?)
  `).run(data.label, data.hours ?? null, data.time ?? null);
};

export const updateCheckOutSetting = (data: {
  id: number;
  label: string;
  hours?: number;
  time?: string;
}) => {
  return db.prepare(`
    UPDATE check_out_settings
    SET label = ?, hours = ?, time = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(data.label, data.hours ?? null, data.time ?? null, data.id);
};

export const deleteCheckOutSetting = (id: number) => {
  return db.prepare("DELETE FROM check_out_settings WHERE id = ?").run(id);
};

export const setDefaultCheckOut = (id: number) => {
  return db.prepare(`
    UPDATE check_out_settings
    SET is_default = 1, updated_at = datetime('now')
    WHERE id = ?
  `).run(id);
};

export default {
  getCheckOutSettings,
  createCheckOutSetting,
  updateCheckOutSetting,
  deleteCheckOutSetting,
  setDefaultCheckOut
};
