const Redis = require("ioredis");

const REDIS_URL = String(process.env.REDIS_URL || "redis://127.0.0.1:6379").trim();
const REDIS_DISABLED = String(process.env.REDIS_DISABLED || "").trim().toLowerCase() === "true";

let redisClient = null;
let redisReady = false;

function getClient() {
  if (REDIS_DISABLED) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(REDIS_URL, {
    retryStrategy: () => null,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
  });

  redisClient.on("ready", () => {
    redisReady = true;
    console.log("Order-service Redis ready");
  });

  redisClient.on("end", () => {
    redisReady = false;
  });

  redisClient.on("error", (error) => {
    redisReady = false;
    console.warn("Order-service Redis error:", error.message || error);
  });

  return redisClient;
}

function isReady() {
  return !!redisClient && redisReady;
}

async function getValue(key) {
  const client = getClient();
  if (!client || !isReady()) {
    return null;
  }

  try {
    return await client.get(key);
  } catch (error) {
    console.warn("Redis get failed:", error.message || error);
    return null;
  }
}

async function setValue(key, value, ttlSeconds = 0) {
  const client = getClient();
  if (!client || !isReady()) {
    return false;
  }

  try {
    if (Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
      await client.set(key, value, "EX", Math.floor(ttlSeconds));
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    console.warn("Redis set failed:", error.message || error);
    return false;
  }
}

async function getJson(key) {
  const raw = await getValue(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

async function setJson(key, value, ttlSeconds = 0) {
  return setValue(key, JSON.stringify(value), ttlSeconds);
}

async function incrValue(key) {
  const client = getClient();
  if (!client || !isReady()) {
    return null;
  }

  try {
    return await client.incr(key);
  } catch (error) {
    console.warn("Redis incr failed:", error.message || error);
    return null;
  }
}

async function delKeys(keys = []) {
  const client = getClient();
  const cleanKeys = keys.filter(Boolean);
  if (!client || !isReady() || !cleanKeys.length) {
    return 0;
  }

  try {
    return await client.del(...cleanKeys);
  } catch (error) {
    console.warn("Redis del failed:", error.message || error);
    return 0;
  }
}

async function closeRedis() {
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.quit();
  } catch (_error) {
    try {
      redisClient.disconnect();
    } catch (_disconnectError) {
      // ignore disconnect errors during shutdown
    }
  } finally {
    redisClient = null;
    redisReady = false;
  }
}

module.exports = {
  getClient,
  isReady,
  getValue,
  setValue,
  getJson,
  setJson,
  incrValue,
  delKeys,
  closeRedis,
};
