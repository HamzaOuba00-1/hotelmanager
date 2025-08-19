import { publicApi } from "./axios";
import { PublicRoom } from "../types/publicTypes";

/** Requête de réservation publique */
export interface PublicReservationRequest {
  hotelId: number;
  roomId: number;
  firstName: string;
  lastName: string;
  startAt: string; // ISO 8601 (toISOString)
  endAt: string;   // ISO 8601
}

export interface PublicReservationResponse {
  reservationId: number;
  email: string;
  generatedPassword: string;
}

/** GET /public/hotels/{hotelId}/rooms/available?start=...&end=... */
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

/** POST /public/reservations */
export async function reserveRoom(body: PublicReservationRequest) {
  const { data } = await publicApi.post<PublicReservationResponse>(
    "/public/reservations",
    body
  );
  return data;
}
