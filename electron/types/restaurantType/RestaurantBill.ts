import { BaseEntity } from "../common";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface RestaurantBill extends BaseEntity {
  bill_no: string;
  bill_date: string; // YYYY-MM-DD
  table_id?: number | null;
  waiter_id?: number | null;
  customer_name?: string | null;

  basic_amount: number;
  discount: number;
  service_tax_amount: number;
  gst_amount: number;
  net_amount: number;

  payment_status: PaymentStatus;
}
