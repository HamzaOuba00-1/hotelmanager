import axios from "./axios";

export interface Shift {
  id?: number;
  date: string;         
  startTime: string;    
  endTime: string;
  service?: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  },
}

export interface ShiftInput {
  employee: { id: number };
  date: string;
  startTime: string;
  endTime: string;
  service?: string;
}

export const getShiftsForHotel = (start: string, end: string) => {
  return axios.get<Shift[]>("/api/planning/hotel", {
    params: { start, end },
  });
};

export const getMyShifts = (start: string, end: string) => {
  return axios.get<Shift[]>("/api/planning/me", {
    params: { start, end },
  });
};

export const createShift = (shift: ShiftInput) => {
  return axios.post<Shift>("/api/planning", shift);
};

export const deleteShift = (id: number) => {
  return axios.delete(`/api/planning/${id}`);
};
