import axios from "axios";

/** Base URL de ton API Spring */
const API_BASE = process.env.REACT_APP_API_URL ?? "http://127.0.0.1:8080";

/** Client privé (injecte le JWT si présent) */
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Client public (pas d’Authorization) */
export const publicApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export default api;
