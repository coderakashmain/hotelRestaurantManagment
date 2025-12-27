import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";

export default function PoliceReport() {
  const [checkInId, setCheckInId] = useState<number | null>(null);

  // fetch police report only when checkInId is present
  const { data, loading, error, reload } = useAsync(
    () => {
      if (!checkInId) return Promise.resolve(null);
      return api.policeReport.getByCheckIn(checkInId);
    },
    [checkInId]
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Police Station Report
      </h2>

      {/* Check-in selector */}
      <div className="mb-4">
        <label className="block text-sm mb-1">
          Check-in ID
        </label>
        <input
          type="number"
          value={checkInId ?? ""}
          onChange={(e) =>
            setCheckInId(
              e.target.value ? Number(e.target.value) : null
            )
          }
          className="border px-2 py-1 w-60 rounded"
          placeholder="Enter Check-in ID"
        />
      </div>

      {/* States */}
      {loading && <p>Loading...</p>}
      {error && (
        <p className="text-red-500">
          {error.message}
        </p>
      )}

      {/* No report yet */}
      {!loading && !data && checkInId && (
        <p className="text-gray-500">
          No police report found for this stay.
        </p>
      )}

      {/* Report View */}
      {data && (
        <div className="border rounded p-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <b>Guest Name:</b> {data.full_name}
            </div>
            <div>
              <b>Phone:</b> {data.phone}
            </div>

            <div>
              <b>Address:</b> {data.address}
            </div>
            <div>
              <b>ID Proof:</b>{" "}
              {data.id_proof_type} - {data.id_proof_number}
            </div>

            <div>
              <b>Check-in ID:</b> {data.checkin_id}
            </div>
            <div>
              <b>Check-in Time:</b> {data.check_in_time}
            </div>

            <div>
              <b>Station Name:</b> {data.station_name}
            </div>
            <div>
              <b>Officer:</b> {data.officer_name || "-"}
            </div>

            <div className="col-span-2">
              <b>Station Address:</b> {data.station_address}
            </div>

            <div className="col-span-2">
              <b>Purpose:</b> {data.purpose}
            </div>

            <div className="col-span-2">
              <b>Remarks:</b> {data.remarks || "-"}
            </div>

            <div>
              <b>Status:</b>{" "}
              {data.submitted ? "Submitted" : "Not Submitted"}
            </div>

            {data.submitted_at && (
              <div>
                <b>Submitted At:</b> {data.submitted_at}
              </div>
            )}
          </div>

          {/* Actions */}
          {!data.submitted && (
            <button
              onClick={async () => {
                await api.policeReport.markSubmitted(data.id);
                reload();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Mark as Submitted
            </button>
          )}
        </div>
      )}
    </div>
  );
}
