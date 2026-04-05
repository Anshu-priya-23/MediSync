const axios = require("axios");

const INVENTORY_URL = (process.env.INVENTORY_SERVICE_URL || "http://127.0.0.1:5002").replace(/\/+$/, "");

const inventoryApi = axios.create({
  baseURL: INVENTORY_URL,
  timeout: Number(process.env.INVENTORY_TIMEOUT_MS || 7000),
});

function normalizeMedicines(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.medicines)) {
    return payload.medicines;
  }

  return [];
}

function buildImageUrl(imageValue) {
  const raw = String(imageValue || "").trim();
  if (!raw) {
    return "";
  }

  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    return raw;
  }

  return `${INVENTORY_URL}/uploads/${raw.replace(/^\/+/, "")}`;
}

function normalizeMedicine(medicine) {
  if (!medicine) {
    return null;
  }

  const id = medicine._id || medicine.id || medicine.medicineId;
  return {
    ...medicine,
    _id: String(id),
    id: String(id),
    medicineId: String(id),
    availableStock: Number(medicine.availableStock ?? medicine.stock ?? 0),
    stock: Number(medicine.stock ?? medicine.availableStock ?? 0),
    imageData: buildImageUrl(medicine.imageData || medicine.image),
    price: Number(medicine.price || 0),
  };
}

async function fetchMedicines(filters = {}) {
  let medicines = [];

  if (filters.category) {
    const response = await inventoryApi.get(
      `/api/medicines/category/${encodeURIComponent(filters.category)}`
    );
    medicines = normalizeMedicines(response.data);
  } else {
    const response = await inventoryApi.get("/api/medicines");
    medicines = normalizeMedicines(response.data);
  }

  const q = String(filters.q || "").trim().toLowerCase();

  return medicines
    .map(normalizeMedicine)
    .filter(Boolean)
    .filter((medicine) => {
      if (!q) {
        return true;
      }

      return (
        String(medicine.name || "").toLowerCase().includes(q) ||
        String(medicine.category || "").toLowerCase().includes(q) ||
        String(medicine.description || "").toLowerCase().includes(q)
      );
    });
}

async function getMedicineById(medicineId) {
  const id = String(medicineId || "").trim();
  if (!id) {
    return null;
  }

  try {
    const response = await inventoryApi.get(`/api/medicines/${id}`);
    return normalizeMedicine(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

async function verifyStock(items = []) {
  const response = await inventoryApi.post("/api/medicines/stock/verify", {
    items: items.map((item) => ({
      medicineId: String(item.medicineId || ""),
      quantity: Number(item.quantity || 0),
    })),
  });

  return response.data || { ok: true, unavailable: [] };
}

async function reserveStock(items = [], reference = "") {
  const response = await inventoryApi.post("/api/medicines/stock/deduct", {
    reference,
    items: items.map((item) => ({
      medicineId: String(item.medicineId || ""),
      quantity: Number(item.quantity || 0),
    })),
  });

  return response.data || { ok: true };
}

async function releaseStock(items = [], reference = "") {
  const response = await inventoryApi.post("/api/medicines/stock/release", {
    reference,
    items: items.map((item) => ({
      medicineId: String(item.medicineId || ""),
      quantity: Number(item.quantity || 0),
    })),
  });

  return response.data || { ok: true };
}

module.exports = {
  fetchMedicines,
  getMedicineById,
  verifyStock,
  reserveStock,
  releaseStock,
};
