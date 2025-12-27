import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency } from "../../utils/currency";

/* =========================
   TYPES
========================= */
type ClosedKOT = {
  id: number;
  kot_no: string;
  table_no: string;
  waiter_name: string;
};

type BillPreview = {
  table_no: string;
  waiter_name: string;
  items: {
    dish_code: number;
    dish_name: string;
    quantity: number;
    rate: number;
    total: number;
  }[];
  basicAmount: number;
  gstAmount: number;
  serviceTaxAmount: number;
};

export default function BillingPage() {
  const [selectedKOTs, setSelectedKOTs] = useState<number[]>([]);
  const [discount, setDiscount] = useState(0);

  /* =========================
     LOAD CLOSED KOTS
  ========================= */
  const {
    data: closedKOTs,
    reload: reloadKOTs,
  } = useAsync<ClosedKOT[]>(
    () => api.kot.listClosed(),
    []
  );

  /* =========================
     BILL PREVIEW
  ========================= */
  const {
    data: preview,
    reload: reloadPreview,
  } = useAsync<BillPreview | null>(
    () =>
      
      selectedKOTs.length
        ? api.restaurant_bill.preview({ kotIds: selectedKOTs })
        : Promise.resolve(null),
    [selectedKOTs]
  );

  /* 🔥 FORCE PREVIEW REFRESH ON SELECTION CHANGE */
  useEffect(() => {
    if (selectedKOTs.length) {
        console.log(selectedKOTs),
      reloadPreview();
    }
  }, [selectedKOTs]);
  console.log("This is perview",preview)

  /* =========================
     TOGGLE KOT
  ========================= */
  const toggleKOT = (id: number) => {
    setSelectedKOTs((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* =========================
     SAVE BILL
  ========================= */
  const saveBill = async () => {
    if (!selectedKOTs.length) {
      alert("Select at least one KOT");
      return;
    }

    await api.restaurant_bill.create({
      kotIds: selectedKOTs,
      discount,
    });

    alert("Bill saved successfully");

    setSelectedKOTs([]);
    setDiscount(0);
    reloadKOTs();
  };

  /* =========================
     TOTALS
  ========================= */
  const basicAmount = preview?.basicAmount || 0;
  const gstAmount = preview?.gstAmount || 0;
  const serviceTax = preview?.serviceTaxAmount || 0;

  const netPayable =
    basicAmount - discount + gstAmount + serviceTax;

  return (
    <div className="h-full grid grid-cols-3 gap-4 p-4">
      {/* =========================
          LEFT PANEL – CLOSED KOTS
      ========================= */}
      <div className="bg-white rounded shadow p-3 overflow-y-auto">
        <h3 className="font-semibold mb-2">Closed KOTs</h3>

        <div className="grid grid-cols-3 text-xs font-semibold border-b mb-2">
          <span>Table</span>
          <span>Order</span>
          <span>Waiter</span>
        </div>

        {closedKOTs?.length === 0 && (
          <div className="text-sm text-gray-500 mt-4">
            No closed KOTs available
          </div>
        )}

        {closedKOTs?.map((k) => (
          <label
            key={k.id}
            className="grid grid-cols-3 text-sm cursor-pointer hover:bg-gray-100 items-center"
          >
            <input
              type="checkbox"
              checked={selectedKOTs.includes(k.id)}
              onChange={() => toggleKOT(k.id)}
            />
            <span>{k.table_no}</span>
            <span>{k.kot_no}</span>
            <span>{k.waiter_name}</span>
          </label>
        ))}
      </div>

      {/* =========================
          RIGHT PANEL – BILL
      ========================= */}
      <div className="col-span-2 bg-white rounded shadow p-4">
        {!preview ? (
          <div className="text-center text-gray-500 mt-20">
            Select KOT(s) to generate bill
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
              <div>
                <b>Bill No:</b> AUTO
              </div>
              <div>
                <b>Date:</b>{" "}
                {new Date().toLocaleDateString()}
              </div>
              <div>
                <b>Table:</b> {preview.table_no}
              </div>
              <div>
                <b>Waiter:</b> {preview.waiter_name}
              </div>
            </div>

            {/* DISH TABLE */}
            <table className="w-full border-collapse text-sm mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Sl</th>
                  <th className="border p-2">Dish</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Rate</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {preview.items.map((i, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">
                      {idx + 1}
                    </td>
                    <td className="border p-2">
                      {i.dish_name}
                    </td>
                    <td className="border p-2">
                      {i.quantity}
                    </td>
                    <td className="border p-2">
                      {formatCurrency(i.rate)}
                    </td>
                    <td className="border p-2">
                      {formatCurrency(i.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SUMMARY */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Basic Amount</span>
              <span className="text-right">
                {formatCurrency(basicAmount)}
              </span>

              <span>Discount</span>
              <input
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(Number(e.target.value))
                }
                className="border px-2 py-1 text-right"
              />

              <span>GST</span>
              <span className="text-right">
                {formatCurrency(gstAmount)}
              </span>

              <span>Service Tax</span>
              <span className="text-right">
                {formatCurrency(serviceTax)}
              </span>

              <b>Net Payable</b>
              <b className="text-right">
                {formatCurrency(netPayable)}
              </b>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveBill}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>

              <button className="px-4 py-2 bg-gray-500 text-white rounded">
                Print
              </button>

              <button
                onClick={() => setSelectedKOTs([])}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
