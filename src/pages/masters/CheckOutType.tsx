import { useState } from "react";
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

const CheckOutType = () => {
  const { allowChange, setAllowChange ,checkOutType,loading,refreshCheckOutType} = useCheckOutRule();
  const [editRow, setEditRow] = useState<CheckOutSetting | null>(null);
  const [newRow, setNewRow] = useState({
    label: "",
    hours: null as number | null,
    time: "",
  });

 





  const create = async () => {
    if (!newRow.label) return alert("Enter Hours details!");
    await api.checkOut.create(newRow);
    setNewRow({ label: "", hours: null, time: "" });
    refreshCheckOutType();
  };

  const update = async () => {
    if (!editRow) return;
    await api.checkOut.update(editRow);
    setEditRow(null);
    refreshCheckOutType();
  };

  const remove = async (id: number) => {
    if (confirm("Delete this checkout setting?")) {
      await api.checkOut.delete(id);
      refreshCheckOutType();
    }
  };
  const formatTo12Hr = (time?: string | null) => {
    if (!time) return "--";
    let [h, m] = time.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const setDefault = async (id: number) => {
    await api.checkOut.setDefault(id);
    refreshCheckOutType();
  };

  if (loading) return <div className="p-8 text-lg">Loading...</div>;

  return (
    <div className="w-full  p-10 overflow-scroll">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Check–Out Rules</h1>

      {/* ADD NEW */}
      <div className="bg-white p-5 mb-6 rounded-xl shadow border">
        <h3 className="font-semibold mb-4">Add New Check–Out</h3>
        <div className="grid grid-cols-3 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Label (e.g. 12 Noon)"
            value={newRow.label}
            onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Hours (optional)"
            value={newRow.hours ?? ""}
            onChange={(e) => setNewRow({ ...newRow, hours: +e.target.value })}
          />
          <input
            type="time"
            className="border p-2 rounded"
            placeholder="Time"
            value={newRow.time}
            onChange={(e) => setNewRow({ ...newRow, time: e.target.value })}
          />
        </div>

        <button
          onClick={create}
          className="mt-3 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Add Check–Out Rule
        </button>
      </div>

      {/* LIST TABLE */}
      <table className="w-full bg-white rounded-xl shadow border">
        <thead className="bg-gray-100 border-b">
          <tr>
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
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {editing ? (
                    <input
                      value={editRow?.label}
                      className="border p-1 rounded w-full"
                      onChange={(e) =>
                        setEditRow({ ...editRow!, label: e.target.value })
                      }
                    />
                  ) : (
                    row.label
                  )}
                </td>
                <td className="p-3">
                  {editing ? (
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={editRow?.hours ?? ""}
                      onChange={(e) =>
                        setEditRow({ ...editRow!, hours: +e.target.value })
                      }
                    />
                  ) : (
                    row.hours ?? "--"
                  )}
                </td>
                <td className="p-3">
                  {editing ? (
                    <input
                      type="time"
                      className="border p-1 rounded w-full"
                      value={editRow?.time ?? ""}
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
                    className={`px-3 py-1 rounded ${
                      row.is_default
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <StarIcon className="h-5 inline-block" />
                  </button>
                </td>

                {/* ACTIONS */}
                <td className="p-3 text-right flex justify-end gap-3">
                  {editing ? (
                    <>
                      <button className="text-green-600" onClick={update}>
                        <CheckIcon className="h-5" />
                      </button>
                      <button
                        className="text-gray-600"
                        onClick={() => setEditRow(null)}
                      >
                        <XMarkIcon className="h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-blue-600"
                        onClick={() => setEditRow(row)}
                      >
                        <PencilSquareIcon className="h-5" />
                      </button>
                      <button
                        className="text-red-600"
                        onClick={() => remove(row.id)}
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

      <div className="mt-10 flex items-center gap-3   rounded-xl ">
        <input
          type="checkbox"
          className="w-5 h-5"
          checked={allowChange}
          onChange={(e) => setAllowChange(e.target.checked)}
        />

        <label className="text-gray-800 select-none ">
           Allow changing check-out hours during check-in
        </label>
      </div>
    </div>
  );
};

export default CheckOutType;
