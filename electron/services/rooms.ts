// services/rooms.ts
import { getDb } from "../db/database";
import { Floor, Room  } from "../types";

const db = getDb();

/* ====================================
   FLOORS
==================================== */

export const getFloors = (): Floor[] => {
  return db
    .prepare("SELECT * FROM floor ORDER BY floor_number ASC")
    .all() as Floor[];
};

export const addFloor = (floor_name: string, floor_number?: number) => {
  return db
    .prepare(
      `INSERT INTO floor (floor_name, floor_number, created_at)
       VALUES (?, ?, datetime('now'))`
    )
    .run(floor_name, floor_number ?? null);
};

//  NEW — rename floor
export const renameFloor = (id: number, floor_name: string) => {
  return db
    .prepare(
      `UPDATE floor SET floor_name = ?, created_at = datetime('now')
       WHERE id = ?`
    )
    .run(floor_name, id);
};

/* ====================================
   ROOMS
==================================== */



export const getAllRooms = (): any[] => {
   return db.prepare(`
    SELECT 
      r.*,
      g.id AS guest_id,
      g.full_name AS guest_name,
      g.phone AS guest_phone,
      f.type_name as room_type,
      f.full_rate as room_full_rate,
      f.hourly_rate as room_hourly_rate
    FROM room r
    LEFT JOIN room_type f
      ON f.id = r.room_type_id
    LEFT JOIN check_in c 
      ON c.room_id = r.id AND c.status = 'ACTIVE'
    LEFT JOIN guest g 
      ON g.id = c.guest_id AND c.status = 'ACTIVE'
    WHERE r.is_active = TRUE
    ORDER BY r.room_number
  `).all();
};

export const getRoomById = (id: number): Room | undefined => {
  return db.prepare("SELECT * FROM room WHERE id = ?").get(id) as Room;
};

export const addRoom = (
  roomNumber: string,
  floorId: number
) => {

   const validFloor = floorId ? db.prepare(`SELECT id FROM floor WHERE id = ?`).get(floorId) : null;
  return db
    .prepare(
      `INSERT INTO room
        (floor_id, room_number,created_at)
       VALUES (?, ?,datetime('now'))`
    )
    .run(validFloor ? floorId : null, roomNumber);
};

export const updateRoomStatus = (roomId: number, status: string) => {
  if(status.toLocaleLowerCase() === "blocked"){
     return db
    .prepare(
      `UPDATE room SET status = ?, created_at = datetime('now') ,is_active = FALSE
       WHERE id = ?`
    )
    .run(status, roomId);
  }else{
     return db
    .prepare(
      `UPDATE room SET status = ?, created_at = datetime('now')
       WHERE id = ?`
    )
    .run(status, roomId);
  }
 
};

//  NEW — update room (type, status, prices)
export const updateRoom = (id: number, data: Partial<Room>) => {
  const fields = Object.keys(data);
  if (fields.length === 0) return;


  
  const values = data.room_type_id;

 
  return db
    .prepare(
      `UPDATE room 
       SET room_type_id = ?, created_at = datetime('now')
       WHERE id = ?`
    )
    .run(values, id);
};
