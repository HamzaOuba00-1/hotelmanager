import api from "./axios";

export interface RoomLite {
  id: number;
  roomNumber: number;
  roomType: string;
  floor: number;
  description?: string;
  roomState: string;
}

export async function listRooms(): Promise<RoomLite[]> {
  const { data } = await api.get<RoomLite[]>("/api/rooms");
  return data;
}
