const Medicine = require("../models/Medicine");
const redis = require("../config/redis");
const mongoose = require("mongoose");

const normalizeItems = (items = []) =>
  items
    .map((item) => ({
      medicineId: String(item?.medicineId || "").trim(),
      quantity: Number(item?.quantity || 0),
    }))
    .filter((item) => item.medicineId && Number.isFinite(item.quantity) && item.quantity > 0);

const safeRedisDel = async (key) => {
  try {
    await redis.del(key);
  } catch (_error) {
    // Keep business APIs working even if Redis is unavailable.
  }
};

const clearMedicineCache = async (supplierId = "", category = "") => {
  await safeRedisDel("medicines:all");
  if (category) {
    await safeRedisDel(`medicines:category:${category}`);
  }
  if (supplierId) {
    await safeRedisDel(`medicines:count:${supplierId}`);
  }
};

// CREATE
exports.createMedicine = async (data, file) => {
  if (file) {
    data.image = file.filename;
  }

  const medicine = new Medicine(data);
  const saved = await medicine.save();
  await clearMedicineCache(saved?.supplierId, saved?.category);
  return saved;
};

// GET ALL (WITH CACHE)
exports.getAllMedicines = async () => {
  const cacheKey = "medicines:all";

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const medicines = await Medicine.find().sort({ createdAt: -1 });
    await redis.set(cacheKey, JSON.stringify(medicines), "EX", 60);

    return medicines;
  } catch (error) {
    console.error("Redis error:", error.message);
    return await Medicine.find().sort({ createdAt: -1 });
  }
};

// GET ONE
exports.getMedicineById = async (id) => {
  return await Medicine.findById(id);
};

// UPDATE
exports.updateMedicine = async (id, data, file) => {
  if (file) {
    data.image = file.filename;
  }

  const updated = await Medicine.findByIdAndUpdate(id, data, {
    new: true,
  });

  await clearMedicineCache(updated?.supplierId, updated?.category);
  return updated;
};

// DELETE
exports.deleteMedicine = async (id) => {
  const deleted = await Medicine.findByIdAndDelete(id);
  await clearMedicineCache(deleted?.supplierId, deleted?.category);
  return deleted;
};

// GET BY CATEGORY (WITH CACHE)
exports.getMedicinesByCategory = async (category) => {
  const cacheKey = `medicines:category:${category}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const medicines = await Medicine.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).sort({ createdAt: -1 });

    await redis.set(cacheKey, JSON.stringify(medicines), "EX", 60);
    return medicines;
  } catch (error) {
    console.error("Redis error:", error.message);
    return await Medicine.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).sort({ createdAt: -1 });
  }
};

// GET MEDICINE COUNT BY SUPPLIER (WITH CACHE)
exports.getMedicineCountBySupplier = async (supplierId) => {
  const cacheKey = `medicines:count:${supplierId}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const count = await Medicine.countDocuments({
      supplierId: new mongoose.Types.ObjectId(supplierId),
    });

    const result = { totalMedicines: count };
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);

    return result;
  } catch (error) {
    console.error("Redis error:", error.message);

    const count = await Medicine.countDocuments({
      supplierId: new mongoose.Types.ObjectId(supplierId),
    });

    return { totalMedicines: count };
  }
};

exports.getMedicinesBySupplier = async (supplierId) => {
  try {
    return await Medicine.find({
      supplierId: new mongoose.Types.ObjectId(supplierId),
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching supplier medicines:", error.message);
    throw error;
  }
};

exports.verifyStock = async (items = []) => {
  const normalizedItems = normalizeItems(items);
  const unavailable = [];

  for (const item of normalizedItems) {
    const medicine = await Medicine.findById(item.medicineId);
    const currentStock = Number(medicine?.stock || 0);

    if (!medicine || currentStock < item.quantity) {
      unavailable.push({
        medicineId: item.medicineId,
        requested: item.quantity,
        available: currentStock,
      });
    }
  }

  return {
    ok: unavailable.length === 0,
    unavailable,
  };
};

exports.deductStock = async (items = []) => {
  const normalizedItems = normalizeItems(items);
  if (!normalizedItems.length) {
    return { ok: true };
  }

  const applied = [];

  for (const item of normalizedItems) {
    const medicine = await Medicine.findOneAndUpdate(
      {
        _id: item.medicineId,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { stock: -item.quantity },
      },
      { new: true }
    );

    if (!medicine) {
      for (const rollbackItem of applied) {
        await Medicine.findByIdAndUpdate(rollbackItem.medicineId, {
          $inc: { stock: rollbackItem.quantity },
        });
      }

      return {
        ok: false,
        message: "Insufficient stock for one or more medicines",
        unavailable: [
          {
            medicineId: item.medicineId,
            requested: item.quantity,
          },
        ],
      };
    }

    applied.push(item);
    await clearMedicineCache(medicine?.supplierId, medicine?.category);
  }

  return { ok: true };
};

exports.releaseStock = async (items = []) => {
  const normalizedItems = normalizeItems(items);

  for (const item of normalizedItems) {
    const medicine = await Medicine.findByIdAndUpdate(
      item.medicineId,
      {
        $inc: { stock: item.quantity },
      },
      { new: true }
    );

    if (medicine) {
      await clearMedicineCache(medicine?.supplierId, medicine?.category);
    }
  }

  return { ok: true };
};
