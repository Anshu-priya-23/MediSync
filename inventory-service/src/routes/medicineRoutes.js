const express = require("express");
const router = express.Router();

const medicineService = require("../services/medicineService");
const upload = require("../config/multer");

// CREATE
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const medicine = await medicineService.createMedicine(
      req.body,
      req.file
    );
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const medicines = await medicineService.getAllMedicines();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET MEDICINES BY SUPPLIER
router.get("/supplier/:supplierId", async (req, res) => {
  try {
    const medicines = await medicineService.getMedicinesBySupplier(
      req.params.supplierId
    );
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// UPDATE
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updated = await medicineService.updateMedicine(
      req.params.id,
      req.body,
      req.file
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await medicineService.deleteMedicine(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET BY CATEGORY
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const medicines =
      await medicineService.getMedicinesByCategory(category);

    if (medicines.length === 0) {
      return res.status(404).json({
        message: "No medicines found for this category",
      });
    }

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET MEDICINE COUNT FOR SUPPLIER
router.get("/count/:supplierId", async (req, res) => {
  try {
    const result =
      await medicineService.getMedicineCountBySupplier(
        req.params.supplierId
      );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;