import { BaseEntity, StatusFlag } from "../common";

export interface ServiceTax extends BaseEntity {
  service_tax_percent: number;
  effective_from?: string | null;
  effective_to?: string | null;
  is_active: StatusFlag;
}
