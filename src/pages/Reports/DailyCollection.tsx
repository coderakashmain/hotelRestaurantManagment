import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";

export default function DailyCollection() {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const { data, loading, error, reload } = useAsync(
    () => api.dcr.list(date),
    [date]
  );
console.log("This is data",data)
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Daily Collection Register
      </h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border px-2 py-1 w-60 rounded"
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error.message}</p>}

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Type</th>
            <th>Ref</th>
            <th>Room</th>
            <th>Base</th>
            <th>Pay Amt</th>
            <th>Mode</th>
            <th>Particulars</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((row: any) => (
            <tr key={row.id}>
              <td>{row.entry_type}</td>
              <td>{row.reference_no}</td>
              <td>{row.room_number || "-"}</td>
              <td>{row.base_amount}</td>
              <td>{row.payment_amount}</td>
              <td>{row.payment_mode}</td>
              <td>{row.particulars}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
