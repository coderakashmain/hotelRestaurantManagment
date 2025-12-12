import { useAsync } from "../../hooks/useAsync";
import { api } from "../../api/api";
import { useCompany } from "../../context/CompanyInfoContext";
import InvoicePrint from "./InvoicePrint";
import { useState } from "react";

export default function ShowBillModal({ billId, onClose }: any) {
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");

  const { company } = useCompany();
  const [print, setPrint] = useState(false);
  const {
    loading,
    data: bill,
    reload,
  } = useAsync(() => api.bill.get(billId), [billId]);



  if (!bill || loading) return <div>Loading...</div>;

  const applyDiscount = async () => {
    const res = await api.bill.updateDiscount({
      bill_id: billId,
      value: discountValue,
      type: discountType,
    });

    alert("Discount applied successfully!");
    reload();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] p-6 rounded shadow-xl">
        <h2 className="text-xl font-bold mb-4">Bill Details</h2>

        <div className="space-y-2 text-sm">
          <p>
            <b>Guest Name:</b> {bill.guest?.name}
          </p>
          <p>
            <b>Phone:</b> {bill.guest?.phone}
          </p>
          <p>
            <b>Address:</b> {bill.guest?.address}
          </p>

          <p>
            <b>Room:</b> {bill.room?.number}
          </p>
          <p>
            <b>Check-In:</b> {new Date(bill.stay?.check_in).toLocaleString()}
          </p>
          <p>
            <b> Check-Out:</b>{" "}
            {bill.stay?.check_out
              ? new Date(bill.stay.check_out).toLocaleString()
              : "---"}
          </p>
          <p>
            <b>Expected Check-Out:</b>{" "}
            {bill.bill?.expected_check_out_time
              ? new Date(bill.bill.expected_check_out_time).toLocaleString()
              : "---"}
          </p>

          <hr />

          {/* Summary vertical */}
          <div className="border p-3 rounded bg-gray-50 space-y-1">
            <div className="flex justify-between">
              <span>Room Fee</span>
              <span>₹ {bill.bill.room_charge_total}</span>
            </div>
            <div className="flex justify-between">
              <span>Extra Charge</span>
              <span>₹ {bill.bill.extra_charge_total}</span>
            </div>
             <div className="flex justify-between">
              <span>Discount</span>
              <span>₹ {bill.bill.discount}</span>
            </div>

            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Sub Total</span>
              <span>₹ {bill.bill.room_charge_total + bill.bill.extra_charge_total}</span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>
              <span>₹ {bill.bill.tax_total}</span>
            </div>
            <div className="flex justify-between">
              <span>Advance</span>
              <span>₹ {bill.bill.total_advance}</span>
            </div>
           
            <div className="flex justify-between">
              <span>Final Amount</span>
              <span>₹ {bill.bill.balance_amount}</span>
            </div>
          </div>
        </div>

        <hr className="my-3" />

        <h3 className="font-semibold">Discount</h3>

        <div className="flex gap-2 items-center">
          <input
            type="number"
            className="border p-1 w-24 rounded"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
          />

          <select
            className="border p-1 rounded"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as any)}
          >
            <option value="FLAT">₹ Flat</option>
            <option value="PERCENT">% Percent</option>
          </select>

          <button
            className="px-3 py-1 bg-blue-600 text-white rounded cursor-pointer text-sm"
            onClick={applyDiscount}
          >
            Apply
          </button>
        </div>

        <div className="mt-6 text-right gap-10">
          <button  className="px-4 py-2 border rounded mr-2 cursor-pointer" onClick={onClose}>
            Close
          </button>
          <button
            onClick={() => setPrint(true)}
            className="px-6 py-2 bg-green-600 text-white rounded cursor-pointer"
          >
            Print Bill
          </button>

          {print && (
            <InvoicePrint
              data={bill}
              company={company}
              onClose={() => setPrint(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
