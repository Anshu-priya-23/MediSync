const Medicine = require("../models/medicine");
const redis = require("../config/redis");
const mongoose = require("mongoose");

// CREATE
exports.createMedicine = async (data, file) => {
  console.log(data);

  if (file) {
    data.image = file.filename;
  }

  // ✅ NEW: handle addedDate
  if (data.addedDate) {
    data.addedDate = new Date(data.addedDate);
  }

  const medicine = new Medicine(data);
  const saved = await medicine.save();

  //medicine = new Medicine(medicineData);
  return await medicine.save();
};

// GET ALL (WITH CACHE)
exports.getAllMedicines = async () => {
  const cacheKey = "medicines:all";
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const medicines = await Medicine.find().sort({ createdAt: -1 });
    await redis.set(cacheKey, JSON.stringify(medicines), "EX", 60);
    return medicines;
  } catch (err) {
    console.error(err.message);
    return await Medicine.find().sort({ createdAt: -1 });
  }
};

// GET ONE
exports.getMedicineById = async (id) => {
  return await Medicine.findById(id);
};

// UPDATE
exports.updateMedicine = async (id, data, file) => {
  if (file) data.image = file.filename;

  // ✅ NEW: handle addedDate
  if (data.addedDate) {
    data.addedDate = new Date(data.addedDate);
  }

  const updated = await Medicine.findByIdAndUpdate(id, data, {
    new: true,
  });

  updated = await Medicine.findByIdAndUpdate(id, updateData, { new: true });

  // Clear cache
  await redis.del("medicines:all");
  if (updated?.category) await redis.del(`medicines:category:${updated.category}`);
  if (updated?.supplierId) await redis.del(`medicines:count:${updated.supplierId}`);

  return updated;
};

// DELETE
exports.deleteMedicine = async (id) => {
  const deleted = await Medicine.findByIdAndDelete(id);
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
    if (cached) return JSON.parse(cached);

    const medicines = await Medicine.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).sort({ createdAt: -1 });

    await redis.set(cacheKey, JSON.stringify(medicines), "EX", 60);
    return medicines;
  } catch (err) {
    console.error(err.message);
    return await Medicine.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    }).sort({ createdAt: -1 });
  }
};

// GET MEDICINE COUNT BY SUPPLIER
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

// GET MEDICINES BY SUPPLIER
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