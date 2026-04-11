import express from "express";
import {
  getDashboard,
  getReports,
  getSuppliers,
  getStock,
  getSettings,
  updateProfile,
  updatePreferences,
  changePassword
} from "../controllers/analyticsController.js";

const router = express.Router();

// ================= DASHBOARD =================
router.get("/dashboard", getDashboard);

// ================= REPORTS =================
router.get("/reports", getReports);

// ================= STOCK =================
router.get("/stock", getStock);

// ================= SUPPLIERS =================
router.get("/suppliers", getSuppliers);

// ================= SETTINGS =================
router.get("/settings", getSettings);
router.put("/settings/profile", updateProfile);
router.put("/settings/preferences", updatePreferences);
router.put("/settings/password", changePassword);

export default router;