import { BaseEntity, StatusFlag } from "../common";

export interface RestaurantTable extends BaseEntity {
  table_code: number;
  table_no: string;
  description?: string | null;
  is_active: StatusFlag;
}
