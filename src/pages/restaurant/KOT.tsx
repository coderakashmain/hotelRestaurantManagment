import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency } from "../../utils/currency";

/* =========================
   TYPES
========================= */
type Table = {
  id: number;
  table_no: string;
};

type Employee = {
  id: number;
  emp_code: number;
  name: string;
  designation?: string;
};

type Dish = {
  id: number;
  dish_code: number;
  name: string;
  full_plate_rate: number;
};

export default function KOT() {
  /* =========================
     STATE
  ========================= */
  const [tableNo, setTableNo] = useState("");
  const [tableId, setTableId] = useState<number | null>(null);

  const [waiterCode, setWaiterCode] = useState("");
  const [waiterName, setWaiterName] = useState("");
  const [waiterId, setWaiterId] = useState<number | null>(null);

  const [kotId, setKotId] = useState<number | null>(null);

  const [dishCode, setDishCode] = useState("");
  const [dishName, setDishName] = useState("");
  const [dishRate, setDishRate] = useState(0);
  const [qty, setQty] = useState<number>(1);

  /* =========================
     LOAD MASTER DATA
  ========================= */
  const { data: tables } = useAsync<Table[]>(() => api.table.list(), []);
  const { data: employees } = useAsync<Employee[]>(() => api.employee.list(), []);
  const { data: dishes } = useAsync<Dish[]>(() => api.dish.list(), []);

  const {
    data: kotDetails,
    reload: reloadKOT,
  } = useAsync<any>(
    () => (kotId ? api.kot.get(kotId) : Promise.resolve(null)),
    [kotId]
  );

  /* =========================
     TABLE SELECT
  ========================= */
  const selectTable = (t: Table) => {
    setTableNo(t.table_no);
    setTableId(t.id);

    setWaiterCode("");
    setWaiterName("");
    setWaiterId(null);
    setKotId(null);
  };

  /* =========================
     WAITER SELECT / INPUT
  ========================= */
  const onWaiterCodeChange = async (code: string) => {
    setWaiterCode(code);

    const waiter = employees?.find(
      (w) => String(w.emp_code) === code && w.designation === "Waiter"
    );

    if (!waiter) {
      setWaiterName("");
      setWaiterId(null);
      return;
    }

    setWaiterName(waiter.name);
    setWaiterId(waiter.id);

    // Auto create KOT
    if (tableId && !kotId) {
      const kot = await api.kot.create({
        kot_no: `KOT-${Date.now()}`,
        kot_date: new Date().toISOString().slice(0, 10),
        table_id: tableId,
        waiter_id: waiter.id,
      });
      setKotId(kot.id);
    }
  };

  /* =========================
     DISH SELECT / INPUT
  ========================= */
  const onDishCodeChange = (code: string) => {
    setDishCode(code);

    const dish = dishes?.find((d) => String(d.dish_code) === code);
    if (!dish) {
      setDishName("");
      setDishRate(0);
      return;
    }

    setDishName(dish.name);
    setDishRate(dish.full_plate_rate);
  };

  /* =========================
     ADD / UPDATE DISH
  ========================= */
  const addDish = async () => {
    if (!kotId || !dishCode || qty <= 0) return;

    const dish = dishes?.find((d) => String(d.dish_code) === dishCode);
    if (!dish) return;

    await api.kot.addItem({
      kot_id: kotId,
      dish_id: dish.id,
      quantity: qty, // backend merges quantity if exists
    });

    setDishCode("");
    setDishName("");
    setDishRate(0);
    setQty(1);

    reloadKOT();
  };

  /* =========================
     CLOSE KOT
  ========================= */
  const closeKOT = async () => {
    if (!kotId) return;

    await api.kot.close(kotId);

    alert(`KOT ${kotId} closed successfully`);

    // Reset for next order
    setKotId(null);
    setTableId(null);
    setTableNo("");
    setWaiterCode("");
    setWaiterName("");
    setWaiterId(null);
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4 h-full">
      {/* =========================
          LEFT PANEL
      ========================= */}
      <div className="bg-white rounded shadow p-3 overflow-y-auto">
        <h3 className="font-semibold mb-2">Tables</h3>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {tables?.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTable(t)}
              className={`border p-2 rounded ${
                tableId === t.id ? "bg-blue-600 text-white" : ""
              }`}
            >
              {t.table_no}
            </button>
          ))}
        </div>

        {!waiterId ? (
          <>
            <h3 className="font-semibold mb-2">Waiters</h3>
            {employees?.map((e) => (
              <div
                key={e.id}
                onClick={() => onWaiterCodeChange(String(e.emp_code))}
                className="grid grid-cols-6 text-sm cursor-pointer hover:bg-gray-100"
              >
                <span>{e.emp_code}</span>
                <span className="col-span-5">{e.name}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <h3 className="font-semibold mb-2">Dishes</h3>
            {dishes?.map((d) => (
              <div
                key={d.id}
                onClick={() => onDishCodeChange(String(d.dish_code))}
                className="grid grid-cols-6 text-sm cursor-pointer hover:bg-gray-100"
              >
                <span>{d.dish_code}</span>
                <span className="col-span-5">{d.name}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* =========================
          RIGHT PANEL
      ========================= */}
      <div className="col-span-2 bg-white rounded shadow p-4">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <input value={tableNo} readOnly className="border px-2 py-1" />
          <input
            placeholder="Waiter Code"
            value={waiterCode}
            onChange={(e) => onWaiterCodeChange(e.target.value)}
            className="border px-2 py-1"
          />
          <input
            value={waiterName}
            readOnly
            className="border px-2 py-1 bg-gray-100 col-span-2"
          />
        </div>

        {kotId && (
          <>
            <div className="grid grid-cols-6 gap-2 mb-3">
              <input
                placeholder="Dish Code"
                value={dishCode}
                onChange={(e) => onDishCodeChange(e.target.value)}
                className="border px-2 py-1"
              />
              <input
                value={dishName}
                readOnly
                className="border px-2 py-1 bg-gray-100 col-span-2"
              />
              <input
                type="number"
                step="0.5"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="border px-2 py-1"
              />
              <input
                value={formatCurrency(dishRate)}
                readOnly
                className="border px-2 py-1 bg-gray-100"
              />
              <button
                onClick={addDish}
                className="bg-green-600 text-white rounded"
              >
                +
              </button>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Sl</th>
                  <th className="border p-2">Code</th>
                  <th className="border p-2">Dish</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Rate</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {kotDetails?.items?.map((i: any, idx: number) => (
                  <tr key={i.id}>
                    <td className="border p-2">{idx + 1}</td>
                    <td className="border p-2">{i.dish_code}</td>
                    <td className="border p-2">{i.dish_name}</td>
                    <td className="border p-2">{i.quantity}</td>
                    <td className="border p-2">{formatCurrency(i.rate)}</td>
                    <td className="border p-2">{formatCurrency(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={closeKOT}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save KOT
            </button>
          </>
        )}
      </div>
    </div>
  );
}
