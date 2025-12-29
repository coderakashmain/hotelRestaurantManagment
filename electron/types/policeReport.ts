export interface PoliceReport {
  id?: number;

  report_no: string;

  station_name: string;
  station_address?: string;
  officer_name?: string;

  purpose?: string;
  remarks?: string;

  submitted?: number;          // 0 | 1
  submitted_at?: string;

  created_at?: string;
  updated_at?: string;
}

export interface PoliceReportCheckIn {
  id?: number;

  police_report_id: number;
  check_in_id: number;

  created_at?: string;
}
