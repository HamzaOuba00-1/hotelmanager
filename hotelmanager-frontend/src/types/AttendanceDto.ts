export interface AttendanceDto {
  id: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  date: string; 
  checkInAt: string | null;
  checkOutAt: string | null;
  status: string;
  source: string;
}
