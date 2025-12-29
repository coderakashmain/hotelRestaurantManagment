import { useState, useEffect } from "react";
import { Cog6ToothIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../api/api";
import AddExtraChargeModal from "../billing/AddExtraChargeModal";
import AddAdvanceModal from "../billing/AddAdvanceModal";
import ShowBillModal from "../billing/ShowBillModal";
import CheckoutModal from "../billing/CheckoutModal";
import { useNavigate } from "react-router";

type RoomCard = {
  id: number;
  room_number: string;
  room_type: string;
  status: string;
  floor_id: number;
  guest_id?: number | null;
  guest_name?: string | null;
  guest_phone?: string | null;
};

export default function RoomChart() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [showExtraPopup, setShowExtraPopup] = useState(false);
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [currentBillId, setCurrentBillId] = useState<number | null>(null);
  const [currentBill, setCurrentBill] = useState<any | null>(null);
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [billIdForView, setBillIdForView] = useState<number | null>(null);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [checkoutBill, setCheckoutBill] = useState<any>(null);

  const [dropdownRoom, setDropdownRoom] = useState<RoomCard | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [activeIndex, setActiveIndex] = useState(0);

  /* ================= DATA ================= */
  const { loading, data, reload } = useAsync(async () => {
    const floors = await api.floor.list();
    const rooms = await api.room.list();
    return floors.map((f: any) => ({
      ...f,
      rooms: rooms.filter((r: any) => r.floor_id === f.id),
    }));
  }, []);

  /* ================= DROPDOWN ACTIONS ================= */
  const dropdownActions =
    dropdownRoom?.status?.toLowerCase() === "available"
      ? [
          {
            label: "Check In",
            action: () =>
              navigate(`/hotel/checkin?room=${dropdownRoom.id}`),
          },
        ]
      : dropdownRoom?.status?.toUpperCase() === "OCCUPIED"
      ? [
          {
            label: "Add Other Charge",
            action: async () => {
              const bill = await api.bill.getBillByRoom(dropdownRoom.id);
              setCurrentBillId(bill.id);
              setShowExtraPopup(true);
            },
          },
          {
            label: "Add Advance",
            action: async () => {
              const bill = await api.bill.getBillByRoom(dropdownRoom.id);
              setCurrentBill(bill);
              setShowAdvancePopup(true);
            },
          },
          {
            label: "Show Bill",
            action: async () => {
              const bill = await api.bill.getBillByRoom(dropdownRoom.id);
              setBillIdForView(bill.id);
              setShowBillPopup(true);
            },
          },
          {
            label: "Check Out",
            danger: true,
            action: async () => {
              const bill = await api.bill.getBillByRoom(dropdownRoom.id);
              setCheckoutBill(bill);
              setShowCheckoutPopup(true);
            },
          },
        ]
      : [];

  /* ================= ESC + KEYBOARD NAV ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownRoom(null);
        setShowExtraPopup(false);
        setShowAdvancePopup(false);
        setShowBillPopup(false);
        setShowCheckoutPopup(false);
      }

      if (!dropdownRoom || dropdownActions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) =>
          i < dropdownActions.length - 1 ? i + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          i > 0 ? i - 1 : dropdownActions.length - 1
        );
      }

      if (e.key === "Enter") {
        e.preventDefault();
        dropdownActions[activeIndex]?.action();
        setDropdownRoom(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dropdownRoom, activeIndex, dropdownActions]);

  /* ================= HELPERS ================= */
  const openDropdown = (e: React.MouseEvent, room: RoomCard) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 6,
      left: Math.min(rect.right - 200, window.innerWidth - 220),
    });
    setActiveIndex(0);
    setDropdownRoom(room);
  };

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-success/10 border-success/30 text-success";
      case "occupied":
        return "bg-error/10 border-error/30 text-error";
      case "maintenance":
        return "bg-warning/10 border-warning/30 text-warning";
      default:
        return "bg-gray/10 border-gray text-secondary";
    }
  };

  /* ================= SAFE EARLY RETURN ================= */
  if (loading || !data) {
    return <div className="p-6 text-sm text-secondary">Loading rooms…</div>;
  }

  const allRooms: RoomCard[] = data
    .flatMap((floor: any) => floor.rooms)
    .sort((a: any, b: any) => Number(a.room_number) - Number(b.room_number));

  /* ================= UI ================= */
  return (
    <div className="p-6 relative">
      <h1 className="text-lg font-semibold mb-6">Room Chart</h1>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
        {allRooms.map((room) => (
          <div
            key={room.id}
            className={`relative p-4 bg-bg-primary  border-gray hover:-translate-y-2 hover:shadow-xl shadow rounded-sm border transition-all ${statusStyle(
              room.status
            )}`}
          >
            <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase">
              {room.status}
            </span>

            <Cog6ToothIcon
              onClick={(e) => openDropdown(e, room)}
              className="w-4 h-4 absolute top-2 right-2 cursor-pointer text-secondary hover:text-primary"
            />

            <div className="mt-5 space-y-1">
              <div className="text-sm font-semibold">
                Room {room.room_number}
              </div>

              <div className="text-xs text-secondary">
                Type: {room.room_type}
              </div>

              {room.guest_name && (
                <div className="text-xs">
                  Guest <span className="font-medium">{room.guest_name}</span>
                </div>
              )}

              {room.guest_phone && (
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <PhoneIcon className="w-3.5 h-3.5" />
                  {room.guest_phone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DROPDOWN */}
      {dropdownRoom && (
        <div
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 9999,
          }}
          className="bg-bg-secondary border border-gray rounded-sm shadow-soft w-[200px] animate-dropdown"
        >
          {dropdownActions.map((item: any, index) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setDropdownRoom(null);
              }}
              className={`menu-item ${
                item.danger ? "text-error" : ""
              } ${index === activeIndex ? "bg-lightColor outline outline-1 outline-primary" : ""}`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => setDropdownRoom(null)}
            className="block w-full text-center text-xs py-2 border-t hover:bg-lightColor"
          >
            Close
          </button>
        </div>
      )}

      {/* MODALS */}
      {showExtraPopup && currentBillId && (
        <AddExtraChargeModal
          billId={currentBillId}
          onClose={() => {
            setShowExtraPopup(false);
            reload();
          }}
        />
      )}

      {showAdvancePopup && currentBill && (
        <AddAdvanceModal
          billId={currentBill.id}
          guestId={currentBill.guest_id}
          onClose={() => {
            setShowAdvancePopup(false);
            reload();
          }}
        />
      )}
     

      {showBillPopup && billIdForView && (
        <ShowBillModal
          billId={billIdForView}
          onClose={() => {
            setShowBillPopup(false);
            setBillIdForView(null);
          }}
        />
      )}

      {showCheckoutPopup && checkoutBill && (
        <CheckoutModal
          bill={checkoutBill}
          onClose={() => setShowCheckoutPopup(false)}
          onDone={() => reload()}
        />
      )}
    </div>
  );
}
