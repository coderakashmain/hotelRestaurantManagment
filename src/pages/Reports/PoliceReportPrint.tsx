import { useRef } from "react";
import { formatDateTime } from "../../utils/date";
import { useCompany } from "../../context/CompanyInfoContext";
import { api } from "../../api/api";

export default function PoliceReportPrint({
  report,
  onBack,
}: {
  report: any;
  onBack: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const { company } = useCompany();

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>Police Report</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px;
              font-size: 12px;
            }
            th {
              background: #f0f0f0;
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };



  return (
    <div className="p-6 bg-white text-black">
      {/* ===== Screen-only buttons ===== */}
      <div className="flex gap-3 mb-4 print:hidden">
        <button onClick={onBack} className="px-3 py-1 bg-gray-300 rounded">
          ← Back
        </button>

        <button
          onClick={handlePrint}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          🖨️ Print / Save PDF
        </button>
        
      </div>

      {/* ===== PRINT AREA ===== */}
      <div ref={printRef}>
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="flex items-center gap-3">
            {company?.logo_url && (
              <img src={company.logo_url} alt="Hotel Logo" className="h-14" />
            )}
            <div>
              <h1 className="font-bold text-lg">{company?.name}</h1>
              <div className="text-xs whitespace-pre-line">
                {company?.address}
              </div>
              <div className="text-xs">
                {company?.contact_number} | {company?.email}
              </div>
            </div>
          </div>

          <div className="text-xs text-right">
            <div>
              <b>GST:</b> {company?.gst_number}
            </div>
            <div>
              <b>City:</b> {company?.city}
            </div>
          </div>
        </div>

        {/* ===== TITLE ===== */}
        <h2 className="text-center font-bold text-base mb-4 underline">
          POLICE GUEST INFORMATION REPORT
        </h2>

        {/* ===== REPORT META ===== */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <b>Report No:</b> {report.report_no}
          </div>
          <div>
            <b>Date:</b> {formatDateTime(report.created_at)}
          </div>
          <div>
            <b>Police Station:</b> {report.station_name}
          </div>
          <div>
            <b>Officer Name:</b> {report.officer_name || "-"}
          </div>
          <div className="col-span-2">
            <b>Station Address:</b> {report.station_address}
          </div>
          <div className="col-span-2">
            <b>Purpose:</b> {report.purpose}
          </div>
        </div>

        {/* ===== GUEST TABLE ===== */}
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Guest Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>ID Proof</th>
              <th>Check-in ID</th>
              <th>Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            {report.checkins.map((c: any, i: number) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td>{c.full_name}</td>
                <td>{c.phone}</td>
                <td>{c.address}</td>
                <td>
                  {c.id_proof_type} - {c.id_proof_number}
                </td>
                <td>{c.checkin_id}</td>
                <td>{formatDateTime(c.check_in_time)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== REMARKS ===== */}
        <div className="mt-4 text-sm">
          <b>Remarks:</b> {report.remarks || "-"}
        </div>

        {/* ===== SIGNATURES ===== */}
        <div className="mt-10 flex justify-between text-sm">
          <div>
            ________________________ <br />
            Hotel Authorized Sign
          </div>
          <div>
            ________________________ <br />
            Police Officer Sign
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="mt-8 text-xs text-center border-t pt-2">
          This is a system-generated police report from {company?.name}.
          Generated on {formatDateTime(new Date().toISOString())}
        </div>
      </div>
    </div>
  );
}
