import instance from "./axios";

export type DailyCodeResponse = {
  code: string;
  validFrom: string;   
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

export type CreateManualAttendanceRequest = {
  employeeId: number;
  date: string;        
  checkInAt: string;   
  checkOutAt?: string; 
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

export async function getCurrentDailyCode(): Promise<DailyCodeResponse> {
  const { data } = await instance.get<DailyCodeResponse>("/api/attendance/codes/current");
  return data;
}

export async function regenerateDailyCode(): Promise<DailyCodeResponse> {
  const { data } = await instance.post<DailyCodeResponse>("/api/attendance/codes/regenerate");
  return data;
}

export async function checkIn(body: CheckInRequest): Promise<AttendanceDto> {
  const { data } = await instance.post<AttendanceDto>("/api/attendance/check-in", body);
  return data;
}

export async function checkOut(): Promise<CheckOutResponse> {
  const { data } = await instance.post<CheckOutResponse>("/api/attendance/check-out");
  return data;
}

export async function listAttendance(params: { start: string; end: string; }): Promise<AttendanceDto[]> {
  const { data } = await instance.get<AttendanceDto[]>("/api/attendance", { params });
  return data;
}
export async function getMyOpenAttendance(): Promise<AttendanceDto | null> {
  try {
    const { data } = await instance.get<AttendanceDto>("/api/attendance/open");
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null; 
    throw e;
  }
}
export async function checkoutAttendance(attendanceId: number): Promise<AttendanceDto> {
  const { data } = await instance.patch<AttendanceDto>(
    `/api/attendance/${attendanceId}/checkout`
  );
  return data;
}

export async function deleteAttendance(attendanceId: number): Promise<void> {
  await instance.delete(`/api/attendance/${attendanceId}`);
}

export async function listMyAttendance(params: { start: string; end: string }): Promise<AttendanceDto[]> {
  const { data } = await instance.get<AttendanceDto[]>("/api/attendance/me", { params });
  return data;
}
