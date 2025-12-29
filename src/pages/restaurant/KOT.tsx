import { useEffect, useRef, useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency } from "../../utils/currency";
import { ClosedKOT } from "./restaurantType";
import { useSnackbar } from "../../context/SnackbarContext";
import KOTReceiptPrint from "./KOTReceiptPrint";
import { useNavigate } from "react-router";

/* ================= TYPES ================= */
type Table = { id: number; table_no: string };
type Employee = {
  id: number;
  emp_code: number;
  name: string;
  designation: string;
};
type Dish = {
  id: number;
  dish_code: number;
  name: string;
  full_plate_rate: number;
  half_plate_rate: number;
};

export default function KOTPage() {
  /* ================= STATE ================= */
  const [tableNo, setTableNo] = useState("");
  const [tableId, setTableId] = useState<number | null>(null);
  const tableRef = useRef<HTMLInputElement>(null);
  const { showSnackbar } = useSnackbar();
  const waiterRef = useRef<HTMLInputElement>(null);
  const dishCodeRef = useRef<HTMLInputElement>(null);
  const [printKOTId, setPrintKOTId] = useState<number | null>(null);
  const navigate = useNavigate();

  const [waiterCode, setWaiterCode] = useState("");
  const [waiterName, setWaiterName] = useState("");
  const [waiterId, setWaiterId] = useState<number | null>(null);

  const [kotId, setKotId] = useState<number | null>(null);

  const [dishCode, setDishCode] = useState("");
  const [dishName, setDishName] = useState("");
  const [qty, setQty] = useState<number>(1);

  /* ================= DATA ================= */
  const { data: tables } = useAsync<Table[]>(() => api.table.list(), []);
  const { data: employees } = useAsync<Employee[]>(
    () => api.employee.list(),
    []
  );
  const { data: dishes } = useAsync<Dish[]>(() => api.dish.list(), []);

  const { data: closedKOTs, reload: reloadKOTs } = useAsync<ClosedKOT[]>(
    () => api.kot.listClosed(),
    []
  );

  const { data: kotDetails, reload: reloadKOT } = useAsync<any>(
    () => (kotId ? api.kot.get(kotId) : Promise.resolve(null)),
    [kotId]
  );

  /* ================= HANDLERS ================= */
  const onTableChange = (value: string) => {
    setTableNo(value);
    const t = tables?.find((t) => t.table_no === value);
    if (t) setTableId(t.id);

    setWaiterCode("");
    setWaiterName("");
    setWaiterId(null);
  };

  const onWaiterCodeChange = async (code: string) => {
    setWaiterCode(code);

    const w = employees?.find(
      (e) => String(e.emp_code) === code && e.designation === "Waiter"
    );

    if (!w) {
      setWaiterName("");
      setWaiterId(null);
      return;
    }

    setWaiterName(w.name);
    setWaiterId(w.id);

    if (tableId && !kotId) {
      const kot = await api.kot.create({
        // kot_no: `KOT-${Date.now()}`,
        kot_date: new Date().toISOString().slice(0, 10),
        table_id: tableId,
        waiter_id: w.id,
      });
      setKotId(kot.id);
    }
  };

  const onWaiterNameChange = (name: string) => {
    setWaiterName(name);
    const w = employees?.find(
      (e) =>
        e.designation === "Waiter" &&
        e.name.toLowerCase().includes(name.toLowerCase())
    );
    if (w) {
      setWaiterCode(String(w.emp_code));
      setWaiterId(w.id);
    }
  };

  const onDishCodeChange = (code: string) => {
    setDishCode(code);
    const d = dishes?.find((d) => String(d.dish_code) === code);
    setDishName(d?.name || "");
  };

  const onDishNameChange = (name: string) => {
    setDishName(name);
    const d = dishes?.find((d) =>
      d.name.toLowerCase().includes(name.toLowerCase())
    );
    if (d) setDishCode(String(d.dish_code));
  };

  const addDish = async () => {
    if (!kotId || !dishCode || qty <= 0) {
      showSnackbar("Please Enter DIST CODE Or Dish Name!", "warning");
      return;
    }

    const dish = dishes?.find((d) => String(d.dish_code) === dishCode);
    if (!dish) return;

    await api.kot.addItem({
      kot_id: kotId,
      dish_id: dish.id,
      quantity: qty,
    });

    setDishCode("");
    setDishName("");
    setQty(1);
    reloadKOT();
  };

  const closeKOT = async () => {
    if (!kotId) {
      // showSnackbar("Please add dished.",'error')
      return;
    }
    try {
      await api.kot.close(kotId);
      setPrintKOTId(kotId);
      reloadKOTs();
      showSnackbar("KOT Saved.", "success");
      setKotId(null);
      setTableNo("");
      setTableId(null);
      setWaiterCode("");
      setWaiterName("");
      setWaiterId(null);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
  
      /* ================= MODAL PRIORITY ================= */
      if (printKOTId) {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setPrintKOTId(null);
        }
        return; // 🚫 block everything else
      }
  
      /* ================= SHORTCUTS ================= */
  
      // Alt + T → Table
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        tableRef.current?.focus();
        return;
      }
  
      // Alt + W → Waiter
      if (e.altKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        waiterRef.current?.focus();
        return;
      }
  
      // Alt + D → Dish Code
      if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        dishCodeRef.current?.focus();
        return;
      }
  
      // Enter → Add dish OR Save KOT
      if (e.key === "Enter" && kotId) {
        e.preventDefault();
        e.stopPropagation();
  
        const hasDishInput =
          dishCode.trim() !== "" ||
          dishName.trim() !== "" ||
          qty !== 1;
  
        if (hasDishInput) {
          addDish();
        } else {
          closeKOT();
        }
        return;
      }
  
      // Esc → Reset current KOT
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
  
        setKotId(null);
        setDishCode("");
        setDishName("");
        setQty(1);
      }
    };
  
    window.addEventListener("keydown", onKeyDown, true); // 🔥 CAPTURE MODE
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    kotId,
    dishCode,
    dishName,
    qty,
    printKOTId
  ]);
  

  /* ================= UI ================= */
  return (
    <div className="grid grid-cols-3 gap-4 p-4 h-full">
      {/* ================= LEFT PANEL ================= */}
      <div className="bg-white rounded shadow p-3 overflow-y-auto scrollbar-none">
        <h3 className="text-sm mb-2 text-gray-400">Tables</h3>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {tables?.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTableNo(t.table_no);
                setTableId(t.id);
              }}
              className={`border p-2 rounded bg-bg-primary border-gray text-sm transition
                ${
                  tableId === t.id
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              {t.table_no}
            </button>
          ))}
        </div>

        {/* WAITERS / DISHES TABLE */}
        {/* SECTION TITLE */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            {!waiterId ? "Waiters List" : "Dishes List"}
          </h3>

          <span className="text-[10px] text-gray-400">Click to select</span>
        </div>

        {/* TABLE WRAPPER */}
        <div className="border border-gray-200 rounded-sm overflow-hidden bg-white max-h-60 overflow-y-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-24">
                  Code
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Name
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {!waiterId
                ? employees
                    ?.filter((e) => e.designation === "Waiter")
                    .map((e) => (
                      <tr
                        key={e.id}
                        onClick={() => onWaiterCodeChange(String(e.emp_code))}
                        className="
                  cursor-pointer
                  transition-colors
                  hover:bg-blue-50
                  active:bg-blue-100
                "
                      >
                        <td className="px-3 py-2 font-mono text-gray-700">
                          {e.emp_code}
                        </td>
                        <td className="px-3 py-2 text-gray-800">{e.name}</td>
                      </tr>
                    ))
                : dishes?.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => onDishCodeChange(String(d.dish_code))}
                      className="
                cursor-pointer
                transition-colors
                hover:bg-green-50
                active:bg-green-100
              "
                    >
                      <td className="px-3 py-2 font-mono text-gray-700">
                        {d.dish_code}
                      </td>
                      <td className="px-3 py-2 text-gray-800">{d.name}</td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {((!waiterId &&
            employees?.filter((e) => e.designation === "Waiter").length ===
              0) ||
            (waiterId && dishes?.length === 0)) && (
            <div className="p-4 text-center text-xs text-gray-400">
              No records available
            </div>
          )}
        </div>

        {/* CLOSED KOTS */}
        {/* SECTION HEADER */}
        <div className="flex items-center justify-between mt-5 mb-2">
          <h3 className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            Closed KOTs
          </h3>

          <span className="text-[10px] text-gray-400">
            Click bill icon to proceed
          </span>
        </div>

        {/* TABLE WRAPPER */}
        <div className="border border-gray-200 rounded-sm overflow-hidden bg-white max-h-50 overflow-y-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Table
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  KOT No
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  KOT
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Waiter
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-16">
                  Bill
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {closedKOTs?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-xs text-gray-400"
                  >
                    No closed KOTs available
                  </td>
                </tr>
              )}

              {closedKOTs?.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-700">
                    {k.table_no}
                  </td>

                  <td className="px-3 py-2 text-gray-700">{k.kot_no}</td>
                  <td onClick={()=>   setPrintKOTId(k.id)} className="px-3 py-2 text-center "> <button    className="
                inline-flex items-center justify-center
                w-8 h-8 rounded-sm
                border border-gray-200
                text-blue-600
                hover:bg-blue-50 hover:border-blue-300
                transition
              ">🧾</button></td>

                  <td className="px-3 py-2 text-gray-700">{k.waiter_name}</td>

                  {/* ACTION */}
                  <td className="px-3 py-2 text-center">
                    <button
                      title="Create / Preview Bill"
                      onClick={() => {
                        // 🔥 use this KOT id for billing navigation
                        // example:
                        navigate(`/restaurant/kot-billing`,{ state: { kotId: k.id }})
                       
                      }}
                      className="
                inline-flex items-center justify-center
                w-8 h-8 rounded-sm
                border border-gray-200
                text-blue-600
                hover:bg-blue-50 hover:border-blue-300
                transition
              "
                    >
                      -
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= RIGHT PANEL (UNCHANGED) ================= */}
      <div className="col-span-2 bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Kitchen Order Ticket</h2>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500">Table No (Alt+T)</label>
            <input
              ref={tableRef}
              value={tableNo}
              onChange={(e) => onTableChange(e.target.value)}
              className="border px-2 py-1 w-full rounded focus:ring"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Waiter Code (Alt+W)</label>
            <input
              ref={waiterRef}
              value={waiterCode}
              onChange={(e) => onWaiterCodeChange(e.target.value)}
              className="border px-2 py-1 w-full rounded focus:ring"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-500">Waiter Name</label>
            <input
              value={waiterName}
              onChange={(e) => onWaiterNameChange(e.target.value)}
              className="border px-2 py-1 w-full rounded"
            />
          </div>
        </div>

        <>
          {/* ================= ITEM ENTRY ================= */}
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 mb-3">
            <div className="grid grid-cols-6 gap-3 items-end">
              {/* Dish Code */}
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">
                  Dish Code <span className="text-gray-400">(Alt + D)</span>
                </label>
                <input
                  ref={dishCodeRef}
                  value={dishCode}
                  onChange={(e) => onDishCodeChange(e.target.value)}
                  className="
            w-full px-2 py-1.5 text-sm
            border border-gray-300 rounded-sm
            focus:outline-none focus:border-blue-500
            transition
          "
                />
              </div>

              {/* Dish Name */}
              <div className="col-span-2">
                <label className="block text-[11px] text-gray-500 mb-1">
                  Dish Name
                </label>
                <input
                  value={dishName}
                  onChange={(e) => onDishNameChange(e.target.value)}
                  className="
            w-full px-2 py-1.5 text-sm
            border border-gray-300 rounded-sm
            focus:outline-none focus:border-blue-500
            transition
          "
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="
            w-full px-2 py-1.5 text-sm
            border border-gray-300 rounded-sm
            focus:outline-none focus:border-blue-500
            transition
          "
                />
              </div>

              {/* Add Button */}
              <button
                onClick={addDish}
                className="
          h-[34px]
          bg-green-600 text-white text-sm font-medium
          rounded-sm
          hover:bg-green-700
          transition
        "
              >
                + Add
              </button>
            </div>

            {/* Keyboard Hints */}
            <div className="mt-2 text-[11px] text-gray-500 flex gap-4">
              <span>⏎ Enter → Add</span>
              <span>Ctrl + S → Save</span>
              <span>Esc → Close</span>
            </div>
          </div>

          {/* ================= ITEMS TABLE ================= */}
          <div className="border border-gray-200 rounded-sm overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 w-10">
                    #
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 w-20">
                    Code
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">
                    Dish
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-16">
                    Qty
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-20">
                    Rate
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-24">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {kotDetails?.items?.map((i: any, idx: number) => (
                  <tr key={i.id} className="hover:bg-gray-50 transition">
                    <td className="px-2 py-2 text-gray-600">{idx + 1}</td>
                    <td className="px-2 py-2 text-gray-600">{i.dish_code}</td>
                    <td className="px-2 py-2 font-medium text-gray-800">
                      {i.dish_name}
                    </td>
                    <td className="px-2 py-2 text-center">{i.quantity}</td>
                    <td className="px-2 py-2 text-right">
                      {formatCurrency(i.rate)}
                    </td>
                    <td className="px-2 py-2 text-right font-semibold">
                      {formatCurrency(i.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= SAVE ================= */}
          <div className="flex justify-end mt-3">
            <button
              onClick={closeKOT}
              className="
        px-6 py-2
        bg-blue-600 text-white text-sm font-medium
        rounded-sm
        hover:bg-blue-700
        transition
      "
            >
              Save KOT
            </button>
          </div>
        </>
      </div>
      {printKOTId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-sm shadow-lg p-4 w-[320px]">
            <KOTReceiptPrint
              kotId={printKOTId}
              onClose={() => setPrintKOTId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
