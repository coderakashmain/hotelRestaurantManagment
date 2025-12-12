export interface GST {
  id: number;
  gst_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  effective_from: string;
  effective_to: string | null;
  is_active: number;
  created_at: string;
}
