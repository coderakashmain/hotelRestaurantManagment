import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { CheckOutSetting } from "../../components/rooms/types";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useCheckOutRule } from "../../context/CheckOutRuleContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

const CheckOutType = () => {
  const {
    allowChange,
    setAllowChange,
    checkOutType,
    loading,
    refreshCheckOutType,
  } = useCheckOutRule();

  const { showSnackbar } = useSnackbar();

  const [editRow, setEditRow] = useState<CheckOutSetting | null>(null);
  const [newRow, setNewRow] = useState({
    label: "",
    hours: null as number | null,
    time: "",
  });

  /* =======================
     Keyboard shortcuts
  ======================= */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditRow(null);
      }
      if (e.key === "Enter" && editRow) {
        update();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editRow]);

  /* =======================
     Helpers
  ======================= */
  const formatTo12Hr = (time?: string | null) => {
    if (!time) return "--";
    let [h, m] = time.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  /* =======================
     CRUD Actions
  ======================= */
  const create = async () => {
    if (!newRow.label.trim()) {
      showSnackbar("Label is required", "warning");
      return;
    }

    await api.checkOut.create(newRow);
    showSnackbar("Check-out rule added", "success");

    setNewRow({ label: "", hours: null, time: "" });
    refreshCheckOutType();
  };

  const update = async () => {
    if (!editRow) return;

    await api.checkOut.update(editRow);
    showSnackbar("Check-out rule updated", "success");

    setEditRow(null);
    refreshCheckOutType();
  };

  const remove = async (id: number) => {
    await api.checkOut.delete(id);
    showSnackbar("Check-out rule removed", "success");
    refreshCheckOutType();
  };

  const setDefault = async (id: number) => {
    await api.checkOut.setDefault(id);
    showSnackbar("Default check-out updated", "warning");
    refreshCheckOutType();
  };

  if (loading) {
    return <div className="p-10 text-lg">Loading check-out rules…</div>;
  }
useKeyboardShortcuts({
  Enter : create
},[newRow])
  return (
    <div className="w-full p-10">

      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text">
          Check-Out Rules
        </h1>
        <p className="text-sm text-secondary mt-1">
          Define standard checkout timings used during billing & check-in
        </p>
      </div>

      {/* ================= ADD NEW ================= */}
      <div className="card mb-6 rounded-sm">
        <h3 className="font-medium mb-4">Add New Rule</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border border-gray rounded-sm px-3 py-2"
            placeholder="Label (e.g. 12 Noon)"
            value={newRow.label}
            onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
          />

          <input
            type="number"
            className="border border-gray rounded-sm px-3 py-2"
            placeholder="Hours (optional)"
            value={newRow.hours ?? ""}
            onChange={(e) =>
              setNewRow({
                ...newRow,
                hours: e.target.value ? +e.target.value : null,
              })
            }
          />

          <input
            type="time"
            className="border border-gray rounded-sm px-3 py-2"
            value={newRow.time}
            onChange={(e) => setNewRow({ ...newRow, time: e.target.value })}
          />
        </div>

        <button
          onClick={create}
          className="btn mt-4 rounded-sm"
        >
          Add Rule
        </button>
        <p className="text-xs text-secondary mt-4">
            ⏎ Enter = Create &nbsp; • &nbsp; Esc = Back
          </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card rounded-sm">
        <table className="w-full">
          <thead className="border-b border-gray">
            <tr className="text-sm text-secondary">
              <th className="p-3 text-left">Label</th>
              <th className="p-3 text-left">Hours</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-center">Default</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {checkOutType.map((row) => {
              const editing = editRow?.id === row.id;

              return (
                <tr key={row.id} className="border-b text-sm border-gray last:border-0">

                  {/* LABEL */}
                  <td className="p-2">
                    {editing ? (
                      <input
                        className="border border-gray rounded-sm px-2  w-full"
                        value={editRow.label}
                        onChange={(e) =>
                          setEditRow({ ...editRow!, label: e.target.value })
                        }
                      />
                    ) : (
                      row.label
                    )}
                  </td>

                  {/* HOURS */}
                  <td className="p-2">
                    {editing ? (
                      <input
                        type="number"
                        className="border border-gray rounded-sm px-2 w-full"
                        value={editRow.hours ?? ""}
                        onChange={(e) =>
                          setEditRow({
                            ...editRow!,
                            hours: e.target.value ? +e.target.value : null,
                          })
                        }
                      />
                    ) : (
                      row.hours ?? "--"
                    )}
                  </td>

                  {/* TIME */}
                  <td className="p-3">
                    {editing ? (
                      <input
                        type="time"
                        className="border border-gray rounded-sm px-2 py-1 w-full"
                        value={editRow.time ?? ""}
                        onChange={(e) =>
                          setEditRow({ ...editRow!, time: e.target.value })
                        }
                      />
                    ) : (
                      formatTo12Hr(row.time)
                    )}
                  </td>

                  {/* DEFAULT */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setDefault(row.id)}
                      className={`rounded-full p-2 ${
                        row.is_default
                          ? "bg-success text-white"
                          : "bg-lightColor text-secondary"
                      }`}
                      title="Set as default"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 text-right flex justify-end gap-3">
                    {editing ? (
                      <>
                        <button
                          onClick={update}
                          className="text-success"
                          title="Save"
                        >
                          <CheckIcon className="h-5" />
                        </button>
                        <button
                          onClick={() => setEditRow(null)}
                          className="text-secondary"
                          title="Cancel"
                        >
                          <XMarkIcon className="h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditRow(row)}
                          className="text-primary"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5" />
                        </button>
                        <button
                          onClick={() => remove(row.id)}
                          className="text-error"
                          title="Delete"
                        >
                          <TrashIcon className="h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= GLOBAL OPTION ================= */}
      <div className="mt-8 flex items-center gap-3">
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={allowChange}
          onChange={(e) => setAllowChange(e.target.checked)}
        />
        <label className="text-sm text-text select-none">
          Allow changing check-out hours during check-in
        </label>
      </div>
    </div>
  );
};

export default CheckOutType;
