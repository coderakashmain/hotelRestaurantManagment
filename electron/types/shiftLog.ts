export interface ShiftLog {
  id: number;
  user_id: number;

  shift_date: string;

  opening_cash: number;
  closing_cash: number;
  cash_collected: number;

  notes?: string | null;
  created_at: string;
}
