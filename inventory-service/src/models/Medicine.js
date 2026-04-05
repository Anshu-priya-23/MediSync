const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku:{type:String, unique:true,required:true},
    category: { type: String },
    price: { type: Number },
    stock: { type: Number },
    minThreshold: { type: Number },
    expiryDate: { type: Date },

    addedDate: { type: Date }, // ✅ NEW FIELD ADDED

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