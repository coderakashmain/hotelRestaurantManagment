import { Bill } from "./bill";

export interface FullBillSnapshot {
  bill: Bill;
  guest: any;
  room: any;
  stay: any;
  company: any;
  latest_payment: any;
  extras: any[];
}
