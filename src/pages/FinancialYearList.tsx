import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useFinancialYear } from "../context/FinancialYearContext";
import { useSnackbar } from "../context/SnackbarContext";
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export default function FinancialYearList() {
  const { years, loading, reloadYears, setActiveYear } = useFinancialYear();
  const { showSnackbar } = useSnackbar();

  /* ================= CREATE ================= */
  const getDefaultYear = () => {
    const d = new Date();
    return d.getMonth() + 1 > 3 ? d.getFullYear() : d.getFullYear() - 1;
  };

  const [year, setYear] = useState(getDefaultYear());
  const [prefix, setPrefix] = useState("");

  

  const createFY = async () => {
    if (!year) {
      showSnackbar("Starting year is required", "warning");
      return;
    }
    try{
      await api.fy.create({
        year,
        prefix: prefix || undefined,
      });
  
      showSnackbar("Financial year created successfully", "success");
      setPrefix("");
      reloadYears();
    }catch(err:any){
      showSnackbar(err.message, "error");
    }
   
  };

  /* ================= EDIT ================= */
  const [editOpen, setEditOpen] = useState(false);
  const [editingFY, setEditingFY] = useState<any>(null);
  const [yearName, setYearName] = useState("");
  const [editPrefix, setEditPrefix] = useState("");

  const openEdit = (fy: any) => {
    setEditingFY(fy);
    setYearName(fy.year_name);
    setEditPrefix(fy.invoice_prefix || "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingFY) return;

    await api.fy.update(editingFY.id, {
      year_name: yearName,
      invoice_prefix: editPrefix || undefined,
    });

    showSnackbar("Financial year updated", "success");
    setEditOpen(false);
    reloadYears();
  };

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditOpen(false);
      if (e.key === "Enter" && editOpen) saveEdit();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editOpen, yearName, editPrefix]);

  /* ================= AUTO ACTIVE ================= */
  useEffect(() => {
    if (years.length && !years.some((y) => y.is_active)) {
      setActiveYear(years[0].id);
    }
  }, [years]);
  useKeyboardShortcuts({
    Enter : createFY
  },[{year,prefix}]);

  if (loading) return <div className="p-10 text-lg">Loading financial years…</div>;



  return (
    <div className="p-10 w-full space-y-10">

      {/* ================= PAGE HEADER ================= */}
      <div>
        <h1 className="text-3xl font-semibold">Financial Years</h1>
        <p className="text-secondary mt-1 max-w-3xl">
          Financial years define accounting boundaries for billing, invoices,
          GST calculation, and reports. Only one financial year can be active
          at a time.
        </p>
      </div>

      {/* ================= CREATE SECTION ================= */}
      <div className="card rounded-sm w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-1">
          Create New Financial Year
        </h2>
        <p className="text-sm text-secondary mb-4">
          Typically starts on <b>1st April</b> and ends on <b>31st March</b>.
          Invoice prefix is optional but recommended.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Starting Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray p-2 rounded-sm w-full"
              placeholder="2024"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Invoice Prefix
            </label>
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="border border-gray p-2 rounded-sm w-full"
              placeholder="FY24"
            />
          </div>

          <button
            onClick={createFY}
            className="btn rounded-sm h-[40px]"
          >
            Create Financial Year
          </button>
        </div>
        <p className="text-xs text-secondary mt-4">
            ⏎ Enter = Create &nbsp; • &nbsp; Esc = Back
          </p>
      </div>

      {/* ================= LIST ================= */}
      <div className="card rounded-sm w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray text-secondary">
            <tr>
              <th className="p-4 text-left">Financial Year</th>
              <th className="p-4 text-left">Start Date</th>
              <th className="p-4 text-left">End Date</th>
              <th className="p-4 text-left">Invoice Prefix</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {years.map((fy: any) => (
              <tr
                key={fy.id}
                className="border-b  border-gray last:border-0 hover:bg-lightColor transition"
              >
                <td className="p-4 font-medium">{fy.year_name}</td>
                <td className="p-4">{fy.start_date}</td>
                <td className="p-4">{fy.end_date}</td>
                <td className="p-4">{fy.invoice_prefix || "-"}</td>

                <td className="p-4">
                  {fy.is_active ? (
                    <span className="px-3 py-1 text-xs rounded-full bg-success text-white">
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveYear(fy.id)}
                      className="px-3 py-1 text-xs rounded-sm bg-primary text-white"
                    >
                      Set Active
                    </button>
                  )}
                </td>

                <td className="p-4 flex justify-end gap-4">
                  <button
                    onClick={() => openEdit(fy)}
                    className="text-primary hover:opacity-80"
                    title="Edit financial year"
                  >
                    <PencilSquareIcon className="h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card rounded-sm w-[460px]">
            <h3 className="text-lg font-semibold mb-1">
              Edit Financial Year
            </h3>
            <p className="text-sm text-secondary mb-4">
              Update display name or invoice prefix.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Financial Year Name
                </label>
                <input
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  className="border border-gray p-2 rounded-sm w-full"
                  placeholder="2024–2025"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Invoice Prefix
                </label>
                <input
                  value={editPrefix}
                  onChange={(e) => setEditPrefix(e.target.value)}
                  className="border border-gray p-2 rounded-sm w-full"
                  placeholder="FY24"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEdit}
                className="btn flex-1 rounded-sm"
              >
                <CheckIcon className="h-5 mr-1" /> Save Changes
              </button>

              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 bg-gray text-black py-2 rounded-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
