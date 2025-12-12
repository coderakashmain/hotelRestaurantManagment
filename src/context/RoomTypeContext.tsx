import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";
import { RoomType } from "../pages/masters/types";

interface RoomTypeContextType {
  roomTypes: RoomType[];
  loading: boolean;
  refreshRoomTypes: () => Promise<void>;
}

const RoomTypeContext = createContext<RoomTypeContextType | null>(null);

export const useRoomTypes = () => {
  const ctx = useContext(RoomTypeContext);
  if (!ctx) throw new Error("useRoomTypes must be used inside RoomTypeProvider");
  return ctx;
};

export const RoomTypeProvider = ({ children }: any) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshRoomTypes = async () => {
    setLoading(true);
    const list = await api.roomType.list();
    setRoomTypes(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshRoomTypes();
  }, []);

  return (
    <RoomTypeContext.Provider value={{ roomTypes, loading, refreshRoomTypes }}>
      {children}
    </RoomTypeContext.Provider>
  );
};
