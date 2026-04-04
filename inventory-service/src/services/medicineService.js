const Medicine = require("../models/Medicine");
const redis = require("../config/redis");

// CREATE
exports.createMedicine = async (data, file) => {
  console.log(data);
  if (file) {
    data.image = file.filename;
  }

  const medicine = new Medicine(data);
  const saved = await medicine.save();

  // ✅ CLEAR CACHE AFTER CREATE
  // await redis.del("medicines:all");
  // if (data.category) await redis.del(`medicines:category:${data.category}`);
  // if (data.supplierId) await redis.del(`medicines:count:${data.supplierId}`);

  return saved;
};


// GET ALL (WITH CACHE)
exports.getAllMedicines = async () => {
  const cacheKey = "medicines:all";

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Medicines Cache HIT ✅");
      return JSON.parse(cached);
    }

    console.log("Medicines Cache MISS ❌");

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

  // ✅ CLEAR CACHE AFTER UPDATE
  await redis.del("medicines:all");
  if (updated?.category) await redis.del(`medicines:category:${updated.category}`);
  if (updated?.supplierId) await redis.del(`medicines:count:${updated.supplierId}`);

  return updated;
};


// DELETE
exports.deleteMedicine = async (id) => {
  const deleted = await Medicine.findByIdAndDelete(id);

  // ✅ CLEAR CACHE AFTER DELETE
  await redis.del("medicines:all");
  if (deleted?.category) await redis.del(`medicines:category:${deleted.category}`);
  if (deleted?.supplierId) await redis.del(`medicines:count:${deleted.supplierId}`);

  return deleted;
};


// GET BY CATEGORY (WITH CACHE)
exports.getMedicinesByCategory = async (category) => {
  const cacheKey = `medicines:category:${category}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Category Cache HIT ✅");
      return JSON.parse(cached);
    }

    console.log("Category Cache MISS ❌");

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
      console.log("Count Cache HIT ✅");
      return JSON.parse(cached);
    }

    console.log("Count Cache MISS ❌");

    const count = await Medicine.countDocuments({
      supplierId
    });

    const result = { totalMedicines: count };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);

    return result;

  } catch (error) {
    console.error("Redis error:", error.message);

    const count = await Medicine.countDocuments({ supplierId });
    return { totalMedicines: count };
  }
};