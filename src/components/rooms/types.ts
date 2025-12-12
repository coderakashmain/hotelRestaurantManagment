export type Customer = {
  name: string;
  mobile: string;
  checkIn: string;
};

export type RoomType = {
  id: string;
  floor: number;
  roomNo: number;
  type: "AC" | "Non-AC" | "Deluxe";
  status: "Available" | "Occupied" | "Cleaning";
  customer?: Customer;
};

export type CheckOutSetting  ={
   id: number;
  label: string;
  hours: number | null;
  time: string | null;
  is_default: number;
  created_at: string;
  updated_at: string;
}