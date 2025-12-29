import { useAsync } from "../../hooks/useAsync";
import { api } from "../../api/api";
import { useCompany } from "../../context/CompanyInfoContext";
import { useEffect, useState } from "react";
import { useInvoiceData } from "../../context/InvoiceDataContext";
import { useNavigate } from "react-router";
import { useSnackbar } from "../../context/SnackbarContext";

import {
  ReceiptPercentIcon,
  UserIcon,
  PhoneIcon,
  HomeIcon,
  ClockIcon,
  BanknotesIcon,
  TagIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ShowBillModal({ billId, onClose }: any) {
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] =
    useState<"FLAT" | "PERCENT">("FLAT");

  const { setInvoiceData, setCompanyData } = useInvoiceData();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { company } = useCompany();

  const {
    loading,
    data: bill,
    reload,
  } = useAsync(() => api.bill.get(billId), [billId]);

  useEffect(() => {
    if (bill) setInvoiceData(bill);
    if (company && company.length > 0) {
      setCompanyData(company[0]);
    }
  }, [bill, company]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (loading || !bill) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-bg-secondary rounded-sm p-6 text-sm shadow-card">
          Loading bill…
        </div>
      </div>
    );
  }

  const applyDiscount = async () => {
    if (discountValue <= 0) {
      showSnackbar("Enter valid discount value", "warning");
      return;
    }

    await api.bill.updateDiscount({
      bill_id: billId,
      value: discountValue,
      type: discountType,
    });

    showSnackbar("Discount applied successfully", "success");
    reload();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-bg-secondary w-[540px] p-6 rounded-sm shadow-card animate-dropdown">

        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <ReceiptPercentIcon className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">Bill Details</h2>
              <p className="text-xs text-secondary">
                Review charges, discount & payments
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

        {/* ================= GUEST INFO ================= */}
        <div className="text-sm space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-secondary" />
            <span><b>Guest:</b> {bill.guest?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-secondary" />
            <span><b>Phone:</b> {bill.guest?.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-secondary" />
            <span><b>Address:</b> {bill.guest?.address}</span>
          </div>

          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-secondary" />
            <span><b>Room:</b> {bill.room?.number}</span>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-secondary" />
            <span>
              <b>Check-In:</b>{" "}
              {new Date(bill.stay?.check_in).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-secondary" />
            <span>
              <b>Check-Out:</b>{" "}
              {bill.stay?.check_out
                ? new Date(bill.stay.check_out).toLocaleString()
                : "---"}
            </span>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className=" border p-3 rounded bg-gray-50 space-y-1 text-sm ">
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

          <div className="flex justify-between font-medium border-t pt-2">
            <span>Sub Total</span>
            <span>
              ₹{" "}
              {bill.bill.room_charge_total +
                bill.bill.extra_charge_total}
            </span>
          </div>

          <div className="flex justify-between">
            <span>GST</span>
            <span>₹ {bill.bill.tax_total}</span>
          </div>

          <div className="flex justify-between">
            <span>Advance</span>
            <span>₹ {bill.bill.total_advance}</span>
          </div>

          <div className="flex justify-between font-semibold text-primary">
            <span className="flex items-center gap-1">
              <BanknotesIcon className="w-4 h-4" />
              Balance Payable
            </span>
            <span>₹ {bill.bill.balance_amount}</span>
          </div>
        </div>

        {/* ================= DISCOUNT ================= */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <TagIcon className="w-4 h-4 text-secondary" />
            Apply Discount
          </h3>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              className="border border-gray rounded-sm px-2 py-1 text-sm w-24"
              value={discountValue}
              onChange={(e) =>
                setDiscountValue(Number(e.target.value))
              }
            />

            <select
              className="border border-gray rounded-sm px-2 py-1 text-sm"
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as any)
              }
            >
              <option value="FLAT">₹ Flat</option>
              <option value="PERCENT">% Percent</option>
            </select>

            <button
              onClick={applyDiscount}
              className="btn text-sm px-4"
            >
              Apply
            </button>
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
            onClick={() => navigate("/hotel/print/invoice")}
            className="px-5 py-2 text-sm rounded-sm bg-success text-white hover:opacity-90 transition flex items-center gap-2"
          >
            <PrinterIcon className="w-4 h-4" />
            Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
