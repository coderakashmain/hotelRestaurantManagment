import { formatDateTime, formatDateinNumber } from "../../utils/date";
import { formatCurrency } from "../../utils/currency";
import { numberToWords } from "../../utils/numberToWords";
import { useInvoiceData } from "../../context/InvoiceDataContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useCompany } from "../../context/CompanyInfoContext";

export default function InvoicePrint() {
  const { invoiceData: data } = useInvoiceData();
  const {company} = useCompany();
  const { bill, guest, room, finalTable, stay } = data;
  const navigate = useNavigate();

  useEffect(()=>{
    if(!data || !company){
      navigate(-1);
    }
  },[data,company]);
  
  const printDoc = () => window.print();
  if(!data) return null;

  return (
    <>
      {/* ================= SCREEN CONTROLS (NOT PRINTED) ================= */}
      <div className="print:hidden   flex  p-6">
        <div className=" text-right">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded mr-2"
          >
            Close
          </button>
          <button
            onClick={printDoc}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Print Invoice
          </button>
        </div>
      </div>

      {/* ================= PRINTABLE INVOICE ================= */}
      <div className="invoice-print bg-white text-black p-6 w-200">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <div>
            <h1 className="font-bold text-2xl">{company?.name}</h1>
            <p className="text-xs whitespace-pre-line">{company?.address}</p>
            <p className="text-xs">Phone: {company?.contact_number}</p>
            <p className="text-xs">GSTIN: {company?.gst_number}</p>
          </div>

          <div className="text-right text-xs">
            <h2 className="font-bold text-lg">INVOICE</h2>
            <p><b>Invoice No:</b> {bill.invoice_no}</p>
            <p><b>GUID:</b> {bill.guid}</p>
            <p><b>Date:</b> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* BILL TO / INFO */}
        <div className="flex justify-between mb-4 text-xs">
          <div>
            <h3 className="font-semibold">Bill To</h3>
            <p>{guest.name}</p>
            <p>{guest.address}</p>
            <p>{guest.phone}</p>
          </div>

          <div>
            <h3 className="font-semibold">Stay Info</h3>
            <p><b>Room:</b> {room.number}</p>
            <p><b>Check In:</b> {formatDateTime(stay.check_in)}</p>
            {stay.check_out && (
              <p><b>Check Out:</b> {formatDateTime(stay.check_out)}</p>
            )}
            <p>
              <b>Stay:</b>{" "}
              {stay.hours === 1
                ? `${stay.hour_count} Hrs`
                : stay.stay_type_label}
            </p>
          </div>
        </div>

        {/* CHARGES TABLE */}
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th>Date</th>
              <th>Room</th>
              <th>Extra Person</th>
              <th>Food</th>
              <th>Laundry</th>
              <th>Misc</th>
              <th>Advance</th>
            </tr>
          </thead>
          <tbody>
            {finalTable.map((row: any) => (
              <tr key={row.date}>
                <td>{formatDateinNumber(row.date)}</td>
                <td>
                  {stay.hours === 1
                    ? formatCurrency(bill.room_charge_total)
                    : formatCurrency(row.room_fee)}
                </td>
                <td>{formatCurrency(row.extra["Extra Person"] || 0)}</td>
                <td>{formatCurrency(row.extra["Food"] || 0)}</td>
                <td>{formatCurrency(row.extra["Laundry"] || 0)}</td>
                <td>{formatCurrency(row.extra["Misc"] || 0)}</td>
                <td>{formatCurrency(row.advance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="flex justify-between mt-6 text-xs no-break">
          <div>
            <b>Amount in Words:</b>
            <p>{numberToWords(bill.balance_amount)}</p>
          </div>

          <table className="w-[280px]">
            <tbody>
              <tr>
                <td>Total</td>
                <td className="text-right">
                  {formatCurrency(bill.room_charge_total + bill.extra_charge_total)}
                </td>
              </tr>
              <tr>
                <td>Discount</td>
                <td className="text-right">{formatCurrency(bill.discount)}</td>
              </tr>
              <tr>
                <td>GST</td>
                <td className="text-right">{formatCurrency(bill.tax_total)}</td>
              </tr>
              <tr>
                <td>Advance</td>
                <td className="text-right">{formatCurrency(bill.total_advance)}</td>
              </tr>
              <tr className="font-bold">
                <td>Net Payable</td>
                <td className="text-right">
                  {formatCurrency(bill.balance_amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SIGNATURES */}
        <div className="flex justify-between mt-12 text-xs text-center no-break">
          <div>__________________<br />Customer</div>
          <div>__________________<br />Reception</div>
          <div>__________________<br />Cashier</div>
        </div>
      </div>

      {/* ================= PRINT CSS (CRITICAL) ================= */}
      <style>
        {`
          @page {
            size: A4;
            margin: 12mm;
          }

          @media print {

            /* Hide EVERYTHING */
            body * {
              visibility: hidden !important;
            }

            /* Show ONLY invoice */
            .invoice-print,
            .invoice-print * {
              visibility: visible !important;
            }

            /* Force invoice to page origin */
            .invoice-print {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
              background: #fff;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #000;
              padding: 6px;
            }

            th {
              background: #f2f2f2;
            }

            tr {
              page-break-inside: avoid;
            }

            .no-break {
              page-break-inside: avoid;
            }
          }
        `}
      </style>
    </>
  );
}
