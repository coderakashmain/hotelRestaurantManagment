import { BaseEntity, StatusFlag } from "../common";

export interface Dish extends BaseEntity {
  dish_code: number;
  name: string;
  category_id: number;
  full_plate_rate: number;
  half_plate_rate: number;
  is_active: StatusFlag;
}
