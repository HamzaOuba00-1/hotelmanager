// src/api/planningApi.ts
import axios from "./axios"; // instance avec interceptor

export interface Shift {
  id?: number;
  date: string;         // format: YYYY-MM-DD
  startTime: string;    // format: HH:mm
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

// ✅ Récupère tous les shifts du manager (planning global hôtel)
export const getShiftsForHotel = (start: string, end: string) => {
  return axios.get<Shift[]>("/api/planning/hotel", {
    params: { start, end },
  });
};

// ✅ Récupère les shifts de l'utilisateur connecté
export const getMyShifts = (start: string, end: string) => {
  return axios.get<Shift[]>("/api/planning/me", {
    params: { start, end },
  });
};

// ✅ Crée un shift (manager uniquement)
export const createShift = (shift: ShiftInput) => {
  return axios.post<Shift>("/api/planning", shift);
};

// ✅ Supprime un shift (manager uniquement)
export const deleteShift = (id: number) => {
  return axios.delete(`/api/planning/${id}`);
};
