import axios from '../../../api/axios';
import { Crew } from '../Crew';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getCrews = async (): Promise<Crew[]> => {
  const res = await axios.get<Crew[]>('/crews', authHeader());
  return res.data;
};

export const getCrew = async (id: number): Promise<Crew> => {
  const res = await axios.get<Crew>(`/crews/${id}`, authHeader());
  return res.data;
};

export const createCrew = async (payload: {
  name: string; service: string; memberIds?: number[];
}): Promise<Crew> => {
  const res = await axios.post<Crew>('/crews', payload, authHeader());
  return res.data;
};

export const updateCrew = async (id: number, payload: {
  name?: string; service?: string; memberIds?: number[];
}): Promise<Crew> => {
  const res = await axios.put<Crew>(`/crews/${id}`, payload, authHeader());
  return res.data;
};

export const addCrewMembers = async (id: number, memberIds: number[]): Promise<Crew> => {
  const res = await axios.post<Crew>(`/crews/${id}/members`, memberIds, authHeader());
  return res.data;
};

export const removeCrewMember = async (id: number, userId: number): Promise<Crew> => {
  const res = await axios.delete<Crew>(`/crews/${id}/members/${userId}`, authHeader());
  return res.data;
};

export const deleteCrew = async (id: number): Promise<void> => {
  await axios.delete(`/crews/${id}`, authHeader());
};
