import { BaseEntity, StatusFlag } from "../common";

export interface Employee extends BaseEntity {
  emp_code: number;
  name: string;
  father_name?: string | null;
  location?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  nationality?: string | null;
  aadhaar_no?: string | null;
  mobile?: string | null;
  designation?: string | null;
  is_active: StatusFlag;
}
