import { useState, useEffect } from "react";
import { useGST } from "../../context/GSTContext";
import { api } from "../../api/api";
import {
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const GSTPage = () => {
  const { list, loading, reload } = useGST();
  const [edit, setEdit] = useState<any>(null);
  const [newGST, setNewGST] = useState({
    gst_percent: 0,
    cgst_percent: 0,
    sgst_percent: 0,
    igst_percent: 0,
    effective_from: "",
    effective_to: "",
    is_active: 0,
  });

  const save = async () => {
    await api.gst.create(newGST);
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
    await api.gst.update(edit);
    setEdit(null);
    reload();
  };

  const setActive = async (id: number) => {
    await api.gst.setActive(id);
    reload();
  };

  const remove = async (id: number) => {
    if (confirm("Delete this GST slab?")) {
      await api.gst.delete(id);
      reload();
    }
  };

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
    if (edit) {
      const cgst = Number((edit.gst_percent / 2).toFixed(2));
      const sgst = Number((edit.gst_percent / 2).toFixed(2));
      setEdit((prev: any) => ({
        ...prev,
        cgst_percent: cgst,
        sgst_percent: sgst,
        igst_percent: edit.gst_percent,
      }));
    }
  }, [edit?.gst_percent]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">GST Management</h2>

      {/* Add new */}
      <div className="bg-white p-4 rounded shadow border mb-6">
        <h3 className="font-semibold mb-3">Add GST Slab</h3>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray block mb-2" htmlFor="typename">
              GST%
            </label>

            <input
              className="border p-2 rounded"
              placeholder="GST%"
              value={newGST.gst_percent}
              onChange={(e) =>
                setNewGST({ ...newGST, gst_percent: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-xs text-gray block mb-2" htmlFor="typename">
              CGST%
            </label>
            <input
              className="border p-2 rounded"
              placeholder="CGST%"
              disabled={true}
              value={newGST.cgst_percent}
              onChange={(e) =>
                setNewGST({ ...newGST, cgst_percent: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-xs text-gray block mb-2" htmlFor="typename">
              SGST%
            </label>

            <input
              className="border p-2 rounded"
              placeholder="SGST%"
              disabled={true}
              value={newGST.sgst_percent}
              onChange={(e) =>
                setNewGST({ ...newGST, sgst_percent: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-xs text-gray block mb-2" htmlFor="typename">
              Effective From
            </label>

            <input
              type="date"
              className="border p-2 rounded w-full"
              value={newGST.effective_from}
              onChange={(e) =>
                setNewGST({ ...newGST, effective_from: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray block mb-2" htmlFor="typename">
              Effective To  
            </label>

            <input
              type="date"
              className="border p-2 rounded w-full"
              value={newGST.effective_to}
              onChange={(e) =>
                setNewGST({ ...newGST, effective_to: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={save}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Table */}
      <table className="w-full bg-white border rounded shadow">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3 text-left">GST</th>
            <th className="p-3 text-left">SGST</th>
            <th className="p-3 text-left">IGST</th>
            <th className="p-3 text-left">Effective From</th>
            <th className="p-3 text-left">Effective To</th>
            <th className="p-3 text-center">Active</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((gst: any) => {
            const editing = edit?.id === gst.id;
            return (
              <tr key={gst.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  {editing ? (
                    <input
                      value={edit.gst_percent}
                      onChange={(e) =>
                        setEdit({ ...edit, gst_percent: e.target.value })
                      }
                    />
                  ) : (
                    gst.gst_percent
                  )}
                </td>
                <td className="p-2">
                  {editing ? (
                    <input
                      disabled={true}
                      value={edit.cgst_percent}
                      onChange={(e) =>
                        setEdit({ ...edit, cgst_percent: e.target.value })
                      }
                    />
                  ) : (
                    gst.cgst_percent
                  )}
                </td>
                <td className="p-2">
                  {editing ? (
                    <input
                      disabled={true}
                      value={edit.sgst_percent}
                      onChange={(e) =>
                        setEdit({ ...edit, sgst_percent: e.target.value })
                      }
                    />
                  ) : (
                    gst.sgst_percent
                  )}
                </td>

                <td className="p-2">
                  {editing ? (
                    <input
                      type="date"
                      value={edit.effective_from}
                      onChange={(e) =>
                        setEdit({ ...edit, effective_from: e.target.value })
                      }
                    />
                  ) : (
                    gst.effective_from
                  )}
                </td>
                <td className="p-2">
                  {editing ? (
                    <input
                      type="date"
                      value={edit.effective_to}
                      onChange={(e) =>
                        setEdit({ ...edit, effective_to: e.target.value })
                      }
                    />
                  ) : (
                    gst.effective_to || "--"
                  )}
                </td>

                <td className="text-center">
                  <button
                    onClick={() => setActive(gst.id)}
                    className={
                      gst.is_active ? "text-green-600" : "text-gray-400"
                    }
                  >
                    ✓
                  </button>
                </td>

                <td className="p-2 text-right">
                  {editing ? (
                    <>
                      <button onClick={update} className="text-green-600">
                        <CheckIcon className="h-5" />
                      </button>
                      <button
                        onClick={() => setEdit(null)}
                        className="text-gray-600"
                      >
                        <XMarkIcon className="h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEdit(gst)}
                        className="text-blue-600"
                      >
                        <PencilSquareIcon className="h-5" />
                      </button>
                      <button
                        onClick={() => remove(gst.id)}
                        className="text-red-600"
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
  );
};

export default GSTPage;
