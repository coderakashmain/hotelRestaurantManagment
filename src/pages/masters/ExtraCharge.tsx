import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";

const ExtraCharge = () => {
  const [newTypeName, setNewTypeName] = useState("");
  const { data: billTypes, reload } = useAsync(() => api.billType.list(), []);

  const saveNewType = async () => {
    if (!newTypeName.trim()) return alert("Enter type name");
    await api.billType.create({ name: newTypeName });
    setNewTypeName("");
    reload();
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Extra Charge</h1>

      <div className="flex gap-2 mt-5">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="New bill type"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
        />
        <button
          className="px-4 bg-green-600 text-white rounded"
          onClick={saveNewType}
        >
          Add
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-xl"> Charges List</h3>
        <table className="w-full mt-6 bg-white border border-gray rounded-lg shadow">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">ID</th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Bill Type
              </th>
            </tr>
          </thead>
          <tbody>
            {billTypes?.map((t: any, index: number) => (
              <tr
                key={t.id}
                className={`border-b border-gray hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-gray-50/50" : ""
                }`}
              >
                <td className="p-3 text-gray-700 font-medium">{t.id}</td>
                <td className="p-3 text-gray-800">{t.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExtraCharge;
