import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";

type Category = {
  id: number;
  category_code: number;
  description: string;
  sub_description?: string;
  short_name?: string;
  is_active: number;
};

const emptyForm = {
  category_code: "",
  description: "",
  sub_description: "",
  short_name: "",
  is_active: 1,
};

export default function CategoryPage() {
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);


  const {
    data: categories,
    loading,
    error,
    reload,
  } = useAsync<Category[]>(() => api.category.list(), []);

  
  const handleSubmit = async () => {
    if (!form.category_code || !form.description) {
      alert("Category code and description are required");
      return;
    }

    try {
      if (editingId) {
        await api.category.update(editingId, form);
      } else {
        await api.category.add({
          ...form,
          category_code: Number(form.category_code),
        });
      }

      setForm(emptyForm);
      setEditingId(null);
      reload(); // 🔥 reload via hook
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
  };

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (row: Category) => {
    setEditingId(row.id);
    setForm({
      category_code: row.category_code,
      description: row.description,
      sub_description: row.sub_description || "",
      short_name: row.short_name || "",
      is_active: row.is_active,
    });
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    try {
      await api.category.delete(id);
      reload();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Category Master</h1>

      {/* =========================
          FORM
      ========================= */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-5 gap-4">
        <input
          type="number"
          placeholder="Category Code"
          value={form.category_code}
          onChange={(e) => setForm({ ...form, category_code: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border px-2 py-1 rounded col-span-2"
        />

        <input
          type="text"
          placeholder="Short Name"
          value={form.short_name}
          onChange={(e) => setForm({ ...form, short_name: e.target.value })}
          className="border px-2 py-1 rounded"
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

        <textarea
          placeholder="Sub Description"
          value={form.sub_description}
          onChange={(e) =>
            setForm({ ...form, sub_description: e.target.value })
          }
          className="border px-2 py-1 rounded col-span-5"
        />

        <div className="col-span-5 flex gap-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            {editingId ? "Update" : "Add"}
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
          TABLE
      ========================= */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Code</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Short</th>
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
            ) : categories?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No categories found
                </td>
              </tr>
            ) : (
              categories?.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.category_code}</td>
                  <td className="border p-2">{row.description}</td>
                  <td className="border p-2">{row.short_name}</td>
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
