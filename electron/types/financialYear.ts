export interface FinancialYear {
  id: number;
  year_name: string;

  start_date: string;
  end_date: string;

  current_invoice_no: number;
  invoice_prefix: string | null;

   is_active: 0 | 1;
  created_at?: string;
}
