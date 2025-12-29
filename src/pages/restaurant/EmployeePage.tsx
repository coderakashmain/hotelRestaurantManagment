import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { useSnackbar } from "../../context/SnackbarContext";

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

const DESIGNATIONS = [
  "Manager",
  "Cashier",
  "Waiter",
  "Chef",
  "Helper",
  "Cleaner",
];

export default function EmployeePage() {
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
const {showSnackbar} = useSnackbar();
  /* =========================
     LOAD
  ========================= */
  const {
    data: employees,
    loading,
    reload,
  } = useAsync<Employee[]>(() => api.employee.list(), []);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!form.emp_code || !form.name) {
      showSnackbar("Plese enter required filled!",'warning')
      return;
    };

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
    try{

   
    if (editingId) {
      await api.employee.update(editingId, payload);
    } else {
      await api.employee.add(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    reload();
  }catch(err:any){
    showSnackbar(err.message,"error")
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
     DELETE (silent)
  ========================= */
  const handleDelete = async (id: number) => {
    await api.employee.delete(id);
    reload();
  };

  /* =========================
     KEYBOARD SHORTCUTS
     ENTER → SAVE
     ESC → CANCEL
  ========================= */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
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
    <div className="p-8 space-y-6 w-full">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">Employee Master</h1>
        <p className="text-sm text-secondary">
          Manage hotel staff and roles
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Employee" : "Add New Employee"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-secondary mb-1">
              Employee Code
            </label>
            <input
              type="number"
              value={form.emp_code}
              onChange={(e) =>
                setForm({ ...form, emp_code: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-secondary mb-1">
              Employee Name
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
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

          <div>
            <label className="block text-xs text-secondary mb-1">
              Father Name
            </label>
            <input
              value={form.father_name}
              onChange={(e) =>
                setForm({ ...form, father_name: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Mobile
            </label>
            <input
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Aadhaar No
            </label>
            <input
              value={form.aadhaar_no}
              onChange={(e) =>
                setForm({ ...form, aadhaar_no: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Designation
            </label>
            <select
              value={form.designation}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
              className="w-full border border-gray bg-white rounded-sm p-2 text-sm"
            >
              <option value="">Select</option>
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Location
            </label>
            <input
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              City
            </label>
            <input
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              District
            </label>
            <input
              value={form.district}
              onChange={(e) =>
                setForm({ ...form, district: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              State
            </label>
            <input
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Country
            </label>
            <input
              value={form.country}
              onChange={(e) =>
                setForm({ ...form, country: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-secondary mb-1">
              Nationality
            </label>
            <input
              value={form.nationality}
              onChange={(e) =>
                setForm({ ...form, nationality: e.target.value })
              }
              className="w-full border rounded-sm p-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} className="btn">
            {editingId ? "Update Employee" : "Add Employee"}
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
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">City</th>
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

            {employees?.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray hover:bg-lightColor transition"
              >
                <td className="p-3">{row.emp_code}</td>
                <td className="p-3">{row.name}</td>
                <td className="p-3">{row.mobile || "-"}</td>
                <td className="p-3">{row.designation || "-"}</td>
                <td className="p-3">{row.city || "-"}</td>
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
