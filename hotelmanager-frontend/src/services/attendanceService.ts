// src/services/attendanceService.ts
import axios from "axios";
import { AttendanceDto } from "../types/AttendanceDto";

const API_URL = "http://localhost:8080/api/attendance";

export const checkIn = async (): Promise<AttendanceDto> => {
  const { data } = await axios.post<AttendanceDto>(`${API_URL}/check-in`, {}, { withCredentials: true });
  return data;
};

export const checkOut = async (): Promise<AttendanceDto> => {
  const { data } = await axios.post<AttendanceDto>(`${API_URL}/check-out`, {}, { withCredentials: true });
  return data;
};
