const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    price: { type: Number },
    stock: { type: Number },
    minThreshold: { type: Number },
    expiryDate: { type: Date, required: true }, // Medicine Expiry
    entryDate: { type: Date, required: true },  // ✅ Stock Entry Date
    batchNumber: { type: String },
    description: { type: String },
    image: { type: String },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    version: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);