
import { formatDateTime } from "../../utils/date";
import {formatCurrency} from "../../utils/currency";
import { formatDateinNumber } from "../../utils/date";
import { numberToWords } from "../../utils/numberToWords";
import { useInvoiceData } from "../../context/InvoiceDataContext";
import { useNavigate } from "react-router";

export default function InvoicePrint() {
  const {invoiceData : data ,companyData : company}=useInvoiceData();
  const { bill, guest, room,finalTable, stay } =
    data;
    const navigate = useNavigate();

    
    const printDoc = () => window.print();
   

  return (
    <div className=" inset-0 bg-white flex justify-center items-start p-8 z-50 overflow-auto">
      <div className=" w-[900px] p-6 print:w-full print:p-0">
        {/* HEADER */}
        <div className="flex justify-between mb-3">
          <div className="text-start ">
            <h1 className="font-bold text-3xl">
              {company?.name || "Hotel Name"}
            </h1>
            <p className="mt-2 text-xs">{company?.address}</p>
            <p className="text-xs">Phone: {company?.contact_number}</p>
            <p className="text-xs">GSTIN: {company?.gst_number}</p>
          </div>

          <div className="text-right">
            <h1 className="font-bold text-xl">INVOICE</h1>
            <p className="mt-2 text-xs">
              <b>Invoice No:</b> {bill.invoice_no}
            </p>
            <p className=" text-xs">
              <b>GUID: </b> {bill.guid}
            </p>
            <p className="text-xs">
              <b>Date:</b> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* BILL TO + OTHER INFO */}
        <div className="flex justify-between mb-2">
          <div className="text-start">
            <h2 className="font-semibold ">Bill To</h2>
            <p className="text-xs mt-2">{guest.name}</p>
            <p className="text-xs">{guest.address}</p>
            <p className="text-xs">{guest.phone}</p>
          </div>

          <div className="text-start ">
            <h2 className="font-semibold ">Other Info</h2>
            <p className="text-xs mt-2">
              <b>Room No:</b> {room.number}
            </p>
            <p className="text-xs">
              <b>Check In:</b> {formatDateTime(stay.check_in)}
            </p>
            {stay.check_out && (<p className="text-xs">
              <b>Check Out:</b>{" "}
              {stay.check_out ? formatDateTime(stay.check_out) : "—"}
            </p>)}
            <p className="text-xs">
              <b>Stay:</b> {stay.hours ===1 ?`${stay.hour_count} Hrs` :stay.stay_type_label}
            </p>
          </div>
        </div>

        {/* ROOM + CHARGES TABLE */}
        <h2 className="font-semibold mb-2">Room Charges Summary</h2>

        {/* <div className="border p-4  space-y-2 w-full text-xs">
          <div className="flex justify-between">
            <span>Room Fee</span>
            <span>₹ {bill.room_charge_total}</span>
          </div>

          {extraSummary.map((e: any) => (
            <div className="flex justify-between" key={e.id}>
              <span>{e.name}</span>
              <span>₹ {e.total || 0}</span>
            </div>
          ))}
         


          <hr />

          <div className="flex justify-between font-semibold">
            <span>Sub Total</span>
            <span>₹ {bill.room_charge_total + bill.extra_charge_total}</span>
          </div>
           <div className="flex justify-between">
            <span>Discount</span>
            <span>₹ {bill.discount || 0}</span>
          </div>
          
          <div className="flex justify-between">
            <span>GST</span>
            <span>₹ {bill.tax_total || 0}</span>
          </div>

          <div className="flex justify-between">
            <span>Advance Paid</span>
            <span>₹ {bill.total_advance || 0}</span>
          </div>
         

          <hr />

          <div className="flex justify-between text-lg font-bold text-blue-700">
            <span>Final Amount</span>
            <span>₹ {bill.balance_amount}</span>
          </div>
           <div className="flex justify-between">
            <span>Payment status</span>
            <span className={`text-${bill.payment_status === "PAID" ? "green"  : bill.payment_status === "UNPAID" ? "red" : "yellow"}-600`}> {bill.payment_status }</span>
          </div>
        </div> */}
        <table className="w-full text-xs border">
          <thead className="font-bold bg-gray-100 ">
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Room Fee</th>
              <th className="border px-2 py-1">Extra Person</th>
              <th className="border px-2 py-1">Food</th>
              <th className="border px-2 py-1">Laundry</th>
              <th className="border px-2 py-1">Misc</th>
              <th className="border px-2 py-1">Adv</th>
            </tr>
          </thead>

          <tbody>
            {finalTable.map((row : any) => (
              <tr key={row.date}>
                <td className="border px-2 py-1">{formatDateinNumber(row.date)}</td>
                <td className="border px-2 py-1">{stay.hours ===1 ?formatCurrency(bill.room_charge_total) :  formatCurrency(row.room_fee)}</td>
                <td className="border px-2 py-1">
                  {row.extra["Extra Person"] || 0}
                </td>
                <td className="border px-2 py-1">{formatCurrency(row.extra["Food"] || 0)}</td>
                <td className="border px-2 py-1">
                  {formatCurrency(row.extra["Laundry"] || 0)}
                </td>
                <td className="border px-2 py-1">{formatCurrency(row.extra["Misc"] || 0)}</td>
                <td className="border px-2 py-1">{formatCurrency(row.advance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS SECTION */}
        <div className="flex justify-end mt-6">
          <div className="flex-1 flex justify-start">
            <p className="text-sm font-bold">{numberToWords(bill.balance_amount)}</p>
          </div>
          <table className="text-sm w-[300px] border">
            <tbody>
              <tr>
                <td className="border px-2 text-start">Total Bill</td>
                <td className="border px-2 text-right">
                   {formatCurrency(bill.extra_charge_total + bill.room_charge_total)}
                </td>
              </tr>
              <tr>
                <td className="border px-2 text-start">Discount</td> 
                <td className="border px-2 text-right"> {formatCurrency(bill.discount)}</td>
              </tr>
              {/* <tr>
                <td className="border px-2 text-start">Extra Charge</td>
                <td className="border px-2 text-right">₹ {bill.extra_charge_total}</td>
              </tr> */}
              <tr>
                <td className="border px-2 text-start">GST</td>
                <td className="border px-2 text-right"> {formatCurrency(bill.tax_total)}</td>
              </tr>
              <tr>
                <td className="border px-2 text-start">Advance</td>
                <td className="border px-2 text-right"> {formatCurrency(bill.total_advance)}</td>
              </tr>
              <tr className="font-bold bg-gray-100">
                <td className="border px-2 text-start">Net Bill</td>
                <td className="border px-2 text-right">
                   {formatCurrency(bill.balance_amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER SIGN */}
        <div className="flex justify-between mt-12 text-center text-sm">
          <span>
            ____________________ <br /> Customer
          </span>
          <span>
            ____________________ <br /> Reception
          </span>
          <span>
            ____________________ <br /> Cashier
          </span>
        </div>

        {/* PRINT BUTTON */}
        <div className="text-right mt-6 print:hidden">
          <button
            onClick={()=> navigate(-1)}
            className="px-4 py-2 border rounded mr-2 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={printDoc}
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          >
            Print Invoice
          </button>
        </div>
      </div>
      

      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            .border, .border td, .border th { border: 1px solid #000 !important; }
          }
        `}
      </style>
    </div>
  );
}
