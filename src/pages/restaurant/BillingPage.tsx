import { useState, useEffect, useRef } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency } from "../../utils/currency";
import BillReceiptPrint from "./BillReceiptPrint";
import { useSnackbar } from "../../context/SnackbarContext";
import { useLocation } from "react-router";

/* =========================
   TYPES
========================= */
type ClosedKOT = {
  id: number;
  kot_no: string;
  table_no: string;
  waiter_name: string;
  waiter_code?: number;
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
  gst_percentage : number;
  serviceTax_percent : number;
  basicAmount: number;
  gstAmount: number;
  serviceTaxAmount: number;
};

type Bill = {
  id: number;
  bill_no: string;
  bill_date: string;
  table_no: string;
  waiter_name: string;
  net_amount: number;
  payment_status: string;
};

export default function BillingPage() {
  const [selectedKOTs, setSelectedKOTs] = useState<number[]>([]);
  const { showSnackbar } = useSnackbar();
  const [filterTable, setFilterTable] = useState("");
  const [filterWaiterCode, setFilterWaiterCode] = useState("");
  const [filterWaiterName, setFilterWaiterName] = useState("");
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [servicetaxStatus, setServicetaxStatus] = useState(false);
  const [lastBillId, setLastBillId] = useState<number | null>(null);
  const location = useLocation();
  const stateTableId = location.state?.tableId;
  const tableRef = useRef<HTMLInputElement>(null);
const waiterCodeRef = useRef<HTMLInputElement>(null);
const waiterNameRef = useRef<HTMLInputElement>(null);


  const [discount, setDiscount] = useState(0);

  /* =========================
     LOAD CLOSED KOTS
  ========================= */
  const { data: closedKOTs, reload: reloadKOTs } = useAsync<ClosedKOT[]>(
    () => api.kot.listClosed(),
    []
  );
  // const { data: bills, reload: billlistReload } = useAsync<Bill[]>(
  //   () => api.restaurant_bill.list(),
  //   []
  // );

  /* =========================
     BILL PREVIEW
  ========================= */
  const { data: preview, reload: reloadPreview } = useAsync<BillPreview | null>(
    () =>
      selectedKOTs.length
        ? api.restaurant_bill.preview({ kotIds: selectedKOTs })
        : Promise.resolve(null),
    [selectedKOTs]
  );

  /* 🔥 FORCE PREVIEW REFRESH ON SELECTION CHANGE */
  useEffect(() => {
    if (selectedKOTs.length) {
      reloadPreview();
    }
  }, [selectedKOTs]);

  useEffect(() => {
    if (!closedKOTs) return;

    const hasAnyFilter =
      filterTable.trim() || filterWaiterCode.trim() || filterWaiterName.trim();

    // 🚫 No filters → do NOT auto select
    if (!hasAnyFilter) {
      setSelectedKOTs([]);
      return;
    }

    let filtered = closedKOTs;

    // 🔹 Table filter
    if (filterTable.trim()) {
      filtered = filtered.filter(
        (k) => String(k.table_no) === filterTable.trim()
      );
    }

    // 🔹 Waiter Code filter
    if (filterWaiterCode.trim()) {
      filtered = filtered.filter(
        (k) => String(k.waiter_code) === filterWaiterCode.trim()
      );

      if (filtered.length > 0) {
        setFilterWaiterName(filtered[0].waiter_name);
      } else {
        setFilterWaiterName("");
      }
    }

    // 🔹 Waiter Name filter (only if code empty)
    if (!filterWaiterCode.trim() && filterWaiterName.trim()) {
      filtered = filtered.filter((k) =>
        k.waiter_name.toLowerCase().includes(filterWaiterName.toLowerCase())
      );
    }

    setSelectedKOTs(filtered.map((k) => k.id));
  }, [filterTable, filterWaiterCode, filterWaiterName, closedKOTs,stateTableId]);
  useEffect(() => {
    if (!stateTableId || !closedKOTs) return;
  
  
    setFilterTable(String(stateTableId));
  
  }, [stateTableId, closedKOTs]);
  

  useEffect(() => {
    if (!filterWaiterName || !closedKOTs) return;

    const found = closedKOTs.find((k) =>
      k.waiter_name.toLowerCase().includes(filterWaiterName.toLowerCase())
    );

    if (found) {
      setFilterWaiterCode(String(found.waiter_code));
    }
  }, [filterWaiterName]);

  /* =========================
     TOGGLE KOT
  ========================= */
  const toggleKOT = (id: number) => {
    setSelectedKOTs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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

    const res = await api.restaurant_bill.create({
      kotIds: selectedKOTs,
      discount,
      servicetaxStatus,
    });
    showSnackbar("Bill created.",'success')

    setLastBillId(res.id); // backend must return bill id
    setShowBillPopup(true);
    // billlistReload();
    setSelectedKOTs([]);
    setDiscount(0);
    reloadKOTs();
  };

  /* =========================
     TOTALS
  ========================= */
  const [finalDiscount,setFinalDiscount] = useState<number>(0);
  const [finalGstAmount,setFinalGstAmount] = useState<number>(0);
  const basicAmount = preview?.basicAmount || 0;
  const gstAmount = preview?.gstAmount || 0;
  const serviceTax = preview?.serviceTaxAmount || 0;
const gst_percent = preview?.gst_percentage || 0;
  useEffect(()=>{
    setFinalDiscount(basicAmount * (discount/100))

  },[discount]);
  useEffect(()=>{
    const finalAmount = basicAmount - finalDiscount;
    setFinalGstAmount(finalAmount * (gst_percent/100))

  },[gstAmount,finalDiscount])


  // const netPayable = basicAmount - discount + gstAmount + serviceTax;

 

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
  
      // 🟥 IF POPUP IS OPEN → ONLY HANDLE ESC
      if (showBillPopup) {
        if (e.key === "Escape") {
          e.preventDefault();
          setShowBillPopup(false);
        }
        return; // 🚫 block all other shortcuts
      }
  
      // 🔹 ALT + T → Table filter
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        tableRef.current?.focus();
      }
  
      // 🔹 ALT + W → Waiter code
      if (e.altKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        waiterCodeRef.current?.focus();
      }
  
      // 🔹 ALT + N → Waiter name
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        waiterNameRef.current?.focus();
      }
  
      // 🔹 ENTER → Save bill
      if (e.key === "Enter" && preview) {
        e.preventDefault();
        saveBill();
      }
  
      // 🔹 CTRL + D → Delete selected KOTs
      
  
      // 🔹 CTRL + P → Print last bill
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (lastBillId) {
          setShowBillPopup(true);
        }
      }
  
      // 🔹 ESC → Reset page (only when popup NOT open)
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedKOTs([]);
        setFilterTable("");
        setFilterWaiterCode("");
        setFilterWaiterName("");
      }
    };
  
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    preview,
    lastBillId,
    showBillPopup
  ]);
  
  

  return (
    <div className="h-full grid grid-cols-3 gap-4 p-4">
      {/* =========================
          LEFT PANEL – CLOSED KOTS
      ========================= */}

      <div className="bg-white rounded p-3 shadow">
        <h3 className="text-xs font-medium text-gray-500 tracking-wide uppercase mb-2">
          Closed KOTs
        </h3>

        <div className="bg-white rounded-sm   overflow-y-auto max-h-300">
          <div className="border border-gray-200 rounded-sm overflow-hidden relative">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-center">
                <tr>
                  <th className="w-8 px-2 py-2 border-b text-center border-gray"></th>
                  <th className="px-2 py-2 border-b border-gray text-left text-xs font-semibold text-gray-600">
                    Table
                  </th>
                  <th className="px-2 py-2 border-b border-gray text-left text-xs font-semibold text-gray-600">
                    KOT No
                  </th>
                  <th className="px-2 py-2 border-b text-left border-gray text-xs font-semibold text-gray-600">
                    Waiter
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {closedKOTs?.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-gray-500 text-sm"
                    >
                      No closed KOTs available
                    </td>
                  </tr>
                )}

                {closedKOTs?.map((k) => (
                  <tr
                    key={k.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    {/* Checkbox */}
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedKOTs.includes(k.id)}
                        onChange={() => toggleKOT(k.id)}
                        className="accent-blue-600 cursor-pointer"
                      />
                    </td>

                    {/* Table No */}
                    <td className="px-2 py-2 font-medium text-gray-800">
                      {k.table_no}
                    </td>

                    {/* KOT No */}
                    <td className="px-2 py-2 text-gray-700">{k.kot_no}</td>

                    {/* Waiter */}
                    <td className="px-2 py-2 text-gray-600">{k.waiter_name}</td>

                    {/* Bill Input */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hint */}
        </div>
        <p className="mt-2 text-[11px] text-gray-500">
          ✔ Select KOTs to merge / generate bill
        </p>
        {/* <div className=" mt-4 bg-white rounded-sm ">
          <h2 className="text-xs font-medium text-gray-500 tracking-wide uppercase mb-2">Bill List</h2>

          <div className="border border-gray-200 rounded-sm overflow-y-auto max-h-60 relative">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                <tr>
                  <th className="px-2 py-2 text-gray-600 text-xs text-left">Bill No</th>
                  <th className="px-2 py-2 text-gray-600 text-xs text-left">Date</th>
                  <th className="px-2 py-2 text-gray-600 text-xs text-left">Table</th>
                  <th className="px-2 py-2 text-gray-600 text-xs text-left">Waiter</th>
                  <th className="px-2 py-2 text-gray-600 text-xs text-right">Amount</th>
                  <th className="px-2 py-2 text-gray-600 text-xs text-center">Print</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {bills?.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 text-xs">
                    <td className="px-2 py-2 font-medium">{b.bill_no}</td>
                    <td className="px-2 py-2">
                      {new Date(b.bill_date).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-2">{b.table_no}</td>
                    <td className="px-2 py-2">{b.waiter_name}</td>
                    <td className="px-2 py-2 text-right">
                      {formatCurrency(b.net_amount)}
                    </td>
                    
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={
                          () => {
                            setLastBillId(b.id);
                            setShowBillPopup(true);
                          }
                          // open BillReceiptPrint popup here
                        }
                        className="border px-2 py-1 border-gray rounded-sm hover:bg-gray-100"
                      >
                        🖨️
                      </button>
                    </td>
                  </tr>
                ))}

                {bills?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-400">
                      No bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>

      {/* =========================
          RIGHT PANEL – BILL
      ========================= */}
      <div className="col-span-2 bg-white rounded shadow p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-4">KOT Billing</h2>
          <span className="text-xs text-gray-400">⌨ Enter = Save | Esc = Close 
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3 text-sm bg-gray-50 border border-gray-200 rounded-sm p-3 ">
          {/* Bill No */}
          <div>
            <label className="text-xs text-gray-500">Bill No</label>
            <input
              value="AUTO"
              readOnly
              className="border px-2 py-1 w-full bg-gray-100 rounded"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-gray-500">Date</label>
            <input
           
              value={new Date().toLocaleDateString()}
              readOnly
              className="border px-2 py-1 w-full bg-gray-100 rounded"
            />
          </div>

          {/* Table No */}
          <div>
            <label className="text-xs text-gray-500">Table No</label>
            <input
            ref={tableRef}
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="border px-2 py-1 w-full rounded "
            
            />
          </div>

          {/* Waiter Code */}
          <div>
            <label className="text-xs text-gray-500">Waiter Code</label>
            <input
            ref={waiterCodeRef}
              value={filterWaiterCode}
              onChange={(e) => setFilterWaiterCode(e.target.value)}
              className="border px-2 py-1 w-full rounded "
          
            />
          </div>

          {/* Waiter Name */}
          <div className="col-span-2">
            <label className="text-xs text-gray-500">Waiter Name</label>
            <input
             ref={waiterNameRef}
              value={filterWaiterName}
              onChange={(e) => setFilterWaiterName(e.target.value)}
              className="border px-2 py-1 w-full rounded "
              placeholder="Name"
            />
          </div>
        </div>

        {!preview ? (
  <div className="flex items-center justify-center h-64 text-sm text-gray-400">
    Select KOT(s) to generate bill
  </div>
) : (
  <div className="space-y-4">

    {/* ================= HEADER ================= */}
    <div className="grid grid-cols-4 gap-3 text-xs bg-gray-50 border border-gray rounded-sm p-3">
      <div>
        <span className="text-gray-500">Bill No</span>
        <div className="font-semibold">AUTO</div>
      </div>

      <div>
        <span className="text-gray-500">Date</span>
        <div className="font-semibold">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div>
        <span className="text-gray-500">Table</span>
        <div className="font-semibold">{preview.table_no}</div>
      </div>

      <div>
        <span className="text-gray-500">Waiter</span>
        <div className="font-semibold">{preview.waiter_name}</div>
      </div>
    </div>

    {/* ================= ITEMS TABLE ================= */}
    <div className="border border-gray  rounded-sm overflow-hidden">
      <table className="w-full text-xs border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray  px-2 py-2 text-left w-10">#</th>
            <th className="border border-gray  px-2 py-2 text-left">Dish</th>
            <th className="border border-gray  px-2 py-2 text-right w-16">Qty</th>
            <th className="border border-gray  px-2 py-2 text-right w-20">Rate</th>
            <th className="border border-gray  px-2 py-2 text-right w-24">Total</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {preview.items.map((i, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-2 py-2">{idx + 1}</td>
              <td className="px-2 py-2">{i.dish_name}</td>
              <td className="px-2 py-2 text-right">{i.quantity}</td>
              <td className="px-2 py-2 text-right">
                {formatCurrency(i.rate)}
              </td>
              <td className="px-2 py-2 text-right font-medium">
                {formatCurrency(i.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ================= SUMMARY ================= */}
    <div className="border rounded-sm p-3 text-sm bg-bg-primary border-gray">
      <div className="grid grid-cols-2 gap-y-2 items-center">

        <span className="text-gray-600">Basic Amount</span>
        <span className="text-right font-medium">
          {formatCurrency(basicAmount)}
        </span>
          <div className="flex gap-2 items-center">

        <span className="text-gray-600">Discount</span>
        <input
          type="number"
          value={discount}

          onChange={(e) => setDiscount(Number(e.target.value))}
          className="border px-2 py-1 rounded-sm text-right w-20"
          />
          %
          </div>
          <span className="text-right">{formatCurrency(finalDiscount)}</span>

        <span className="text-gray-600">GST</span>
        <span className="text-right">
          {formatCurrency(finalGstAmount)}
        </span>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={servicetaxStatus}
            onChange={() =>
              setServicetaxStatus(!servicetaxStatus)
            }
            className="cursor-pointer"
          />
          <span className="text-gray-600">Service Tax <span>({preview?.serviceTax_percent}%)</span></span>
        </div>

        <span className="text-right">
          {formatCurrency(serviceTax)}
        </span>

        <div className="col-span-2 border-t border-gray mt-2 pt-2 flex justify-between font-semibold">
          <span>Net Payable</span>
          <span>
            {servicetaxStatus
              ? formatCurrency(
                  basicAmount - finalDiscount + finalGstAmount + serviceTax
                )
              : formatCurrency(basicAmount - finalDiscount + finalGstAmount)}
          </span>
        </div>
      </div>
    </div>

    {/* ================= ACTIONS ================= */}
    <div className="flex justify-end gap-2 pt-2">
      <button
        onClick={saveBill}
        className="px-5 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"
      >
        Save Bill
      </button>

   

      <button
        onClick={() => setSelectedKOTs([])}
        className="px-5 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition"
      >
        Close
      </button>
    </div>

    {/* ================= SHORTCUT HINT ================= */}
    {/* <p className="text-xs text-gray-400 text-right">
      ⌨ Enter = Save | Esc = Close
    </p> */}
  </div>
)}

      </div>
      {showBillPopup && lastBillId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-sm shadow-lg p-4 w-[420px]">
            <BillReceiptPrint
              billId={lastBillId}
              onClose={() => setShowBillPopup(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
