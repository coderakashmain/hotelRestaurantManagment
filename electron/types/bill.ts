export interface Bill {
  id: number;
  check_in_id: number;
  guest_id: number;
  room_id: number;
  financial_year_id: number | null;
  invoice_no: string | null;

  room_charge_total: number;
  extra_charge_total: number;
  discount: number;
  tax_total: number;

  final_amount: number;
  total_advance: number;
  total_paid: number;
  balance_amount: number;

  payment_status: string;

  notes?: string | null;

  created_at: string;
  updated_at: string;
}

export interface BillDetails {
  bill: Bill;
  guest: {
    name: string;
    phone: string | null;
    address: string | null;
  };
  room: {
    number: string;
  };
  stay: {
    check_in: string;
    check_out: string | null;
    stay_type_label?: string;
    hours?: number | null;
    fixed_time?: string | null;
    rate_applied?: number | null;
    extra_time?: number | null;
  };
  extraSummary: Array<{
    id: number;
    name: string;
    gst_applicable: number;
    amount: number;
    quantity: number;
    total: number;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    payment_type: string;
    method: string;
    created_at: string;
    reference_no?: string | null;
  }>;
  latestPayment?: {
    id: number;
    amount: number;
    payment_type: string;
    method: string;
    created_at: string;
    reference_no?: string | null;
  } | null;
}
