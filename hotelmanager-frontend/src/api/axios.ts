// src/api/axios.ts
import axios from 'axios';
import { AuthResponse } from "./authApi";


const instance = axios.create({
  baseURL: 'http://localhost:8080', // adapte selon ton backend
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;



export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>("/api/auth/login", credentials);
  return response.data;
}
