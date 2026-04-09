import axios from "axios";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const INVENTORY_BASE_URL = (
  process.env.REACT_APP_INVENTORY_BASE_URL || process.env.REACT_APP_API_URL || "http://localhost:5002"
).replace(/\/+$/, "");

export const API_URL = `${INVENTORY_BASE_URL}/api`;
export const IMAGE_URL = INVENTORY_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
