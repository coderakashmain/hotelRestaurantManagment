import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { formatCurrency } from "../../utils/currency";
import { useUsers } from "../../context/UserContext";
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TrashIcon,
  CalendarDaysIcon,
  BanknotesIcon,
} from "@heroicons/react/24/solid";

export default function DailyCollection() {
  const { users } = useUsers();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [focusedRow, setFocusedRow] = useState<number | null>(null);

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(() => api.dcr.list(date), [date]);

  const entries = data?.entries || [];
  const summary = data?.summary;

  /* ================= KEYBOARD SHORTCUTS ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Reload
      if (e.key.toLowerCase() === "r") {
        reload();
      }

      // Previous day
      if (e.key === "ArrowLeft") {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        setDate(d.toISOString().slice(0, 10));
      }

      // Next day
      if (e.key === "ArrowRight") {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        setDate(d.toISOString().slice(0, 10));
      }

      // Escape clears selection
      if (e.key === "Escape") {
        setFocusedRow(null);
      }

      // Delete reverses selected entry
      if (e.key === "Delete" && focusedRow) {
        const row = entries.find((r: any) => r.id === focusedRow);
        if (!row) return;

        if (!confirm("Reverse selected entry?")) return;

        api.dcr.reverse({
          id: row.id,
          userId: users[0]?.id,
        }).then(reload);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [date, focusedRow, entries]);

  return (
    <div className="p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BanknotesIcon className="h-6 w-6 text-green-600" />
          Daily Collection Register
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="btn flex items-center gap-1"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Reload (R)
          </button>
        </div>
      </div>

      {/* ================= DATE PICKER ================= */}
      <div className="flex items-center gap-3">
        <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray px-3 py-2 rounded-sm"
        />
        <span className="text-xs text-gray-500">
          ← / → to change date
        </span>
      </div>

      {loading && <p className="text-sm">Loading...</p>}
      {error && (
        <p className="text-red-600 text-sm">
          {error.message}
        </p>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-white shadow-card rounded overflow-auto">
        <table className="w-full text-sm border border-gray-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border border-gray  p-2">Type</th>
              <th className="border border-gray p-2">Ref</th>
              <th className="border border-gray p-2">Room</th>
              <th className="border border-gray p-2 text-right">CR</th>
              <th className="border border-gray p-2 text-right">DR</th>
              <th className="border border-gray p-2">Mode</th>
              <th className="border border-gray p-2">Particulars</th>
              <th className="border border-gray p-2">User</th>
              <th className="border border-gray p-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((row: any) => (
              <tr
                key={row.id}
                onClick={() => setFocusedRow(row.id)}
                className={`cursor-pointer ${
                  focusedRow === row.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="border border-gray p-2">
                  {row.entry_type}
                </td>

                <td className="border border-gray p-2">
                  {row.reference_no}
                </td>

                <td className="border border-gray p-2 text-center">
                  {row.room_number || "-"}
                </td>

                <td className="border border-gray p-2 text-right text-green-600 font-medium">
                  {row.direction === "CR"
                    ? formatCurrency(row.payment_amount)
                    : "-"}
                </td>

                <td className="border border-gray p-2 text-right text-red-600 font-medium">
                  {row.direction === "DR"
                    ? formatCurrency(row.payment_amount)
                    : "-"}
                </td>

                <td className="border border-gray p-2">
                  {row.payment_mode}
                </td>

                <td className="border border-gray p-2">
                  {row.particulars}
                </td>

                <td className="border border-gray p-2">
                  {row.created_by_name || "-"}
                </td>

                <td className="border border-gray p-2 text-center">
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm("Reverse this entry?")) return;

                      await api.dcr.reverse({
                        id: row.id,
                        userId: users[0]?.id,
                      });

                      reload();
                    }}
                  >
                    <TrashIcon className="h-4 w-4 inline" />
                  </button>
                </td>
              </tr>
            ))}

            {!entries.length && !loading && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center p-6 text-gray-500"
                >
                  No entries for this date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= SUMMARY ================= */}
      {summary && (
        <div className="bg-gray-50 border border-gray rounded p-4">
          <h3 className="font-semibold mb-3">Summary</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><b>Total Receipt:</b> {formatCurrency(summary.total_receipt || 0)}</div>
            <div><b>Total Payment:</b> {formatCurrency(summary.total_payment || 0)}</div>
            <div><b>Cash In:</b> {formatCurrency(summary.cash_in || 0)}</div>
            <div><b>Cash Out:</b> {formatCurrency(summary.cash_out || 0)}</div>
            <div><b>UPI:</b> {formatCurrency(summary.upi_total || 0)}</div>
            <div><b>Card:</b> {formatCurrency(summary.card_total || 0)}</div>
          </div>
        </div>
      )}

      {/* ================= FOOTER HINT ================= */}
      <div className="text-xs text-gray-500">
        Shortcuts: <b>←</b>/<b>→</b> change date · <b>R</b> reload · <b>DEL</b> reverse · <b>ESC</b> clear selection
      </div>

    </div>
  );
}
