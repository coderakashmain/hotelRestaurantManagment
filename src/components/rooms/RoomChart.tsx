import { useState } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
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
  const [showExtraPopup, setShowExtraPopup] = useState(false);
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [currentBillId, setCurrentBillId] = useState<number | null>(null);
  const [currentBill, setCurrentBill] = useState<any | null>(null);
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [billIdForView, setBillIdForView] = useState<number | null>(null);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [checkoutBill, setCheckoutBill] = useState<any>(null);
  const navigate = useNavigate();

  const { loading, data, reload } = useAsync(async () => {
    const floors = await api.floor.list();
    const rooms = await api.room.list();

    // Merge: attach rooms to each floor
    return floors.map((f: any) => ({
      ...f,
      rooms: rooms.filter((r: any) => r.floor_id === f.id),
    }));
  }, []);

  const [dropdownRoom, setDropdownRoom] = useState<RoomCard | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  if (loading || !data) return <div className="p-6">Loading...</div>;

  // Flatten all rooms across floors
  const allRooms: RoomCard[] = data
    .flatMap((floor: any) => floor.rooms)
    .sort(
      (a: RoomCard, b: RoomCard) =>
        Number(a.room_number) - Number(b.room_number)
    );

  const openDropdown = (event: React.MouseEvent, room: RoomCard) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    let left = rect.right - 200;
    let top = rect.bottom + 8;

    if (left + 200 > window.innerWidth) left = window.innerWidth - 220;

    setDropdownPos({ top, left });
    setDropdownRoom(room);
  };

  const closeDropdown = () => setDropdownRoom(null);

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-6">Room Chart</h1>

      <div className="grid grid-cols-6 gap-6">
        {allRooms.map((room) => (
          <div
            key={room.id}
            className={`shadow-lg relative p-4 rounded-lg border border-gray-200 hover:-translate-y-2 hover:shadow-2xl transition min-h-30
              ${
                room.status?.toLowerCase() === "available"
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
          >
            <Cog6ToothIcon
              onClick={(e) => openDropdown(e, room)}
              className="w-4 h-4 absolute top-3 right-3 cursor-pointer text-gray-700 hover:text-blue-600"
            />

            <h3 className="font-bold text-md">Room {room.room_number}</h3>
            <p className="text-xs">Type: {room.room_type}</p>


          
            
           {room?.guest_name &&( <p className="text-xs">Name: {room.guest_name}</p>)}
           {room?.guest_phone &&( <p className="text-xs">Phone: {room.guest_phone}</p>)}

          

            {room.status?.toLowerCase() === "maintenance" && (
              <p className="text-yellow-700 font-semibold mt-1">Maintenance</p>
            )}
          </div>
        ))}
      </div>




      {/* Dropdown */}
      {dropdownRoom && (
        <div
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 9999,
          }}
          className="bg-white shadow-sm border rounded-md w-[200px] text-sm"
        >
          {/* AVAILABLE ROOM MENU */}
          {dropdownRoom.status.toLowerCase() === "available" && (
            <button  onClick={() => {
              closeDropdown();
              navigate(`/hotel/checkin?room=${dropdownRoom.id}`)
              }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
               Check In
            </button>
          )}

          {/* OCCUPIED ROOM MENU */}
          {dropdownRoom.status.toUpperCase() === "OCCUPIED" && (
            <>
              <button
                onClick={async () => {
                  const bill = await api.bill.getBillByRoom(dropdownRoom.id);
                  setCurrentBillId(bill.id);
                  setShowExtraPopup(true);
                  closeDropdown()
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Add Other Charge
              </button>

              <button
                onClick={async () => {
                  const bill = await api.bill.getBillByRoom(dropdownRoom.id);

                  if (!bill) {
                    alert("Bill not found for this room!");
                    return;
                  }

                  setCurrentBill(bill);
                  setShowAdvancePopup(true);
                    closeDropdown();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Add Advance
              </button>

              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Adjustment
              </button>

              <button
                onClick={async () => {
                  const bill = await api.bill.getBillByRoom(dropdownRoom.id);
                  if (!bill) return alert("Bill not found!");
                  setBillIdForView(bill.id);
                  setShowBillPopup(true);
                  closeDropdown()
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Show Bill
              </button>

              <button
                onClick={async () => {
                  const bill = await api.bill.getBillByRoom(dropdownRoom.id);

                  if (!bill) return alert("Bill not found!");

                  setCheckoutBill(bill);
                  setShowCheckoutPopup(true);
                  closeDropdown();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                Check Out
              </button>
            </>
          )}

          <button
            onClick={closeDropdown}
            className="block w-full text-center text-xs text-gray-500 py-2 border-t hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      )}

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
            setBillIdForView(null);
            setShowBillPopup(false)}}
        />
      )}
      {showCheckoutPopup && checkoutBill && (
  <CheckoutModal
    bill={checkoutBill}
    onClose={() => setShowCheckoutPopup(false)}
    onDone={() => {
      reload();
    }}
  />
)}

    </div>
  );
}
