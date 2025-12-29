import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { formatDateTime } from "../../utils/date";
import { useInvoiceData } from "../../context/InvoiceDataContext";
import { useCompany } from "../../context/CompanyInfoContext";
import { useNavigate } from "react-router";
import {
  BanknotesIcon,
  UserIcon,
  HomeIcon,
  ClockIcon,
  ReceiptPercentIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutModal({
  bill: billdata,
  onClose,
}: any) {
  const [amount, setAmount] = useState<number>(
    billdata.balance_amount || 0
  );
  const [method, setMethod] = useState("CASH");
  const [checkoutState, setCheckoutState] = useState(false);

  const { company } = useCompany();
  const { setInvoiceData, setCompanyData } = useInvoiceData();
  const navigate = useNavigate();

  const { data: bill, reload } = useAsync(
    () => api.bill.get(billdata.id),
    [billdata.id]
  );

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") finalPay();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  /* ================= CHECKOUT ================= */
  const finalPay = async () => {
    await api.bill.checkout({
      billId: billdata.id,
      finalPaymentAmount: amount,
      finalPaymentMethod: method,
      doRefundIfOverpaid: true,
    });

    reload();
    setCheckoutState(true);
  };

  useEffect(() => {
    if (checkoutState && bill) {
      setInvoiceData(bill);
      setCompanyData(company);
      navigate("/hotel/print/invoice");
    }
  }, [checkoutState, bill]);

  if (!bill) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-bg-secondary w-[560px] p-6 rounded-sm shadow-card animate-dropdown">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <ReceiptPercentIcon className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">Checkout Summary</h2>
              <p className="text-xs text-secondary">
                Final payment & invoice generation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-lightColor transition"
          >
            <XMarkIcon className="w-4 h-4 text-secondary" />
          </button>
        </div>

        {/* ================= BASIC INFO ================= */}
        <div className="text-sm space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-secondary" />
            <span><b>Guest:</b> {bill.guest?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-secondary" />
            <span><b>Room:</b> {bill.room?.number}</span>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-secondary" />
            <span>
              <b>Stay:</b>{" "}
              {formatDateTime(bill.stay?.check_in)} →{" "}
              {bill.stay?.check_out
                ? formatDateTime(bill.stay.check_out)
                : "Now"}
            </span>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="border p-3 rounded bg-gray-50 space-y-1 text-sm ">
          <div className="flex justify-between">
            <span>Room Charges</span>
            <span>₹ {bill.bill.room_charge_total}</span>
          </div>
          <div className="flex justify-between">
            <span>Extra Charges</span>
            <span>₹ {bill.bill.extra_charge_total}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>₹ {bill.bill.discount}</span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span>₹ {bill.bill.tax_total}</span>
          </div>

          <div className="flex justify-between font-medium border-t pt-2">
            <span>Final Amount</span>
            <span>₹ {bill.bill.final_amount}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>₹ {bill.bill.total_paid}</span>
          </div>

          <div className="flex justify-between font-semibold text-primary">
            <span className="flex items-center gap-1">
              <BanknotesIcon className="w-4 h-4" />
              Balance Payable
            </span>
            <span>₹ {bill.bill.balance_amount}</span>
          </div>
        </div>

        {/* ================= PAYMENT ================= */}
        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-secondary">
              Amount Receiving
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray
                         focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-secondary">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-sm border border-gray
                         focus:outline-none focus:border-primary transition"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-sm border border-gray hover:bg-lightColor transition"
          >
            Close
          </button>

          <button
            onClick={finalPay}
            className="px-5 py-2 text-sm rounded-sm bg-success text-white
                       hover:opacity-90 transition flex items-center gap-2"
          >
            <PrinterIcon className="w-4 h-4" />
            Confirm & Print
          </button>
        </div>
      </div>
    </div>
  );
}
