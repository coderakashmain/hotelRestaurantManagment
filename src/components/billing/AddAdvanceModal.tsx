import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useMrData } from "../../context/MrDataContext";
import { useNavigate } from "react-router";
import { useSnackbar } from "../../context/SnackbarContext";

export default function AddAdvanceModal({
  billId,
  guestId,
  onClose,
}: {
  billId: number;
  guestId: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");

  const { setMrData } = useMrData();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") save();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  /* ================= SAVE ================= */
  const save = async () => {
    if (Number(amount) <= 0 || amount === "") {
      showSnackbar("Amount must be greater than 0", "warning");
      return;
    }

    const data = await api.bill.addPayment({
      bill_id: billId,
      guest_id: guestId,
      payment_type: "ADVANCE",
      amount,
      method,
      reference_no: reference || "",
    });

    showSnackbar("Advance payment added", "success");
    setMrData(data);
    navigate("/hotel/print/mr");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-bg-secondary w-[420px] rounded-sm shadow-card p-6 animate-dropdown"
        role="dialog"
        aria-modal="true"
      >
        {/* ================= HEADER ================= */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Add Advance Payment</h2>
          <p className="text-xs text-secondary">
            Record advance received from guest
          </p>
        </div>

        {/* ================= FORM ================= */}
        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-secondary">
              Amount
            </label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray
                         focus:outline-none focus:border-primary transition"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              min={0}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-medium text-secondary">
              Payment Method
            </label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray
                         focus:outline-none focus:border-primary transition"
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

          {/* Reference */}
          <div>
            <label className="text-xs font-medium text-secondary">
              Reference No (optional)
            </label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray
                         focus:outline-none focus:border-primary transition"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="UPI / Cheque / Txn ID"
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-sm border border-gray
                       hover:bg-lightColor transition"
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="btn text-sm px-5"
          >
            Save Advance
          </button>
        </div>
      </div>
    </div>
  );
}
