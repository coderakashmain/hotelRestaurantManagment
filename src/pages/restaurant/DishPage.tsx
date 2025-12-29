import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { PlusIcon } from "@heroicons/react/24/solid";
import { formatCurrency } from "../../utils/currency";
import { useSnackbar } from "../../context/SnackbarContext";

type Dish = {
  id: number;
  dish_code: number;
  name: string;
  category_id: number;
  full_plate_rate: number;
  half_plate_rate: number;
  is_active: number;
};

type Category = {
  id: number;
  description: string;
};

const emptyForm = {
  dish_code: "",
  name: "",
  category_id: "",
  full_plate_rate: "",
  half_plate_rate: "",
  is_active: 1,
};

export default function DishPage() {
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10; // change if needed

  /* =========================
     LOAD DATA
  ========================= */
  const {
    data: dishes,
    loading,
    reload,
  } = useAsync<Dish[]>(() => api.dish.list(), []);

  const { data: categories } = useAsync<Category[]>(
    () => api.category.list(),
    []
  );

  const totalItems = dishes?.length || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const paginatedDishes = dishes?.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  useEffect(() => {
    setPage(1);
  }, [dishes]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.dish_code || !form.name || !form.category_id) {
      showSnackbar("Please enter the field first!", "warning");
      return;
    }

    const payload = {
      dish_code: Number(form.dish_code),
      name: form.name,
      category_id: Number(form.category_id),
      full_plate_rate: Number(form.full_plate_rate || 0),
      half_plate_rate: Number(form.half_plate_rate || 0),
      is_active: form.is_active,
    };
    try {
      if (editingId) {
        await api.dish.update(editingId, payload);
      } else {
        await api.dish.add(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      reload();
    } catch (err: any) {
      showSnackbar(err.message, "error");
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
  const handleEdit = (row: Dish) => {
    setEditingId(row.id);
    setForm({
      dish_code: row.dish_code,
      name: row.name,
      category_id: row.category_id,
      full_plate_rate: row.full_plate_rate,
      half_plate_rate: row.half_plate_rate,
      is_active: row.is_active,
    });
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: number) => {
    await api.dish.delete(id);
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

      // Allow textarea new line if ever added
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
        <h1 className="text-2xl font-semibold">Dish Master</h1>
        <p className="text-sm text-secondary">Manage menu items and pricing</p>
      </div>

      {/* ================= FORM ================= */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Dish" : "Add New Dish"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs text-secondary mb-1">
              Dish Code
            </label>
            <input
              type="number"
              value={form.dish_code}
              onChange={(e) => setForm({ ...form, dish_code: e.target.value })}
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-secondary mb-1">
              Dish Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-secondary mb-1">
              Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className="w-full border border-gray bg-white rounded-sm p-2 text-sm"
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">Status</label>
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

          <div>
            <label className="block text-xs text-secondary mb-1">
              Full Plate Rate
            </label>
            <input
              type="number"
              value={form.full_plate_rate}
              onChange={(e) =>
                setForm({ ...form, full_plate_rate: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Half Plate Rate
            </label>
            <input
              type="number"
              value={form.half_plate_rate}
              onChange={(e) =>
                setForm({ ...form, half_plate_rate: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="btn flex items-center gap-2"
          >
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
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Full</th>
              <th className="p-3 text-left">Half</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-secondary">
                  Loading…
                </td>
              </tr>
            )}

            {paginatedDishes?.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray hover:bg-lightColor transition"
              >
                <td className="p-3">{row.dish_code}</td>
                <td className="p-3">{row.name}</td>
                <td className="p-3">
                  {categories?.find((c) => c.id === row.category_id)
                    ?.description || "-"}
                </td>
                <td className="p-3">{formatCurrency(row.full_plate_rate)}</td>
                <td className="p-3">{formatCurrency(row.half_plate_rate)}</td>
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
                <td className="p-3 flex justify-end gap-3">
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
        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 overflow-x-auto scrollbar-none">
            <p className="text-xs text-secondary text-nowrap pr-2">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, totalItems)} of {totalItems}
            </p>

            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-sm disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded-sm disabled:opacity-50"
              >
                Next
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-sm border border-gray ${
                    page === i + 1 ? "bg-primary text-white" : "bg-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

             
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
