import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";

type Employee = {
  id: number;
  emp_code: number;
  name: string;
  father_name?: string;
  location?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  nationality?: string;
  aadhaar_no?: string;
  mobile?: string;
  designation?: string;
  is_active: number;
};

const emptyForm = {
  emp_code: "",
  name: "",
  father_name: "",
  location: "",
  city: "",
  district: "",
  state: "",
  country: "",
  nationality: "",
  aadhaar_no: "",
  mobile: "",
  designation: "",
  is_active: 1,
};

export default function EmployeePage() {
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  /* =========================
     LOAD EMPLOYEES
  ========================= */
  const {
    data: employees,
    loading,
    error,
    reload,
  } = useAsync<Employee[]>(() => api.employee.list(), []);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.emp_code || !form.name) {
      alert("Employee code and name are required");
      return;
    }

    try {
      const payload = {
        emp_code: Number(form.emp_code),
        name: form.name,
        father_name: form.father_name || null,
        location: form.location || null,
        city: form.city || null,
        district: form.district || null,
        state: form.state || null,
        country: form.country || null,
        nationality: form.nationality || null,
        aadhaar_no: form.aadhaar_no || null,
        mobile: form.mobile || null,
        designation: form.designation || null,
        is_active: form.is_active,
      };

      if (editingId) {
        await api.employee.update(editingId, payload);
      } else {
        await api.employee.add(payload);
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
  const handleEdit = (row: Employee) => {
    setEditingId(row.id);
    setForm({
      emp_code: row.emp_code,
      name: row.name,
      father_name: row.father_name || "",
      location: row.location || "",
      city: row.city || "",
      district: row.district || "",
      state: row.state || "",
      country: row.country || "",
      nationality: row.nationality || "",
      aadhaar_no: row.aadhaar_no || "",
      mobile: row.mobile || "",
      designation: row.designation || "",
      is_active: row.is_active,
    });
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this employee?")) return;

    try {
      await api.employee.delete(id);
      reload();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const DESIGNATIONS = [
    "Manager",
    "Cashier",
    "Waiter",
    "Chef",
    "Helper",
    "Cleaner",
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Employee Master</h1>

      {/* =========================
          FORM
      ========================= */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-4 gap-4">
        <input
          type="number"
          placeholder="Employee Code"
          value={form.emp_code}
          onChange={(e) => setForm({ ...form, emp_code: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Employee Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-2 py-1 rounded col-span-2"
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

        <input
          type="text"
          placeholder="Father Name"
          value={form.father_name}
          onChange={(e) => setForm({ ...form, father_name: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Mobile"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Aadhaar No"
          value={form.aadhaar_no}
          onChange={(e) => setForm({ ...form, aadhaar_no: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <select
          value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
          className="border px-2 py-1 rounded"
        >
          <option value="">Select Designation</option>
          {DESIGNATIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="District"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Nationality"
          value={form.nationality}
          onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          className="border px-2 py-1 rounded"
        />

        <div className="col-span-4 flex gap-2">
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
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Code</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">Designation</th>
              <th className="border p-2">City</th>
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
            ) : employees?.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No employees found
                </td>
              </tr>
            ) : (
              employees?.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.emp_code}</td>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2">{row.mobile}</td>
                  <td className="border p-2">{row.designation}</td>
                  <td className="border p-2">{row.city}</td>
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
