import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { useSnackbar } from "../../context/SnackbarContext";

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
  const {showSnackbar} = useSnackbar();

  const {
    data: categories,
    loading,
    reload,
  } = useAsync<Category[]>(() => api.category.list(), []);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.category_code || !form.description){
      showSnackbar("Fill the box first.",'warning')
      return;
    } 

    if (editingId) {
      try{
        await api.category.update(editingId, form);

      }catch(err :any){
        showSnackbar(err.message,'error')
      }
    } else {
      try{

    
      await api.category.add({
        ...form,
        category_code: Number(form.category_code),
      });
    }catch(err:any){
      showSnackbar(err.message,'error')
    }
    }

    setForm(emptyForm);
    setEditingId(null);
    reload();
  };

  /* =========================
     CANCEL
  ========================= */
  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
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
    await api.category.delete(id);
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

      // ❌ allow multiline textarea normally
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
        <h1 className="text-2xl font-semibold">Category Master</h1>
        <p className="text-sm text-secondary">
          Manage billing and system categories
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-secondary mb-1">
              Category Code
            </label>
            <input
              type="number"
              value={form.category_code}
              onChange={(e) =>
                setForm({ ...form, category_code: e.target.value })
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
              Short Name
            </label>
            <input
              value={form.short_name}
              onChange={(e) =>
                setForm({ ...form, short_name: e.target.value })
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
        </div>

        <div>
          <label className="block text-xs text-secondary mb-1">
            Sub Description
          </label>
          <textarea
            rows={3}
            value={form.sub_description}
            onChange={(e) =>
              setForm({ ...form, sub_description: e.target.value })
            }
            className="w-full border rounded-sm p-2 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} className="btn">
            {editingId ? "Update" : "Add"}
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

        {/* Shortcut hint */}
        <p className="text-xs text-secondary">
          ⏎ Enter = Save &nbsp;&nbsp; • &nbsp;&nbsp; Esc = Cancel
        </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray bg-lightColor">
            <tr>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Short</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
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

            {categories?.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray hover:bg-lightColor transition"
              >
                <td className="p-3">{row.category_code}</td>
                <td className="p-3">{row.description}</td>
                <td className="p-3">{row.short_name || "-"}</td>
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
                <td className="p-3 text-right flex justify-end gap-3">
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
