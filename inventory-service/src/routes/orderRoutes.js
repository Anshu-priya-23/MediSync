const express = require("express");
const router = express.Router();

const orderService = require("../services/orderService");

// GET SUPPLIER ORDERS
router.get("/supplier/:supplierId", async (req, res) => {
  try {
    const orders = await orderService.getOrdersBySupplier(
      req.params.supplierId
    );

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SUPPLIER ORDERS
// router.get("/supplier/:supplierId", async (req, res) => {
//   try {
//     const orders = await orderService.getOrdersBySupplier(
//       req.params.supplierId
//     );

//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// GET SUPPLIER STATS
router.get("/stats/:supplierId", async (req, res) => {
  try {
    const stats = await orderService.getSupplierStats(
      req.params.supplierId
    );

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get("/stats/:supplierId", async (req, res) => {
//   try {
//     const stats = await orderService.getSupplierStats(
//       req.params.supplierId
//     );

//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;