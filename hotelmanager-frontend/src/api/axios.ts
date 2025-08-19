// src/api/axios.ts
import axios from 'axios';
import { AuthResponse } from "./authApi";

// Création de l'instance Axios avec baseURL
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ Interceptor : injecte automatiquement le token dans toutes les requêtes
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(localStorage.getItem("token"));
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;

// Authentification
export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await instance.post<AuthResponse>("/auth/login", credentials);
  return response.data;
}
