import { useState, useEffect } from "react";
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
import { useSnackbar } from "../../context/SnackbarContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

const RoomTypePage = () => {
  const { roomTypes, loading, refreshRoomTypes } = useRoomTypes();
  const { showSnackbar } = useSnackbar();
  
  const [editRow, setEditRow] = useState<RoomType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const [newType, setNewType] = useState({
    type_name: "",
    full_rate: 0,
    hourly_rate: 0,
  });

  /* ================= KEYBOARD SHORTCUTS ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditRow(null);
        setPendingDelete(null);
      }

      if (e.key === "Enter") {
        if (editRow) update();
        if (pendingDelete) confirmDelete();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editRow, pendingDelete]);

  /* ================= ACTIONS ================= */

  const create = async () => {
    if (!newType.type_name.trim()) {
      showSnackbar("Room type name is required", "warning");
      return;
    }

    await api.roomType.create(newType);
    setNewType({ type_name: "", full_rate: 0, hourly_rate: 0 });
    refreshRoomTypes();
    showSnackbar("Room type created", "success");
  };

  const update = async () => {
    if (!editRow) return;
    await api.roomType.update(editRow.id, editRow);
    setEditRow(null);
    refreshRoomTypes();
    showSnackbar("Room type updated", "success");
  };

  const askDelete = (id: number) => {
    setPendingDelete(id);
    showSnackbar("Press ENTER to delete, ESC to cancel", "warning");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await api.roomType.delete(pendingDelete);
    setPendingDelete(null);
    refreshRoomTypes();
    showSnackbar("Room type deleted", "success");
  };

  const toggle = async (t: RoomType) => {
    await api.roomType.toggle(t.id, t.is_active ? 0 : 1);
    refreshRoomTypes();
    showSnackbar(
      `Room type ${t.is_active ? "deactivated" : "activated"}`,
      "warning"
    );
  };

  if (loading) {
    return <div className="p-6 text-sm text-secondary">Loading room types…</div>;
  }

  /* ================= UI ================= */

    useKeyboardShortcuts({
      Enter :create,
      
    },[newType]);
  return (
    <div className="p-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Room Types</h1>
      </div>

      {/* ADD NEW */}
      <div className="  bg-bg-primary border  border-gray  rounded-sm  p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text">Add New Room Type</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Type name"
            value={newType.type_name}
            onChange={(e) =>
              setNewType({ ...newType, type_name: e.target.value })
            }
            className="border border-gray rounded-sm px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Full rate"
            value={newType.full_rate}
            onChange={(e) =>
              setNewType({ ...newType, full_rate: +e.target.value })
            }
            className="border border-gray rounded-sm px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Hourly rate"
            value={newType.hourly_rate}
            onChange={(e) =>
              setNewType({ ...newType, hourly_rate: +e.target.value })
            }
            className="border border-gray rounded-sm px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={create}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-sm transition hover-lift"
        >
          <PlusIcon className="w-4 h-4" />
          Add Room Type
        </button>

        <p className="text-xs text-secondary">
            ⏎ Enter = Create &nbsp; • &nbsp; Esc = Back
          </p>
      </div>

      {/* TABLE */}
      <div className="bg-bg-primary  border border-gray  rounded-sm  overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-lightColor border-b border-gray">
            <tr className="text-left text-secondary">
              <th className="p-3">ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Full Rate</th>
              <th className="p-3">Hourly Rate</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roomTypes.map((rt) => {
              const editing = editRow?.id === rt.id;

              return (
                <tr
                  key={rt.id}
                  className="border-b border-gray bg-bg-primary last:border-0 hover-bg-gray transition"
                >
                  <td className="p-3">{rt.id}</td>

                  <td className="p-3">
                    {editing ? (
                      <input
                        className="border rounded-sm px-2 py-1 w-full"
                        value={editRow?.type_name || ""}
                        onChange={(e) =>
                          setEditRow({
                            ...editRow!,
                            type_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      rt.type_name
                    )}
                  </td>

                  <td className="p-3">
                    {editing ? (
                      <input
                        type="number"
                        className="border rounded-sm px-2 py-1 w-full"
                        value={editRow?.full_rate}
                        onChange={(e) =>
                          setEditRow({
                            ...editRow!,
                            full_rate: +e.target.value,
                          })
                        }
                      />
                    ) : (
                      `₹ ${rt.full_rate}`
                    )}
                  </td>

                  <td className="p-3">
                    {editing ? (
                      <input
                        type="number"
                        className="border rounded-sm px-2 py-1 w-full"
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

                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggle(rt)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rt.is_active
                          ? "bg-success/15 text-success"
                          : "bg-error/15 text-error"
                      }`}
                    >
                      {rt.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="p-3 text-right flex justify-end gap-2">
                    {editing ? (
                      <>
                        <button
                          onClick={update}
                          className="text-success hover:text-success"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditRow(null)}
                          className="text-secondary hover:text-text"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditRow(rt)}
                          className="text-primary hover:text-primary"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => askDelete(rt.id)}
                          className="text-error hover:text-error"
                        >
                          <TrashIcon className="w-5 h-5" />
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
    </div>
  );
};

export default RoomTypePage;
