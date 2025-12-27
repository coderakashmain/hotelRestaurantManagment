import { BaseEntity } from "../common";

export type KOTStatus = "OPEN" | "CLOSED";

export interface KOT extends BaseEntity {
  kot_no: string;
  kot_date: string; // YYYY-MM-DD
  table_id: number;
  waiter_id: number;
  status: KOTStatus;
}
