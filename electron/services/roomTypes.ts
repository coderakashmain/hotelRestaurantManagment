import { getDb } from "../db/database";
import { RoomType } from "../../src/components/rooms/types";

const db = getDb();

export const getRoomTypes = (): RoomType[] => {
  return db.prepare(`SELECT * FROM room_type ORDER BY id DESC`).all() as RoomType[];
};


export const createRoomType = (data: {
  type_name: string;
  full_rate: number;
  hourly_rate?: number;
}) => {
  return db.prepare(`
    INSERT INTO room_type (type_name, full_rate, hourly_rate)
    VALUES (?, ?, ?)
  `).run(data.type_name, data.full_rate, data.hourly_rate ?? 0);
};

export const updateRoomType = (id : number ,data: {
  id: number;
  type_name: string;
  full_rate: number;
  hourly_rate: number;
}) => {
  return db.prepare(`
    UPDATE room_type
    SET type_name = ?, full_rate = ?, hourly_rate = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(data.type_name, data.full_rate, data.hourly_rate, data.id);
};


export const deleteRoomType = (id: number) => {
  return db.prepare(`DELETE FROM room_type WHERE id = ?`).run(id);
};

export const toggleRoomType = (id: number, active: number) => {
  return db.prepare(`
    UPDATE room_type
    SET is_active = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(active, id);
};

export const getRoomTypeById = (id: number): RoomType | undefined => {
  return db.prepare(`SELECT * FROM room_type WHERE id = ?`).get(id) as RoomType | undefined;
};
