import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { formatDateTime } from "../../utils/date";
import { useInvoiceData } from "../../context/InvoiceDataContext";
import { useCompany } from "../../context/CompanyInfoContext";
import { useNavigate } from "react-router";

export default function CheckoutModal({
  bill: billdata,
  onClose,
}: any) {
  const [amount, setAmount] = useState<number>(billdata.balance_amount || 0);
  const [method, setMethod] = useState("CASH");
  const {company} =useCompany();
  const {setInvoiceData,setCompanyData}=  useInvoiceData() ;
  const [checkoutstate,setCheckoutstate] = useState(false);
  const navigate  = useNavigate();
  

  const {
    data: bill,
    reload,
  } = useAsync(() => api.bill.get(billdata.id), [billdata.id]);

  const finalPay = async () => {
   await api.bill.checkout({
      billId: billdata.id,
      finalPaymentAmount: amount,
      finalPaymentMethod: method,
      doRefundIfOverpaid: true,
    });
    reload();
    setCheckoutstate(true)

    

    // refresh parent but don't close immediately (print first)
  };
  useEffect(()=>{
    if(checkoutstate){
      setInvoiceData(bill);
      setCompanyData(company)
      navigate('/hotel/print/invoice');
    }

  },[checkoutstate])

  if (!bill) return null;

 

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[520px] p-6 rounded shadow-xl relative">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-6 border-b pb-3">
          Checkout Summary
        </h2>

        {/* Bill Details */}
        <div className="space-y-2 text-[15px]">
          <p>
            <b>Guest:</b> {bill.guest?.name}
          </p>
          <p>
            <b>GUID:</b> {bill.bill?.guid}
          </p>
          <p>
            <b>Room:</b> {bill.room?.number}
          </p>
          <p>
            <b>Stay:</b> {formatDateTime(bill.stay?.check_in)} →{" "}
            {bill.stay?.check_out ? formatDateTime(bill.stay.check_out) : "Now"}
          </p>
        </div>

        <hr className="my-3" />

        {/* Charges Section */}
        <div className="border p-3 rounded bg-gray-50 space-y-1">
          <div className="space-y-1 text-sm">
            <p>
              <b>Room Charge:</b> ₹{bill.bill.room_charge_total}
            </p>
            <p>
              <b>Extra Charges:</b> ₹{bill.bill.extra_charge_total}
            </p>
            <p>
              <b>Discount:</b> ₹{bill.bill.discount}
            </p>
            <p>
              <b>GST:</b> ₹{bill.bill.tax_total}
            </p>
          </div>

          <hr className="my-3" />

          {/* Final */}
          <div className="text-sm font-semibold">
            <p>
              <b>Final Amount:</b> ₹{bill.bill.final_amount}
            </p>
            <p>
              <b>Paid:</b> ₹{bill.bill.total_paid}
            </p>
            <p>
              <b>Balance:</b> ₹{bill.bill.balance_amount}
            </p>
          </div>
        </div>

        {/* Payment Entry */}
        <div className="mt-6">
          <label className="block text-sm mb-1 font-medium">
            Amount Receiving
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border p-2 w-full rounded"
          />

          <label className="block mt-3 text-sm mb-1 font-medium">
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={finalPay}
            className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
          >
            Confirm & Print
          </button>
        </div>
      </div>

      {/* {print && (
        <InvoicePrint
          data={bill}
          company={company}
          onClose={() => {
            onDone();
            onClose();
            setPrint(false);
          }}
        />
      )} */}
    </div>
  );
}
