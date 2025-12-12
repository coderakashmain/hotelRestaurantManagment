export interface Room {
  id: number;
  floor_id: number | null;
  room_number: string;
  room_type_id: number | null;
  room_type: string; // AC, NON-AC, DELUXE, SUITE
  status: string;    // AVAILABLE, OCCUPIED, BLOCKED

  room_full_rate: number;
  room_hourly_rate: number;

  is_active: number;

  created_at: string;
  updated_at?: string;
}
