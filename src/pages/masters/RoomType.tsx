import {  useState } from "react";
import { api } from "../../api/api";
import { RoomType } from "./types";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useRoomTypes } from "../../context/RoomTypeContext";

const RoomTypePage = () => {
  const [editRow, setEditRow] = useState<RoomType | null>(null);
  const { roomTypes, loading,refreshRoomTypes} = useRoomTypes();
  const [newType, setNewType] = useState({
    type_name: "",
    full_rate: 0,
    hourly_rate: 0,
  });



  const create = async () => {
    if (!newType.type_name) return alert("Please enter Room Type!");
    await api.roomType.create(newType);
    setNewType({ type_name: "", full_rate: 0, hourly_rate: 0 });
    refreshRoomTypes();
  };

  const update = async () => {
    if (!editRow) return;
    await api.roomType.update(editRow.id, editRow);
    setEditRow(null);
    refreshRoomTypes();
  };

  const remove = async (id: number) => {
    if (confirm("Delete this room type?")) {
      await api.roomType.delete(id);
      refreshRoomTypes();
    }
  };

  const toggle = async (t: RoomType) => {
    await api.roomType.toggle(t.id, t.is_active ? 0 : 1);
    refreshRoomTypes();
  };

  if (loading) return <div className="p-8 text-lg">Loading Room Types...</div>;

  return (
    <div className="w-full  p-10 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Room Types</h1>
      </div>

      {/* ADD NEW */}
      <div className="bg-white shadow rounded-xl p-4 mb-6 border border-gray">
        <h3 className="font-semibold text-gray-700 mb-2">Add New Room Type</h3>
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div>
            <label className="text-xs text-gray block mb-2" htmlFor="typename">
              Type Name
            </label>
            <input
              placeholder="Type Name"
              value={newType.type_name}
              id="typename"
              onChange={(e) =>
                setNewType({ ...newType, type_name: e.target.value })
              }
              className="w-full h-full rounded px-3"
            />
          </div>

          <div className="">
            <label className="text-xs text-gray block mb-2" htmlFor="fullrate">
              Full Rate
            </label>
            <input
              placeholder="Full Rate"
              id="fullrate"
              type="number"
              value={newType.full_rate}
              onChange={(e) =>
                setNewType({ ...newType, full_rate: +e.target.value })
              }
              className="w-full h-full rounded px-3"
            />
          </div>

          <div>
            <label className="text-xs text-gray block mb-2" htmlFor="hourlyrate">
              Hourly Rate
            </label>

            <input
              id="hourlyrate"
              placeholder="Hourly Rate"
              type="number"
              value={newType.hourly_rate}
              onChange={(e) =>
                setNewType({ ...newType, hourly_rate: +e.target.value })
              }
              className="w-full h-full rounded px-3"
            />
          </div>
        </div>
        <button
          onClick={create}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusIcon className="h-5" /> Add Type
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full bg-white border border-gray rounded-xl shadow">
        <thead className="bg-gray-100 border-b border-gray">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Type Name</th>
            <th className="p-3 text-left">Full Rate</th>
            <th className="p-3 text-left">Hourly Rate</th>
            <th className="p-3 text-center">Active</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roomTypes.map((rt) => {
            const editing = editRow?.id === rt.id;
            return (
              <tr key={rt.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{rt.id}</td>

                {/* TYPE NAME */}
                <td className="p-3">
                  {editing ? (
                    <input
                      className="border p-1 rounded w-full"
                      value={editRow?.type_name || ""}
                      onChange={(e) =>
                        setEditRow({ ...editRow!, type_name: e.target.value })
                      }
                    />
                  ) : (
                    rt.type_name
                  )}
                </td>

                {/* FULL RATE */}
                <td className="p-3">
                  {editing ? (
                    <input
                      className="border p-1 rounded w-full"
                      type="number"
                      value={editRow?.full_rate}
                      onChange={(e) =>
                        setEditRow({ ...editRow!, full_rate: +e.target.value })
                      }
                    />
                  ) : (
                    `₹ ${rt.full_rate}`
                  )}
                </td>

                {/* HOURLY RATE */}
                <td className="p-3">
                  {editing ? (
                    <input
                      className="border p-1 rounded w-full"
                      type="number"
                      value={editRow?.hourly_rate}
                      onChange={(e) =>
                        setEditRow({
                          ...editRow!,
                          hourly_rate: +e.target.value,
                        })
                      }
                    />
                  ) : (
                    `₹ ${rt.hourly_rate}`
                  )}
                </td>

                {/* ACTIVE */}
                <td className="p-3 text-center">
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${
                      rt.is_active
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                    onClick={() => toggle(rt)}
                  >
                    {rt.is_active ? "Active" : "Inactive"}
                  </button>
                </td>

                {/* ACTIONS */}
                <td className="p-3 text-right flex justify-end gap-2">
                  {editing ? (
                    <>
                      <button
                        onClick={update}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckIcon className="h-5" />
                      </button>
                      <button
                        onClick={() => setEditRow(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <XMarkIcon className="h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditRow(rt)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="h-5" />
                      </button>
                      <button
                        onClick={() => remove(rt.id)}
                        className="text-red-600 hover:text-red-800"
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
  );
};

export default RoomTypePage;
