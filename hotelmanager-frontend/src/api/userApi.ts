// src/api/userApi.ts
import axios from './axios';
import { User, CreateUserPayload } from '../types/User';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAllUsers = async (): Promise<User[]> => {
  const res = await axios.get<User[]>('/users', authHeader());
  return res.data;
};

export const getMe = async (): Promise<string> => {
  const res = await axios.get<string>('/auth/me', authHeader());
  return res.data;
};

export const getUsersFromMyHotel = async (): Promise<User[]> => {
  const res = await axios.get<User[]>('/users/my-hotel', authHeader());
  return res.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await axios.post<User>('/users', payload, authHeader());
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`/users/${id}`, authHeader());
};

// 👉 AJOUTE ÇA (PUT standard REST) :
export const updateUser = async (
  id: number,
  payload: Partial<CreateUserPayload> & Partial<User>
): Promise<User> => {
  const res = await axios.put<User>(`/users/${id}`, payload, authHeader());
  return res.data;
};

// // Si ton back préfère PATCH, remplace par :
// export const updateUser = async (id: number, payload: Partial<CreateUserPayload> & Partial<User>): Promise<User> => {
//   const res = await axios.patch<User>(`/users/${id}`, payload, authHeader());
//   return res.data;
// };
