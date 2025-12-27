
import { api } from "../api/api";
import { NavLink } from "react-router";
import { useFinancialYear } from "../context/FinancialYearContext";
import { useEffect } from "react";

export default function FinancialYearList() {
   const { years, setActiveYear,loading,reloadYears } = useFinancialYear();


  const deleteYear = async (id: number) => {
    if (!window.confirm("Delete this financial year?")) return;

    try {
      await api.fy.delete(id);
      reloadYears();
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(()=>{
    if(years.length > 0 && !years[0].is_active){
      setActiveYear(years[0].id);
    };
  },[years])

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Financial Years</h1>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Year</th>
            <th className="p-3">Start</th>
            <th className="p-3">End</th>
            <th className="p-3">Prefix</th>
            <th className="p-3">Active</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {years.map((fy: any) => (
            <tr key={fy.id} className="border-b">
              <td className="p-3">{fy.year_name}</td>
              <td className="p-3">{fy.start_date}</td>
              <td className="p-3">{fy.end_date}</td>
              <td className="p-3">{fy.invoice_prefix || "-"}</td>

              <td className="p-3">
                {fy.is_active ? (
                  <span className="px-3 py-1 bg-green-500 text-white text-xs rounded">
                    ACTIVE
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      
                      setActiveYear(fy.id)}}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    Set Active
                  </button>
                )}
              </td>

              <td className="p-3 flex gap-3">
                <NavLink
                  to={`/hotel/fy-edit/${fy.id}`}
                  className="text-blue-600 underline"
                >
                  Edit
                </NavLink>

                {!fy.is_active && (
                  <button
                    onClick={() => deleteYear(fy.id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
