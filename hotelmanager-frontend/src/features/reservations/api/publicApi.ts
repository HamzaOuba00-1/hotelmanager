import { publicApi } from "../../../api/axios";
import { PublicRoom } from "../../rooms/publicTypes";

export interface PublicReservationRequest {
  hotelId: number;
  roomId: number;
  firstName: string;
  lastName: string;
  guestPhone: string;        // ✅ NEW
  startAt: string;
  endAt: string;
}

export interface PublicReservationResponse {
  reservationId: number;
  email: string;
  generatedPassword: string;
}

export async function getAvailableRooms(
  hotelId: number,
  startISO: string,
  endISO: string
): Promise<PublicRoom[]> {
  const { data } = await publicApi.get<PublicRoom[]>(
    `/public/hotels/${hotelId}/rooms/available`,
    { params: { start: startISO, end: endISO } }
  );
  return data;
}

export async function reserveRoom(body: PublicReservationRequest) {
  const { data } = await publicApi.post<PublicReservationResponse>(
    "/public/reservations",
    body
  );
  return data;
}
