import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAsync } from "../hooks/useAsync";

export default function FinancialYearEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading, data: fy } = useAsync(() => {
    if (!id) return Promise.resolve(null);
    return api.fy.list().then((list) => list.find((f: any) => f.id == id));
  }, [id]);

  const [yearName, setYearName] = useState("");
  const [prefix, setPrefix] = useState("");

  useEffect(() => {
    if (fy) {
      setYearName(fy.year_name);
      setPrefix(fy.invoice_prefix || "");
    }
  }, [fy]);

  const saveChanges = async () => {
    await api.fy.update(Number(id), {
      year_name: yearName,
      invoice_prefix: prefix || undefined,
    });

    alert("Financial Year updated successfully!");
    navigate("/fy");
  };

  if (loading || !fy) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Financial Year</h1>

      <div className="bg-white shadow p-6 rounded w-[420px] space-y-4">

        <div>
          <label className="block mb-1 font-medium">Financial Year Name</label>
          <input
            value={yearName}
            onChange={(e) => setYearName(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="2024-2025"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Invoice Prefix (optional)</label>
          <input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="INV / HOTEL / FY25"
          />
        </div>

        <button
          onClick={saveChanges}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Save Changes
        </button>

        <button
          onClick={() => navigate("/fy")}
          className="w-full bg-gray-300 text-black py-2 rounded mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
