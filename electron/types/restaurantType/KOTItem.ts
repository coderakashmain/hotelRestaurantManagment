import { BaseEntity } from "../common";

export interface KOTItem extends BaseEntity {
  kot_id: number;
  dish_id: number;
  quantity: number;
  rate: number;
  total: number;
}
