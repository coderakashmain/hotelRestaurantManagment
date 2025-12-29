import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useSnackbar } from "../../context/SnackbarContext";

const ExtraCharge = () => {
  const [newTypeName, setNewTypeName] = useState("");
  const {showSnackbar} = useSnackbar();

  const { data: billTypes, loading, reload } = useAsync(
    () => api.billType.list(),
    []
  );

  const saveNewType = async () => {
    if (!newTypeName.trim()) {
      showSnackbar("Enter charge name",'warning')
      return;
    }

    await api.billType.create({ name: newTypeName });
    setNewTypeName("");
    reload();
  };
  useKeyboardShortcuts({
    Enter : saveNewType
  },[newTypeName]);

  return (
    <div className="p-6 max-w-4xl">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Extra Charges</h1>
        <p className="text-sm text-secondary">
          Manage additional billable charge types used during billing
        </p>
      </div>

      {/* ================= ADD FORM ================= */}
      <div className="card mb-8">
        <div className="flex items-center gap-3">
          <input
            className="flex-1 px-3 py-2 rounded-sm border border-gray text-sm
                       focus:outline-none focus:border-primary transition"
            placeholder="Enter charge name (e.g. Laundry, Extra Bed)"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />

          <button
            onClick={saveNewType}
            className="btn px-5 text-sm"
          >
            Add
          </button>
          
        </div>
        <p className="text-xs text-secondary mt-4">
            ⏎ Enter = Create &nbsp; • &nbsp; Esc = Back
          </p>
      </div>

      {/* ================= LIST ================= */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Charges List</h3>
          <span className="text-xs text-secondary">
            Total: {billTypes?.length || 0}
          </span>
        </div>

        {loading ? (
          <div className="text-sm text-secondary py-6 text-center">
            Loading charges…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray text-secondary">
                  <th className="text-left py-2 px-3 font-medium w-20">
                    ID
                  </th>
                  <th className="text-left py-2 px-3 font-medium">
                    Charge Name
                  </th>
                </tr>
              </thead>

              <tbody>
                {billTypes?.map((t: any, index: number) => (
                  <tr
                    key={t.id}
                    className={`
                      border-b border-gray last:border-none
                      ${index % 2 === 0 ? "bg-lightColor/40" : ""}
                      hover:bg-lightColor transition
                    `}
                  >
                    <td className="py-2 px-3 font-medium text-secondary">
                      {t.id}
                    </td>
                    <td className="py-2 px-3">
                      {t.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {billTypes?.length === 0 && (
              <div className="text-center text-sm text-secondary py-6">
                No extra charges added yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraCharge;
