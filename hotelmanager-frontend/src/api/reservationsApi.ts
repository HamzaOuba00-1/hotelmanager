// src/api/reservationsApi.ts
import api from "./axios";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "NO_SHOW"
  | "CANCELED"
  | "COMPLETED";

export interface RoomLite {
  id: number;
  roomNumber: number;
  roomType: string;
  floor: number;
}
export interface UserLite {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Reservation {
  id: number;
  room: RoomLite;
  client?: UserLite | null;
  guestFirstName: string;
  guestLastName: string;
  guestPhone?: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  version?: number;
}

/* ================= MANAGER ================= */
export async function listReservations(): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>("/api/reservations");
  return data;
}

export async function getAllowedStatuses(
  id: number
): Promise<ReservationStatus[]> {
  const { data } = await api.get<ReservationStatus[]>(
    `/api/reservations/${id}/allowed-status`
  );
  return data;
}

export async function updateStatus(
  id: number,
  status: ReservationStatus
): Promise<void> {
  await api.patch(`/api/reservations/${id}/status`, { status });
}

/* ================= CLIENT ================= */
export async function listMyReservations(): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>("/api/client/reservations");
  return data;
}

export async function cancelMyReservation(id: number): Promise<void> {
  await api.patch(`/api/client/reservations/${id}/cancel`);
}
