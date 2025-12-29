import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useSnackbar } from "../../context/SnackbarContext";
type RestaurantTable = {
  id: number;
  table_code: number;
  table_no: string;
  description?: string;
  is_active: number;
};

const emptyForm = {
  table_code: "",
  table_no: "",
  description: "",
  is_active: 1,
};

export default function RestaurantTablePage() {
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const {showSnackbar} = useSnackbar();

  /* =========================
     LOAD TABLES
  ========================= */
  const {
    data: tables,
    loading,
    reload,
  } = useAsync<RestaurantTable[]>(() => api.table.list(), []);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.table_code || !form.table_no) {
      showSnackbar("Enter field First!",'warning');
      return;
    }

    const payload = {
      table_code: Number(form.table_code),
      table_no: form.table_no,
      description: form.description,
      is_active: form.is_active,
    };
    try{


    if (editingId) {
      await api.table.update(editingId, payload);
    } else {
      await api.table.add(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    reload();
  }catch(err:any){
    showSnackbar(err.message,"error");
  }
  };

  /* =========================
     CANCEL
  ========================= */
  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (row: RestaurantTable) => {
    setEditingId(row.id);
    setForm({
      table_code: row.table_code,
      table_no: row.table_no,
      description: row.description || "",
      is_active: row.is_active,
    });
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: number) => {
    await api.table.delete(id);
    reload();
  };

  /* =========================
     KEYBOARD SHORTCUTS
     ENTER → SAVE
     ESC → CANCEL
  ========================= */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;

      if (tag === "TEXTAREA" && e.key === "Enter") return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form, editingId]);

  return (
    <div className="p-8 w-full space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">Restaurant Table Master</h1>
        <p className="text-sm text-secondary">
          Manage restaurant seating tables
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Table" : "Add New Table"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs text-secondary mb-1">
              Table Code
            </label>
            <input
              type="number"
              value={form.table_code}
              onChange={(e) =>
                setForm({ ...form, table_code: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Table Number
            </label>
            <input
              value={form.table_no}
              onChange={(e) =>
                setForm({ ...form, table_no: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-secondary mb-1">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Status
            </label>
            <select
              value={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: Number(e.target.value) })
              }
              className="w-full border border-gray bg-white rounded-sm p-2 text-sm"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button onClick={handleSubmit} className="btn flex gap-2">
              {editingId ? "Update" : <PlusIcon className="h-4 w-4" />}
              {!editingId && "Add"}
            </button>

            {editingId && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-sm bg-gray text-black"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-secondary">
          ⏎ Enter = Save &nbsp;&nbsp; • &nbsp;&nbsp; Esc = Cancel
        </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray bg-lightColor">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Table No</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-secondary">
                  Loading…
                </td>
              </tr>
            )}

            {tables?.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray hover:bg-lightColor transition"
              >
                <td className="p-3">{row.table_code}</td>
                <td className="p-3">{row.table_no}</td>
                <td className="p-3">{row.description || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      row.is_active
                        ? "bg-success text-white"
                        : "bg-gray text-black"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 flex justify-end gap-4">
                  <button
                    onClick={() => handleEdit(row)}
                    className="text-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-error"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
