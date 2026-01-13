// src/renderer/pages/CheckinPage.tsx
import { useEffect, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { api } from "../api/api";
import { useFinancialYear } from "../context/FinancialYearContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCheckOutRule } from "../context/CheckOutRuleContext";
import { useSnackbar } from "../context/SnackbarContext";

type RoomType = {
  id: number;
  room_number: string;
  room_type: string;
  room_type_id: number;
  status?: string;
  room_full_rate?: number;
  room_hourly_rate?: number;
};

export default function CheckinPage() {
  const [searchParams] = useSearchParams();
  const initialRoomId = Number(searchParams.get("room")) || null;
  const { checkOutType, allowChange } = useCheckOutRule();
  const [guestDetails, setGuestDetails] = useState<any | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const [extraTime, setExtraTime] = useState<number | "">("");
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  // load guests & rooms
  const {
    loading: loadingGuests,
    data: guests,
    reload: reloadGuests,
  } = useAsync(() => api.guest.list(), []);

  const {
    loading: loadingRooms,
    data: roomsRaw,
    reload: reloadRooms,
  } = useAsync(() => api.room.list(), []);

  const { years } = useFinancialYear();
  // form state
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const [guestForm, setGuestForm] = useState({
    id: null as number | null,
    full_name: "",
    phone: "",
    email: "",
    address: "",
    id_proof_type: "",
    id_proof_number: "",
  });

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    initialRoomId
  );
  const [stayType, setStayType] = useState<any>(
    checkOutType.find((type) => type.is_default === 1)
  );
  const [hourCount, setHourCount] = useState<number>(1); // for HOURLY calculation
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [noOfGuests, setNoOfGuests] = useState<number>(1);

  const [expectedCheckout, setExpectedCheckout] = useState<string | null>(null);
  const [advance, setAdvance] = useState<number | ''>('');
  const [advanceMethod, setAdvanceMethod] = useState<string>("CASH");
  const [notes, setNotes] = useState<string>("");

  const isLoading = loadingGuests || loadingRooms;

  //

  useEffect(() => {
    if (guests?.length === 0) {
      setShowGuestModal(true);
    }
  }, [guests]);

  // helper to coerce return shapes
  const extractInsertId = (res: any): number | null => {
    if (!res) return null;
    if (typeof res === "number") return res;
    if (res.lastInsertRowid) return Number(res.lastInsertRowid);
    if (res.lastInsertRowId) return Number(res.lastInsertRowId);
    if (res.id) return Number(res.id);
    if (res.insertId) return Number(res.insertId);
    if (res.checkinId) return Number(res.checkinId);
    if (res.checkin_id) return Number(res.checkin_id);
    return null;
  };

  // when room changes -> populate default rate
  const selectedRoom: RoomType | undefined = (roomsRaw || []).find(
    (r: any) => Number(r.id) === Number(selectedRoomId)
  );

  // compute a suggested rate based on stayType & selected room defaults
  useEffect(() => {
    if (!selectedRoom) {
      setCustomRate(null);
      setExpectedCheckout(null);
      return;
    }

    const now = new Date();
    let suggestedRate: number | null = null;
    let expected: Date = new Date(now);

    if (stayType?.hours === 12) {
      expected.setHours(now.getHours() + 12);
    } else if (stayType?.hours === 24) {
      expected.setDate(now.getDate() + 1);
    } else if (stayType?.hours === 1) {
      expected.setHours(now.getHours() + Math.max(1, hourCount));
    }

    if (stayType?.hours === 1) {
      suggestedRate = (selectedRoom.room_hourly_rate ?? 0) * hourCount;
    } else {
      suggestedRate = selectedRoom.room_full_rate ?? null;
    }

    setCustomRate(suggestedRate);

    setExpectedCheckout(expected.toISOString().slice(0, 19).replace("T", " "));
  }, [selectedRoomId, stayType, hourCount, selectedRoom]);

  // create guest quick
  const createGuest = async () => {
    if (!guestForm.full_name.trim()) {
      showSnackbar("Guest name required", "warning");
      return;
    }
    if (!guestForm.phone.trim()) {
      showSnackbar("Please enter phone number.", "warning");
      return;
    }

    if (
      guestForm.phone.trim().length > 0 &&
      guestForm.phone.trim().length < 10
    ) {
      showSnackbar("Enter 10 digit phone number!", "warning");
      return;
    }
    if (!guestForm.id_proof_type || !guestForm.id_proof_number) {
      showSnackbar("Please enter ID Proof.", "warning");
      return;
    }
    if (guestForm?.phone === guestDetails?.phone && autoFilled) {
      setSelectedGuestId(guestForm.id as number);
      setSelectedGuest(guestForm);
      setShowGuestModal(false);
      return;
    }
    const res = await api.guest.add({
      full_name: guestForm.full_name,
      phone: guestForm.phone.trim(),
      email: guestForm.email,
      address: guestForm.address,
      id_proof_type: guestForm.id_proof_type,
      id_proof_number: guestForm.id_proof_number,
    });

    const newId = extractInsertId(res);
    if (newId) {
      setSelectedGuestId(newId);
      setSelectedGuest(guestForm);
    }

    setGuestForm({
      id: null,
      full_name: "",
      phone: "",
      email: "",
      address: "",
      id_proof_type: "",
      id_proof_number: "",
    });
    setShowGuestModal(false);
    reloadGuests();
  };

  // main submit - create checkin, create bill (if backend does it), add advance payment if provided
  const doCheckin = async () => {
    if (!selectedGuestId)
      return showSnackbar("Select a guest or create new.", "warning");
    if (!selectedRoomId) return showSnackbar("Select a room.", "warning");

    const activeYear = years.find((y) => y.is_active === 1);

    if (!activeYear) {
      showSnackbar("First select a Financial Year!", "warning");
      return;
    }

    const today = new Date();
    const start = new Date(activeYear.start_date);
    const end = new Date(activeYear.end_date);

    if (today < start || today > end) {
      return showSnackbar(
        "Today is outside the Financial Year range!",
        "warning"
      );
    }

    // ensure we have a rate number
    const rateToUse = Number(customRate ?? 0);

    // build payload
    const payload = {
      guest_id: selectedGuestId,
      room_id: selectedRoomId,
      check_in_time: new Date().toISOString(),
      expected_check_out_time: expectedCheckout,
      stay_type: stayType.id,
      rate_applied: rateToUse,
      hour_count: hourCount,
      no_of_guests: noOfGuests,
      notes: notes || null,
      extra_time: extraTime,
    };

    // create checkin (backend should set room occupied and create a bill if implemented)
    const res = await api.checkin.create(payload);
    const checkinId = extractInsertId(res);

    // try to locate bill id returned by backend
    let billId: number | null = null;
    if (res && typeof res === "object") {
      billId = res.bill_id ?? res.billId ?? res.bill?.id ?? null;
    }

    // If backend didn't return billId but returned checkinId, attempt to create bill via a known endpoint
    // NOTE: This depends on existing backend. If you have a specific endpoint (like api.bill.createForCheckin), replace accordingly.
    if (!billId && checkinId) {
      // try common name: api.bill.createForCheckin or api.bill.create
      if ((api as any).bill?.createForCheckin) {
        const billRes = await (api as any).bill.createForCheckin({
          check_in_id: checkinId,
        });
        billId =
          extractInsertId(billRes) ??
          (billRes && (billRes.id ?? billRes.billId));
      } else if ((api as any).bill?.create) {
        const billRes = await (api as any).bill.create({
          check_in_id: checkinId,
        });
        billId =
          extractInsertId(billRes) ??
          (billRes && (billRes.id ?? billRes.billId));
      }
    }

    // If user paid an advance now -> create a payment linked to bill (preferred) or store as payment with bill_id = null
    if (advance && Number(advance) > 0) {
      if (billId) {
        await api.bill.addPayment({
          bill_id: billId,
          guest_id: selectedGuestId,
          payment_type: "ADVANCE",
          amount: advance,
          method: advanceMethod,
          note: "Advance collected at check-in",
        });
      } else {
        // If no bill available, attempt to add a payment record (some schemas allow payment without bill)
        if ((api as any).payment?.add) {
          await (api as any).payment.add({
            check_in_id: checkinId,
            guest_id: selectedGuestId,
            payment_type: "ADVANCE",
            amount: Number(advance),
            method: advanceMethod,
            note: "Advance (no bill created)",
          });
        } else {
          // fallback: warn user that advance couldn't be attached to bill

          showSnackbar(
            "Advance collected but could not attach to bill automatically. You can add it manually later.",
            "warning"
          );
        }
      }
    }

    // Finally, mark room occupied in DB (if backend didn't do it)
    if ((api as any).room?.updateStatus) {
      await api.room.updateStatus(selectedRoomId, "OCCUPIED");
    } else if ((api as any).room?.update) {
      await api.room.update(selectedRoomId, { status: "OCCUPIED" });
    }

    showSnackbar("Checked in successfully.", "success");
    navigate("/hotel/rooms-chart");
    setSelectedGuestId(null);
    setSelectedGuest(null);
    setSelectedRoomId(null);
    reloadRooms();
    reloadGuests();
  };

  // Helpers for rendered lists
  const availableRooms: RoomType[] = (roomsRaw || []).filter(
    (r: any) => (r.status || "").toLowerCase() === "available"
  );

  const guestByPhone = async (phone: string) => {
    const guest = await api.guest.getByPhone(phone);

    if (guest) {
      setAutoFilled(true);

      setGuestForm({
        id: guest.id,
        phone: guest.phone,
        full_name: guest.full_name || "",
        email: guest.email || "",
        id_proof_type: guest.id_proof_type || "",
        id_proof_number: guest.id_proof_number || "",
        address: guest.address || "",
      });

      setGuestDetails(guest);
    } else {
      setAutoFilled(false);
      setGuestDetails(null);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;

      const inInput =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable;

      /* ================= ENTER ================= */
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();

        // Guest modal → create / select guest
        if (showGuestModal) {
          createGuest();
          return;
        }

        // Main page → check-in
        if (!inInput) {
          doCheckin();
        }
        return;
      }

      /* ================= ESCAPE ================= */
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();

        // 1️⃣ If input focused → just blur
        if (inInput && target) {
          target.blur();
          return;
        }

        // 2️⃣ If guest modal open → close it
        if (showGuestModal) {
          setShowGuestModal(false);
          return;
        }

        // 3️⃣ Else → navigate back
        navigate(-1);
      }
    };

    // Capture phase → Electron-safe
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [showGuestModal, guestForm, selectedGuestId, selectedRoomId, customRate]);

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">New Check-In</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Guest select */}
        <div className="col-span-1 card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Guest Data</h2>
            <div className="flex gap-5">
              {selectedGuest && (
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="text-xs text-red-600 cursor-pointer"
                >
                  Remove Guest
                </button>
              )}
              <button
                className="text-xs   text-blue-600 cursor-pointer"
                onClick={() => setShowGuestModal(true)}
              >
                + Add Guest
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm">
            {selectedGuest ? (
              <p>
                Name : {selectedGuest.full_name} <br />
                Phone : {selectedGuest.phone} <br />
                Adress : {selectedGuest.address
                  ? selectedGuest.address
                  : "N/A"}{" "}
                <br />
              </p>
            ) : (
              "No guest selected"
            )}
          </div>

          <div className="mt-5 text-sm">
            {selectedRoomId ? (
              <p>
                Room No : {selectedRoom?.room_number} <br />
                Room Type : {selectedRoom?.room_type} <br />
                Rate : ₹{" "}
                {customRate ??
                  (stayType?.hours === 1
                    ? selectedRoom?.room_hourly_rate ?? 0
                    : selectedRoom?.room_full_rate ?? 0)}{" "}
                <br />
                {/* {stayType?.hours === 1 && (
                <span>Final Price : ₹{customRate}</span>
              )} <br /> */}
              </p>
            ) : (
              "No Room selected"
            )}
          </div>
        </div>

        {/* Room select */}
        <div className="col-span-1 card">
          <h2 className="font-semibold mb-2">Room</h2>

          <select
            className="w-full border border-gray p-2 rounded bg-white"
            value={selectedRoomId ?? 0}
            onChange={(e) => setSelectedRoomId(Number(e.target.value) || null)}
          >
            <option value={0}>Select available room</option>
            {availableRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number} — {r.room_type} — ₹
                {stayType?.hours === 1
                  ? r.room_hourly_rate ?? 0
                  : r.room_full_rate ?? 0}
              </option>
            ))}
          </select>

          <div className="mt-3 text-sm text-gray-600">
            Selected rate and defaults are auto-filled but editable below.
          </div>

          <label className="block text-sm mt-5 mb-1">No. of Guests</label>
          <input
            type="number"
            min={1}
            value={noOfGuests}
            onChange={(e) => setNoOfGuests(Number(e.target.value))}
            className="w-full border border-gray p-2 rounded mb-2"
          />
        </div>

        {/* Stay details */}
        <div className="col-span-1 card">
          <h2 className="font-semibold mb-2">Stay Details</h2>

          <label className="block text-sm mb-1">Stay Type</label>
          <select
            value={stayType?.id}
            disabled={!allowChange}
            onChange={(e) => {
              const selected = checkOutType.find(
                (c) => c.id === Number(e.target.value)
              );
              setStayType(selected || null);
            }}
            className="w-full border border-gray bg-white p-2 rounded mb-2"
          >
            {allowChange
              ? checkOutType.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label} {type.hours ? `- ${type.hours} hours` : ""}
                  </option>
                ))
              : checkOutType
                  .filter((type) => type.is_default === 1)
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label} {type.hours ? `- ${type.hours} hours` : ""}
                    </option>
                  ))}
          </select>

          {stayType?.label.toLowerCase() === "hourly" && (
            <>
              <label className="block text-sm mb-1">No. of Hours</label>

              <input
                type="number"
                min={1}
                value={hourCount}
                onChange={(e) => setHourCount(Number(e.target.value))}
                className="w-full border border-gray p-2 rounded mb-2"
                placeholder="Hours"
              />
            </>
          )}

          <label className="block text-sm mb-1">Extra Time (Minutes)</label>
          <input
            type="number"
            value={extraTime}
            onChange={(e) => {
              const value = e.target.value;
              setExtraTime(value === "" ? "" : Number(value));
            }}
            className="w-full border  p-2 rounded mb-2"
          />

          <label className="block text-sm mb-1">Expected Checkout</label>
          <input
            type="text"
            value={expectedCheckout ?? ""}
            onChange={(e) => setExpectedCheckout(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
        </div>
      </div>

      {/* Advance + notes */}
      <div className="mt-4 card  grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Advance Amount</label>
          <input
            type="number"
            value={advance}
            onChange={(e) => {
              const value = e.target.value;
              setAdvance(value === "" ? "" : Number(value));
            }}
            className="w-full border p-2 rounded"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Payment Method</label>
          <select
            value={advanceMethod}
            onChange={(e) => setAdvanceMethod(e.target.value)}
            className="w-full border border-gray bg-white p-2 rounded"
          >
            <option>CASH</option>
            <option>UPI</option>
            <option>CARD</option>
            <option>ONLINE</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Any notes..."
          />
        </div>
        <p className="text-xs text-secondary">
          ⏎ Enter = Create &nbsp; • &nbsp; Esc = Back
        </p>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          className="px-4 py-2 border rounded"
          onClick={() => {
            // reset
            setSelectedGuestId(null);
            setSelectedRoomId(null);
            setCustomRate(null);
            setAdvance(0);
            setNotes("");
          }}
        >
          Reset
        </button>

        <button
          className="px-6 py-2 bg-sky-600 text-white rounded"
          onClick={doCheckin}
        >
          Check In
        </button>
      </div>

      {/* Add Guest Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-md shadow-card p-6">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Add Guest</h3>
              <p className="text-sm text-secondary">
                Enter guest details to continue check-in
              </p>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="block text-xs text-secondary font-medium mb-1">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={guestForm.phone}
                className="w-full border rounded-sm p-2"
                placeholder="10 digit mobile number"
                onChange={(e) => {
                  const value = e.target.value;
                  setGuestForm({ ...guestForm, phone: value });

                  // When full number entered → fetch attempt
                  if (value.length === 10) {
                    guestByPhone(value);
                    return;
                  }

                  // Clear auto-filled data if phone reduced
                  if (autoFilled && value.length < 10) {
                    setAutoFilled(false);
                    setGuestDetails(null);
                    setGuestForm({
                      ...guestForm,
                      id: null,
                      full_name: "",
                      email: "",
                      id_proof_type: "",
                      id_proof_number: "",
                      address: "",
                    });
                  }
                }}
              />
            </div>

            {/* Name */}
            <div className="mb-3">
              <label className="block  text-xs text-secondary font-medium mb-1">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                name="full_name"
                value={guestForm.full_name}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, full_name: e.target.value })
                }
                className="w-full border rounded-sm p-2"
                placeholder="Guest full name"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="block text-xs text-secondary font-medium mb-1">
                Email (optional)
              </label>
              <input
                value={guestForm.email}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, email: e.target.value })
                }
                className="w-full border rounded-sm p-2"
                placeholder="guest@email.com"
              />
            </div>

            {/* ID Proof */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* ID Proof Type */}
              <div>
                <label className="block text-xs text-secondary mb-1">
                  ID Proof Type
                </label>
                <select
                  value={guestForm.id_proof_type}
                  onChange={(e) =>
                    setGuestForm({
                      ...guestForm,
                      id_proof_type: e.target.value,
                    })
                  }
                  className="w-full border border-gray rounded-sm p-2 text-sm"
                >
                  <option value="">Select ID Proof</option>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="VOTER_ID">Voter ID</option>
                </select>
              </div>

              {/* ID Proof Number */}
              <div>
                <label className="block text-xs text-secondary mb-1">
                  ID Proof Number
                </label>
                <input
                  value={guestForm.id_proof_number}
                  onChange={(e) =>
                    setGuestForm({
                      ...guestForm,
                      id_proof_number: e.target.value,
                    })
                  }
                  className="w-full border rounded-sm p-2 text-sm"
                  placeholder="Enter ID number"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-xs text-secondary font-medium mb-1">
                Address
              </label>
              <textarea
                value={guestForm.address}
                onChange={(e) =>
                  setGuestForm({ ...guestForm, address: e.target.value })
                }
                className="w-full border border-gray rounded-sm p-2"
                rows={3}
                placeholder="Guest address"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3  border-t border-gray">
              <button
                className="px-4 py-2 border border-gray rounded-sm"
                onClick={() => setShowGuestModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-5 py-2 bg-primary text-white rounded-sm"
                onClick={createGuest}
              >
                Select Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
