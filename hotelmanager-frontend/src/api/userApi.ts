// src/api/userApi.ts
import axios from './axios';
import { User } from '../types/User';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  const res = await axios.get<User[]>('/users', authHeader());
  return res.data;
};

export const getMe = async (): Promise<string> => {
  const res = await axios.get<string>('/auth/me', authHeader());
  return res.data;
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  const res = await axios.post<User>('/users', user, authHeader());
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`/users/${id}`, authHeader());
};
