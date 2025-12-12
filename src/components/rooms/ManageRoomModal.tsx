import { RoomType } from "./types";

type Props = {
  room: RoomType;
  close: () => void;
};

const ManageRoomModal: React.FC<Props> = ({ room, close }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-96 space-y-3">
        <h2 className="text-lg font-bold">
          Room {room.roomNo} Management
        </h2>

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Add Other Charges
        </button>

        <button className="w-full bg-orange-500 text-white py-2 rounded">
          Add Advance
        </button>

        <button className="w-full bg-yellow-500 text-white py-2 rounded">
          Adjustment
        </button>

        <button className="w-full bg-purple-600 text-white py-2 rounded">
          Show Bills
        </button>

        <button className="w-full bg-red-600 text-white py-2 rounded">
          Check Out
        </button>

        <button onClick={close} className="w-full text-gray-500 text-sm mt-2">
          Close
        </button>
      </div>
    </div>
  );
};

export default ManageRoomModal;
