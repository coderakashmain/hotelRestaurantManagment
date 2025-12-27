import { useState } from "react";
import { api } from "../../api/api";
// import MoneyReceiptPrint from "./MoneyReceiptPrint";
import { useMrData } from "../../context/MrDataContext";
import { useNavigate } from "react-router";
export default function AddAdvanceModal({
  billId,
  guestId,
  onClose,
}: {
  billId: number;
  guestId: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const {setMrData} = useMrData();
  const navigate = useNavigate();



  const save = async () => {
    if (amount <= 0) return alert("Amount must be greater than 0");

    const data = await api.bill.addPayment({
      bill_id: billId,
      guest_id: guestId,
      payment_type: "ADVANCE",
      amount,
      method,
      reference_no: reference || "",
    });

 
    setMrData(data);
    navigate('/hotel/print/mr')

  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white min-w-96 p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Add Advance Payment</h2>

       
          <>
            <div>
              <label className="text-sm block">Amount</label>
              <input
                type="number"
                className="w-full border p-2 rounded mt-1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm block">Payment Method</label>
              <select
                className="w-full border p-2 rounded mt-1"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="ONLINE">Online</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-sm block">Reference No (optional)</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-4">
              <button className="px-4 py-2 border rounded" onClick={onClose}>
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded"
                onClick={save}
              >
                Save Advance
              </button>
            </div>
          </>
       

        {/* {paidStatus && (
          <div className="mt-4 p-3 border rounded  bg-green-50 text-center space-y-3">
            <p className="font-semibold text-green-700">
              Advance added successfully!
            </p>

            <div className="flex justify-center gap-3">
              <button onClick={onClose} className="px-4 py-2 border rounded text-nowrap cursor-pointer ">
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded text-nowrap cursor-pointer" 
                onClick={() => setCustomerView(true)}
              >
                Print Customer Copy
              </button>

              <button
                className="px-4 py-2 bg-gray-700 text-white rounded text-nowrap cursor-pointer"
                onClick={() => setEmployeeView(true)}
              >
                Print Employee Copy
              </button>
            </div>
          </div>
        )} */}
      </div>

     
    </div>
  );
}
