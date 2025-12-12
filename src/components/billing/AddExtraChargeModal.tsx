import { useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../api/api";

export default function AddExtraChargeModal({
  billId,
  onClose,
}: {
  billId: number;
  onClose: () => void;
}) {
  const { data: billTypes } = useAsync(() => api.billType.list(), []);

  const [billTypeId, setBillTypeId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const total = amount ;



  const saveCharge = async () => {
    if (!billTypeId) return alert("Select bill type");
    if (amount <= 0) return alert("Amount must be > 0");

    await api.bill.addExtra({
      bill_id: billId,
      bill_type_id: billTypeId,
      description,
      amount
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-96 rounded-lg shadow-lg p-6 space-y-4">

        <h2 className="text-xl font-bold">Add Extra Charge</h2>

        {/* Bill Type */}
        <div>
          <label className="text-sm">Bill Type</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={billTypeId ?? ""}
            onChange={(e) => setBillTypeId(Number(e.target.value))}
          >
            <option value="">Select Type</option>
            {billTypes?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add new Type */}
     

        {/* Description */}
        <div>
          <label className="text-sm">Description</label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm">Amount</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

      
        </div>

        {/* Total */}
        <div className="text-right font-semibold text-lg">
          Total: ₹{total}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={saveCharge}
            className="px-5 py-2 bg-blue-600 text-white rounded"
          >
            Save Charge
          </button>
        </div>
      </div>
    </div>
  );
}
