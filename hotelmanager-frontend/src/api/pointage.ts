// src/api/pointage.ts
import instance from "./axios";

export type DailyCodeResponse = {
  code: string;
  validFrom: string;   // 👈 ajouté pour la progression
  validUntil: string;
};

export type CheckInRequest = {
  code: string;
  lat?: number;
  lng?: number;
};

export type CheckOutResponse = {
  attendanceId: number;
  checkOutAt: string;
};

export type AttendanceDto = {
  id: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  date: string;
  checkInAt: string;
  checkOutAt?: string;
  status: "PRESENT" | "RETARD" | "ABSENT";
  source?: string;
};

// --- Ajout pointage manuel (MANAGER) ---
export type CreateManualAttendanceRequest = {
  employeeId: number;
  date: string;        // yyyy-MM-dd
  checkInAt: string;   // ISO datetime (ex: 2025-08-08T08:12:00)
  checkOutAt?: string; // ISO
  status: "PRESENT" | "RETARD" | "ABSENT";
  source?: "MANUAL";
  lat?: number;
  lng?: number;
};

export async function createManualAttendance(
  body: CreateManualAttendanceRequest
): Promise<AttendanceDto> {
  const { data } = await instance.post<AttendanceDto>("/api/attendance/manual", body);
  return data;
}

// --- Codes du jour ---
export async function getCurrentDailyCode(): Promise<DailyCodeResponse> {
  const { data } = await instance.get<DailyCodeResponse>("/api/attendance/codes/current");
  return data;
}

export async function regenerateDailyCode(): Promise<DailyCodeResponse> {
  const { data } = await instance.post<DailyCodeResponse>("/api/attendance/codes/regenerate");
  return data;
}

// --- Check-in/out perso (si besoin) ---
export async function checkIn(body: CheckInRequest): Promise<AttendanceDto> {
  const { data } = await instance.post<AttendanceDto>("/api/attendance/check-in", body);
  return data;
}

export async function checkOut(): Promise<CheckOutResponse> {
  const { data } = await instance.post<CheckOutResponse>("/api/attendance/check-out");
  return data;
}

// --- Liste (MANAGER) ---
export async function listAttendance(params: { start: string; end: string; }): Promise<AttendanceDto[]> {
  const { data } = await instance.get<AttendanceDto[]>("/api/attendance", { params });
  return data;
}
export async function getMyOpenAttendance(): Promise<AttendanceDto | null> {
  try {
    const { data } = await instance.get<AttendanceDto>("/api/attendance/open");
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null; // pas d’ouverture
    throw e;
  }
}
export async function checkoutAttendance(attendanceId: number): Promise<AttendanceDto> {
  const { data } = await instance.patch<AttendanceDto>(
    `/api/attendance/${attendanceId}/checkout`
  );
  return data;
}

// --- Supprimer un pointage (MANAGER) ---
export async function deleteAttendance(attendanceId: number): Promise<void> {
  await instance.delete(`/api/attendance/${attendanceId}`);
}

export async function listMyAttendance(params: { start: string; end: string }): Promise<AttendanceDto[]> {
  const { data } = await instance.get<AttendanceDto[]>("/api/attendance/me", { params });
  return data;
}
