import { BaseEntity, StatusFlag } from "../common";

export interface Category extends BaseEntity {
  category_code: number;
  description: string;
  sub_description?: string | null;
  short_name?: string | null;
  is_active: StatusFlag;
}
