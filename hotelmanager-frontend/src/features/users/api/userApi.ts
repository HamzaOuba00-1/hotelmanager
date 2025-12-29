import axios from "../../../api/axios";
import { User, CreateUserPayload } from "../User";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ================= MANAGER APIs =================

export const getAllUsers = async (): Promise<User[]> => {
  const res = await axios.get<User[]>("/users", authHeader());
  return res.data;
};

export const getUsersFromMyHotel = async (): Promise<User[]> => {
  const res = await axios.get<User[]>("/users/my-hotel", authHeader());
  return res.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await axios.post<User>("/users", payload, authHeader());
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`/users/${id}`, authHeader());
};

export const updateUser = async (
  id: number,
  payload: Partial<CreateUserPayload> & Partial<User>
): Promise<User> => {
  const res = await axios.put<User>(`/users/${id}`, payload, authHeader());
  return res.data;
};

// ================= CLIENT SELF APIs =================


export const getMyProfile = async (): Promise<User> => {
  const res = await axios.get<User>("/users/me", authHeader());
  return res.data;
};


export const updateMyProfile = async (
  payload: Partial<User>
): Promise<User> => {
  const res = await axios.put<User>("/users/me", payload, authHeader());
  return res.data;
};


export const changeMyPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await axios.put(
    "/users/me/password",
    { currentPassword, newPassword },
    authHeader()
  );
};
