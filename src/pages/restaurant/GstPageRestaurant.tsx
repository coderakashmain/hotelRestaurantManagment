import { useEffect, useState } from "react";
import { api } from "../../api/api";
import {
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

import { useSnackbar } from "../../context/SnackbarContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useAsync } from "../../hooks/useAsync";

const GstPageRestaurant = () => {

  const { data: list, reload, loading } = useAsync<any>(
    () => api.restaurant_gst.list(),
    []
  );

  const { showSnackbar } = useSnackbar();

  const [edit, setEdit] = useState<any | null>(null);

  const [newGST, setNewGST] = useState({
    gst_percent: 0,
    cgst_percent: 0,
    sgst_percent: 0,
    igst_percent: 0,
    effective_from: "",
    effective_to: "",
    is_active: 0,
  });

  /* =======================
     Keyboard shortcuts
  ======================= */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEdit(null);
      }
      if (e.key === "Enter" && edit) {
        update();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [edit]);

  /* =======================
     Auto tax split
  ======================= */
  useEffect(() => {
    const cgst = Number((newGST.gst_percent / 2).toFixed(2));
    const sgst = Number((newGST.gst_percent / 2).toFixed(2));

    setNewGST((prev) => ({
      ...prev,
      cgst_percent: cgst,
      sgst_percent: sgst,
      igst_percent: newGST.gst_percent,
    }));
  }, [newGST.gst_percent]);

  useEffect(() => {
    if (!edit) return;

    const cgst = Number((edit.gst_percent / 2).toFixed(2));
    const sgst = Number((edit.gst_percent / 2).toFixed(2));

    setEdit((prev: any) => ({
      ...prev,
      cgst_percent: cgst,
      sgst_percent: sgst,
      igst_percent: edit.gst_percent,
    }));
  }, [edit?.gst_percent]);

  /* =======================
     Actions
  ======================= */
  const create = async () => {
    if (!newGST.gst_percent) {
      showSnackbar("GST percentage is required", "warning");
      return;
    }

    await api.restaurant_gst.create(newGST);
    showSnackbar("GST slab added", "success");

    setNewGST({
      gst_percent: 0,
      cgst_percent: 0,
      sgst_percent: 0,
      igst_percent: 0,
      effective_from: "",
      effective_to: "",
      is_active: 0,
    });

    reload();
  };

  const update = async () => {
    if (!edit) return;

    await api.restaurant_gst.update(edit);
    showSnackbar("GST slab updated", "success");

    setEdit(null);
    reload();
  };

  const setActive = async (id: number) => {
    await api.restaurant_gst.setActive(id);
    showSnackbar("Active GST updated", "warning");
    reload();
  };

  const remove = async (id: number) => {
    await api.restaurant_gst.delete(id);
    showSnackbar("GST slab removed", "success");
    reload();
  };



  useKeyboardShortcuts({
    Enter: create
  },[newGST]);
  if (loading) {
    return <div className="p-10 text-lg">Loading GST slabs…</div>;
  }
  return (
    <div className="w-full p-10">

      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text">
          GST Management
        </h1>
        <p className="text-sm text-secondary mt-1">
          Configure tax slabs used for billing & invoices
        </p>
      </div>

      {/* ================= ADD GST ================= */}
      <div className="card rounded-sm mb-6">
        <h3 className="font-medium mb-4">Add GST Slab</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            className="border border-gray rounded-sm px-3 py-2"
            placeholder="GST %"
            value={newGST.gst_percent}
            onChange={(e) =>
              setNewGST({ ...newGST, gst_percent: Number(e.target.value) })
            }
          />

          <input
            disabled
            className="border border-gray rounded-sm px-3 py-2 bg-lightColor"
            value={newGST.cgst_percent}
            placeholder="CGST %"
          />

          <input
            disabled
            className="border border-gray rounded-sm px-3 py-2 bg-lightColor"
            value={newGST.sgst_percent}
            placeholder="SGST %"
          />

          <input
            type="date"
            className="border border-gray rounded-sm px-3 py-2"
            value={newGST.effective_from}
            onChange={(e) =>
              setNewGST({ ...newGST, effective_from: e.target.value })
            }
          />

          <input
            type="date"
            className="border border-gray rounded-sm px-3 py-2"
            value={newGST.effective_to}
            onChange={(e) =>
              setNewGST({ ...newGST, effective_to: e.target.value })
            }
          />
        </div>

        <button
          onClick={create}
          className="btn mt-4 rounded-sm"
        >
          Add GST
        </button>
        <p className="text-xs text-secondary mt-4">
            ⏎ Enter = Create &nbsp; • &nbsp; Esc = Back
          </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card rounded-sm">
        <table className="w-full">
          <thead className="border-b border-gray">
            <tr className="text-sm text-secondary">
              <th className="p-3 text-left">GST</th>
              <th className="p-3 text-left">CGST</th>
              <th className="p-3 text-left">SGST</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-center">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((gst: any) => {
              const editing = edit?.id === gst.id;

              return (
                <tr key={gst.id} className="border-b border-gray last:border-0">

                  <td className="p-3">
                    {editing ? (
                      <input
                        className="border border-gray rounded-sm px-2 py-1 w-full"
                        value={edit.gst_percent}
                        onChange={(e) =>
                          setEdit({ ...edit, gst_percent: Number(e.target.value) })
                        }
                      />
                    ) : (
                      `${gst.gst_percent}%`
                    )}
                  </td>

                  <td className="p-3">{gst.cgst_percent}%</td>
                  <td className="p-3">{gst.sgst_percent}%</td>

                  <td className="p-3">
                    {editing ? (
                      <input
                        type="date"
                        className="border border-gray rounded-sm px-2 py-1"
                        value={edit.effective_from}
                        onChange={(e) =>
                          setEdit({ ...edit, effective_from: e.target.value })
                        }
                      />
                    ) : (
                      gst.effective_from
                    )}
                  </td>

                  <td className="p-3">
                    {editing ? (
                      <input
                        type="date"
                        className="border border-gray rounded-sm px-2 py-1"
                        value={edit.effective_to || ""}
                        onChange={(e) =>
                          setEdit({ ...edit, effective_to: e.target.value })
                        }
                      />
                    ) : (
                      gst.effective_to || "--"
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => setActive(gst.id)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        gst.is_active
                          ? "bg-success text-white"
                          : "bg-lightColor text-secondary"
                      }`}
                    >
                      Active
                    </button>
                  </td>

                  <td className="p-3 text-right flex justify-end gap-3">
                    {editing ? (
                      <>
                        <button onClick={update} className="text-success">
                          <CheckIcon className="h-5" />
                        </button>
                        <button
                          onClick={() => setEdit(null)}
                          className="text-secondary"
                        >
                          <XMarkIcon className="h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEdit(gst)}
                          className="text-primary"
                        >
                          <PencilSquareIcon className="h-5" />
                        </button>
                        <button
                          onClick={() => remove(gst.id)}
                          className="text-error"
                        >
                          <TrashIcon className="h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GstPageRestaurant;
