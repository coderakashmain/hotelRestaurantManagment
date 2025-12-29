import { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { api } from "../api/api";
import { useAsync } from "../hooks/useAsync";
import { useRoomTypes } from "../context/RoomTypeContext";
import { useSnackbar } from "../context/SnackbarContext";

/* ======================================================
   LOAD FLOORS + ROOMS
====================================================== */
async function fetchFloorsAndRooms() {
  const floors = await api.floor.list();
  const rooms = await api.room.list();

  return floors.map((f: any) => ({
    id: f.id,
    floor_name: f.floor_name,
    floor_number: f.floor_number,
    rooms: rooms.filter((r: any) => r.floor_id === f.id),
  }));
}

export default function RoomSetting() {
  const { roomTypes } = useRoomTypes();
  const { loading, data: floors, reload } = useAsync(fetchFloorsAndRooms, []);

  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [floorModal, setFloorModal] = useState<any>(null);
  const [roomsToAdd, setRoomsToAdd] = useState(0);

  const [showNewFloorModal, setShowNewFloorModal] = useState(false);
  const [newFloorNo, setNewFloorNo] = useState(0);
  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorRooms, setNewFloorRooms] = useState(0);

  const [renameFloor, setRenameFloor] = useState<any>(null);
  const [newName, setNewName] = useState("");

  /* ================= Keyboard ================= */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingRoom(null);
        setFloorModal(null);
        setShowNewFloorModal(false);
        setRenameFloor(null);
      }
      if (e.key === "Enter") {
        if (renameFloor) rename();
        if (floorModal && roomsToAdd > 0) addRooms();
        if (showNewFloorModal) addFloor();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading || !floors) return <div className="p-6">Loading…</div>;

  /* ================= Actions ================= */
  const {showSnackbar} = useSnackbar();
  const addFloor = async () => {
    if(!newFloorName || !newFloorNo){
      showSnackbar("Please enter Floor no and Floor Name!",'warning')
      return;
    }
    const res = await api.floor.add({
      floor_name: newFloorName || `Floor ${newFloorNo}`,
      floor_number: newFloorNo,
    });

    const floorId = res.lastInsertRowid;

    for (let i = 1; i <= newFloorRooms; i++) {
      await api.room.add({
        room_number: String(newFloorNo * 100 + i),
        floor_id: floorId,
      });
    }

    setShowNewFloorModal(false);
    reload();
  };

  const addRooms = async () => {
    const base = floorModal.rooms.length;
    for (let i = 1; i <= roomsToAdd; i++) {
      await api.room.add({
        room_number: String(
          floorModal.floor_number * 100 + (base + i)
        ),
        floor_id: floorModal.id,
      });
    }
    setFloorModal(null);
    reload();
  };

  const rename = async () => {
    await api.floor.rename(renameFloor.id, newName);
    setRenameFloor(null);
    reload();
  };

  const deleteRoom = async (id: number) => {
    await api.room.updateStatus(id, "BLOCKED");
    reload();
  };

  // const updateRoom = async (room: any, typeId: number) => {
  //   await api.room.update(room.id, { room_type_id: typeId });
  //   reload();
  // };
  const updateRoom = async (room: any, value: any) => {
    let data: any = {};

    data.room_type_id = value;

    await api.room.update(room.id, data);

    setEditingRoom({ ...room, ...data });
    reload();
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Room & Floor Management</h1>
          <p className="text-sm text-secondary">
            Manage floors, rooms, and room types
          </p>
        </div>

        <button
          onClick={() => setShowNewFloorModal(true)}
          className="btn bg-primary text-white flex items-center gap-2 hover-glow"
        >
          <PlusIcon className="w-5 h-5" />
          Add Floor
        </button>
      </div>

      {/* Floors */}
      {floors.map((floor: any) => (
        <section key={floor.id} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">
              {floor.floor_name}
            </h2>

            <div className="flex gap-3 text-secondary">
              <PencilSquareIcon
                className="w-5 h-5 cursor-pointer hover:text-primary"
                onClick={() => {
                  setRenameFloor(floor);
                  setNewName(floor.floor_name);
                }}
              />
              <Cog6ToothIcon
                className="w-5 h-5 cursor-pointer hover:text-primary"
                onClick={() => setFloorModal(floor)}
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {floor.rooms.map((room: any) => (
              <div
                key={room.id}
                className="card hover-lift flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      Room {room.room_number}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {room.room_type || "No type"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Cog6ToothIcon
                      className="w-4 h-4 cursor-pointer hover:text-primary"
                      onClick={() => setEditingRoom(room)}
                    />
                    <TrashIcon
                      className="w-4 h-4 cursor-pointer text-error"
                      onClick={() => deleteRoom(room.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ================= MODALS ================= */}

      {renameFloor && (
        <Modal title="Rename Floor" onClose={() => setRenameFloor(null)}>
          <Label>Floor Name</Label>
          <input
            autoFocus
            className=" w-full rounded-sm p-2"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Primary onClick={rename} />
        </Modal>
      )}

      {floorModal && (
        <Modal
          title={`Add Rooms to ${floorModal.floor_name}`}
          onClose={() => setFloorModal(null)}
        >
          <Label>Number of Rooms</Label>
          <input
            type="number"
            className=" w-full rounded-sm p-2"
            onChange={(e) => setRoomsToAdd(+e.target.value)}
          />
          <Primary onClick={addRooms} />
        </Modal>
      )}

      {showNewFloorModal && (
        <Modal title="Add New Floor" onClose={() => setShowNewFloorModal(false)}>
          <Label>Floor Number</Label>
          <input
            type="number"
            className=" w-full rounded-sm p-2"
            onChange={(e) => setNewFloorNo(+e.target.value)}
          />

          <Label>Floor Name</Label>
          <input
            className=" w-full rounded-sm p-2"
            onChange={(e) => setNewFloorName(e.target.value)}
          />

          <Label>Rooms Count</Label>
          <input
            type="number"
            className=" w-full rounded-sm p-2"
            onChange={(e) => setNewFloorRooms(+e.target.value)}
          />

          <Primary onClick={addFloor} />
        </Modal>
      )}

      {editingRoom && (
        <Modal
          title={`Edit Room ${editingRoom.room_number}`}
          onClose={() => setEditingRoom(null)}
        >
          <Label>Room Type</Label>
          <select
            className="input w-full border border-gray p-2 rounded"
            value={editingRoom.room_type_id}
            onChange={(e) => updateRoom(editingRoom, e.target.value)}
          >
            {roomTypes.map((rt: any) => (
                <option key={rt.id} value={rt.id}>
                  {rt.type_name}
                </option>
              ))}
          </select>

          <button className="block mt-5 bg-primary w-full text-white rounded-sm text-center py-2" onClick={() => setEditingRoom(null)} >Close</button>
        </Modal>
      )}

    </div>
  );
}

/* ================= Reusable UI ================= */

const Label = ({ children }: any) => (
  <label className="text-xs text-secondary mb-1 block">
    {children}
  </label>
);

const Primary = ({ onClick, text = "Save" }: any) => (
  <button
    onClick={onClick}
    className="btn bg-primary text-white w-full mt-4 hover-glow"
  >
    {text} <span className="text-xs opacity-70">(Enter)</span>
  </button>
);

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-bg-secondary w-96 rounded-md shadow-card p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
      <button
        onClick={onClose}
        className="mt-3 text-xs w-f text-secondary underline"
      >
        ESC to close
      </button>
    </div>
  </div>
);
