import { useState, useEffect } from "react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../api/api";
import { useSnackbar } from "../../context/SnackbarContext";

export default function AddExtraChargeModal({
  billId,
  onClose,
}: {
  billId: number;
  onClose: () => void;
}) {
  const { data: billTypes } = useAsync(() => api.billType.list(), []);
  const { showSnackbar } = useSnackbar();

  const [billTypeId, setBillTypeId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const total = amount;

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") saveCharge();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  /* ================= SAVE ================= */
  const saveCharge = async () => {
    if (!billTypeId) {
      showSnackbar("Please select charge type", "warning");
      return;
    }

    if (amount <= 0) {
      showSnackbar("Amount must be greater than 0", "warning");
      return;
    }

    await api.bill.addExtra({
      bill_id: billId,
      bill_type_id: billTypeId,
      description,
      amount,
    });

    showSnackbar("Extra charge added successfully", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-bg-secondary w-[420px] rounded-sm shadow-card p-6 animate-dropdown">
      <div className="mb-4">
          <h2 className="text-sm font-semibold">Add Extra Charge</h2>
          <p className="text-xs text-secondary mt-2">
            Add additional charge to the current bill
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-secondary">Charge Type</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray focus:border-primary transition"
              value={billTypeId ?? ""}
              onChange={(e) => setBillTypeId(Number(e.target.value))}
            >
              <option value="">Select charge</option>
              {billTypes?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-secondary">Description</label>
            <textarea
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray focus:border-primary transition"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-secondary">Amount</label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray focus:border-primary transition"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-between pt-3 border-t border-gray">
            <span className="text-xs text-secondary">Total</span>
            <span className="font-semibold text-primary">₹ {total}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-sm border border-gray hover:bg-lightColor transition"
          >
            Cancel
          </button>
          <button onClick={saveCharge} className="btn text-sm px-5">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
