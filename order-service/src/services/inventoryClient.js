const axios = require("axios");
const redis = require("../config/redis");

const INVENTORY_URL = (process.env.INVENTORY_SERVICE_URL || "http://127.0.0.1:5002").replace(/\/+$/, "");
const MEDICINE_CACHE_TTL_MS = Number(process.env.INVENTORY_MEDICINE_CACHE_TTL_MS || 15000);
const MEDICINE_LIST_CACHE_TTL_MS = Number(process.env.INVENTORY_MEDICINE_LIST_CACHE_TTL_MS || 10000);
const medicineCache = new Map();
const medicineListCache = new Map();
const REDIS_MEDICINE_KEY_PREFIX = "order:inventory:medicine:";
const REDIS_MEDICINE_LIST_KEY_PREFIX = "order:inventory:medicine:list:";
const REDIS_MEDICINE_LIST_VERSION_KEY = "order:inventory:medicine:list:version";

const inventoryApi = axios.create({
  baseURL: INVENTORY_URL,
  timeout: Number(process.env.INVENTORY_TIMEOUT_MS || 7000),
});

function toTtlSeconds(ttlMs, fallbackSeconds) {
  const parsed = Math.floor(Number(ttlMs) / 1000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackSeconds;
}

function encodeKeyPart(value) {
  return encodeURIComponent(String(value || ""));
}

async function getRedisListVersion() {
  const raw = await redis.getValue(REDIS_MEDICINE_LIST_VERSION_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function medicineRedisKey(medicineId) {
  return `${REDIS_MEDICINE_KEY_PREFIX}${encodeKeyPart(medicineId)}`;
}

function medicineListRedisKey(listVersion, filterKey) {
  return `${REDIS_MEDICINE_LIST_KEY_PREFIX}v${listVersion}:${encodeKeyPart(filterKey)}`;
}

function ttlOrDefault(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getCached(cache, key) {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return cached.value;
}

function setCached(cache, key, value, ttlMs) {
  const ttl = ttlOrDefault(ttlMs, 5000);
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

function normalizedFilterKey(filters = {}) {
  const normalizedCategory = String(filters.category || "").trim().toLowerCase();
  const normalizedQuery = String(filters.q || "").trim().toLowerCase();
  return `${normalizedCategory}::${normalizedQuery}`;
}

async function invalidateMedicineCaches(items = []) {
  medicineListCache.clear();
  const redisKeys = [];

  for (const item of items) {
    const medicineId = String(item?.medicineId || "").trim();
    if (medicineId) {
      medicineCache.delete(medicineId);
      redisKeys.push(medicineRedisKey(medicineId));
    }
  }

  await Promise.allSettled([
    redis.delKeys(redisKeys),
    redis.incrValue(REDIS_MEDICINE_LIST_VERSION_KEY),
  ]);
}

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
  const filterKey = normalizedFilterKey(filters);
  const listVersion = await getRedisListVersion();
  const redisKey = medicineListRedisKey(listVersion, filterKey);
  const redisCached = await redis.getJson(redisKey);
  if (Array.isArray(redisCached)) {
    setCached(medicineListCache, filterKey, redisCached, MEDICINE_LIST_CACHE_TTL_MS);
    return redisCached;
  }

  const cached = getCached(medicineListCache, filterKey);
  if (cached) {
    return cached;
  }

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

  const normalized = medicines
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

  setCached(medicineListCache, filterKey, normalized, MEDICINE_LIST_CACHE_TTL_MS);
  await redis.setJson(redisKey, normalized, toTtlSeconds(MEDICINE_LIST_CACHE_TTL_MS, 10));
  return normalized;
}

async function getMedicineById(medicineId) {
  const id = String(medicineId || "").trim();
  if (!id) {
    return null;
  }

  const redisKey = medicineRedisKey(id);
  const redisCached = await redis.getJson(redisKey);
  if (redisCached && typeof redisCached === "object") {
    setCached(medicineCache, id, redisCached, MEDICINE_CACHE_TTL_MS);
    return redisCached;
  }

  const cached = getCached(medicineCache, id);
  if (cached) {
    return cached;
  }

  try {
    const response = await inventoryApi.get(`/api/medicines/${id}`);
    const medicine = normalizeMedicine(response.data);
    if (medicine) {
      setCached(medicineCache, id, medicine, MEDICINE_CACHE_TTL_MS);
      await redis.setJson(redisKey, medicine, toTtlSeconds(MEDICINE_CACHE_TTL_MS, 15));
    }
    return medicine;
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

  await invalidateMedicineCaches(items);
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

  await invalidateMedicineCaches(items);
  return response.data || { ok: true };
}

async function clearInventoryCache() {
  medicineCache.clear();
  medicineListCache.clear();
  await redis.incrValue(REDIS_MEDICINE_LIST_VERSION_KEY);
}

module.exports = {
  fetchMedicines,
  getMedicineById,
  verifyStock,
  reserveStock,
  releaseStock,
  clearInventoryCache,
};
