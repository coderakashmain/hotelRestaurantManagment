import { useRef } from "react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../api/api";
import { useCompany } from "../../context/CompanyInfoContext";
import { formatCurrency } from "../../utils/currency";

export default function BillReceiptPrint({
  billId,
  onClose,
}: {
  billId: number;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const { company } = useCompany();

  const { data } = useAsync<any>(
    () => api.restaurant_bill.get(billId),
    [billId]
  );

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const w = window.open("", "", "width=300,height=600");
    w?.document.write(`
      <html>
        <head>
          <title>Bill</title>
          <style>
           * {
  box-sizing: border-box;
  font-family: monospace;
}

@page {
  size: 58mm auto; /* 🔥 thermal paper width */
  margin: 0;
}

body {
  margin: 0;
   padding: 6px;
   width: 280px;
              font-size: 11px;
              line-height: 1.2;
}

.receipt {
  width: 58mm;
  padding: 6px;
  font-size: 11px;
  line-height: 1.2;
}

.center { text-align: center; }
.right { text-align: right; }
.bold { font-weight: bold; }

hr {
  border: none;
  border-top: 1px dashed #000;
  margin: 6px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 2px 0;
  font-size: 11px;
  word-break: break-word;
}

          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `);
    w?.document.close();
  };

  if (!data) return null;

  const { bill, items } = data;

  return (
    <>
      {/* ================= RECEIPT ================= */}
      <div ref={printRef} className="receipt">
        {/* HEADER */}
        <div className="center font-bold">{company?.name?.toUpperCase()}</div>
        <div className="center text-xs">
          {company?.address}, {company?.city}
        </div>
        <div className="center text-xs">Ph: {company?.contact_number}</div>
        {company?.gst_number && (
          <div className="center text-xs">GST No: {company.gst_number}</div>
        )}

        <hr />

        <div className="center font-bold">BILL</div>

        <hr />

        {/* META */}
        <div>Bill No : {bill.bill_no}</div>
        <div>Wr No : {bill.waiter_name}</div>
        <div>Room/Table : {bill.table_no}</div>
        <div>Date : {new Date(bill.bill_date).toLocaleString()}</div>
        <div>Cashier : ADMIN</div>

        <hr />

        {/* ITEMS */}
        <table>
          <thead>
            <tr>
              <td>Sl</td>
              <td>Item</td>
              <td className="right">Qty</td>
              <td className="right">Rate</td>
              <td className="right">Amount</td>
            </tr>
          </thead>
          <tbody>
            {items.map((i: any, idx: number) => (
              <tr key={i.id}>
                <td>{idx + 1}</td>
                <td>{i.dish_name}</td>
                <td className="right">{i.quantity}</td>
                <td className="right">{formatCurrency(i.rate)}</td>
                <td className="right">{formatCurrency(i.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* TOTALS */}
        <div className="right">Total : {items.length}</div>
        <div className="right">{formatCurrency(bill.basic_amount)}</div>

        {bill.discount > 0 && (
          <div className="right">
            Discount : {formatCurrency(bill.discount)}
          </div>
        )}

        <hr />

        <div className="right">
          Sub Total : {formatCurrency(bill.basic_amount - (bill.discount || 0))}
        </div>

        <div className="right">GST : {formatCurrency(bill.gst_amount)}</div>

        <div className="right">
          Service Tax : {formatCurrency(bill.service_tax_amount)}
        </div>

        <hr />

        <div className="right font-bold">
          Grand Total : {formatCurrency(bill.net_amount)}
        </div>

        <hr />

        {/* FOOTER */}
        <div className="text-xs">
          Guest Signature
          <br />
          (Please do not sign if you have paid)
        </div>

        <div className="right text-xs">CASHIER</div>

        <hr />

        <div className="center text-xs">Thank You !! Please Visit Again</div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handlePrint}
          className="flex-1 bg-blue-600 text-white py-2 rounded-sm"
        >
          Print
        </button>

        <button onClick={onClose} className="flex-1 border py-2 rounded-sm">
          Close
        </button>
      </div>
    </>
  );
}
