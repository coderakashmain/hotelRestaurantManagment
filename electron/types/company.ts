export interface CompanyInfo {
  id: number;
  name: string;
  address?: string | null;
  city ?: string | null;
  contact_number?: string | null;
  email?: string | null;
  gst_number?: string | null;
  logo_url?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  ifsc_code?: string | null;

  is_active: number;
  created_at: string;
  updated_at: string;
}
