import { useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useFinancialYear } from "../../context/FinancialYearContext";

export default function UserCreatePage() {
    const {reloadYears} = useFinancialYear();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
  });

  const createUser = async () => {
    if (!form.name || !form.username || !form.password)
      return alert("All fields except email are required");

    await api.users.create(form);

    alert("User Created Successfully!");
       reloadYears();
    navigate("/"); // redirect to login after setup
 
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="bg-bg-secondary p-6 w-96 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Create Admin User</h2>

        <input className="border p-2 w-full mb-2 rounded"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input className="border p-2 w-full mb-2 rounded"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input type="password" className="border p-2 w-full mb-2 rounded"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input className="border p-2 w-full mb-4 rounded"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <button
          className="bg-sky-600 text-white w-full py-2 rounded"
          onClick={createUser}
        >
          Create User
        </button>
      </div>
    </div>
  );
}
