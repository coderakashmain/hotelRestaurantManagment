import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { PlusIcon } from "@heroicons/react/24/solid";
import { formatCurrency } from "../../utils/currency";

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

  /* =========================
     LOAD DATA
  ========================= */
  const {
    data: dishes,
    loading,
    error,
    reload,
  } = useAsync<Dish[]>(() => api.dish.list(), []);

  const { data: categories } = useAsync<Category[]>(
    () => api.category.list(),
    []
  );

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.dish_code || !form.name || !form.category_id) {
      alert("Dish code, name and category are required");
      return;
    }

    try {
      const payload = {
        dish_code: Number(form.dish_code),
        name: form.name,
        category_id: Number(form.category_id),
        full_plate_rate: Number(form.full_plate_rate || 0),
        half_plate_rate: Number(form.half_plate_rate || 0),
        is_active: form.is_active,
      };

      if (editingId) {
        await api.dish.update(editingId, payload);
      } else {
        await api.dish.add(payload);
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
    if (!confirm("Delete this dish?")) return;

    try {
      await api.dish.delete(id);
      reload();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Dish Master</h1>

      {/* =========================
          FORM
      ========================= */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-9 gap-4">
        <input
          type="number"
          placeholder="Dish Code"
          value={form.dish_code}
          onChange={(e) => setForm({ ...form, dish_code: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Dish Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`border px-2 py-1 rounded col-span-${editingId ? 3 : 2}`}
        />

        <select
          value={form.category_id}
          onChange={(e) =>
            setForm({ ...form, category_id: e.target.value })
          }
          className="border px-2 py-1 rounded col-span-2"
        >
          <option value="">Select Category</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.description}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Full Plate Rate"
          value={form.full_plate_rate}
          onChange={(e) =>
            setForm({ ...form, full_plate_rate: e.target.value })
          }
          className="border px-2 py-1 rounded col-span-1"
        />

        <input
          type="number"
          placeholder="Half Plate Rate"
          value={form.half_plate_rate}
          onChange={(e) =>
            setForm({ ...form, half_plate_rate: e.target.value })
          }
          className="border px-2 py-1 rounded "
        />

        <select
          value={form.is_active}
          onChange={(e) =>
            setForm({ ...form, is_active: Number(e.target.value) })
          }
          className="border px-2 py-1 rounded "
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>

        <div className={`col-span-${editingId ?2 :1} flex gap-2`}>
          <button
            onClick={handleSubmit}
            className={`px-4 py-1 bg-blue-600 text-white rounded ${!editingId && "flex-1"} flex justify-center items-center`}
          >
            {editingId ? "Update" : <PlusIcon className="h-5 w-5 text-white" />
            }
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="px-4 py-1 bg-gray-400 text-white rounded "
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
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Full</th>
              <th className="border p-2">Half</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-red-600">
                  {error.message || "Failed to load"}
                </td>
              </tr>
            ) : dishes?.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No dishes found
                </td>
              </tr>
            ) : (
              dishes?.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.dish_code}</td>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2">
                    {categories?.find((c) => c.id === row.category_id)
                      ?.description || "-"}
                  </td>
                  <td className="border p-2">{formatCurrency(row.full_plate_rate)}</td>
                  <td className="border p-2">{formatCurrency(row.half_plate_rate)}</td>
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
