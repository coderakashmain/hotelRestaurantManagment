export interface Booking {
  id: number;
  guest_id: number;
  room_id: number | null;

  booking_from: string;
  booking_to: string | null;

  status: string; // REQUESTED, CONFIRMED, CANCELLED
  advance_amount: number;
  notes?: string | null;

  created_at: string;
}
