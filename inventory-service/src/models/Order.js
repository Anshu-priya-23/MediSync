const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medicines: [
      {
        name: String,
        quantity: Number,
        price: Number,
        supplierId: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
      },
    ],

    totalAmount: Number,

    status: {
      type: String,
      default: "Pending",
    },

    customerName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);