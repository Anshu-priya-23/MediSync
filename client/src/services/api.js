import axios from "axios";

const API_BASE_URL = ("http://localhost:5003").replace(/\/+$/, "");
const INVENTORY_BASE_URL = (
  process.env.REACT_APP_INVENTORY_BASE_URL || process.env.REACT_APP_API_URL || "http://localhost:5002"
).replace(/\/+$/, "");

// 🚀 ADDED: Dedicated Base URL for the Payment Service
const PAYMENT_BASE_URL = (
  process.env.REACT_APP_PAYMENT_BASE_URL || "http://localhost:5004"
).replace(/\/+$/, "");

export const API_URL = `${INVENTORY_BASE_URL}/api`;
export const IMAGE_URL = INVENTORY_BASE_URL;

// Original instance for Orders, Auth, etc. (Untouched)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 🚀 ADDED: Dedicated instance for Payments & Stripe
export const paymentApi = axios.create({
  baseURL: PAYMENT_BASE_URL,
  timeout: 10000,
});

// Token interceptor for original API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚀 ADDED: Token interceptor for Payment API
paymentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;