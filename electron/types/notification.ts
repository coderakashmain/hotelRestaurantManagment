export interface NotificationLog {
  id: number;

  guest_id?: number | null;
  bill_id?: number | null;

  medium: string;   // SMS, WHATSAPP, EMAIL
  message: string;
  status: string;   // SENT, FAILED, PENDING

  created_at: string;
}
