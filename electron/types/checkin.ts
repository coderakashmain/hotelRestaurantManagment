export interface CheckIn {
  id: number;
  guest_id: number;
  room_id: number;

  check_in_time: string;
  expected_check_out_time: string | null;
  check_out_time: string | null;

  stay_type: Number; // 12H, 24H, HOURLY, CUSTOM
  rate_applied: number;

  no_of_guests: number;
  status: string;

  created_at: string;
  updated_at: string;
}
