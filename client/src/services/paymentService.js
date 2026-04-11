// 🚀 CHANGED: Import the new paymentApi instance we just created
import api, { paymentApi } from "./api";

export async function createPayment(payload) {
  // 🚀 CHANGED: Now using paymentApi (Port 5004)
  const response = await paymentApi.post("/api/payments/create", payload);
  return response.data || {};
}

export async function fetchPaymentsByOrder(orderId) {
  // 🚀 CHANGED: Now using paymentApi
  const response = await paymentApi.get(`/api/payments/order/${orderId}`);
  return response.data?.items || [];
}

export async function fetchPaymentById(paymentId) {
  // 🚀 CHANGED: Now using paymentApi
  const response = await paymentApi.get(`/api/payments/${paymentId}`);
  return response.data?.payment;
}

export const createStripeIntent = async (data) => {
  // 🚀 CHANGED: Using paymentApi AND added "/api" to match your backend routes
  const response = await paymentApi.post("/api/payments/create-intent", data);
  return response.data;
};