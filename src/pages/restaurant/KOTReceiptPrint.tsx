import { useRef } from "react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../api/api";
import { useCompany } from "../../context/CompanyInfoContext";

export default function KOTReceiptPrint({
  kotId,
  onClose,
}: {
  kotId: number;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const { company } = useCompany();

  const { data } = useAsync<any>(() => api.kot.get(kotId), [kotId]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const w = window.open("", "", "width=300,height=600");

    w?.document.write(`
      <html>
        <head>
          <title>KOT</title>
          <style>
            * {
              box-sizing: border-box;
              font-family: monospace;
            }

            body {
              margin: 0;
              padding: 6px;
              width: 280px;
              font-size: 11px;
              line-height: 1.2;
            }

            .center {
              text-align: center;
            }

            .bold {
              font-weight: bold;
            }

            hr {
              border: none;
              border-top: 1px dashed #000;
              margin: 6px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            th, td {
              padding: 2px 0;
              font-size: 11px;
              word-break: break-word;
            }

            .right {
              text-align: right;
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

  return (
    <>
      {/* ================= PRINT AREA ================= */}
      <div ref={printRef}>
        {/* COMPANY HEADER */}
        <div className="center bold">
          {company?.name?.toUpperCase()}
        </div>

        {company?.address && (
          <div className="center">
            {company.address}
            {company.city ? `, ${company.city}` : ""}
          </div>
        )}

        {company?.contact_number && (
          <div className="center">
            Ph: {company.contact_number}
          </div>
        )}

        {company?.gst_number && (
          <div className="center">
            GST: {company.gst_number}
          </div>
        )}

        <hr />

        {/* KOT INFO */}
        <div>KOT NO : {data.kot.kot_no}</div>
        <div>Table : {data.kot.table_no}</div>
        <div>Waiter : {data.kot.waiter_name}</div>
        <div>
          Date : {new Date(data.kot.created_at).toLocaleString()}
        </div>

        <hr />

        {/* ITEMS */}
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th className="right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((i: any) => (
              <tr key={i.id}>
                <td>{i.dish_name}</td>
                <td className="right">{i.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <div className="right">
          Total Items : {data.items.length}
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handlePrint}
          className="flex-1 bg-blue-600 text-white py-2 rounded-sm"
        >
          Print
        </button>

        <button
          onClick={onClose}
          className="flex-1 border py-2 rounded-sm"
        >
          Close
        </button>
      </div>
    </>
  );
}
