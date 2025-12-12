import { RoomType } from "./types";

type Props = {
  room: RoomType;
  close: () => void;
};

const CheckinModal: React.FC<Props> = ({ room, close }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-96 space-y-3">
        <h2 className="text-xl font-bold">
          Check-in Room {room.roomNo}
        </h2>

        <input
          type="text"
          placeholder="Guest Name"
          className="border w-full p-2"
        />

        <input
          type="text"
          placeholder="Mobile Number"
          className="border w-full p-2"
        />

        <button className="bg-green-600 text-white w-full py-2 rounded">
          Confirm Check-in
        </button>

        <button onClick={close} className="w-full mt-2 text-sm text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CheckinModal;
