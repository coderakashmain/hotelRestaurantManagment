import { useState } from "react";
import { api } from "../../api/api";
import { useAsync } from "../../hooks/useAsync";
import PoliceReportPrint from "./PoliceReportPrint";
import { useSnackbar } from "../../context/SnackbarContext";
import {
  PlusIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

export default function PoliceReport() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const {showSnackbar} = useSnackbar();
const [reportView,setreportView] = useState(false);
  /* ================= FORM ================= */
 
  /* ================= LIST ================= */
  const {
    data: reports,
    loading: listLoading,
    reload: reloadList,
  } = useAsync(() => api.policeReport.list(), []);

  const [form, setForm] = useState({
    station_name: "",
    station_address: "",
    officer_name: "",
    purpose: "",
    remarks: "",
  });


  /* ================= DETAILS ================= */
  const {
    data: report,
    loading: reportLoading,
    reload: reloadReport,
  } = useAsync(
    () =>
      selectedReportId
        ? api.policeReport.getById(selectedReportId)
        : Promise.resolve(null),
    [selectedReportId]
  );

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    // if ( !form.station_name) {
    //   showSnackbar("Enter Station_name",'warning');
    //   return;
    // }

    try{

      await api.policeReport.create(form);
    
    reloadList();
    setForm({
      station_name: "",
      station_address: "",
      officer_name: "",
      purpose: "",
      remarks: "",
    });
  }catch(err : any){
    showSnackbar(err.message,"error")
  }
  };

  useKeyboardShortcuts({
    Enter : handleCreate
  },[form]);

  /* ================= PRINT ================= */
  if (showPrint && report) {
    return (
      <PoliceReportPrint
        report={report}
        onBack={() => setShowPrint(false)}
      />
    );
  }


  return (
    <div className="p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-2">
        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold">Police Report Management</h2>
      </div>

      {/* ================= CREATE ================= */}
      <div className="card rounded p-5 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <PlusIcon className="h-5 w-5 text-green-600" />
          Create Police Report
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* <div>
            <label className="text-xs text-gray-500">Report Number *</label>
            <input
              className="w-full border p-2 rounded-sm"
              value={form.report_no}
              onChange={(e) =>
                setForm({ ...form, report_no: e.target.value })
              }
            />
          </div> */}

          <div>
            <label className="text-xs text-gray-500">Station Name *</label>
            <input
              className="w-full border p-2 rounded-sm"
              value={form.station_name}
              onChange={(e) =>
                setForm({ ...form, station_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Officer Name</label>
            <input
              className="w-full border p-2 rounded-sm"
              value={form.officer_name}
              onChange={(e) =>
                setForm({ ...form, officer_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Station Address</label>
            <input
              className="w-full border p-2 rounded-sm"
              value={form.station_address}
              onChange={(e) =>
                setForm({ ...form, station_address: e.target.value })
              }
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-500">Purpose</label>
            <textarea
              className="w-full border p-2 rounded-sm"
              rows={2}
              value={form.purpose}
              onChange={(e) =>
                setForm({ ...form, purpose: e.target.value })
              }
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-500">Remarks</label>
            <textarea
              className="w-full border p-2 rounded-sm"
              rows={2}
              value={form.remarks}
              onChange={(e) =>
                setForm({ ...form, remarks: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="bg-primary hover-accent transition  text-white px-5 py-2 rounded-sm"
        >
          Create Report
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="card rounded  p-5">
        <h3 className="font-semibold mb-3">All Reports</h3>

        {listLoading && <p className="text-sm">Loading...</p>}

        <ul className="space-y-2">
          {reports?.map((r: any) => (
            <li
              key={r.id}
              onClick={() => {
                setreportView(!reportView);
                setSelectedReportId(r.id)}
              }
              className={`border p-3 rounded cursor-pointer bg hover:bg-gray-50 ${
                selectedReportId === r.id && reportView ? "bg-blue-50 border-blue-300" : "bg-bg-secondary border-gray"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                  {r.report_no} — {r.station_name}
                </div>

                {r.submitted ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <div className="text-xs text-gray-500">
                Check-ins linked: {r.total_checkins}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= DETAILS ================= */}
      {selectedReportId && reportView && (
        <div className="bg-white rounded  border border-gray p-5">
          <h3 className="font-semibold mb-3">Report Details</h3>

          {reportLoading && <p className="text-sm">Loading...</p>}

          {report && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><b>Report No:</b> {report.report_no}</div>
                <div><b>Station:</b> {report.station_name}</div>
                <div><b>Officer:</b> {report.officer_name || "-"}</div>
                <div>
                  <b>Status:</b>{" "}
                  {report.submitted ? "Submitted" : "Pending"}
                </div>
                <div className="col-span-2">
                  <b>Purpose:</b> {report.purpose || "-"}
                </div>
              </div>

              <h4 className="font-semibold mt-4">Guests</h4>
              {report.checkins.map((c: any) => (
                <div
                  key={c.id}
                  className="border border-gray rounded p-2 mt-2 text-sm"
                >
                  <b>{c.full_name}</b> — {c.phone}
                  <div className="text-xs text-gray-500">
                    Check-in ID: {c.checkin_id} | {c.check_in_time}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 mt-4">
                {!report.submitted && (
                  <button
                    onClick={async () => {
                      await api.policeReport.markSubmitted(report.id);
                      reloadReport();
                      reloadList();
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-sm flex items-center gap-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Mark Submitted
                  </button>
                )}

                <button
                  onClick={() => setShowPrint(true)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-sm flex items-center gap-2"
                >
                  <PrinterIcon className="h-5 w-5" />
                  Print View
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
