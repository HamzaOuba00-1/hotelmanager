// src/types/AttendanceDto.ts
export interface AttendanceDto {
  id: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  date: string; // ISO format
  checkInAt: string | null;
  checkOutAt: string | null;
  status: string;
  source: string;
}
