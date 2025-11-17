import api from "./axios";

export type ReservationStatus =
  | "PENDING" | "CONFIRMED" | "CHECKED_IN" | "NO_SHOW" | "CANCELED" | "COMPLETED";

export interface RoomLite { id: number; roomNumber: number; roomType: string; floor: number }
export interface UserLite { id: number; firstName: string; lastName: string; email?: string; phone?: string }

export interface Reservation {
  id: number;
  hotelId?: number;
  room: RoomLite;
  client?: UserLite | null;
  guestFirstName: string;
  guestLastName: string;
  startAt: string; 
  status: ReservationStatus;
  version?: number;
}

export async function listReservations(): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>("/api/reservations");
  return data;
}

export async function getAllowedStatuses(id: number): Promise<ReservationStatus[]> {
  const { data } = await api.get<ReservationStatus[]>(`/api/reservations/${id}/allowed-status`);
  return data;
}

export async function updateStatus(id: number, status: ReservationStatus): Promise<void> {
  await api.patch(`/api/reservations/${id}/status`, { status });
}

export async function searchReservations(params: {
  status?: ReservationStatus | "ALL";
  q?: string;
  arrivalsOn?: string;  
  departuresOn?: string; 
}) {
  const { data } = await api.get<Reservation[]>("/api/reservations", { params });
  return data;
}
