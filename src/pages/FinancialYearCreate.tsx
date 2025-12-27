import { useState } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router";
import { useFinancialYear } from "../context/FinancialYearContext";

export default function FinancialYearCreate() {
  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    if (month > 3) {
      return year;
    } else {
      return year - 1;
    }
  };

  const [year, setYear] = useState(getFinancialYear());
  const [prefix, setPrefix] = useState("");
  const navigate = useNavigate();
  const { reloadYears } = useFinancialYear();

  const save = async () => {
    await api.fy.create({
      year: Number(year),
      prefix: prefix || undefined,
    });
    alert("Financial Year Created");
    navigate("/hotel/fy");
    reloadYears();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Financial Year</h1>

      <div className="bg-white shadow p-6 rounded w-96 space-y-3">
        <label className="block text-sm font-medium">Starting Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded p-2 w-full"
        />

        <label className="block text-sm font-medium">
          Invoice Prefix (optional)
        </label>
        <input
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="HOTEL, INV, FY24 etc"
        />

        <button
          onClick={save}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Create Year
        </button>
      </div>
    </div>
  );
}
