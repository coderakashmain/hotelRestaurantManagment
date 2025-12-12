export interface Payment {
  id: number;
  bill_id: number;
  guest_id: number;

  payment_type: "ADVANCE" | "FINAL" | "REFUND";
  amount: number;

  method: string; // CASH, CARD, UPI, ONLINE...
  reference_no?: string | null;
  note?: string | null;

  created_at: string;
}
