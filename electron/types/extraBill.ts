export interface ExtraBill {
  id: number;
  bill_id: number;

  bill_type_id: number;
  description?: string | null;

  amount: number;
  quantity: number;
  total: number;

  added_by?: number | null;
  added_at: string;
}
