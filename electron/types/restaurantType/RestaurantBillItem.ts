import { BaseEntity } from "../common";

export interface RestaurantBillItem extends BaseEntity {
  bill_id: number;
  dish_id: number;
  quantity: number;
  rate: number;
  total: number;
}
