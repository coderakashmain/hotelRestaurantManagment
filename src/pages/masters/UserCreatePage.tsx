import { useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useFinancialYear } from "../../context/FinancialYearContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { useUsers } from "../../context/UserContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { reloadYears } = useFinancialYear();
  const { refreshUsers } = useUsers();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
  });

  /* =========================
     CREATE USER
  ========================= */
  const createUser = async () => {
    if (!form.name || !form.username || !form.password) {
      showSnackbar("Please Enter the required field!", "warning");
      return;
    }

    await api.users.create({
      name: form.name,
      username: form.username,
      password: form.password,
      email: form.email || undefined,
    });
    showSnackbar("User created successfully.");
    refreshUsers();
    reloadYears();

    navigate("/hotel/fy");
  };

  /* =========================
     KEYBOARD SHORTCUTS
     ENTER → SAVE
     ESC → BACK
  ========================= */
  // useEffect(() => {
  //   const handler = (e: KeyboardEvent) => {
  //     const tag = (e.target as HTMLElement)?.tagName;

  //     if (tag === "TEXTAREA") return;

  //     if (e.key === "Enter") {
  //       e.preventDefault();
  //       createUser();
  //     }

  //     if (e.key === "Escape") {
  //       e.preventDefault();
  //       navigate(-1);
  //     }
  //   };

  //   window.addEventListener("keydown", handler);
  //   return () => window.removeEventListener("keydown", handler);
  // }, [form]);

 
  useKeyboardShortcuts(
    {
      Enter: createUser,
  
    },
    [form]
  );
  
 

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-bg-secondary px-6">
      <div className="w-full max-w-md card space-y-5">
        {/* ================= HEADER ================= */}
        <div>
          <h2 className="text-xl font-semibold">Create Admin User</h2>
          <p className="text-sm text-secondary mt-1">
            This user will manage hotel operations
          </p>
        </div>

        {/* ================= FORM ================= */}
        <Field
          label="Full Name *"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Admin Name"
        />

        <Field
          label="Username *"
          value={form.username}
          onChange={(v) => setForm({ ...form, username: v })}
          placeholder="admin"
        />

        <Field
          label="Password *"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="••••••••"
        />

        <Field
          label="Email (optional)"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="admin@hotel.com"
        />

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-between items-center pt-3">
          <p className="text-xs text-secondary">
            ⏎ Enter = Create &nbsp; • &nbsp; Esc = Back
          </p>

          <button onClick={createUser} className="btn hover-glow hover-accent">
            Create User
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================
   FIELD COMPONENT
========================= */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-secondary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-sm p-2 text-sm bg-white"
      />
    </div>
  );
}
