const Medicine = require("../models/medicine");
const redis = require("../config/redis");
const mongoose = require("mongoose");

// CREATE
exports.createMedicine = async (data, file) => {
  if (file) data.image = file.filename;

  const medicineData = {
    name: data.name,
    category: data.category,
    price: Number(data.price),
    stock: Number(data.stock),
    minThreshold: Number(data.minThreshold),   // frontend field: threshold
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null, // convert string to Date
    entryDate: data.entryDate ? new Date(data.entryDate) : null,   // convert string to Date
    batchNumber: data.batchNumber,
    description: data.description,
    supplierId: data.supplierId,
    image: data.image || null,
    version: 0,
  };

  const medicine = new Medicine(medicineData);
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

  // convert strings to proper types
  const updateData = {
    ...data,
    price: data.price !== undefined ? Number(data.price) : undefined,
    stock: data.stock !== undefined ? Number(data.stock) : undefined,
    minThreshold: data.minThreshold !== undefined ? Number(data.minThreshold) : undefined,
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
  };

  const updated = await Medicine.findByIdAndUpdate(id, updateData, { new: true });

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
    if (cached) return JSON.parse(cached);

    const count = await Medicine.countDocuments({
      supplierId: new mongoose.Types.ObjectId(supplierId),
    });

    const result = { totalMedicines: count };
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);
    return result;
  } catch (err) {
    console.error(err.message);
    const count = await Medicine.countDocuments({
      supplierId: new mongoose.Types.ObjectId(supplierId),
    });
    return { totalMedicines: count };
  }
};

// GET MEDICINES BY SUPPLIER
exports.getMedicinesBySupplier = async (supplierId) => {
  return await Medicine.find({
    supplierId: new mongoose.Types.ObjectId(supplierId),
  }).sort({ createdAt: -1 });
};