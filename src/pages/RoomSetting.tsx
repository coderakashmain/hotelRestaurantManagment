import { useState } from "react";
import {
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";

import { api } from "../api/api";
import { useAsync } from "../hooks/useAsync";
import { useRoomTypes } from "../context/RoomTypeContext";
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

  if (loading || !floors) {
    return <div className="p-6">Loading...</div>;
  }

  /* ======================================================
       ADD NEW FLOOR
  ====================================================== */
  const addNewFloor = async () => {
    const result = await api.floor.add({
      floor_name: newFloorName || `Floor ${newFloorNo}`,
      floor_number: newFloorNo,
    });

    const floorId = result.lastInsertRowid; // FIXED

    // Add rooms automatically
    for (let i = 1; i <= newFloorRooms; i++) {
      const roomNo = newFloorNo * 100 + i;

      await api.room.add({
        room_number: String(roomNo),
        floor_id: floorId, // VALID NOW
      });
    }

    setShowNewFloorModal(false);
    reload();
  };

  /* ======================================================
       ADD ROOMS TO FLOOR
  ====================================================== */
  const addRoomsToFloor = async () => {
    if (!floorModal) return;

    const existing = floorModal.rooms.length;

    for (let i = 1; i <= roomsToAdd; i++) {
      const roomNo = floorModal.floor_number * 100 + (existing + i);

      await api.room.add({
        room_number: String(roomNo),
        floor_id: floorModal.id,
      });
    }

    setRoomsToAdd(0);
    setFloorModal(null);
    reload();
  };

  /* ======================================================
       DELETE ROOM (Soft delete / block)
  ====================================================== */
  const deleteRoom = async (roomId: number) => {
    await api.room.updateStatus(roomId, "BLOCKED");
    reload();
  };

  /* ======================================================
       EDIT ROOM
  ====================================================== */
  const updateRoom = async (room: any, value: any) => {
    let data: any = {};

    data.room_type_id = value;

    await api.room.update(room.id, data);

    setEditingRoom({ ...room, ...data });
    reload();
  };

  /* ======================================================
       RENAME FLOOR
  ====================================================== */
  const handleFloorRename = async () => {
    await api.floor.rename(renameFloor.id, newName);

    setRenameFloor(null);
    reload();
  };

  /* ======================================================
       UI SECTION (Only UI — no logic touched)
  ====================================================== */

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room & Floor Management</h1>

        <button
          onClick={() => setShowNewFloorModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded btn"
        >
          <PlusIcon className="w-5 h-5" />
          Add Floor
        </button>
      </div>

      {/* Floors */}
      {floors.map((floor: any) => (
        <div key={floor.id} className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{floor.floor_name}</h2>

            <div className="flex gap-3 items-center">
              <PencilSquareIcon
                className="w-6 h-6 cursor-pointer"
                onClick={() => {
                  setRenameFloor(floor);
                  setNewName(floor.floor_name);
                }}
              />

              <Cog6ToothIcon
                className="w-6 h-6 cursor-pointer"
                onClick={() => setFloorModal(floor)}
              />
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-6 gap-4">
            {floor.rooms.map((room: any) => (
              <div
                key={room.id}
                className="shadow-lg flex justify-between flex-col bg-white p-4 rounded-lg border border-gray-200 hover:-translate-y-2 hover:shadow-2xl transition min-h-30"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-md">
                    Room No: {room.room_number}
                  </h3>

                  <div className="flex gap-2  items-center">
                    <Cog6ToothIcon
                      className="w-4 h-4 cursor-pointer hover:text-blue-600 "
                      onClick={() => setEditingRoom(room)}
                    />
                    <TrashIcon
                      className="w-4 h-4 text-red-600 cursor-pointer hover:text-red-700"
                      onClick={() => deleteRoom(room.id)}
                    />
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-600">
                  <p>Type: {room.room_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Rename Floor Modal */}
      {renameFloor && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-5 rounded w-80">
            <h3 className="font-bold mb-3">Rename Floor</h3>

            <input
              type="text"
              value={newName}
              className="border w-full p-2 mb-3"
              onChange={(e) => setNewName(e.target.value)}
            />

            <button
              onClick={handleFloorRename}
              className="bg-blue-600 text-white w-full py-2 rounded btn"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Add Rooms Modal */}
      {floorModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-5 rounded w-80">
            <h3 className="font-bold mb-3">
              Add Rooms to {floorModal.floor_name}
            </h3>

            <input
              type="number"
              className="border w-full p-2 mb-3"
              onChange={(e) => setRoomsToAdd(Number(e.target.value))}
              placeholder="Number of rooms"
            />

            <button
              onClick={addRoomsToFloor}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              Add Rooms
            </button>
          </div>
        </div>
      )}

      {/* Add New Floor Modal */}
      {showNewFloorModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-5 rounded w-80 space-y-3">
            <h3 className="font-bold">Add New Floor</h3>

            <input
              type="number"
              className="border w-full p-2"
              placeholder="Floor Number"
              onChange={(e) => setNewFloorNo(Number(e.target.value))}
            />

            <input
              type="text"
              className="border w-full p-2"
              placeholder="Floor Name"
              onChange={(e) => setNewFloorName(e.target.value)}
            />

            <input
              type="number"
              className="border w-full p-2"
              placeholder="Rooms Count"
              onChange={(e) => setNewFloorRooms(Number(e.target.value))}
            />

            <button
              onClick={addNewFloor}
              className="bg-green-600 text-white w-full py-2 rounded btn"
            >
              Add Floor
            </button>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="font-bold text-lg mb-3">
              Edit Room {editingRoom.room_number}
            </h3>

            {/* Room Type */}
            <label className="block text-sm mb-1">Room Type</label>
            <select
              value={editingRoom.room_type_id}
              className="border w-full p-2 mb-3"
              onChange={(e) => updateRoom(editingRoom, e.target.value)}
            >
              {roomTypes.map((rt: any) => (
                <option key={rt.id} value={rt.id}>
                  {rt.type_name}
                </option>
              ))}
            </select>

            {/* Status */}

            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={() => setEditingRoom(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
