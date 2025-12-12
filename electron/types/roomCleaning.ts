export interface RoomCleaning {
  id: number;
  room_id: number;
  cleaned_by?: number | null;

  cleaned_at: string;
  remarks?: string | null;
}
