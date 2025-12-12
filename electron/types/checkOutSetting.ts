export interface CheckOutSetting {
  id: number;
  label: string;
  hours: number | null;
  time: string | null;
  is_default: number;
  created_at: string;
  updated_at: string;
}
