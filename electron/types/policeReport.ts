export interface PoliceReport {
  id?: number;

  check_in_id: number;
  guest_id: number;

  station_name: string;
  station_address?: string;
  officer_name?: string;

  purpose?: string;
  remarks?: string;

  submitted?: number;
  submitted_at?: string;

  created_at?: string;
}
