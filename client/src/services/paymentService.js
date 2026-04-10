import api from "./api";

export async function createPayment(payload) {
  const response = await api.post("/api/payments/create", payload);
  return response.data || {};
}

export async function fetchPaymentsByOrder(orderId) {
  const response = await api.get(`/api/payments/order/${orderId}`);
  return response.data?.items || [];
}

export async function fetchPaymentById(paymentId) {
  const response = await api.get(`/api/payments/${paymentId}`);
  return response.data?.payment;
}
