import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { PlusIcon } from "@heroicons/react/24/solid";

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

  /* =========================
     LOAD TABLES
  ========================= */
  const {
    data: tables,
    loading,
    error,
    reload,
  } = useAsync<RestaurantTable[]>(() => api.table.list(), []);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.table_code || !form.table_no) {
      alert("Table code and table number are required");
      return;
    }

    try {
      const payload = {
        table_code: Number(form.table_code),
        table_no: form.table_no,
        description: form.description,
        is_active: form.is_active,
      };

      if (editingId) {
        await api.table.update(editingId, payload);
      } else {
        await api.table.add(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      reload();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
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
    if (!confirm("Delete this table?")) return;

    try {
      await api.table.delete(id);
      reload();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Restaurant Table Master</h1>

      {/* =========================
          FORM
      ========================= */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-8 gap-4">
        <input
          type="number"
          placeholder="Table Code"
          value={form.table_code}
          onChange={(e) => setForm({ ...form, table_code: e.target.value })}
          className="border px-2 py-1 rounded col-span-1"
        />

        <input
          type="text"
          placeholder="Table No"
          value={form.table_no}
          onChange={(e) => setForm({ ...form, table_no: e.target.value })}
          className="border px-2 py-1 rounded col-span-2"
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className={`border px-2 py-1 rounded col-span-${editingId ? 4 : 3}`}
        />

        <select
          value={form.is_active}
          onChange={(e) =>
            setForm({ ...form, is_active: Number(e.target.value) })
          }
          className="border px-2 py-1 rounded"
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>

        <div className={`col-span-${editingId ?5 : 1} flex gap-2`}>
          <button
            onClick={handleSubmit}
            className={`px-4 py-1 bg-blue-600 text-white flex items-center justify-center rounded ${!editingId && 'flex-1'}`}
          >
            {editingId ? "Update" : <PlusIcon className="h-5 w-5 text-white" />}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="px-4 py-1 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* =========================
          TABLE LIST
      ========================= */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Code</th>
              <th className="border p-2">Table No</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-red-600">
                  {error.message || "Failed to load"}
                </td>
              </tr>
            ) : tables?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No tables found
                </td>
              </tr>
            ) : (
              tables?.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.table_code}</td>
                  <td className="border p-2">{row.table_no}</td>
                  <td className="border p-2">{row.description}</td>
                  <td className="border p-2">
                    {row.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
